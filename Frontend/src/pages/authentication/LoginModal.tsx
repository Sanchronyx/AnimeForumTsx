// ✅ Updated LoginModal.tsx with Reset Password Option
import React, { useState } from 'react';
import axios from '../../../axiosConfig';
import { useNavigate, Link } from 'react-router-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin?: (userData: any) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.post('/auth/login', formData, { withCredentials: true });
      console.log('✅ Login response:', res.data);

      if (res.status === 200 && res.data) {
        const user = res.data;
        localStorage.setItem('user', JSON.stringify(user));
        if (onLogin) onLogin(user);
        onClose();
        navigate('/');
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Login failed';
      console.error('❌ Login error:', msg);
      setError(msg);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
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
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Login
            </button>
            <button type="button" className="text-gray-500 hover:text-gray-700" onClick={onClose}>
              Cancel
            </button>
          </div>
          <div className="text-sm text-right mt-2">
            <Link to="/forgot-password" className="text-blue-600 hover:underline">
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
