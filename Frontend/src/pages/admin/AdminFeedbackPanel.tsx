import React, { useEffect, useState } from 'react';
import axios from '../../../axiosConfig';

interface Feedback {
  id: number;
  username: string;
  topic: string;
  content: string;
  created_at: string;
}

const AdminFeedbackPanel: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await axios.get('/admin/dev-feedback', { withCredentials: true });
        setFeedbacks(res.data);
      } catch (err) {
        setError('Failed to fetch feedback.');
      }
    };
    fetchFeedback();
  }, []);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Development Feedback</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {feedbacks.length === 0 ? (
        <p className="text-gray-500">No feedback submitted yet.</p>
      ) : (
        feedbacks.map((fb) => (
          <div key={fb.id} className="bg-white border rounded shadow p-4 mb-4">
            <div className="text-sm text-gray-500 mb-1">
              <span className="font-medium">{fb.username}</span> — {new Date(fb.created_at).toLocaleString()}
            </div>
            <h3 className="text-lg font-semibold mb-1">{fb.topic}</h3>
            <p className="text-gray-800 whitespace-pre-wrap">{fb.content}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default AdminFeedbackPanel;
