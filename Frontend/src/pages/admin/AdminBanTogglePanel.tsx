import React, { useState } from 'react';
import axios from '../../../axiosConfig';

const AdminBanTogglePanel: React.FC = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');

  const toggleBan = async (type: 'ban' | 'unban') => {
    if (!username) return setMessage('Username required.');
    try {
      await axios.post(`/admin/${type}-user`, { username }, { withCredentials: true });
      setMessage(`✅ User ${username} has been ${type}ned.`);
      setUsername('');
    } catch {
      setMessage(`❌ Failed to ${type} user.`);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Ban or Unban User</h2>
      {message && <p className="text-sm text-gray-700 mb-2">{message}</p>}
      <input
        className="w-full p-2 border rounded text-black mb-2"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <div className="flex gap-3">
        <button onClick={() => toggleBan('ban')} className="px-4 py-2 bg-red-600 text-white rounded">Ban</button>
        <button onClick={() => toggleBan('unban')} className="px-4 py-2 bg-green-600 text-white rounded">Unban</button>
      </div>
    </div>
  );
};

export default AdminBanTogglePanel;