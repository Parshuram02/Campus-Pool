const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { registerUser, loginUser, getUser, getProfileStats } = require('../controllers/authController');

// @route   POST api/auth/register
router.post('/register', registerUser);

// @route   POST api/auth/login
router.post('/login', loginUser);

// @route   GET api/auth/user
// @desc    Get the logged-in user's own profile
router.get('/user', auth, getUser);

// @route   GET api/auth/profile/:id
// @desc    Get a user's profile stats (hosted/joined ride counts)
router.get('/profile/:id', auth, getProfileStats);

module.exports = router;