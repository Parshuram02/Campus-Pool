const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    source: { type: String, required: true },
    destination: { type: String, required: true },
    departureTime: { type: Date, required: true },
    maxSeats: { type: Number, required: true },
    currentOccupancy: { type: Number, default: 1 }, // Admin is the first person
    costPerPerson: { type: Number },
    typeOfVehicle: { type: String }, // e.g., UberGo, Prime, Personal
    status: { type: String, enum: ['open', 'full', 'completed'], default: 'open' },
    fromCoordinates: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    toCoordinates: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true }
    },
    genderFilter: { type: String, enum: ['all', 'female-only'], default: 'all' },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    requests: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
    }],
    expiresAt: { type: Date, required: true },
}, { timestamps: true });

rideSchema.index({ fromCoordinates: '2dsphere' });
rideSchema.index({ toCoordinates: '2dsphere' });

module.exports = mongoose.model('Ride', rideSchema);