const Item = require('../models/Item');
const Request = require('../models/Request');
const Notification = require('../models/Notification');

const MatchingService = {
  findMatches: async (newItem) => {
    try {
      // Find items in the same category or with matching keywords in description
      // For simplicity, we'll match by category and notify users who have items in categories they might want
      // Actually, a simpler "Smart Match" for this MVP: 
      // Look for items this user might want based on what they just listed (cross-pollination)
      
      const potentialMatches = await Item.find({
        category: newItem.category,
        status: 'Available',
        ownerId: { $ne: newItem.ownerId }
      }).limit(5);

      if (potentialMatches.length > 0) {
        // Notify the owner of the new item about potential items they might want
        await Notification.create({
          userId: newItem.ownerId,
          type: 'match',
          message: `We found ${potentialMatches.length} items in "${newItem.category}" that you might like!`
        });
      }
    } catch (error) {
      console.error('Matching Error:', error);
    }
  },

  getSmartMatches: async (userId) => {
    const myOpenRequests = await Request.find({ userId, status: 'Open' });
    const myAvailableItems = await Item.find({ ownerId: userId, status: 'Available' });

    const twoWay = [];
    for (const req of myOpenRequests) {
      const providerItems = await Item.find({
        status: 'Available',
        ownerId: { $ne: userId },
        category: req.category
      }).limit(5).populate('ownerId', 'anonymousId');

      providerItems.forEach((item) => {
        twoWay.push({
          requestId: req._id,
          requestTitle: req.title,
          providerAnonymousId: item.ownerId?.anonymousId || 'Unknown',
          suggestedItemId: item._id,
          suggestedItemTitle: item.title,
          type: 'two_way'
        });
      });
    }

    const threeWay = [];
    const myCategories = [...new Set(myAvailableItems.map((item) => item.category))];
    const otherOpenRequests = await Request.find({
      status: 'Open',
      userId: { $ne: userId },
      category: { $in: myCategories }
    }).limit(25);

    for (const first of otherOpenRequests) {
      const secondCandidates = await Request.find({
        status: 'Open',
        userId: { $nin: [userId, first.userId] },
        category: first.category === 'Misc' ? { $ne: 'Misc' } : { $in: myCategories }
      }).limit(25);

      const firstUserItems = await Item.find({ ownerId: first.userId, status: 'Available' }).limit(10);
      const firstUserCategories = [...new Set(firstUserItems.map((item) => item.category))];
      if (!myOpenRequests.some((req) => firstUserCategories.includes(req.category))) continue;

      for (const second of secondCandidates) {
        const secondUserItems = await Item.find({ ownerId: second.userId, status: 'Available' }).limit(10);
        const secondUserCategories = [...new Set(secondUserItems.map((item) => item.category))];

        const iCanServeFirst = myAvailableItems.some((item) => item.category === first.category);
        const firstCanServeSecond = firstUserItems.some((item) => item.category === second.category);
        const secondCanServeMe = myOpenRequests.some((req) => secondUserCategories.includes(req.category));

        if (iCanServeFirst && firstCanServeSecond && secondCanServeMe) {
          threeWay.push({
            type: 'three_way',
            cycle: [
              { role: 'you', givesCategory: first.category },
              { role: first.userId.toString(), givesCategory: second.category },
              { role: second.userId.toString(), givesCategory: myOpenRequests[0]?.category || 'Misc' }
            ]
          });
          if (threeWay.length >= 6) break;
        }
      }
      if (threeWay.length >= 6) break;
    }

    return { twoWay: twoWay.slice(0, 15), threeWay };
  }
};

module.exports = MatchingService;
