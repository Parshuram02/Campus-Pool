import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Car, Bike, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

const RideCard = ({ ride, onJoin }) => {
    const navigate = useNavigate();

    // Helper for vehicle style
    const getVehicleStyle = (type) => {
        switch (type) {
            case 'Bike': return { icon: <Bike size={16} />, bg: 'bg-amber-50 text-amber-700 border-amber-200/60', label: 'Bike' };
            case 'Auto': return { icon: <Zap size={16} />, bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', label: 'Auto' };
            case 'Uber Premier': return { icon: <Car size={16} />, bg: 'bg-black text-white border-black', label: 'Premier' };
            default: return { icon: <Car size={16} />, bg: 'bg-neutral-100 text-neutral-900 border-neutral-200', label: 'Uber Go' };
        }
    };

    const style = getVehicleStyle(ride.typeOfVehicle);
    const seatsAvailable = ride.maxSeats - (ride.currentOccupancy || 0);

    return (
        <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:border-black/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            <div>
                {/* Header: Vehicle Tag & Price */}
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-neutral-100">
                    <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border ${style.bg}`}>
                        {style.icon}
                        <span>{ride.typeOfVehicle || 'Standard'}</span>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-extrabold tracking-tight text-neutral-900">₹{ride.costPerPerson}</span>
                        <span className="text-xs font-medium text-neutral-400 block">/ seat</span>
                    </div>
                </div>

                {/* Route Timeline */}
                <div className="space-y-4 mb-6">
                    <div className="flex gap-3">
                        <div className="flex flex-col items-center pt-1">
                            <div className="w-3 h-3 rounded-full bg-black ring-4 ring-black/10"></div>
                            <div className="w-0.5 h-10 bg-neutral-200 my-1"></div>
                            <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10"></div>
                        </div>
                        <div className="flex-1 space-y-3">
                            <div>
                                <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Pickup</p>
                                <p className="font-bold text-neutral-900 text-base leading-snug">{ride.source}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Drop-off</p>
                                <p className="font-bold text-neutral-900 text-base leading-snug">{ride.destination}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Meta details: Time & Seats */}
                <div className="grid grid-cols-2 gap-2 bg-neutral-50/80 p-3 rounded-xl border border-neutral-100 text-xs mb-6">
                    <div className="flex items-center gap-2 text-neutral-700 font-medium">
                        <Clock size={15} className="text-neutral-400" />
                        <span>{new Date(ride.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-700 font-medium">
                        <Users size={15} className="text-neutral-400" />
                        <span>{ride.currentOccupancy || 1}/{ride.maxSeats} Seats Filled</span>
                    </div>
                </div>
            </div>

            {/* Footer: Driver info & Actions */}
            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {ride.admin?.name ? ride.admin.name.charAt(0).toUpperCase() : 'H'}
                    </div>
                    <div className="truncate">
                        <p className="font-bold text-neutral-900 text-xs truncate flex items-center gap-1">
                            {ride.admin?.name || 'Host'}
                            <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                        </p>
                        <p className="text-[11px] text-neutral-400 truncate">{ride.admin?.branch || 'Campus Verified'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => navigate(`/ride/${ride._id}`)}
                        className="px-3 py-2 text-xs font-bold text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-xl transition-colors"
                    >
                        Details
                    </button>
                    <button
                        onClick={() => onJoin(ride._id)}
                        disabled={seatsAvailable <= 0}
                        className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                            seatsAvailable > 0
                            ? 'bg-black hover:bg-neutral-800 text-white hover:scale-[1.03] active:scale-[0.98]'
                            : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                        }`}
                    >
                        {seatsAvailable > 0 ? 'Join' : 'Full'}
                        <ArrowRight size={13} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RideCard;