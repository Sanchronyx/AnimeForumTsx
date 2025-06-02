import React, { useState } from 'react';
import axios from 'axios';

interface UserResult {
  id: number;
  username: string;
  isFriend: boolean;
  requestSent: boolean;
}

const FriendSearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/search/users?q=${query}`, { withCredentials: true });
      setResults(res.data);
    } catch (err) {
      setError('Failed to search users.');
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (userId: number) => {
    try {
      await axios.post(`/friend-request/${userId}`, {}, { withCredentials: true });
      setResults(results.map(u => u.id === userId ? { ...u, requestSent: true } : u));
    } catch {
      alert('Could not send friend request');
    }
  };

  return (
    <div className="mb-6 p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Find Friends</h2>
      <div className="flex gap-2">
        <input
          type="text"
          className="border px-4 py-2 rounded w-full"
          placeholder="Search by username"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={searchUsers}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>
      {loading && <p className="text-sm mt-2 text-gray-500">Searching...</p>}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      <ul className="mt-4 space-y-3">
        {results.map(user => (
          <li key={user.id} className="flex justify-between items-center border-b pb-2">
            <span>{user.username}</span>
            {user.isFriend ? (
              <span className="text-green-500 text-sm">Friend</span>
            ) : user.requestSent ? (
              <span className="text-yellow-500 text-sm">Request Sent</span>
            ) : (
              <button
                onClick={() => sendFriendRequest(user.id)}
                className="text-sm text-blue-600 hover:underline"
              >
                Add Friend
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendSearchBar;
