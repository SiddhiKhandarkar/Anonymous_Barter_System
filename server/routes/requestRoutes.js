const express = require('express');
const auth = require('../middlewares/authMiddleware');
const { createRequest, getOpenRequests, fulfillRequest } = require('../controllers/requestController');

const router = express.Router();

router.post('/', auth, createRequest);
router.get('/', auth, getOpenRequests);
router.post('/:id/fulfill', auth, fulfillRequest);

module.exports = router;
