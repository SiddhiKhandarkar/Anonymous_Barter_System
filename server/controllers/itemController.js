const Item = require('../models/Item');
const AIModerationService = require('../services/aiModerationService');
const MatchingService = require('../services/matchingService');

exports.createItem = async (req, res) => {
  try {
    const { title, description } = req.body;

    const modCheck = AIModerationService.checkContent(`${title} ${description}`);
    if (!modCheck.isSafe) {
      return res.status(400).json({ message: modCheck.reason });
    }

    const category = AIModerationService.categorize(title, description);

    const newItem = new Item({
      ...req.body,
      category,
      ownerId: req.user.id
    });
    
    await newItem.save();

    // Trigger Smart Matching
    MatchingService.findMatches(newItem);

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getItems = async (req, res) => {
  try {
    const items = await Item.find({ status: 'Available' }).populate('ownerId', 'anonymousId rating');
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ ownerId: req.user.id });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('ownerId', 'anonymousId rating');
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
