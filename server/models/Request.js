const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: { type: String, default: 'Misc' },
  preferredCondition: { type: String, enum: ['New', 'Good', 'Used'], default: 'Good' },
  bountyCoins: { type: Number, default: 3, min: 1, max: 30 },
  isFlash: { type: Boolean, default: false },
  isEmergency: { type: Boolean, default: false },
  expiresAt: { type: Date },
  status: { type: String, enum: ['Open', 'Fulfilled', 'Closed', 'Expired'], default: 'Open' },
  fulfilledByTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }
}, { timestamps: true });

module.exports = mongoose.model('Request', RequestSchema);
