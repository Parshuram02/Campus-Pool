const mongoose = require('mongoose');
require('dotenv').config();

const fixIndexes = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const collection = mongoose.connection.collection('users');

        // List indexes
        const indexes = await collection.indexes();
        console.log('Current Indexes:', indexes);

        // Drop the problematic index if it exists
        const regNoIndex = indexes.find(idx => idx.name === 'regNo_1');
        if (regNoIndex) {
            await collection.dropIndex('regNo_1');
            console.log('Dropped stale index: regNo_1');
        } else {
            console.log('Index regNo_1 not found.');
        }

        const phoneIndex = indexes.find(idx => idx.name === 'phone_1');
        if (phoneIndex) {
            await collection.dropIndex('phone_1');
            console.log('Dropped stale index: phone_1');
        } else {
            console.log('Index phone_1 not found.');
        }

        // Drop email index just in case of weirdness, let mongoose recreate it
        // await collection.dropIndex('email_1'); 

        console.log('Done! Please restart your server to allow Mongoose to rebuild valid indexes.');
        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

fixIndexes();
