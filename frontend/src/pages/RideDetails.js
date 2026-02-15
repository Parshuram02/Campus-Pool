import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import io from 'socket.io-client';
import Navbar from '../components/Navbar';

const RideDetails = () => {
    const { id } = useParams();
    const { user, loading } = useContext(AuthContext);
    console.log('Current User Context:', user); // Debugging user ID issue
    const navigate = useNavigate();
    const [ride, setRide] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const socket = useRef();
    const [calculatedShare, setCalculatedShare] = useState(null);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        const fetchRide = async () => {
            const res = await axios.get(`http://localhost:5000/api/rides`); // Should fetch single ride, need endpoint
            // filtering client side for now as I didn't make getSingleRide endpoint
            const r = res.data.find(r => r._id === id);
            setRide(r);
        };
        fetchRide();

        // Fetch Chat History
        const fetchChat = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/chat/${id}`);
                setMessages(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchChat();

        // Socket Setup
        socket.current = io('http://localhost:5000');
        socket.current.emit('join_ride', id);

        socket.current.on('receive_message', (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        return () => socket.current.disconnect();
    }, [id]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!user) return;
        const senderId = user._id || user.id;
        if (!senderId) {
            console.error('SENDER ID IS MISSING!');
            return;
        }
        const msgData = {
            rideId: id,
            senderId: senderId,
            content: newMessage
        };

        await socket.current.emit('send_message', msgData);
        // Optimistic UI update
        // setMessages(prev => [...prev, { ...msgData, sender: user }]); // Socket will echo back usually or we handle it
        setNewMessage('');
    };

    const handleRequest = async () => {
        try {
            await axios.post(`http://localhost:5000/api/rides/${id}/request`);
            alert('Request Sent!');
        } catch (err) {
            alert(err.response.data.msg);
        }
    };

    const handleApproval = async (requestId, status) => {
        try {
            await axios.put(`http://localhost:5000/api/rides/${id}/request/${requestId}`, { status });
            // Refresh ride data
            const res = await axios.get(`http://localhost:5000/api/rides`); // efficient? no. working? yes.
            const r = res.data.find(r => r._id === id);
            setRide(r);
        } catch (err) {
            alert(err.response.data.msg);
        }
    };

    if (loading || !ride || !user) return <div>Loading...</div>;

    // Relaxed check: compare as strings to avoid ObjectId vs String issues
    const isAdmin = user && (ride.admin?._id || ride.admin).toString() === (user._id || user.id).toString();
    console.log('DEBUG: RideDetails isAdmin Check');
    console.log('User:', user);
    console.log('Ride Admin:', ride.admin);
    console.log('Comparison:', ride.admin?._id, '===', user?._id);
    console.log('Is Admin Result:', isAdmin);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto p-4 flex gap-4">
                {/* Left: Ride Info & Requests */}
                <div className="w-2/3 space-y-4">
                    <div className="bg-white p-6 rounded shadow relative">
                        <h2 className="text-2xl font-bold">{ride.source} → {ride.destination}</h2>
                        <p>Date: {new Date(ride.departureTime).toLocaleString()}</p>
                        <p>Host: {ride.admin?.name || 'Unknown'}</p>
                        <p>Gender Filter: {ride.genderFilter}</p>
                        <p className="mt-2 font-bold text-blue-600">
                            Seats: {ride.currentOccupancy} / {ride.maxSeats}
                        </p>

                        {!isAdmin && (
                            <button onClick={handleRequest} className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded">
                                Request to Join
                            </button>
                        )}

                        {isAdmin && (
                            <button
                                onClick={async () => {
                                    const newSeats = prompt("Enter new Total Seats:", ride.maxSeats);
                                    if (newSeats && !isNaN(newSeats)) {
                                        try {
                                            await axios.put(`http://localhost:5000/api/rides/${id}`, { maxSeats: newSeats });
                                            setRide(prev => ({ ...prev, maxSeats: newSeats }));
                                            alert("Seats updated!");
                                        } catch (err) {
                                            alert("Failed to update seats");
                                        }
                                    }
                                }}
                                className="absolute top-6 right-6 text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-gray-700"
                            >
                                ✏️ Edit Seats
                            </button>
                        )}
                    </div>

                    {isAdmin && (
                        <div className="bg-white p-6 rounded shadow">
                            <h3 className="text-xl font-bold mb-2">Requests</h3>
                            {ride.requests.map(req => (
                                <div key={req._id} className="flex justify-between items-center border-b py-2">
                                    <span>{req.user?.name || 'Unknown'} ({req.user?.branch || 'N/A'})</span>
                                    <span>Status: {req.status}</span>
                                    {req.status === 'pending' && (
                                        <div className="gap-2 flex">
                                            <button onClick={() => handleApproval(req._id, 'accepted')} className="bg-green-500 text-white px-2 py-1 rounded">Accept</button>
                                            <button onClick={() => handleApproval(req._id, 'rejected')} className="bg-red-500 text-white px-2 py-1 rounded">Reject</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {ride.requests.length === 0 && <p>No pending requests.</p>}
                        </div>
                    )}



                    {/* Fare Split Calculator (Admin Only) */}
                    {isAdmin && (
                        <div className="bg-white p-6 rounded shadow mt-4">
                            <h3 className="text-xl font-bold mb-2">Fare Split Calculator</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Total Trip Fare (₹)</label>
                                    <input
                                        type="number"
                                        className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. 500"
                                        id="totalFareInput"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-500">
                                        Splitting between <span className="font-bold">{ride.currentOccupancy}</span> people (including you).
                                    </p>
                                    <button
                                        onClick={() => {
                                            const total = document.getElementById('totalFareInput').value;
                                            if (total && ride.currentOccupancy > 0) {
                                                const share = (total / ride.currentOccupancy).toFixed(2);
                                                setCalculatedShare(share);

                                                // Optional: Send this as a chat message
                                                const senderId = user._id || user.id;
                                                if (senderId) {
                                                    const msgData = {
                                                        rideId: id,
                                                        senderId: senderId,
                                                        content: `ADMIN UPDATE: Total Fare is ₹${total}. Each person pays ₹${share}.`
                                                    };
                                                    socket.current.emit('send_message', msgData);
                                                }
                                            }
                                        }}
                                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 font-bold"
                                    >
                                        Calculate & Share
                                    </button>
                                </div>
                                {calculatedShare && (
                                    <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded text-center">
                                        <p className="text-lg text-purple-900">
                                            Each person pays: <span className="font-black text-2xl">₹{calculatedShare}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Chat */}
                <div className="w-1/3 bg-white p-4 rounded shadow flex flex-col h-[500px]">
                    <h3 className="text-xl font-bold mb-2 border-b pb-2">Ride Chat</h3>
                    <div className="flex-1 overflow-y-auto space-y-2 p-2">
                        {messages.map((m, idx) => {
                            const sender = m.sender || {};
                            const isMyMessage = user && (sender === user._id || sender._id === user._id);
                            const senderName = sender.name || 'User';
                            return (
                                <div key={idx} className={`p-2 rounded max-w-[80%] ${isMyMessage ? 'bg-indigo-100 self-end ml-auto' : 'bg-gray-100 mr-auto'}`}>
                                    <p className="text-xs font-bold text-gray-500">{senderName}</p>
                                    <p>{m.content}</p>
                                </div>
                            );
                        })}
                    </div>
                    <form onSubmit={sendMessage} className="mt-2 flex">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 border rounded-l px-2 py-1"
                            placeholder="Type a message..."
                        />
                        <button type="submit" className="bg-indigo-600 text-white px-4 rounded-r">Send</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RideDetails;
