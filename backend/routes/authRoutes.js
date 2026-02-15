const express = require('express');
const router = express.Router();
// Import BOTH registerUser and loginUser from the controller
const { registerUser, loginUser } = require('../controllers/authController');

// @route   POST api/auth/register
router.post('/register', registerUser);

// @route   POST api/auth/login
// THIS WAS MISSING:
router.post('/login', loginUser);

module.exports = router;