import React, { useState } from 'react';
import axios from '../../../axiosConfig';

const AdminNewsPanel: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!title || !content) {
      setMessage('Title and content are required.');
      return;
    }
    try {
      const res = await axios.post('/admin/news', { title, content }, { withCredentials: true });
      setMessage('✅ News created successfully.');
      setTitle('');
      setContent('');
    } catch {
      setMessage('❌ Failed to create news.');
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Create Site News</h2>
      {message && <p className="mb-2 text-sm text-gray-700">{message}</p>}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full border px-3 py-2 mb-2 rounded text-black"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        placeholder="News content..."
        className="w-full border px-3 py-2 mb-2 rounded text-black"
      ></textarea>
      <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">Post News</button>
    </div>
  );
};

export default AdminNewsPanel;