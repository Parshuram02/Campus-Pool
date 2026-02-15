import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Users, IndianRupee, Car, Bike, Zap } from 'lucide-react';

const RideCard = ({ ride, onJoin }) => {
    const navigate = useNavigate();

    // Helper to get icon and color based on vehicle type
    const getVehicleStyle = (type) => {
        switch (type) {
            case 'Bike': return { icon: <Bike size={20} />, color: 'bg-orange-100 text-orange-600', label: 'Bike' };
            case 'Auto': return { icon: <Zap size={20} />, color: 'bg-yellow-100 text-yellow-700', label: 'Auto' };
            case 'Uber Premier': return { icon: <Car size={20} />, color: 'bg-black text-white', label: 'Premier' };
            default: return { icon: <Car size={20} />, color: 'bg-blue-100 text-blue-600', label: 'Car' };
        }
    };

    const style = getVehicleStyle(ride.typeOfVehicle);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-xl ${style.color}`}>
                    {style.icon}
                </div>
                <div className="text-right">
                    <span className="text-2xl font-black text-gray-900">₹{ride.costPerPerson}</span>
                    <p className="text-xs text-gray-400 font-medium">per person</p>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                        <div className="w-0.5 h-8 bg-gray-200 border-l border-dashed"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    </div>
                    <div className="flex-1 space-y-3">
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">From</p>
                            <p className="font-bold text-gray-800">{ride.source}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">To</p>
                            <p className="font-bold text-gray-800">{ride.destination}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-6 bg-gray-50 p-3 rounded-xl">
                <div className="flex items-center gap-1.5">
                    <Clock size={16} className="text-indigo-500" />
                    <span className="font-medium">{new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Users size={16} className="text-indigo-500" />
                    <span className="font-medium">{ride.currentOccupancy}/{ride.maxSeats} Seats</span>
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                        {ride.admin.name.charAt(0)}
                    </div>
                    <div className="text-xs">
                        <p className="font-bold text-gray-900">{ride.admin.name}</p>
                        <p className="text-gray-500">{ride.admin.branch || 'Student'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => navigate(`/ride/${ride._id}`)}
                        className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors"
                    >
                        Details
                    </button>
                    <button
                        onClick={() => onJoin(ride._id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-indigo-100 transition-all"
                    >
                        Join
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RideCard;