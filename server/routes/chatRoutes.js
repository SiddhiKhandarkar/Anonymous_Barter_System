const express = require('express');
const { getChat, addMessage } = require('../controllers/chatController');
const auth = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/:transactionId', auth, getChat);
router.post('/:transactionId', auth, addMessage);

module.exports = router;
