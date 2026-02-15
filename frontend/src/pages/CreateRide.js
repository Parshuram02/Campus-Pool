import { useState } from 'react';
import axios from 'axios';
// import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const CreateRide = () => {
    // const { user } = useContext(AuthContext); // Unused for now
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        source: '', destination: '', departureTime: '', maxSeats: 3,
        costPerPerson: 50, typeOfVehicle: 'Auto', genderFilter: 'all'
    });

    // Simulated Coordinates for demo (In real app, use Leaflet click event)
    const [fromCoords] = useState([73.874, 18.520]); // Pune approx
    const [toCoords] = useState([73.914, 18.567]);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/rides', {
                ...formData,
                fromCoordinates: fromCoords,
                toCoordinates: toCoords
            });
            navigate('/');
        } catch (err) {
            console.error(err);
            alert('Error creating ride');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="container mx-auto p-4 max-w-2xl">
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-2xl font-bold mb-4">Create a new Ride</h2>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" name="source" placeholder="Source" onChange={onChange} required className="border p-2 rounded" />
                            <input type="text" name="destination" placeholder="Destination" onChange={onChange} required className="border p-2 rounded" />
                        </div>
                        <input type="datetime-local" name="departureTime" onChange={onChange} required className="border p-2 rounded w-full" />

                        <div className="grid grid-cols-2 gap-4">
                            <input type="number" name="maxSeats" placeholder="Max Seats" onChange={onChange} className="border p-2 rounded" />
                            <input type="number" name="costPerPerson" placeholder="Cost per person (₹)" onChange={onChange} className="border p-2 rounded" />
                        </div>

                        <select name="typeOfVehicle" onChange={onChange} className="border p-2 rounded w-full">
                            <option value="Auto">Auto</option>
                            <option value="Cab (Mini)">Cab (Mini)</option>
                            <option value="Cab (Prime)">Cab (Prime)</option>
                            <option value="Bike">Bike</option>
                            <option value="Personal Car">Personal Car</option>
                        </select>

                        <div className="p-2 border rounded bg-gray-50">
                            <label className="block mb-2 font-semibold">Gender Filter</label>
                            <label className="inline-flex items-center mr-4">
                                <input type="radio" name="genderFilter" value="all" checked={formData.genderFilter === 'all'} onChange={onChange} className="mr-2" />
                                All
                            </label>
                            <label className="inline-flex items-center">
                                <input type="radio" name="genderFilter" value="female-only" checked={formData.genderFilter === 'female-only'} onChange={onChange} className="mr-2" />
                                Female Only
                            </label>
                        </div>

                        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Create Ride</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateRide;
