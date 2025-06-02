import React, { useEffect, useState } from 'react';
import axios from '../../../axiosConfig';

interface FriendRequestButtonProps {
  targetUsername: string;
}

const FriendRequestButton: React.FC<FriendRequestButtonProps> = ({ targetUsername }) => {
  const [status, setStatus] = useState<'none' | 'pending' | 'friends' | 'requested'>('none');

  useEffect(() => {
    axios.get(`/api/friends/status/${targetUsername}`, { withCredentials: true })
      .then(res => setStatus(res.data.status))
      .catch(() => setStatus('none'));
  }, [targetUsername]);

  const sendRequest = async () => {
    try {
      await axios.post('/api/friends/request', { target: targetUsername }, { withCredentials: true });
      setStatus('pending');
    } catch (err) {
      console.error('Failed to send friend request');
    }
  };

  if (status === 'friends') return <p className="text-green-600">Already friends</p>;
  if (status === 'pending') return <p className="text-yellow-600">Request Sent</p>;
  if (status === 'requested') return <p className="text-blue-600">Request Received</p>;

  return (
    <button
      onClick={sendRequest}
      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Add Friend
    </button>
  );
};

export default FriendRequestButton;