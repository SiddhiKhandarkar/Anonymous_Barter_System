const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  punctuality: { type: Number, min: 1, max: 5, default: 5 },
  itemQuality: { type: Number, min: 1, max: 5, default: 5 },
  communication: { type: Number, min: 1, max: 5, default: 5 },
  comment: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);
