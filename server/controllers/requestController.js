const Request = require('../models/Request');
const Item = require('../models/Item');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const LockerService = require('../services/lockerService');
const { computeEconomy } = require('../utils/coinEconomy');

exports.createRequest = async (req, res) => {
  try {
    const { title, description, category, preferredCondition, bountyCoins, isFlash, isEmergency } = req.body;

    let expiresAt = null;
    if (isFlash) {
      expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 30);
    }

    const request = await Request.create({
      userId: req.user.id,
      title,
      description,
      category: category || 'Misc',
      preferredCondition: preferredCondition || 'Good',
      bountyCoins: bountyCoins || 3,
      isFlash: !!isFlash,
      isEmergency: !!isEmergency,
      expiresAt
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOpenRequests = async (req, res) => {
  try {
    await Request.updateMany({ isFlash: true, status: 'Open', expiresAt: { $lt: new Date() } }, { status: 'Expired' });

    const requests = await Request.find({ status: 'Open' })
      .populate('userId', 'anonymousId')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.fulfillRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { itemId, dropSlot, pickupSlot, fulfillmentType } = req.body;

    const request = await Request.findById(id);
    if (!request || request.status !== 'Open') {
      return res.status(404).json({ message: 'Request is not open for fulfillment' });
    }

    if (request.userId.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot fulfill your own request' });
    }

    const item = await Item.findById(itemId);
    if (!item || item.status !== 'Available') {
      return res.status(400).json({ message: 'Selected item is not available' });
    }

    if (item.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only use your own listing to fulfill requests' });
    }

    const receiver = await User.findById(request.userId);
    let { takerCost, giverReward } = computeEconomy(item);
    let bounty = request.bountyCoins || 0;
    let isDonation = false;

    if (fulfillmentType === 'donation') {
      takerCost = 0;
      giverReward = 0;
      bounty = 0;
      isDonation = true;
    }

    const totalCost = takerCost + bounty;
    if (!receiver || receiver.coins < totalCost) {
      return res.status(400).json({ message: `Requester needs at least ${totalCost} coins to complete this barter.` });
    }

    const { lockerId, otp, qrCode } = LockerService.generateLocker();
    receiver.coins -= takerCost;
    const transaction = await Transaction.create({
      giverId: req.user.id,
      receiverId: request.userId,
      itemId: item._id,
      coinsTransferred: takerCost,
      coinsAwarded: giverReward,
      bountyCoins: bounty,
      escrowLockedCoins: takerCost,
      escrowStatus: 'Locked',
      requestId: request._id,
      isDonation,
      lockerId,
      OTP: otp,
      QRCode: qrCode,
      dropSlot,
      pickupSlot
    });

    item.status = 'Reserved';
    request.status = 'Fulfilled';
    request.fulfilledByTransactionId = transaction._id;
    await receiver.save();
    await item.save();
    await request.save();

    await Notification.create({
      userId: request.userId,
      type: 'match',
      message: `Your request "${request.title}" got a match. Pickup will happen at locker ${lockerId}.`
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
