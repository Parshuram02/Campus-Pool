import { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { CarFront, User, LogOut } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-indigo-600 p-2 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <CarFront className="text-white" size={24} />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Campus Pool
                    </span>
                </Link>

                <div className="flex gap-6 items-center">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-gray-700 font-medium bg-gray-100 px-3 py-1.5 rounded-full">
                                <User size={16} className="text-indigo-600" />
                                <span>{user.name.split(' ')[0]}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center gap-1.5 text-gray-500 hover:text-red-600 transition-colors font-medium text-sm"
                            >
                                <LogOut size={18} />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-gray-600 hover:text-indigo-600 font-medium transition-colors">Login</Link>
                            <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-bold transition-all shadow-lg shadow-indigo-200">
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
