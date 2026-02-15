import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const Home = () => {
    const { user, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [rides, setRides] = useState([]);

    useEffect(() => {
        if (!loading && !user) {
            navigate('/login');
        }
        if (user) {
            fetchRides();
        }
    }, [user, loading, navigate]);

    const fetchRides = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/rides');
            setRides(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Available Rides</h1>
                    <button onClick={() => navigate('/ride/create')} className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700">
                        Create Ride
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rides.map(ride => (
                        <div key={ride._id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-100">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-indigo-700">{ride.source} → {ride.destination}</h3>
                                    <p className="text-sm text-gray-500">{new Date(ride.departureTime).toLocaleString()}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${ride.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {ride.status.toUpperCase()}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                <p><strong>Host:</strong> {ride.admin?.name} ({ride.admin?.branch})</p>
                                <p><strong>Vehicle:</strong> {ride.typeOfVehicle}</p>
                                <p><strong>Fare:</strong> ₹{ride.costPerPerson}</p>
                                <p><strong>Seats:</strong> {ride.currentOccupancy}/{ride.maxSeats}</p>
                                {ride.genderFilter === 'female-only' && (
                                    <p className="text-pink-600 font-bold">Current: Female Only</p>
                                )}
                            </div>

                            <button onClick={() => navigate(`/ride/${ride._id}`)} className="w-full mt-4 bg-indigo-50 text-indigo-700 py-2 rounded border border-indigo-200 hover:bg-indigo-100 transition-colors">
                                View Details & Chat
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
