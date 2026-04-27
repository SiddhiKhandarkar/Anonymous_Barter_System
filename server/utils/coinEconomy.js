const CONDITION_COST = {
  New: 7,
  Good: 5,
  Used: 3
};

const CATEGORY_MODIFIER = {
  Electronics: 2,
  Study: 1,
  Books: 1,
  Furniture: 1,
  Accessories: 0,
  Clothing: 0,
  Misc: 0
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

exports.computeEconomy = (item = {}) => {
  const conditionBase = CONDITION_COST[item.condition] ?? 5;
  const categoryBonus = CATEGORY_MODIFIER[item.category] ?? 0;
  const takerCost = clamp(conditionBase + categoryBonus, 2, 10);
  const giverReward = takerCost;

  return { takerCost, giverReward };
};
