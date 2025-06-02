// axiosConfig.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://animeforum.onrender.com', // ✅ Match browser domain for cookies to work
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

export default axiosInstance;
