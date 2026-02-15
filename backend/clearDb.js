const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const clearUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');
        await User.deleteMany({});
        console.log('Users collection cleared!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

clearUsers();
