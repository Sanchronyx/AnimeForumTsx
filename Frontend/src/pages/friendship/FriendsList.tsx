// src/pages/friendship/FriendsList.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../axiosConfig';

interface Friend {
  id: number;
  username: string;
  bio?: string;
  pending?: boolean;
}

const FriendsList: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/friends/list', { withCredentials: true })
      .then(res => setFriends(res.data))
      .catch(() => setError('Failed to load friends'));
  }, []);

  const goToMessages = (username: string) => {
    navigate(`/messages/${username}`);
  };

  const goToProfile = (username: string) => {
    navigate(`/friend/${username}`);
  };

  const searchUsers = async () => {
    if (!search.trim()) return;
    try {
      const res = await axios.get(`/user/search?query=${search}`);
      setSearchResults(res.data);
    } catch (err) {
      setSearchResults([]);
    }
  };

  const sendFriendRequest = async (id: number) => {
    try {
      await axios.post(`/friend-request/${id}`, {}, { withCredentials: true });
      setMessage('✅ Friend request sent');
    } catch (err: any) {
      setMessage(`❌ ${err.response?.data?.error || 'Error sending request'}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white shadow rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Your Friends</h2>

      {/* Friend Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search for users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border rounded mr-2"
        />
        <button
          onClick={searchUsers}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Search
        </button>
        {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
        {searchResults.length > 0 && (
          <ul className="mt-4 border-t pt-4 space-y-3">
            {searchResults.map(user => (
              <li key={user.id} className="flex justify-between items-center">
                <span>{user.username}</span>
                <button
                  onClick={() => sendFriendRequest(user.id)}
                  className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Add Friend
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {friends.length === 0 ? (
        <p className="text-gray-500">You have no friends yet.</p>
      ) : (
        <ul className="space-y-4">
          {friends.map(friend => (
            <li
              key={friend.username}
              className="flex justify-between items-center border-b pb-2"
            >
              <div>
                <p
                  className="font-semibold text-blue-600 hover:underline cursor-pointer"
                  onClick={() => goToProfile(friend.username)}
                >
                  {friend.username} {friend.pending && <span className="text-yellow-500">(Pending)</span>}
                </p>
                <p className="text-sm text-gray-600">{friend.bio || 'No bio'}</p>
              </div>
              {!friend.pending && (
                <button
                  onClick={() => goToMessages(friend.username)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Message
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FriendsList;
