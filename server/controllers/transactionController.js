const Transaction = require('../models/Transaction');
const Item = require('../models/Item');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Feedback = require('../models/Feedback');
const LockerService = require('../services/lockerService');

exports.createTransaction = async (req, res) => {
  try {
    const { itemId, dropSlot, pickupSlot } = req.body;
    const item = await Item.findById(itemId);
    if (!item || item.status !== 'Available') return res.status(400).json({ message: 'Item not available' });
    if (item.ownerId.toString() === req.user.id) return res.status(400).json({ message: 'Cannot exchange your own item' });

    const receiver = await User.findById(req.user.id);
    if (receiver.coins < 5) return res.status(400).json({ message: 'Not enough coins. Need 5 coins.' });

    const { lockerId, otp, qrCode } = LockerService.generateLocker();

    const transaction = new Transaction({
      giverId: item.ownerId,
      receiverId: req.user.id,
      itemId: item._id,
      lockerId,
      OTP: otp,
      QRCode: qrCode,
      dropSlot,
      pickupSlot
    });

    item.status = 'Reserved';
    await item.save();
    await transaction.save();

    // Create Notification
    await Notification.create({
      userId: item.ownerId,
      type: 'match',
      message: 'Someone wants to barter your item! Drop it at ' + lockerId
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [{ giverId: req.user.id }, { receiverId: req.user.id }]
    }).populate('itemId', 'title images').populate('giverId', 'anonymousId').populate('receiverId', 'anonymousId');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, otp } = req.body;
    const transaction = await Transaction.findById(id).populate('itemId');
    
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    if (status === 'Ready') {
      // Giver drops it
      transaction.status = 'Ready';
      transaction.dropTime = new Date();
      await transaction.save();

      await Notification.create({
        userId: transaction.receiverId,
        type: 'status',
        message: 'Item has been dropped at ' + transaction.lockerId + ' and is ready for pickup'
      });
      return res.json(transaction);
    } 

    if (status === 'Completed') {
      if (transaction.OTP !== otp) return res.status(400).json({ message: 'Invalid OTP' });
      transaction.status = 'Completed';
      transaction.pickupTime = new Date();
      
      const giver = await User.findById(transaction.giverId);
      const receiver = await User.findById(transaction.receiverId);
      
      giver.coins += 7;
      receiver.coins -= 5;

      transaction.itemId.status = 'Exchanged';

      await transaction.itemId.save();
      await giver.save();
      await receiver.save();
      await transaction.save();

      await Notification.create({
        userId: transaction.giverId,
        type: 'collected',
        message: 'Your item was collected. You earned 7 coins!'
      });

      return res.json(transaction);
    }
    
    res.status(400).json({ message: 'Invalid status' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction || transaction.status !== 'Completed') {
      return res.status(400).json({ message: 'Transaction not completed' });
    }

    const toUserId = req.user.id === transaction.giverId.toString() ? transaction.receiverId : transaction.giverId;

    const feedback = new Feedback({
      transactionId: id,
      fromUserId: req.user.id,
      toUserId,
      rating,
      comment
    });

    await feedback.save();

    // Update User overall rating
    const userToUpdate = await User.findById(toUserId);
    const totalRating = (userToUpdate.rating * userToUpdate.ratingCount) + rating;
    userToUpdate.ratingCount += 1;
    userToUpdate.rating = totalRating / userToUpdate.ratingCount;
    await userToUpdate.save();

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
