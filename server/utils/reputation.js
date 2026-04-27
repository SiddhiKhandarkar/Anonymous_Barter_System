const clampFive = (value) => Math.max(1, Math.min(5, value));

const rollingAverage = (current, count, incoming) => {
  if (!count || count < 1) return clampFive(incoming);
  return clampFive(((current * count) + incoming) / (count + 1));
};

exports.applyFeedbackToUser = (user, feedback) => {
  const safeFeedback = {
    rating: feedback.rating || 5,
    punctuality: feedback.punctuality || feedback.rating || 5,
    itemQuality: feedback.itemQuality || feedback.rating || 5,
    communication: feedback.communication || feedback.rating || 5
  };

  const count = user.ratingCount || 0;
  user.rating = rollingAverage(user.rating || 5, count, safeFeedback.rating);
  user.punctualityScore = rollingAverage(user.punctualityScore || 5, count, safeFeedback.punctuality);
  user.itemQualityScore = rollingAverage(user.itemQualityScore || 5, count, safeFeedback.itemQuality);
  user.communicationScore = rollingAverage(user.communicationScore || 5, count, safeFeedback.communication);
  user.ratingCount = count + 1;
};

exports.computeBadges = (user) => {
  const badges = [];
  if ((user.totalTrades || 0) >= 10) badges.push('Campus Trader');
  if ((user.punctualityScore || 0) >= 4.5) badges.push('On-Time Pro');
  if ((user.itemQualityScore || 0) >= 4.5) badges.push('Quality Keeper');
  if ((user.communicationScore || 0) >= 4.5) badges.push('Clear Communicator');

  const disputeRate = (user.totalTrades || 0) > 0 ? (user.disputeCount || 0) / user.totalTrades : 0;
  if ((user.totalTrades || 0) >= 5 && disputeRate <= 0.1) badges.push('Trusted Locker');

  if (!badges.length) badges.push('Rising Member');
  return badges;
};
