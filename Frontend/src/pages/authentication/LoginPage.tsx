// ✅ REPLACEMENT LoginPage.tsx with fully working session-auth-compatible logic

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../axiosConfig';

interface LoginPageProps {
  onLogin: (userData: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      console.log('Submitting login:', formData);
      const res = await axios.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      });

      console.log('Login response:', res);
      if (res.status === 200) {
        const user = res.data;
        console.log('✅ Login successful:', user);
        localStorage.setItem('user', JSON.stringify(user));
        onLogin(user);
        navigate('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Login failed';
      setError(msg);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username or Email"
            className="w-full px-4 py-2 border rounded-md focus:outline-none"
            onChange={handleChange}
            value={formData.username}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none"
            onChange={handleChange}
            value={formData.password}
            required
          />
          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Login
            </button>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
          </div>
          <div className="text-right mt-2">
            <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
