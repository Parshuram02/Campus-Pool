const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db'); // You'll create this next
connectDB(); // Connect to the database
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for dev
        methods: ["GET", "POST"]
    }
});
const Chat = require('./models/Chat');

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`${req.method} request for '${req.url}'`);
    next();
});

// Socket.IO Logic
app.set('io', io); // Make io accessible in routes

io.on('connection', (socket) => {
    console.log('User Connected:', socket.id);

    socket.on('join_ride', (rideId) => {
        socket.join(rideId);
        console.log(`User with ID: ${socket.id} joined ride: ${rideId}`);
    });

    socket.on('send_message', async (data) => {
        console.log('Received message data:', data); // Debugging
        // data: { rideId, senderId, content }
        const { rideId, senderId, content } = data;

        if (!senderId) {
            console.error('Error: senderId is missing in message data');
            return;
        }

        try {
            // Save to DB
            let chat = await Chat.findOne({ ride: rideId });
            if (!chat) {
                chat = new Chat({ ride: rideId, messages: [] });
            }

            const newMessage = { sender: senderId, content, timestamp: new Date() };
            chat.messages.push(newMessage);
            await chat.save();

            // Populate sender info for the real-time message
            // We need to fetch the user's name to send to the frontend immediately
            const User = require('./models/User'); // Ensure User model is loaded
            const senderUser = await User.findById(senderId).select('name');

            const populatedMessage = {
                ...newMessage,
                sender: { _id: senderId, name: senderUser ? senderUser.name : 'Unknown' }
            };

            // Broadcast to room (including sender)
            io.to(rideId).emit('receive_message', populatedMessage);

        } catch (err) {
            console.error('Error saving/sending message:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
    });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/rides', require('./routes/rideRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
// Routes (We will add these soon)
app.get('/', (req, res) => res.send('Campus Pool API Running'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));