import React, { useEffect, useState } from 'react';
import axios from '../../../axiosConfig';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 5;

const EditableNewsPanel: React.FC = () => {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [error, setError] = useState('');
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchNews = async () => {
    try {
      const res = await axios.get('/news', { withCredentials: true });
      setNewsList(res.data);
    } catch (err) {
      setError('❌ Failed to load news. Admin access only.');
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleEdit = (index: number) => {
    setEditIndex(index);
    setTitle(newsList[index].title);
    setContent(newsList[index].content);
  };

  const handleSave = async (id: number) => {
    try {
      await axios.put(`/admin/news/${id}`, { title, content }, { withCredentials: true });
      setEditIndex(null);
      fetchNews();
    } catch {
      setError('❌ Failed to save news update.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this news post?')) return;
    try {
      await axios.delete(`/admin/news/${id}`, { withCredentials: true });
      fetchNews();
    } catch {
      setError('❌ Failed to delete news.');
    }
  };

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedNews = newsList.slice(start, start + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(newsList.length / ITEMS_PER_PAGE);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Manage News</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {paginatedNews.length === 0 ? (
        <p>No news available.</p>
      ) : (
        <div className="space-y-4">
          {paginatedNews.map((n, i) => (
            <div key={n.id} className="p-4 border rounded shadow bg-white">
              {editIndex === i + start ? (
                <>
                  <input
                    className="w-full p-2 mb-2 border rounded"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <textarea
                    className="w-full p-2 mb-2 border rounded"
                    rows={4}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  ></textarea>
                  <div className="flex gap-2">
                    <button onClick={() => handleSave(n.id)} className="px-4 py-1 bg-blue-600 text-white rounded">Save</button>
                    <button onClick={() => setEditIndex(null)} className="px-4 py-1 bg-gray-300 rounded">Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-sm text-gray-500">Posted by {n.created_by} on {new Date(n.created_at).toLocaleString()}</div>
                  <h3 className="font-bold text-lg text-indigo-700">{n.title}</h3>
                  <p className="text-gray-800 whitespace-pre-wrap mb-2">{n.content}</p>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(i + start)} className="px-3 py-1 bg-yellow-500 text-white rounded">Edit</button>
                    <button onClick={() => handleDelete(n.id)} className="px-3 py-1 bg-red-500 text-white rounded">Delete</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EditableNewsPanel;