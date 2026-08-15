import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import RideCard from '../components/RideCard';
import Navbar from '../components/Navbar';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Plus, X, Car, Search, ArrowRight } from 'lucide-react';

const Dashboard = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [rides, setRides] = useState([]);
    const [filteredRides, setFilteredRides] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Form state for creating a new ride
    const [newRide, setNewRide] = useState({
        source: '',
        destination: '',
        departureTime: '',
        maxSeats: 3,
        costPerPerson: '',
        typeOfVehicle: 'Uber Go',
        expiryDuration: 1
    });

    const [sortBy, setSortBy] = useState('time'); // time, price, place, seats

    // 1. Fetch Rides from Backend
    const fetchRides = async () => {
        try {
            setLoading(true);
            const res = await API.get(`/rides?sortBy=${sortBy}`);
            const data = res.data.rides ?? res.data;
            setRides(data);
            setFilteredRides(data);
        } catch (err) {
            showToast("Couldn't load rides. Please refresh.", 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (user) fetchRides();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortBy, user]);

    // Handle Search Filtering
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredRides(rides);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = rides.filter(r => 
                r.source?.toLowerCase().includes(query) || 
                r.destination?.toLowerCase().includes(query) ||
                r.typeOfVehicle?.toLowerCase().includes(query)
            );
            setFilteredRides(filtered);
        }
    }, [searchQuery, rides]);

    // 2. Handle Joining a Ride
    const handleJoin = async (id) => {
        try {
            await API.post(`/rides/${id}/request`);
            showToast('Join request sent to host successfully!');
        } catch (err) {
            showToast(err.response?.data?.msg || 'Failed to send join request', 'error');
        }
    };

    // 3. Handle Creating a New Ride
    const handleCreateRide = async (e) => {
        e.preventDefault();
        try {
            await API.post('/rides', newRide);
            setShowModal(false);
            fetchRides();
            showToast('Ride posted successfully!');
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
            showToast(err.response?.data?.msg || 'Error creating ride', 'error');
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-semibold text-neutral-500">Loading Campus Pool...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-neutral-900 font-sans selection:bg-black selection:text-white flex flex-col">
            <Navbar onOpenHostModal={() => setShowModal(true)} />

            {/* HERO - clean editorial layout with subtle grayish background */}
            <section className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-b from-[#F3F4F7] via-[#EAECEF] to-[#E2E5EC] text-neutral-900">
                <div className="relative max-w-7xl mx-auto min-h-[560px] px-6 md:px-12 lg:px-8 flex items-center">
                    <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] items-center gap-8 lg:gap-0 w-full py-16 md:py-20">
                        {/* Copy */}
                        <div className="relative z-10 max-w-xl text-left">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-[-0.045em] text-neutral-950 leading-[1.02]">
                                Go anywhere,
                                <br />
                                <span className="text-neutral-400">move the way you want</span>
                            </h1>

                            <p className="mt-6 max-w-lg text-base md:text-lg text-neutral-600 leading-7 text-left">
                                Request a ride in minutes, hop in, and get to your destination safely, split travel costs, and connect with fellow students.
                            </p>

                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="bg-black text-white px-7 py-4 rounded-xl font-semibold text-sm hover:bg-neutral-800 transition-all shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2.5 group"
                                >
                                    <span>Host a Ride</span>
                                    <Plus size={17} className="group-hover:rotate-90 transition-transform duration-300" />
                                </button>

                                <button
                                    onClick={() => document.getElementById('available-pools')?.scrollIntoView({ behavior: 'smooth' })}
                                    className="bg-white/90 text-neutral-900 border border-neutral-300 px-7 py-4 rounded-xl font-semibold text-sm hover:bg-white transition-all shadow-sm flex items-center gap-2"
                                >
                                    <span>Explore Pools</span>
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>

                        {/* User's SVG Hero Illustration */}
                        <div className="relative h-[360px] sm:h-[430px] lg:h-[520px] w-full flex items-center justify-end">
                            <img
                                src="/assets/ride-hero-map.svg"
                                alt="Campus Pool Ride Map Illustration"
                                className="h-full w-full object-contain object-right select-none pointer-events-none drop-shadow-md"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* MAIN CONTENT AREA - LIGHT SECTION */}
            <main className="max-w-7xl mx-auto px-6 py-12 space-y-10 w-full flex-1">
                {/* SEARCH & FILTER SECTION */}
                <div id="available-pools" className="space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 flex items-center gap-3">
                                Available Pools
                                <span className="bg-black text-white text-xs px-3 py-1 rounded-xl font-bold">
                                    {filteredRides.length}
                                </span>
                            </h2>
                            <p className="text-sm font-medium text-neutral-500 mt-1">
                                Browse active student rides heading your way.
                            </p>
                        </div>

                        {/* Sort Tabs */}
                        <div className="flex items-center gap-1 bg-neutral-200/60 p-1.5 rounded-xl text-xs font-bold w-full md:w-auto overflow-x-auto">
                            {[
                                { key: 'time', label: 'Earliest' },
                                { key: 'price', label: 'Price' },
                                { key: 'place', label: 'Route' },
                                { key: 'seats', label: 'Seats' }
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setSortBy(tab.key)}
                                    className={`px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                                        sortBy === tab.key
                                        ? 'bg-white text-black shadow-sm'
                                        : 'text-neutral-600 hover:text-black'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search Input Bar */}
                    <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by pickup, destination, or vehicle..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent shadow-sm transition-all"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 hover:text-black"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* RIDES LIST FEED */}
                {loading ? (
                    <div className="flex flex-col justify-center items-center h-64 gap-3">
                        <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Loading Rides...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRides.length > 0 ? (
                            filteredRides.map(ride => (
                                <RideCard key={ride._id} ride={ride} onJoin={handleJoin} />
                            ))
                        ) : (
                            <div className="col-span-full bg-white p-14 rounded-2xl text-center border border-neutral-200/80 shadow-sm max-w-md mx-auto space-y-4">
                                <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center text-neutral-400 mx-auto">
                                    <Car size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-neutral-900">No pools found</h3>
                                <p className="text-sm text-neutral-500 leading-relaxed">
                                    There are currently no active ride pools matching your search. Be the first to host one!
                                </p>
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="bg-black text-white px-7 py-3 rounded-xl text-xs font-bold hover:bg-neutral-800 transition-all shadow-md inline-flex items-center gap-2"
                                >
                                    <Plus size={16} />
                                    Post a Ride
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* CREATE RIDE MODAL - Glassmorphism */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-neutral-100 animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/50">
                            <div>
                                <h2 className="text-xl font-extrabold text-neutral-900">Post New Ride</h2>
                                <p className="text-xs text-neutral-500 font-medium mt-0.5">Share your route and split travel costs</p>
                            </div>
                            <button 
                                onClick={() => setShowModal(false)} 
                                className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-500 hover:text-black hover:bg-neutral-200 flex items-center justify-center transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleCreateRide} className="p-6 space-y-5">
                            <div className="space-y-3">
                                <label className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider block">Route Details</label>
                                <div className="space-y-2">
                                    <input 
                                        type="text" 
                                        placeholder="From (e.g. AIT Campus Main Gate)" 
                                        className="w-full p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-black focus:outline-none transition-all"
                                        onChange={e => setNewRide({ ...newRide, source: e.target.value })} 
                                        required 
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="To (e.g. Pune Station / Airport)" 
                                        className="w-full p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-black focus:outline-none transition-all"
                                        onChange={e => setNewRide({ ...newRide, destination: e.target.value })} 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider block mb-1.5">Departure Time</label>
                                    <input 
                                        type="datetime-local" 
                                        className="w-full p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-black focus:outline-none transition-all"
                                        onChange={e => setNewRide({ ...newRide, departureTime: e.target.value })} 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider block mb-1.5">Total Seats</label>
                                    <input 
                                        type="number" 
                                        min="1" 
                                        max="7" 
                                        className="w-full p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-black focus:outline-none transition-all"
                                        value={newRide.maxSeats} 
                                        onChange={e => setNewRide({ ...newRide, maxSeats: e.target.value })} 
                                        required 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider block mb-1.5">Cost Per Person (₹)</label>
                                    <input 
                                        type="number" 
                                        placeholder="e.g. 120" 
                                        className="w-full p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-black focus:outline-none transition-all"
                                        onChange={e => setNewRide({ ...newRide, costPerPerson: e.target.value })} 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-extrabold text-neutral-400 uppercase tracking-wider block mb-1.5">Vehicle Type</label>
                                    <select 
                                        className="w-full p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-black focus:outline-none transition-all"
                                        value={newRide.typeOfVehicle} 
                                        onChange={e => setNewRide({ ...newRide, typeOfVehicle: e.target.value })}
                                    >
                                        <option value="Uber Go">Uber Go</option>
                                        <option value="Uber Premier">Uber Premier</option>
                                        <option value="Auto">Auto</option>
                                        <option value="Bike">Bike</option>
                                        <option value="Personal">Personal Vehicle</option>
                                    </select>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="w-full bg-black hover:bg-neutral-800 text-white py-4 rounded-xl font-bold text-base transition-all shadow-xl hover:scale-[1.01] active:scale-[0.99] mt-2"
                            >
                                Publish Ride Listing
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;