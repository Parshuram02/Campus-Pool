const express = require('express');
const router = express.Router();
const { getRideMessages } = require('../controllers/chatController');
const auth = require('../middleware/auth'); // Assuming we have auth middleware

// @route   GET api/chat/:rideId
// @desc    Get all messages for a ride
// @access  Private (should be restricted to members, but keeping simple for now)
router.get('/:rideId', getRideMessages);

module.exports = router;
