const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  category: { type: String, default: 'Misc' },
  condition: { type: String, enum: ['New', 'Good', 'Used'], default: 'Good' },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['Available', 'Reserved', 'Exchanged', 'Auction'], default: 'Available' },
  isAuction: { type: Boolean, default: false },
  auctionEndsAt: { type: Date },
  currentBid: { type: Number, default: 0 },
  highestBidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);
