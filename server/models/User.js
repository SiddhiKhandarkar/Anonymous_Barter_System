const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  anonymousId: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  coins: { type: Number, default: 10 },
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  totalTrades: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
