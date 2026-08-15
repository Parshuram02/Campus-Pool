import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Car, LogOut } from 'lucide-react';

const WORDS = ["Student Rides", "Share & Save", "Campus Carpools", "Safe Travel"];

const Navbar = ({ onOpenHostModal }) => {
    const { user, logout } = useContext(AuthContext);

    // Typewriter state for subtitle
    const [wordIndex, setWordIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fullText = WORDS[wordIndex];
        let timeoutDuration = isDeleting ? 40 : 100;

        if (!isDeleting && currentText === fullText) {
            timeoutDuration = 2200;
        } else if (isDeleting && currentText === '') {
            setIsDeleting(false);
            setWordIndex((prev) => (prev + 1) % WORDS.length);
            timeoutDuration = 300;
        }

        const timer = setTimeout(() => {
            if (!isDeleting && currentText !== fullText) {
                setCurrentText(fullText.substring(0, currentText.length + 1));
            } else if (isDeleting && currentText !== '') {
                setCurrentText(fullText.substring(0, currentText.length - 1));
            } else if (currentText === fullText) {
                setIsDeleting(true);
            }
        }, timeoutDuration);

        return () => clearTimeout(timer);
    }, [currentText, isDeleting, wordIndex]);

    const scrollToPools = () => {
        document.getElementById('available-pools')?.scrollIntoView({ behavior: 'smooth' });
    };

    const firstLetter = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'U';

    return (
        <header className="bg-white/90 backdrop-blur-xl sticky top-0 z-50 border-b border-neutral-200/80 text-neutral-900 shadow-[0_2px_15px_rgba(0,0,0,0.04)]">
            <div className="w-full px-6 sm:px-10 h-16 py-3 flex justify-between items-center">
                {/* Brand Logo & Uber-style Links */}
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
                            <Car size={19} className="stroke-[2.5]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tight text-black leading-none flex items-center gap-1">
                                Campus Pool
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 mt-0.5 font-mono h-3.5 flex items-center gap-0.5">
                                {currentText}
                                <span className="inline-block w-0.5 h-2.5 bg-black/60 animate-pulse"></span>
                            </span>
                        </div>
                    </Link>

                    {/* Uber-style Text Nav Links */}
                    <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-700">
                        <button 
                            onClick={onOpenHostModal}
                            className="hover:text-black transition-colors"
                        >
                            Drive / Host
                        </button>
                        <button 
                            onClick={scrollToPools}
                            className="hover:text-black transition-colors"
                        >
                            Explore Pools
                        </button>
                    </nav>
                </div>

                {/* Right Side Actions - Pushed to Extreme Right Edge */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <div className="flex items-center gap-3">
                            {/* High-Contrast Username Initial Avatar Badge */}
                            <div 
                                className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-base font-black shadow-md border-2 border-black hover:scale-105 transition-all select-none cursor-pointer"
                                title={user.name || 'User Profile'}
                            >
                                {firstLetter}
                            </div>

                            {/* Logout Button */}
                            <button
                                onClick={logout}
                                className="p-2 text-neutral-400 hover:text-red-600 hover:bg-neutral-100 rounded-xl transition-colors"
                                title="Log Out"
                            >
                                <LogOut size={19} className="stroke-[2.2]" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="text-sm font-semibold text-neutral-700 hover:text-black transition-colors px-3 py-1.5">
                                Log in
                            </Link>
                            <Link to="/register" className="bg-black hover:bg-neutral-800 text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-sm hover:scale-105">
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
