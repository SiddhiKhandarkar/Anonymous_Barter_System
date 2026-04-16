const AIModerationService = {
  checkContent: (text) => {
    const bannedKeywords = ['knife', 'gun', 'drugs', 'weapon', 'illegal', 'bomb', 'poison', 'medicine', 'alcohol', 'cigarette', 'vape'];
    const textLower = text.toLowerCase();
    for (let word of bannedKeywords) {
      if (textLower.includes(word)) {
        return { isSafe: false, reason: `Safety Filter: Restricted item detected (${word}). Anonymous barter must be safe for the community.` };
      }
    }
    return { isSafe: true };
  },

  categorize: (title, description) => {
    const combined = `${title} ${description}`.toLowerCase();
    
    const rules = [
      { category: 'Books', keywords: ['book', 'novel', 'textbook', 'comic', 'manga', 'magazine', 'dictionary', 'encyclopedia', 'paperback', 'hardcover'] },
      { category: 'Electronics', keywords: ['phone', 'laptop', 'tablet', 'headphone', 'charger', 'mouse', 'keyboard', 'monitor', 'electronic', 'tech', 'gadget', 'camera', 'speaker', 'earbud'] },
      { category: 'Clothing', keywords: ['shirt', 'pant', 'jacket', 't-shirt', 'hoodie', 'shoe', 'clothing', 'apparel', 'dress', 'hat', 'cap', 'socks', 'wear'] },
      { category: 'Stationery', keywords: ['pen', 'pencil', 'notebook', 'paper', 'ruler', 'eraser', 'stapler', 'stationery', 'office', 'art', 'marker', 'supplies'] }
    ];

    for (const rule of rules) {
      if (rule.keywords.some(k => combined.includes(k))) {
        return rule.category;
      }
    }

    return 'Misc';
  }
};

module.exports = AIModerationService;
