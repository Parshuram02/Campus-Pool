const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Ride = require('./models/Ride');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(async () => {
    console.log('MongoDB Connected for Seeding');

    // 1. Find a user to be the host
    let host = await User.findOne();
    if (!host) {
        try {
            // Create a dummy user if none exists
            host = await User.create({
                name: "Test User",
                email: "test@example.com",
                password: "password123",
                branch: "Comp",
                year: "TE",
                gender: "Male",
                phone: "9999999999"
            });
            console.log("Created dummy host");
        } catch (e) {
            console.log("User creation failed, might already exist fully or partially.");
            host = await User.findOne(); // Try finding again
        }
    }

    if (!host) {
        console.error("Could not find or create a host user. Aborting.");
        process.exit(1);
    }

    // 2. Create a test ride
    await Ride.create({
        admin: host._id,
        source: "AIT Gate",
        destination: "Phoenix Mall",
        departureTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // Expires in 1 hour
        maxSeats: 4,
        currentOccupancy: 1,
        costPerPerson: 50,
        typeOfVehicle: "Auto",
        members: [host._id],
        status: "open"
    });

    console.log('Test Ride Created!');
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
