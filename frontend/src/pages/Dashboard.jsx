import React, { useEffect, useState } from 'react';
import API from '../services/api';
import RideCard from '../components/RideCard';
import { Plus, X, Car } from 'lucide-react';

const Dashboard = () => {
    const [rides, setRides] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // State for the "Create Ride" form
    const [newRide, setNewRide] = useState({
        source: '',
        destination: '',
        departureTime: '',
        maxSeats: 3,
        costPerPerson: '',
        typeOfVehicle: 'Uber Go',
        expiryDuration: 1 // Default 1 hour
    });

    const [sortBy, setSortBy] = useState('time'); // time, price, place, seats

    // 1. Fetch Rides from Backend
    const fetchRides = async () => {
        try {
            setLoading(true);
            const res = await API.get(`/rides?sortBy=${sortBy}`);
            setRides(res.data);
        } catch (err) {
            console.error("Error fetching rides", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRides();
    }, [sortBy]);

    // 2. Handle Joining a Ride
    const handleJoin = async (id) => {
        try {
            await API.post(`/rides/${id}/request`);
            alert("Success: Join request sent to the Admin!");
        } catch (err) {
            alert(err.response?.data?.msg || "Failed to send request");
        }
    };

    // 3. Handle Creating a New Ride
    const handleCreateRide = async (e) => {
        e.preventDefault();
        try {
            await API.post('/rides', newRide);
            setShowModal(false); // Close modal
            fetchRides(); // Refresh the list
            // Reset form
            setNewRide({
                source: '',
                destination: '',
                departureTime: '',
                maxSeats: 3,
                costPerPerson: '',
                typeOfVehicle: 'Uber Go',
                expiryDuration: 1
            });
        } catch (err) {
            alert(err.response?.data?.msg || "Error creating ride");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-6xl mx-auto p-6 space-y-8">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-2xl -ml-10 -mb-10"></div>

                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
                            Share RIdes, <br />
                            <span className="text-blue-200">Save Money.</span>
                        </h2>
                        <p className="text-blue-100 text-lg mb-8 max-w-md leading-relaxed">
                            Connect with fellow students for safe, affordable, and eco-friendly rides to and from campus.
                        </p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-white text-indigo-600 px-8 py-3.5 rounded-full font-bold text-lg hover:bg-blue-50 hover:scale-105 transition-all shadow-xl flex items-center gap-2 group"
                        >
                            <Plus className="group-hover:rotate-90 transition-transform" size={24} />
                            Host a New Ride
                        </button>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                            Available Pools
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{rides.length}</span>
                        </h2>
                        <p className="text-gray-500 mt-1">Find students heading your way.</p>
                    </div>

                    <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl">
                        {['time', 'price', 'place', 'seats'].map(type => (
                            <button
                                key={type}
                                onClick={() => setSortBy(type)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${sortBy === type
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                    }`}
                            >
                                {type === 'time' ? 'Earliest' : type}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rides.length > 0 ? (
                            rides.map(ride => (
                                <RideCard key={ride._id} ride={ride} onJoin={handleJoin} />
                            ))
                        ) : (
                            <div className="col-span-full bg-white p-12 rounded-3xl text-center border-2 border-dashed border-gray-200">
                                <Car size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg">No rides found. Why not host one?</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Create Ride Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-800">Post New Ride</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateRide} className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Route</label>
                                <div className="space-y-2 mt-1">
                                    <input type="text" placeholder="From (e.g. AIT Gate)" className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        onChange={e => setNewRide({ ...newRide, source: e.target.value })} required />
                                    <input type="text" placeholder="To (e.g. Airport)" className="w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        onChange={e => setNewRide({ ...newRide, destination: e.target.value })} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Departure</label>
                                    <input type="datetime-local" className="w-full mt-1 p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        onChange={e => setNewRide({ ...newRide, departureTime: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Total Seats</label>
                                    <input type="number" min="1" max="7" className="w-full mt-1 p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newRide.maxSeats} onChange={e => setNewRide({ ...newRide, maxSeats: e.target.value })} required />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Estimated Cost (₹)</label>
                                <input type="number" placeholder="Total fare to split" className="w-full mt-1 p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    onChange={e => setNewRide({ ...newRide, costPerPerson: e.target.value })} required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Expiry (Hrs)</label>
                                    <input type="number" min="1" max="24" defaultValue="1" className="w-full mt-1 p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        onChange={e => setNewRide({ ...newRide, expiryDuration: e.target.value })} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Vehicle Type</label>
                                    <select className="w-full mt-1 p-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={newRide.typeOfVehicle} onChange={e => setNewRide({ ...newRide, typeOfVehicle: e.target.value })}>
                                        <option value="Uber Go">Uber Go</option>
                                        <option value="Uber Premier">Premier</option>
                                        <option value="Auto">Auto</option>
                                        <option value="Bike">Bike</option>
                                        <option value="Personal">Personal</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 mt-4">
                                Publish Ride
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;