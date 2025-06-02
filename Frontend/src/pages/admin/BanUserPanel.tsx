import React, { useEffect, useState } from 'react';
import axios from '../../../axiosConfig';

interface UserInfo {
  id: number;
  username: string;
  is_banned: boolean;
}

const BanUserPanel: React.FC = () => {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/admin/user-list', { withCredentials: true });
      setUsers(res.data);
    } catch {
      setError('❌ Failed to load users.');
    }
  };

  const toggleBan = async (username: string, currentStatus: boolean) => {
    const action = currentStatus ? 'unban' : 'ban';
    try {
      await axios.post(`/admin/${action}-user`, { username }, { withCredentials: true });
      setMessage(`✅ User ${username} has been ${action}ned.`);
      fetchUsers();
    } catch {
      setMessage(`❌ Failed to ${action} user ${username}.`);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Ban / Unban Users</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {message && <p className="text-sm text-gray-700 mb-2">{message}</p>}
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="px-3 py-2 border">Username</th>
            <th className="px-3 py-2 border">Status</th>
            <th className="px-3 py-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="bg-white">
              <td className="px-3 py-2 border">{user.username}</td>
              <td className="px-3 py-2 border">
                {user.is_banned ? (
                  <span className="text-red-600">Banned</span>
                ) : (
                  <span className="text-green-600">Active</span>
                )}
              </td>
              <td className="px-3 py-2 border">
                <button
                  onClick={() => toggleBan(user.username, user.is_banned)}
                  className={`px-3 py-1 rounded text-white ${user.is_banned ? 'bg-green-600' : 'bg-red-600'}`}
                >
                  {user.is_banned ? 'Unban' : 'Ban'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BanUserPanel;