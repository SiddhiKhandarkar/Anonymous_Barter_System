const express = require('express');
const auth = require('../middlewares/authMiddleware');
const { getSmartMatches } = require('../controllers/matchingController');

const router = express.Router();

router.get('/smart', auth, getSmartMatches);

module.exports = router;
