// axiosConfig.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL:'http://localhost:5000', // ✅ Match browser domain for cookies to work
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

export default axiosInstance;

// import.meta.env.VITE_BACKEND_URL ||
