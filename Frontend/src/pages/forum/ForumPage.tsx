import React, { useEffect, useState } from 'react';
import axios from '../../../axiosConfig';
import { Link, useLocation } from 'react-router-dom';


interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
  edited: boolean;
  likes: number;
  dislikes: number;
  tags?: string[];
}

interface Comment {
  id: number;
  text: string;
  author: string;
  created_at: string;
}

const ForumPage: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [expandedPostId, setExpandedPostId] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [commentText, setCommentText] = useState('');
  const [page, setPage] = useState(1);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const location = useLocation();
  const pageSize = 5;

  useEffect(() => {
    fetchCurrentUser();
    fetchPosts();
    fetchTags();
  }, [page, selectedTag, location.key]);

  const fetchCurrentUser = async () => {
    try {
      const res = await axios.get('/auth/whoami', { withCredentials: true });
      setCurrentUser(res.data);
    } catch {
      setCurrentUser(null);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/forum/posts');
      const data = Array.isArray(res.data) ? res.data : [];
      const filtered = selectedTag
        ? data.filter((post: Post) => post.tags?.includes(selectedTag))
        : data;
      setPosts(filtered);
      setError(null);
    } catch {
      setError("Failed to load forum posts.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await axios.get('/api/forum/tags');
      setTags(Array.isArray(res.data) ? res.data : []);
    } catch {
      setTags([]);
    }
  };

  const toggleComments = async (postId: number) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      if (!comments[postId]) {
        const res = await axios.get(`/api/forum/posts/${postId}/comments`);
        setComments(prev => ({ ...prev, [postId]: res.data }));
      }
      setExpandedPostId(postId);
    }
  };

  const submitComment = async (postId: number) => {
    if (!commentText.trim()) return;
    await axios.post(`/api/forum/posts/${postId}/comments`, { text: commentText }, { withCredentials: true });
    const res = await axios.get(`/api/forum/posts/${postId}/comments`);
    setComments(prev => ({ ...prev, [postId]: res.data }));
    setCommentText('');
  };

  const handleReaction = async (postId: number, type: 'like' | 'dislike') => {
    try {
      await axios.post(`/api/forum/posts/${postId}/${type}`, {}, { withCredentials: true });
      const updated = await axios.get('/api/forum/posts');
      const filtered = selectedTag
        ? updated.data.filter((post: Post) => post.tags?.includes(selectedTag))
        : updated.data;
      setPosts(filtered);
    } catch (err) {
      console.error(`Failed to ${type} post`, err);
    }
  };

  const deletePost = async (postId: number) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`/api/forum/posts/${postId}`);
      fetchPosts();
    } catch {
      alert("Failed to delete post. Please try again.");
    }
  };

  const reportComment = async (commentId: number) => {
    try {
      await axios.post('/api/report/comment', { comment_id: commentId }, { withCredentials: true });
      alert('✅ Comment reported');
    } catch {
      alert('❌ Failed to report comment');
    }
  };

  const paginatedPosts = posts.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Community Forum</h1>

      {currentUser && (
        <div className="mb-4 text-right">
          <Link to="/forum/new" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            + Create New Post
          </Link>
        </div>
      )}

      <div className="mb-4">
        <label className="mr-2 font-medium">Filter by tag:</label>
        <select
          className="border px-2 py-1 rounded"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
        >
          <option value="">All</option>
          {tags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {loading && <p>Loading posts...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && paginatedPosts.length === 0 && (
        <p className="text-gray-600">No posts available.</p>
      )}

      {paginatedPosts.map(post => (
        <div key={post.id} className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            {currentUser?.username === post.author && (
              <div className="flex gap-2">
                <Link to={`/forum/edit/${post.id}`} className="text-blue-600">Edit</Link>
                <button onClick={() => deletePost(post.id)} className="text-red-600">Delete</button>
              </div>
            )}
          </div>
          <p className="mt-2 text-gray-700 whitespace-pre-line">{post.content}</p>
          <div className="text-sm text-gray-500 mt-2">
            By {post.author} • {new Date(post.created_at).toLocaleString()} {post.edited && '(Edited)'}
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="mt-2 text-sm text-purple-600">Tags: {post.tags.join(', ')}</div>
          )}
          <div className="flex items-center mt-3 gap-4 text-sm">
            <button onClick={() => handleReaction(post.id, 'like')} className="hover:text-blue-600">👍 {post.likes}</button>
            <button onClick={() => handleReaction(post.id, 'dislike')} className="hover:text-red-600">👎 {post.dislikes}</button>
            <button onClick={() => toggleComments(post.id)} className="text-blue-500 underline">
              {expandedPostId === post.id ? 'Hide' : 'Show'} Comments
            </button>
          </div>
          {expandedPostId === post.id && (
            <div className="mt-4 border-t pt-4">
              <h3 className="font-medium mb-2">Comments</h3>
              {comments[post.id]?.map(comment => (
                <div key={comment.id} className="mb-2 text-sm flex justify-between">
                  <div>
                    <span className="font-semibold">{comment.author}:</span> {comment.text}
                    <span className="text-gray-400 text-xs ml-2">{new Date(comment.created_at).toLocaleString()}</span>
                  </div>
                  <button onClick={() => reportComment(comment.id)} className="text-red-500 text-xs">Report</button>
                </div>
              ))}
              {currentUser && (
                <div className="mt-3">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full border rounded-md p-2"
                    rows={2}
                    placeholder="Write a comment..."
                  ></textarea>
                  <button
                    onClick={() => submitComment(post.id)}
                    className="mt-2 px-4 py-1 bg-blue-500 text-white rounded-md"
                  >
                    Post Comment
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <div className="flex justify-between items-center mt-8">
        <button
          onClick={() => setPage(p => Math.max(p - 1, 1))}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          disabled={page === 1}
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 bg-gray-200 rounded"
          disabled={page * pageSize >= posts.length}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ForumPage;
