const Transaction = require('../models/Transaction');
const Item = require('../models/Item');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Feedback = require('../models/Feedback');
const Request = require('../models/Request');
const Dispute = require('../models/Dispute');
const LockerService = require('../services/lockerService');
const { computeEconomy } = require('../utils/coinEconomy');
const { applyFeedbackToUser } = require('../utils/reputation');

exports.createTransaction = async (req, res) => {
  try {
    const { itemId, dropSlot, pickupSlot } = req.body;
    const item = await Item.findById(itemId);
    if (!item || item.status !== 'Available') return res.status(400).json({ message: 'Item not available' });
    if (item.ownerId.toString() === req.user.id) return res.status(400).json({ message: 'Cannot exchange your own item' });

    const receiver = await User.findById(req.user.id);
    const { takerCost, giverReward } = computeEconomy(item);
    if (receiver.coins < takerCost) return res.status(400).json({ message: `Not enough coins. Need ${takerCost} coins.` });
    receiver.coins -= takerCost;

    const { lockerId, otp, qrCode } = LockerService.generateLocker();

    const transaction = new Transaction({
      giverId: item.ownerId,
      receiverId: req.user.id,
      itemId: item._id,
      coinsTransferred: takerCost,
      coinsAwarded: giverReward,
      escrowLockedCoins: takerCost,
      escrowStatus: 'Locked',
      lockerId,
      OTP: otp,
      QRCode: qrCode,
      dropSlot,
      pickupSlot
    });

    item.status = 'Reserved';
    await receiver.save();
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
    })
      .populate('itemId', 'title images category condition')
      .populate('giverId', 'anonymousId')
      .populate('receiverId', 'anonymousId')
      .populate('requestId', 'title bountyCoins');

    const disputes = await Dispute.find({ transactionId: { $in: transactions.map((txn) => txn._id) } });
    const disputeByTxn = new Map(disputes.map((d) => [d.transactionId.toString(), d]));

    const enhanced = transactions.map((txn) => {
      const dispute = disputeByTxn.get(txn._id.toString());
      return {
        ...txn.toObject(),
        disputeStatus: dispute?.status || null,
        disputeReason: dispute?.reason || null
      };
    });

    res.json(enhanced);
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
      
      const bountyCoins = transaction.bountyCoins || 0;
      const bountyDebitedNow = bountyCoins;
      if (receiver.coins < bountyDebitedNow) {
        return res.status(400).json({ message: `Receiver needs ${bountyDebitedNow} extra coins to complete this barter.` });
      }

      giver.coins += (transaction.coinsAwarded || 0) + bountyCoins;
      receiver.coins -= bountyDebitedNow;
      giver.totalTrades += 1;
      receiver.totalTrades += 1;
      transaction.escrowStatus = 'Released';

      transaction.itemId.status = 'Exchanged';

      if (transaction.requestId) {
        await Request.findByIdAndUpdate(transaction.requestId, {
          status: 'Fulfilled',
          fulfilledByTransactionId: transaction._id
        });
      }

      await transaction.itemId.save();
      await giver.save();
      await receiver.save();
      await transaction.save();

      await Notification.create({
        userId: transaction.giverId,
        type: 'collected',
        message: `Your item was collected. You earned ${(transaction.coinsAwarded || 0) + bountyCoins} coins!`
      });

      return res.json(transaction);
    }
    
    res.status(400).json({ message: 'Invalid status' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.raiseDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, details } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.receiverId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only receiver can raise disputes' });
    }
    if (!['Ready', 'Completed'].includes(transaction.status)) {
      return res.status(400).json({ message: 'Dispute can only be raised during/after pickup' });
    }

    const exists = await Dispute.findOne({ transactionId: id });
    if (exists) return res.status(400).json({ message: 'Dispute already raised for this transaction' });

    const dispute = await Dispute.create({
      transactionId: id,
      raisedBy: req.user.id,
      reason,
      details: details || ''
    });

    transaction.status = 'Disputed';
    transaction.escrowStatus = 'OnHold';
    await transaction.save();
    await User.findByIdAndUpdate(transaction.receiverId, { $inc: { disputeCount: 1 } });

    await Notification.create({
      userId: transaction.giverId,
      type: 'status',
      message: 'A locker dispute was raised for one of your transactions.'
    });

    res.status(201).json(dispute);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDisputeByTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const dispute = await Dispute.findOne({ transactionId: id });
    if (!dispute) return res.status(404).json({ message: 'No dispute found for this transaction' });
    res.json(dispute);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resolveDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, resolutionNote } = req.body;
    if (!['approve_refund', 'reject_release'].includes(action)) {
      return res.status(400).json({ message: 'Invalid resolution action' });
    }

    const dispute = await Dispute.findOne({ transactionId: id });
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });
    if (dispute.status === 'Resolved') return res.status(400).json({ message: 'Dispute already resolved' });

    const transaction = await Transaction.findById(id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    const giver = await User.findById(transaction.giverId);
    const receiver = await User.findById(transaction.receiverId);
    const escrow = transaction.escrowLockedCoins || transaction.coinsTransferred || 0;
    const bounty = transaction.bountyCoins || 0;

    if (action === 'approve_refund') {
      if (transaction.escrowStatus === 'Locked' || transaction.escrowStatus === 'OnHold') {
        receiver.coins += escrow;
      } else if (transaction.escrowStatus === 'Released') {
        giver.coins -= (transaction.coinsAwarded || 0) + bounty;
        receiver.coins += escrow + bounty;
      }
      transaction.escrowStatus = 'Refunded';
      dispute.status = 'Resolved';
      dispute.resolutionNote = resolutionNote || 'Refund approved. Escrow returned to receiver.';
    } else {
      if (transaction.escrowStatus === 'Locked' || transaction.escrowStatus === 'OnHold') {
        giver.coins += escrow;
        if (bounty > 0) {
          giver.coins += bounty;
          receiver.coins -= bounty;
        }
      }
      transaction.escrowStatus = 'Released';
      dispute.status = 'Rejected';
      dispute.resolutionNote = resolutionNote || 'Dispute rejected. Escrow released to giver.';
    }

    transaction.status = 'Completed';
    await giver.save();
    await receiver.save();
    await transaction.save();
    await dispute.save();
    await User.findByIdAndUpdate(receiver._id, { $inc: { resolvedDisputes: 1 } });

    await Notification.create({
      userId: receiver._id,
      type: 'status',
      message: `Dispute reviewed: ${action === 'approve_refund' ? 'refund approved' : 'claim rejected and escrow released'}.`
    });

    res.json({ dispute, transaction });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, punctuality, itemQuality, communication, comment } = req.body;

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
      punctuality,
      itemQuality,
      communication,
      comment
    });

    await feedback.save();

    // Update User overall rating
    const userToUpdate = await User.findById(toUserId);
    applyFeedbackToUser(userToUpdate, { rating, punctuality, itemQuality, communication });
    await userToUpdate.save();

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
