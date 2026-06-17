import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';
import { CarFront } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [submitting, setSubmitting] = useState(false);
    const { login } = useContext(AuthContext);
    const { showToast } = useToast();
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            showToast(err.response?.data?.msg || 'Login failed', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-indigo-600 p-3 rounded-2xl mb-3">
                        <CarFront className="text-white" size={28} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
                    <p className="text-gray-500 text-sm mt-1">Login to find your ride</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" value={email} onChange={onChange} required
                            className="w-full px-3 py-2.5 mt-1 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" name="password" value={password} onChange={onChange} required
                            className="w-full px-3 py-2.5 mt-1 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <button type="submit" disabled={submitting}
                        className="w-full px-4 py-3 text-white bg-indigo-600 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-60">
                        {submitting ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <div className="text-sm text-center mt-5 text-gray-500">
                    Don't have an account? <Link to="/register" className="text-indigo-600 font-semibold hover:underline">Register</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
