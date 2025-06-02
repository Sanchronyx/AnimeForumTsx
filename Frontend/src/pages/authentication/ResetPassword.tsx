import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    axios.get(`/api/reset-password/${token}`)
      .then(res => setEmail(res.data.email))
      .catch(() => setStatus('Invalid or expired token.'));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`/api/reset-password/${token}`, { password });
      setStatus(res.data.message);
    } catch (err: any) {
      setStatus(err.response?.data?.error || 'Something went wrong.');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
        {status && <p className="text-sm text-red-600 mb-2">{status}</p>}
        {email && (
          <>
            <p className="mb-4 text-sm text-gray-600">Resetting password for: {email}</p>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Reset Password</button>
          </>
        )}
      </form>
    </div>
  );
};