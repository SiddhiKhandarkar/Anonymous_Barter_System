const MatchingService = require('../services/matchingService');

exports.getSmartMatches = async (req, res) => {
  try {
    const result = await MatchingService.getSmartMatches(req.user.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const Item = require('../models/Item');

exports.getSuggestions = async (req, res) => {
  try {
    const myItems = await Item.find({ ownerId: req.user.id, status: 'Available' });
    const myCategories = [...new Set(myItems.map((i) => i.category))];

    const directMatches = await Item.find({
      status: 'Available',
      ownerId: { $ne: req.user.id },
      category: { $in: myCategories.length ? myCategories : ['Misc'] }
    }).populate('ownerId', 'anonymousId').limit(10);

    const allAvailable = await Item.find({ status: 'Available' }).populate('ownerId', 'anonymousId');
    const byOwner = new Map();
    allAvailable.forEach((item) => {
      const owner = String(item.ownerId?._id || item.ownerId);
      if (!byOwner.has(owner)) byOwner.set(owner, []);
      byOwner.get(owner).push(item);
    });

    const myOwnerId = String(req.user.id);
    const cycleSuggestions = [];
    const owners = [...byOwner.keys()].filter((o) => o !== myOwnerId);

    for (const ownerA of owners) {
      const aItems = byOwner.get(ownerA) || [];
      for (const ownerB of owners) {
        if (ownerB === ownerA) continue;
        const bItems = byOwner.get(ownerB) || [];
        const aWantsB = aItems.some((a) => bItems.some((b) => b.category === a.category));
        const bWantsMe = bItems.some((b) => myItems.some((m) => m.category === b.category));
        const meWantA = myItems.some((m) => aItems.some((a) => a.category === m.category));
        if (aWantsB && bWantsMe && meWantA) {
          cycleSuggestions.push({
            type: '3-way',
            chain: [
              { ownerId: ownerA, anonymousId: aItems[0]?.ownerId?.anonymousId || 'User' },
              { ownerId: ownerB, anonymousId: bItems[0]?.ownerId?.anonymousId || 'User' },
              { ownerId: myOwnerId, anonymousId: 'You' }
            ],
            note: 'Potential circular swap based on overlapping categories.'
          });
          if (cycleSuggestions.length >= 5) break;
        }
      }
      if (cycleSuggestions.length >= 5) break;
    }

    res.json({ directMatches, cycleSuggestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
