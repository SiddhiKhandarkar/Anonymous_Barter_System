const Item = require('../models/Item');
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
  }
};

module.exports = MatchingService;
