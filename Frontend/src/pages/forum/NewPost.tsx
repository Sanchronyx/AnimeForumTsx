import React, { useEffect, useState } from 'react';
import axios from '../../../axiosConfig';
import { useNavigate } from 'react-router-dom';

const genreOptions = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Mystery',
  'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
];

const CreatePost: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || selectedTags.length === 0) {
      setError('All fields including at least one tag are required.');
      return;
    }

    try {
      await axios.post(
        'api/forum/posts',
        { title, content, tags: selectedTags },
        { withCredentials: true }
      );
      navigate('/forum');
    } catch (err) {
      console.error('Failed to create post:', err);
      setError('Failed to create post. Please try again.');
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Post</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block font-medium">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={5}
          ></textarea>
        </div>

        <div>
          <label className="block font-medium mb-1">Select Tags (at least one required)</label>
          <div className="grid grid-cols-2 gap-2">
            {genreOptions.map(tag => (
              <label key={tag} className="flex items-center">
                <input
                  type="checkbox"
                  value={tag}
                  checked={selectedTags.includes(tag)}
                  onChange={() => handleTagToggle(tag)}
                  className="mr-2"
                />
                {tag}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Submit Post
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
