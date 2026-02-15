import { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', registrationNo: '', branch: 'IT', gender: 'Male'
    });
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const { name, email, password, registrationNo, branch, gender } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.msg || 'Registration failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold text-center">Register</h2>
                <form onSubmit={onSubmit} className="space-y-4">
                    <input type="text" name="name" placeholder="Name" value={name} onChange={onChange} required className="w-full px-3 py-2 border rounded" />
                    <input type="email" name="email" placeholder="Email" value={email} onChange={onChange} required className="w-full px-3 py-2 border rounded" />
                    <input type="password" name="password" placeholder="Password" value={password} onChange={onChange} required className="w-full px-3 py-2 border rounded" />
                    <div className="flex gap-2">
                        <input type="text" name="registrationNo" placeholder="Reg No" value={registrationNo} onChange={onChange} required className="w-1/2 px-3 py-2 border rounded" />
                        <select name="gender" value={gender} onChange={onChange} className="w-1/2 px-3 py-2 border rounded">
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <select name="branch" value={branch} onChange={onChange} className="w-full px-3 py-2 border rounded">
                            <option value="IT">IT</option>
                            <option value="Comp">Comp</option>
                            <option value="E&TC">E&TC</option>
                            <option value="Mech-Are">Mech-Are</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Register</button>
                </form>
                <div className="text-sm text-center">
                    Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
