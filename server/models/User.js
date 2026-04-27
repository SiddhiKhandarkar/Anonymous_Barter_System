const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  anonymousId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  coins: { type: Number, default: 50 },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  totalTrades: { type: Number, default: 0 },
  punctualityScore: { type: Number, default: 5, min: 1, max: 5 },
  itemQualityScore: { type: Number, default: 5, min: 1, max: 5 },
  communicationScore: { type: Number, default: 5, min: 1, max: 5 },
  disputeCount: { type: Number, default: 0 },
  resolvedDisputes: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
