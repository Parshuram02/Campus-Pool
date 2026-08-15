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
                <div className="relative max-w-[1440px] mx-auto min-h-[620px] px-6 md:px-12 lg:px-10 flex items-center">
                    <div className="grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] items-center gap-8 lg:gap-4 w-full py-12 md:py-16">
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

                        {/* User's Animated SVG Hero Map Illustration - Scaled up to occupy full right side */}
                        <div className="relative h-[420px] sm:h-[520px] lg:h-[640px] w-full flex items-center justify-center lg:justify-end select-none">
                            <svg viewBox="0 0 1000 620" fill="none" className="h-full w-full object-contain object-right drop-shadow-xl scale-105 sm:scale-110 lg:scale-120 transform origin-right">
                                <defs>
                                    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
                                        <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#111827" floodOpacity=".10"/>
                                    </filter>
                                    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="18"/>
                                    </filter>
                                </defs>

                                {/* Soft map background terrain */}
                                <path d="M50 130C210 45 370 90 490 155C625 228 720 180 950 92V550H40C95 445 150 355 50 130Z" fill="#EFEFEC"/>
                                <path d="M650 40C760 15 850 28 975 78V245C875 206 790 225 705 176C650 144 615 93 650 40Z" fill="#E8E8E5"/>
                                <path d="M65 390C215 335 315 355 400 420C490 488 575 492 690 420C780 364 875 360 970 405V580H35C20 500 28 445 65 390Z" fill="#F3F3F0"/>

                                {/* Secondary branch road */}
                                <path d="M280 50C305 160 378 208 476 236C562 261 617 238 700 188" stroke="#E0E0DC" strokeWidth="46" strokeLinecap="round"/>
                                <path d="M280 50C305 160 378 208 476 236C562 261 617 238 700 188" stroke="#FAFAF8" strokeWidth="35" strokeLinecap="round"/>

                                {/* Main highway road */}
                                <path d="M-30 472C150 405 230 470 342 420C445 374 498 283 595 296C705 311 765 410 1015 324" stroke="#D7D7D3" strokeWidth="74" strokeLinecap="round"/>
                                <path d="M-30 472C150 405 230 470 342 420C445 374 498 283 595 296C705 311 765 410 1015 324" stroke="#FCFCFB" strokeWidth="61" strokeLinecap="round"/>
                                <path d="M-30 472C150 405 230 470 342 420C445 374 498 283 595 296C705 311 765 410 1015 324" stroke="#242424" strokeWidth="4" strokeLinecap="round" strokeDasharray="14 12" opacity=".85"/>

                                {/* Buildings */}
                                <g opacity=".85">
                                    <path d="M112 170H145V253H112V170Z" fill="#D8D8D4"/>
                                    <path d="M116 164H141V170H116V164Z" fill="#C8C8C4"/>
                                    <path d="M182 112H225V220H182V112Z" fill="#E0E0DC"/>
                                    <path d="M188 105H219V112H188V105Z" fill="#C9C9C5"/>
                                    <path d="M790 132H830V214H790V132Z" fill="#D5D5D1"/>
                                    <path d="M796 125H824V132H796V125Z" fill="#C5C5C1"/>
                                    <path d="M875 260H914V342H875V260Z" fill="#DDDDD9"/>
                                </g>

                                {/* Trees */}
                                <g>
                                    <path d="M160 328L176 283L192 328H185V348H167V328H160Z" fill="#B8D88C"/>
                                    <path d="M166 349H186" stroke="#A4A49F" strokeWidth="4" strokeLinecap="round"/>
                                    <path d="M735 330L754 273L773 330H765V353H743V330H735Z" fill="#C1DE97"/>
                                    <path d="M744 353H766" stroke="#A4A49F" strokeWidth="4" strokeLinecap="round"/>
                                    <path d="M860 410L876 365L892 410H886V429H867V410H860Z" fill="#B7D68A"/>
                                    <path d="M868 429H888" stroke="#A4A49F" strokeWidth="4" strokeLinecap="round"/>
                                </g>

                                {/* Point A - Pickup Location Pin (Pulsing) */}
                                <g transform="translate(-10 0)" className="animate-pulse-pin">
                                    <ellipse cx="60" cy="488" rx="20" ry="7" fill="#111827" opacity=".18" filter="url(#soft)"/>
                                    <g filter="url(#shadow)">
                                        <path d="M30 455C30 438 43 425 60 425C77 425 90 438 90 455C90 478 60 505 60 505C60 505 30 478 30 455Z" fill="#10B981"/>
                                        <circle cx="60" cy="454" r="9" fill="white"/>
                                        <text x="60" y="458" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="900" textAnchor="middle" fill="#10B981">A</text>
                                    </g>
                                </g>

                                {/* Point B - Destination Location Pin (Pulsing) */}
                                <g className="animate-pulse-pin" style={{ animationDelay: '0.8s' }}>
                                    <ellipse cx="850" cy="350" rx="22" ry="7" fill="#111827" opacity=".18" filter="url(#soft)"/>
                                    <g filter="url(#shadow)">
                                        <path d="M820 310C820 291 834 277 852 277C870 277 884 291 884 310C884 335 852 366 852 366C852 366 820 335 820 310Z" fill="#171717"/>
                                        <circle cx="852" cy="309" r="10" fill="white"/>
                                        <text x="852" y="313" fontFamily="Arial, sans-serif" fontSize="10" fontWeight="900" textAnchor="middle" fill="#171717">B</text>
                                    </g>
                                </g>

                                {/* Floating Live Carpool Card Widget */}
                                <g transform="translate(675 58) rotate(2)" filter="url(#shadow)">
                                    <rect width="215" height="135" rx="18" fill="white"/>
                                    <text x="18" y="27" fontFamily="Mozilla Text, sans-serif" fontSize="10" fontWeight="700" fill="#737373">LIVE CARPOOL</text>
                                    <text x="18" y="49" fontFamily="Mozilla Text, sans-serif" fontSize="15" fontWeight="800" fill="#171717">AIT Pune ➔ Anywhere</text>
                                    <path d="M24 92C62 76 96 104 137 83C151 76 160 71 171 72" stroke="#D8D8D4" strokeWidth="4" strokeLinecap="round"/>
                                    <circle cx="24" cy="92" r="5" fill="#10B981"/>
                                    <circle cx="171" cy="72" r="5" fill="#171717"/>
                                    <text x="18" y="115" fontFamily="Mozilla Text, sans-serif" fontSize="9" fontWeight="700" fill="#10B981">● AIT Pune (A)</text>
                                    <text x="126" y="115" fontFamily="Mozilla Text, sans-serif" fontSize="9" fontWeight="700" fill="#737373">Anywhere (B)</text>
                                </g>

                                {/* ANIMATED HERO CAR - Smooth Motion Path along Curve A ➔ B */}
                                <g className="animate-drive-car" filter="url(#shadow)">
                                    <g transform="scale(0.48) translate(-90, -45)">
                                        <ellipse cx="90" cy="83" rx="82" ry="16" fill="#111827" opacity=".2"/>
                                        <path d="M19 62L38 35C45 25 57 20 71 20H119C135 20 149 28 157 41L171 62H180C188 62 194 68 194 76V82C194 88 189 93 183 93H17C9 93 4 88 4 81V75C4 68 10 62 19 62Z" fill="#171717"/>
                                        <path d="M54 27H113C125 27 134 32 141 42L151 57H42L54 27Z" fill="#333333"/>
                                        <path d="M61 31L53 55H94V31H61Z" fill="#555555"/>
                                        <path d="M99 31V55H145L137 42C132 35 124 31 113 31H99Z" fill="#444444"/>
                                        <circle cx="44" cy="89" r="14" fill="#10B981"/>
                                        <circle cx="44" cy="89" r="6" fill="white"/>
                                        <circle cx="157" cy="89" r="14" fill="#10B981"/>
                                        <circle cx="157" cy="89" r="6" fill="white"/>
                                        <rect x="170" y="67" width="15" height="7" rx="3.5" fill="#FEE2E2"/>
                                    </g>
                                </g>
                            </svg>
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