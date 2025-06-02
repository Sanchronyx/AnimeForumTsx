import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FriendSearch: React.FC = () => {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const handleSearch = async () => {
    try {
      const res = await axios.get(`/api/search/users?q=${search}`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
      setMessage('Error searching users');
    }
  };

  const sendFriendRequest = async (id: number) => {
    try {
      const res = await axios.post(`/friend-request/${id}`);
      setMessage(res.data.message);
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to send request');
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Search for Friends</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Enter username..."
          className="flex-1 px-3 py-2 border rounded"
        />
        <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
      </div>
      {message && <p className="text-sm text-red-600 mb-2">{message}</p>}
      <ul className="space-y-2">
        {results.map((user) => (
          <li key={user.id} className="flex justify-between items-center border p-2 rounded">
            <span>{user.username}</span>
            <button onClick={() => sendFriendRequest(user.id)} className="text-sm px-3 py-1 bg-green-500 text-white rounded">Add</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FriendSearch;
