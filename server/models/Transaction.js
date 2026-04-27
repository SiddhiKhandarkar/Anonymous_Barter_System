const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  giverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  coinsTransferred: { type: Number, default: 5 },
  coinsAwarded: { type: Number, default: 7 },
  bountyCoins: { type: Number, default: 0 },
  escrowLockedCoins: { type: Number, default: 0 },
  escrowStatus: { type: String, enum: ['None', 'Locked', 'Released', 'Refunded', 'OnHold'], default: 'None' },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
  isDonation: { type: Boolean, default: false },
  lockerId: { type: String },
  OTP: { type: String },
  QRCode: { type: String },
  dropTime: { type: Date },
  pickupTime: { type: Date },
  dropSlot: { type: String },
  pickupSlot: { type: String },
  status: { type: String, enum: ['Pending', 'Ready', 'Completed', 'Disputed'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
