import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../../axiosConfig';

const EditPost: React.FC = () => {
  const { postId } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/forum/posts')
      .then(res => {
        const post = res.data.find((p: any) => p.id === parseInt(postId || ''));
        if (post) {
          setTitle(post.title);
          setContent(post.content);
        }
      })
      .catch(() => setError('Failed to fetch post data.'));
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`/api/forum/posts/${postId}`, { content });
      navigate('/forum');
    } catch (err) {
      setError('Error updating post.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Post</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          readOnly
          className="w-full border p-2 rounded bg-gray-100"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full border p-2 rounded"
          rows={6}
          required
        ></textarea>
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
          Update Post
        </button>
      </form>
    </div>
  );
};

export default EditPost;
