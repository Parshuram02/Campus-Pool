const Ride = require('../models/Ride');
const User = require('../models/User');

// @desc    Create a new ride card
exports.createRide = async (req, res) => {
    try {
        const { source, destination, departureTime, maxSeats, costPerPerson, typeOfVehicle, fromCoordinates, toCoordinates, genderFilter, expiryDuration } = req.body;

        const depTime = new Date(departureTime);
        const duration = expiryDuration ? parseInt(expiryDuration) : 1; // Default 1 hour
        const expiresAt = new Date(depTime.getTime() + duration * 60 * 60 * 1000);

        const newRide = new Ride({
            admin: req.user,
            source,
            destination,
            departureTime,
            maxSeats,
            costPerPerson,
            typeOfVehicle,
            fromCoordinates: { type: 'Point', coordinates: fromCoordinates || [0, 0] },
            toCoordinates: { type: 'Point', coordinates: toCoordinates || [0, 0] },
            genderFilter,
            members: [req.user],
            expiresAt
        });

        const ride = await newRide.save();
        res.status(201).json(ride);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all active rides (with filters & sorting)
exports.getAllRides = async (req, res) => {
    try {
        const { destination, sortBy } = req.query;

        // Filter: Status Open AND Not Expired
        let query = {
            status: 'open',
            expiresAt: { $gt: new Date() } // Only show unexpired rides
        };

        // Destination Filter
        if (destination) {
            query.destination = { $regex: destination, $options: 'i' };
        }

        let sortOptions = { departureTime: 1 }; // Default: Earliest first

        if (sortBy === 'price') sortOptions = { costPerPerson: 1 };
        if (sortBy === 'seats') sortOptions = { maxSeats: -1 };
        if (sortBy === 'time') sortOptions = { departureTime: 1 };
        if (sortBy === 'place') sortOptions = { destination: 1 };

        const rides = await Ride.find(query)
            .populate('admin', ['name', 'branch', 'gender'])
            .populate('requests.user', 'name email branch')
            .sort(sortOptions);

        res.json(rides);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Request to join a ride
// @route   POST /api/rides/:id/request
exports.requestToJoin = async (req, res) => {
    try {
        const ride = await Ride.findById(req.params.id);
        if (!ride) return res.status(404).json({ msg: 'Ride not found' });

        // Prevent admin from joining their own ride
        if (ride.admin.toString() === req.user) {
            return res.status(400).json({ msg: 'You are the admin of this ride' });
        }

        // Check if user already requested
        const alreadyRequested = ride.requests.find(r => r.user.toString() === req.user);
        if (alreadyRequested) return res.status(400).json({ msg: 'Request already sent' });

        // Check for Gender Restriction
        if (ride.genderFilter === 'female-only') {
            const user = await User.findById(req.user);
            if (user.gender !== 'Female') {
                return res.status(403).json({ msg: 'This ride is for Females only' });
            }
        }

        ride.requests.push({ user: req.user });
        await ride.save();

        res.json({ msg: 'Join request sent to admin' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @desc    Accept or Reject a request
// @route   PUT /api/rides/:id/request/:requestId
exports.handleRequest = async (req, res) => {
    try {
        const { status } = req.body; // 'accepted' or 'rejected'
        const ride = await Ride.findById(req.params.id);

        // Check if the person handling is actually the Admin
        if (ride.admin.toString() !== req.user) {
            return res.status(401).json({ msg: 'Unauthorized' });
        }

        const request = ride.requests.id(req.params.requestId);
        if (!request) return res.status(404).json({ msg: 'Request not found' });

        if (status === 'accepted') {
            if (ride.currentOccupancy >= ride.maxSeats) {
                return res.status(400).json({ msg: 'Ride is full' });
            }
            request.status = 'accepted';
            ride.members.push(request.user);
            ride.currentOccupancy += 1;
        } else {
            request.status = 'rejected';
        }

        await ride.save();

        // Notify the user via Socket
        const io = req.app.get('io');
        io.to(req.params.id).emit('receive_message', {
            sender: { name: 'System' },
            content: `Request for user ${request.user} was ${status}`,
            timestamp: new Date()
        });

        res.json(ride);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// @desc    Update ride details (Admin only: seats, etc.)
// @route   PUT /api/rides/:id
exports.updateRide = async (req, res) => {
    try {
        const { maxSeats } = req.body;
        let ride = await Ride.findById(req.params.id);

        if (!ride) return res.status(404).json({ msg: 'Ride not found' });

        // Ensure user is admin
        if (ride.admin.toString() !== req.user) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        if (maxSeats) ride.maxSeats = maxSeats;

        await ride.save();
        res.json(ride);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};