import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import API, { SOCKET_URL } from '../services/api';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import { Calculator, Check, MapPin, Pencil, Send, Users, X } from 'lucide-react';

const RideDetails = () => {
    const { id } = useParams();
    const { user, loading: authLoading } = useContext(AuthContext);
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [ride, setRide] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const socket = useRef();
    const [calculatedShare, setCalculatedShare] = useState(null);
    const [totalFare, setTotalFare] = useState('');
    const [editingSeats, setEditingSeats] = useState(false);
    const [seatsInput, setSeatsInput] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    const fetchRide = async () => {
        try {
            const res = await API.get(`/rides/${id}`);
            setRide(res.data);
        } catch (err) {
            showToast('Could not load this ride', 'error');
        }
    };

    useEffect(() => {
        fetchRide();

        const fetchChat = async () => {
            try {
                const res = await API.get(`/chat/${id}`);
                setMessages(res.data);
            } catch (err) {
                showToast('Could not load chat history', 'error');
            }
        };
        fetchChat();

        socket.current = io(SOCKET_URL);
        socket.current.emit('join_ride', id);

        socket.current.on('receive_message', (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        return () => socket.current.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!user || !newMessage.trim()) return;
        const senderId = user._id || user.id;
        socket.current.emit('send_message', { rideId: id, senderId, content: newMessage });
        setNewMessage('');
    };

    const handleRequest = async () => {
        try {
            await API.post(`/rides/${id}/request`);
            showToast('Request sent!');
        } catch (err) {
            showToast(err.response?.data?.msg || 'Failed to send request', 'error');
        }
    };

    const handleApproval = async (requestId, status) => {
        try {
            await API.put(`/rides/${id}/request/${requestId}`, { status });
            showToast(`Request ${status}`);
            fetchRide();
        } catch (err) {
            showToast(err.response?.data?.msg || 'Failed to update request', 'error');
        }
    };

    const submitSeats = async (e) => {
        e.preventDefault();
        if (!seatsInput || isNaN(seatsInput)) return;
        try {
            await API.put(`/rides/${id}`, { maxSeats: seatsInput });
            setRide(prev => ({ ...prev, maxSeats: seatsInput }));
            setEditingSeats(false);
            showToast('Seats updated!');
        } catch (err) {
            showToast('Failed to update seats', 'error');
        }
    };

    const calculateShare = () => {
        if (!totalFare || ride.currentOccupancy <= 0) return;
        const share = (totalFare / ride.currentOccupancy).toFixed(2);
        setCalculatedShare(share);

        const senderId = user._id || user.id;
        socket.current.emit('send_message', {
            rideId: id,
            senderId,
            content: `Fare update: total ₹${totalFare} split ${ride.currentOccupancy} ways — each person pays ₹${share}.`
        });
    };

    if (authLoading || !ride || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const isAdmin = (ride.admin?._id || ride.admin).toString() === (user._id || user.id).toString();

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-6xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Ride Info & Requests */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 relative">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
                                <MapPin size={22} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{ride.source} → {ride.destination}</h2>
                                <p className="text-sm text-gray-500">{new Date(ride.departureTime).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl mb-4">
                            <span><strong className="text-gray-800">Host:</strong> {ride.admin?.name || 'Unknown'}</span>
                            <span className="flex items-center gap-1.5"><Users size={16} className="text-indigo-500" /> {ride.currentOccupancy}/{ride.maxSeats} seats</span>
                            {ride.genderFilter === 'female-only' && (
                                <span className="text-pink-600 font-bold">Female Only</span>
                            )}
                        </div>

                        {!isAdmin && (
                            <button onClick={handleRequest} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-indigo-100 transition-all">
                                Request to Join
                            </button>
                        )}

                        {isAdmin && !editingSeats && (
                            <button
                                onClick={() => { setSeatsInput(ride.maxSeats); setEditingSeats(true); }}
                                className="absolute top-6 right-6 flex items-center gap-1.5 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-gray-600 transition-colors"
                            >
                                <Pencil size={14} /> Edit Seats
                            </button>
                        )}

                        {isAdmin && editingSeats && (
                            <form onSubmit={submitSeats} className="absolute top-6 right-6 flex items-center gap-1.5">
                                <input
                                    type="number" min="1" max="7" autoFocus
                                    value={seatsInput}
                                    onChange={e => setSeatsInput(e.target.value)}
                                    className="w-16 p-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                                <button type="submit" className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"><Check size={16} /></button>
                                <button type="button" onClick={() => setEditingSeats(false)} className="p-1.5 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200"><X size={16} /></button>
                            </form>
                        )}
                    </div>

                    {isAdmin && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-3">Join Requests</h3>
                            {ride.requests.length === 0 && <p className="text-gray-500 text-sm">No pending requests.</p>}
                            <div className="space-y-2">
                                {ride.requests.map(req => (
                                    <div key={req._id} className="flex justify-between items-center bg-gray-50 rounded-xl p-3">
                                        <span className="text-sm font-medium text-gray-700">{req.user?.name || 'Unknown'} <span className="text-gray-400">({req.user?.branch || 'N/A'})</span></span>
                                        {req.status === 'pending' ? (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleApproval(req._id, 'accepted')} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Accept</button>
                                                <button onClick={() => handleApproval(req._id, 'rejected')} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Reject</button>
                                            </div>
                                        ) : (
                                            <span className={`text-xs font-bold capitalize ${req.status === 'accepted' ? 'text-green-600' : 'text-red-500'}`}>{req.status}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {isAdmin && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2"><Calculator size={20} className="text-purple-600" /> Fare Split Calculator</h3>
                            <div className="flex items-end gap-3">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Total Trip Fare (₹)</label>
                                    <input
                                        type="number"
                                        value={totalFare}
                                        onChange={e => setTotalFare(e.target.value)}
                                        placeholder="e.g. 500"
                                        className="w-full mt-1 p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                                <button onClick={calculateShare} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl font-bold transition-all">
                                    Calculate
                                </button>
                            </div>
                            <p className="text-sm text-gray-500 mt-2">Splitting between {ride.currentOccupancy} people (including host).</p>
                            {calculatedShare && (
                                <div className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-xl text-center">
                                    <p className="text-purple-900">Each person pays <span className="font-black text-2xl">₹{calculatedShare}</span></p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Chat */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col h-[600px]">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 border-b border-gray-100 pb-3">Ride Chat</h3>
                    <div className="flex-1 overflow-y-auto space-y-2 p-1">
                        {messages.map((m, idx) => {
                            const sender = m.sender || {};
                            const senderId = sender._id || sender;
                            const myId = user._id || user.id;
                            const isMyMessage = senderId?.toString() === myId?.toString();
                            return (
                                <div key={idx} className={`p-3 rounded-xl max-w-[85%] text-sm ${isMyMessage ? 'bg-indigo-600 text-white ml-auto' : 'bg-gray-100 text-gray-800'}`}>
                                    {!isMyMessage && <p className="text-xs font-bold opacity-70 mb-0.5">{sender.name || 'User'}</p>}
                                    <p>{m.content}</p>
                                </div>
                            );
                        })}
                        {messages.length === 0 && <p className="text-gray-400 text-sm text-center mt-6">No messages yet. Say hi!</p>}
                    </div>
                    <form onSubmit={sendMessage} className="mt-3 flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="flex-1 bg-gray-50 border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Type a message..."
                        />
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl"><Send size={18} /></button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RideDetails;
