const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new student
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
    try {
        const { name, email, password, registrationNo, branch, gender } = req.body;

        // 1. Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already registered' });
        }

        // 2. College Email Validation - REMOVED per request
        // if (!email.endsWith('@aitpune.edu.in')) { ... }

        // 3. Create and Save User (Password hashing handled in pre-save hook)
        user = new User({
            name,
            email,
            password, // Raw password
            registrationNo,
            branch,
            gender
        });

        await user.save();

        // 4. Generate JWT
        const payload = { userId: user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            token,
            user: { id: user.id, name: user.name, email: user.email }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

// @desc    Authenticate student & get token
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 2. Compare Password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 3. Generate JWT
        const payload = { userId: user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                branch: user.branch,
                year: user.year
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error during login' });
    }
};

// @desc    Get logged in user data (Useful for Profile page)
// @route   GET /api/auth/user
exports.getUser = async (req, res) => {
    try {
        // req.user comes from your 'auth' middleware
        const user = await User.findById(req.user).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get user stats for profile
exports.getProfileStats = async (req, res) => {
    try {
        const userId = req.params.id;

        const hostedRides = await Ride.countDocuments({ admin: userId });
        const joinedRides = await Ride.countDocuments({
            members: userId,
            admin: { $ne: userId } // Count only where they aren't the host
        });

        const user = await User.findById(userId).select('-password');

        res.json({
            ...user._doc,
            hostedCount: hostedRides,
            joinedCount: joinedRides
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};