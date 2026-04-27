const express = require('express');
const { createTransaction, getTransactions, updateStatus, addFeedback, raiseDispute, getDisputeByTransaction, resolveDispute } = require('../controllers/transactionController');
const auth = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', auth, createTransaction);
router.get('/', auth, getTransactions);
router.put('/:id', auth, updateStatus);
router.post('/:id/feedback', auth, addFeedback);
router.post('/:id/dispute', auth, raiseDispute);
router.get('/:id/dispute', auth, getDisputeByTransaction);
router.post('/:id/dispute/resolve', auth, resolveDispute);

module.exports = router;
