import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';
import { CarFront } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', registrationNo: '', branch: 'IT', gender: 'Male'
    });
    const [submitting, setSubmitting] = useState(false);
    const { register } = useContext(AuthContext);
    const { showToast } = useToast();
    const navigate = useNavigate();

    const { name, email, password, registrationNo, branch, gender } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            showToast(err.response?.data?.msg || 'Registration failed', 'error');
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
                    <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
                    <p className="text-gray-500 text-sm mt-1">Join your campus carpool community</p>
                </div>

                <form onSubmit={onSubmit} className="space-y-3">
                    <input type="text" name="name" placeholder="Full Name" value={name} onChange={onChange} required
                        className="w-full px-3 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input type="email" name="email" placeholder="Email" value={email} onChange={onChange} required
                        className="w-full px-3 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <input type="password" name="password" placeholder="Password" value={password} onChange={onChange} required
                        className="w-full px-3 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <div className="flex gap-3">
                        <input type="text" name="registrationNo" placeholder="Reg No" value={registrationNo} onChange={onChange} required
                            className="w-1/2 px-3 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <select name="gender" value={gender} onChange={onChange}
                            className="w-1/2 px-3 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <select name="branch" value={branch} onChange={onChange}
                        className="w-full px-3 py-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        <option value="IT">IT</option>
                        <option value="Comp">Comp</option>
                        <option value="E&TC">E&TC</option>
                        <option value="Mech-Auto">Mech-Auto</option>
                    </select>
                    <button type="submit" disabled={submitting}
                        className="w-full px-4 py-3 text-white bg-indigo-600 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-60 mt-2">
                        {submitting ? 'Creating account...' : 'Register'}
                    </button>
                </form>
                <div className="text-sm text-center mt-5 text-gray-500">
                    Already have an account? <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
