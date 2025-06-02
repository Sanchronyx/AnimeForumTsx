import React, { useEffect, useState } from 'react';
import axios from '../../../axiosConfig';

interface Request {
  id: number;
  sender_id: number;
  receiver_id: number;
  sender_username: string;
}

const FriendRequestsPanel: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    axios.get('/friend-requests', { withCredentials: true })
      .then(res => setRequests(res.data))
      .catch(console.error);
  }, []);

  const handleResponse = async (id: number, action: 'accept' | 'reject') => {
    await axios.post(`/friend-request/${id}/${action}`, {}, { withCredentials: true });
    setRequests(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Pending Friend Requests</h2>
      {requests.length === 0 ? (
        <p className="text-gray-600">No pending requests.</p>
      ) : (
        <ul className="space-y-3">
          {requests.map(r => (
            <li key={r.id} className="flex justify-between items-center border-b pb-2">
              <span>{r.sender_username}</span>
              <div className="space-x-2">
                <button onClick={() => handleResponse(r.id, 'accept')} className="text-green-600 hover:underline">Accept</button>
                <button onClick={() => handleResponse(r.id, 'reject')} className="text-red-600 hover:underline">Reject</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FriendRequestsPanel;