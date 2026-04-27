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

    if (req.body.isAuction) {
      newItem.isAuction = true;
      newItem.status = 'Auction';
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      newItem.auctionEndsAt = expiresAt;
      newItem.currentBid = req.body.startingBid || 1;
    }
    
    await newItem.save();

    const Request = require('../models/Request');
    const openRequests = await Request.find({ status: 'Open', category: category });
    const io = req.app.get('io');
    if (io) {
      openRequests.forEach(reqObj => {
        if (reqObj.userId.toString() !== req.user.id) {
          io.emit(`matchAlert_${reqObj.userId}`, { 
            message: `New match for your request "${reqObj.title}": ${newItem.title}` 
          });
        }
      });
    }

    // Trigger Smart Matching
    MatchingService.findMatches(newItem);

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getItems = async (req, res) => {
  try {
    // Check expired auctions silently
    await Item.updateMany({ isAuction: true, status: 'Auction', auctionEndsAt: { $lt: new Date() } }, { status: 'Available' });

    const items = await Item.find({ status: { $in: ['Available', 'Auction'] } }).populate('ownerId', 'anonymousId rating');
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

exports.placeBid = async (req, res) => {
  try {
    const { bidAmount } = req.body;
    const item = await Item.findById(req.params.id);
    if (!item || !item.isAuction || item.status !== 'Auction') {
      return res.status(400).json({ message: 'Item is not open for bidding' });
    }
    if (item.auctionEndsAt < new Date()) {
      item.status = 'Available';
      await item.save(); // Auction ended
      return res.status(400).json({ message: 'Auction has ended' });
    }
    if (item.ownerId.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot bid on your own item' });
    }
    const User = require('../models/User');
    const bidder = await User.findById(req.user.id);
    if (bidAmount <= item.currentBid) {
      return res.status(400).json({ message: `Bid must be higher than ${item.currentBid}` });
    }
    if (bidder.coins < bidAmount) {
      return res.status(400).json({ message: 'Not enough coins' });
    }

    item.currentBid = bidAmount;
    item.highestBidderId = req.user.id;
    await item.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('newBid', { itemId: item._id, currentBid: bidAmount });
    }

    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
