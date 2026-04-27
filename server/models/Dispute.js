const mongoose = require('mongoose');

const DisputeSchema = new mongoose.Schema({
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true, unique: true },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, enum: ['empty_locker', 'defective_item', 'other'], required: true },
  details: { type: String, maxlength: 500, default: '' },
  resolutionNote: { type: String, maxlength: 500, default: '' },
  status: { type: String, enum: ['Open', 'Investigating', 'Resolved', 'Rejected'], default: 'Open' }
}, { timestamps: true });

module.exports = mongoose.model('Dispute', DisputeSchema);
