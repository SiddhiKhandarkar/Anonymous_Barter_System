const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  giverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  coinsTransferred: { type: Number, default: 5 },
  lockerId: { type: String },
  OTP: { type: String },
  QRCode: { type: String },
  dropTime: { type: Date },
  pickupTime: { type: Date },
  dropSlot: { type: String },
  pickupSlot: { type: String },
  status: { type: String, enum: ['Pending', 'Ready', 'Completed'], default: 'Pending' },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
