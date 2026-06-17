const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createRide, getAllRides, getRideById, requestToJoin, handleRequest, updateRide } = require('../controllers/rideController');

router.post('/:id/request', auth, requestToJoin);
router.put('/:id/request/:requestId', auth, handleRequest);
router.put('/:id', auth, updateRide);

// @route   POST api/rides
// @desc    Create a ride (Protected)
router.post('/', auth, createRide);

// @route   GET api/rides
// @desc    Get all rides (paginated)
router.get('/', getAllRides);

// @route   GET api/rides/:id
// @desc    Get a single ride
router.get('/:id', getRideById);

module.exports = router;