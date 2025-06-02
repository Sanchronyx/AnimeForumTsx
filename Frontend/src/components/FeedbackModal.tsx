// ✅ Updated FeedbackModal.tsx with visible typed text
import React, { useState } from 'react';
import axios from '../../axiosConfig';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    if (!topic || !message) {
      setError("Both fields are required.");
      return;
    }
    try {
      await axios.post('/feedback/submit', { topic, message }, { withCredentials: true });
      setSuccess("Feedback sent! Thank you.");
      setError('');
      setTopic('');
      setMessage('');
    } catch (err) {
      setSuccess('');
      setError("Failed to send feedback.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-lg font-bold mb-4">Send Feedback to Developers</h2>

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-2">{success}</p>}

        <input
          type="text"
          placeholder="Topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full mb-3 p-2 border rounded text-gray-900 placeholder-gray-500 bg-white"
        />

        <textarea
          placeholder="Your feedback..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="w-full mb-4 p-2 border rounded text-gray-900 placeholder-gray-500 bg-white"
        />

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;