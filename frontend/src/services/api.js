import axios from 'axios';

export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// This attaches your JWT token to every request automatically
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers['x-auth-token'] = token;
    }
    return req;
});

export default API;