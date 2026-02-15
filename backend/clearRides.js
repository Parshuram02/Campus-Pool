const mongoose = require('mongoose');
require('dotenv').config();
const Ride = require('./models/Ride');

const clearRides = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        await Ride.deleteMany({});
        console.log('All rides cleared!');

        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

clearRides();
