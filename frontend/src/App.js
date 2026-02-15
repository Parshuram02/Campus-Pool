import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import RideDetails from './pages/RideDetails';
import CreateRide from './pages/CreateRide';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Home />} />
      <Route path="/ride/create" element={<CreateRide />} />
      <Route path="/ride/:id" element={<RideDetails />} />
    </Routes>
  );
}

export default App;