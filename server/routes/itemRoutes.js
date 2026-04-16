const express = require('express');
const { createItem, getItems, getMyItems, getItemById } = require('../controllers/itemController');
const auth = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', auth, createItem);
router.get('/', getItems);
router.get('/my', auth, getMyItems);
router.get('/:id', getItemById);

module.exports = router;
