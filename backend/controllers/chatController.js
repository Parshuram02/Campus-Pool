const Chat = require('../models/Chat');

// @desc    Get messages for a specific ride
// @route   GET /api/chat/:rideId
exports.getRideMessages = async (req, res) => {
    try {
        const chat = await Chat.findOne({ ride: req.params.rideId })
            .populate('messages.sender', 'name'); // Populate sender name

        if (!chat) return res.json([]);

        res.json(chat.messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
