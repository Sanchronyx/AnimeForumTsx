// ✅ Updated to only fetch and display 5 most recent posts/reviews
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Profile from '../Profile';
import axios from '../../../axiosConfig';

export default function FriendProfilePage() {
  const { username } = useParams<{ username: string }>();
  const [friendProfile, setFriendProfile] = useState<any | null>(null);
  const [content, setContent] = useState<any[]>([]);
  const [comments, setComments] = useState<{ [key: number]: any[] }>({});
  const [newComment, setNewComment] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/profile/${username}`);
        setFriendProfile(res.data);
      } catch (e) {
        setError('Failed to load profile');
      }
    };

    const fetchInteractions = async () => {
      try {
        const [reviewsRes, postsRes] = await Promise.all([
          axios.get(`/api/review/user/${username}`),
          axios.get(`/api/forum/post/user/${username}`)
        ]);

        const combined = [...reviewsRes.data, ...postsRes.data].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 5); // Only take the latest 5

        setContent(combined);

        for (const item of combined) {
          const endpoint = item.anime_title ? 'api/review' : 'api/forum/posts';
          try {
            const res = await axios.get(`/${endpoint}/${item.id}/comments`);
            setComments(prev => ({ ...prev, [item.id]: res.data }));
          } catch (err) {
            console.error(`Failed to load comments for ${endpoint} ${item.id}`, err);
          }
        }
      } catch (err) {
        console.error('Failed to load interactions or comments', err);
      }
    };

    Promise.all([fetchProfile(), fetchInteractions()]).then(() => setLoading(false));
  }, [username]);

  const handleLike = async (id: number, type: 'review' | 'forum') => {
    try {
      await axios.post(`/${type === 'review' ? 'api/review' : 'api/forum/posts'}/${id}/like`);
      setContent(prev => prev.map(i => i.id === id ? { ...i, likes: (i.likes || 0) + 1 } : i));
    } catch {
      console.error('Like failed');
    }
  };

  const handleDislike = async (id: number, type: 'review' | 'forum') => {
    try {
      await axios.post(`/${type === 'review' ? 'api/review' : 'api/forum/posts'}/${id}/dislike`);
      setContent(prev => prev.map(i => i.id === id ? { ...i, dislikes: (i.dislikes || 0) + 1 } : i));
    } catch {
      console.error('Dislike failed');
    }
  };

  const handleComment = async (id: number, type: 'review' | 'forum') => {
    const text = newComment[id];
    if (!text?.trim()) return;
    try {
      const res = await axios.post(`/${type === 'review' ? 'api/review' : 'api/forum/posts'}/${id}/comments`, { text });
      setComments(prev => ({ ...prev, [id]: [...(prev[id] || []), res.data] }));
      setNewComment(prev => ({ ...prev, [id]: '' }));
    } catch {
      console.error('Comment failed');
    }
  };

  if (loading) return <div className="text-center mt-10">Loading friend's profile...</div>;
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
  if (!friendProfile) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <Profile username={username!} profileData={friendProfile} isFriendView />

      <h3 className="text-lg font-bold mt-8 mb-4">{username}'s Recent Activity</h3>
      {content.length === 0 ? (
        <p className="text-gray-500 italic">No posts or reviews to display.</p>
      ) : (
        content.map(item => (
          <div key={item.id} className="border p-4 mb-4 rounded bg-white shadow-sm">
            {item.anime_title && (
              <p className="text-sm text-gray-500 italic">{item.anime_title}</p>
            )}
            <p className="font-semibold text-gray-800 mb-1">
              {item.title || (item.text?.slice(0, 30) || '') + ((item.text?.length || 0) > 30 ? '...' : '')}
            </p>
            <p className="text-sm text-gray-700 mb-1">{item.text}</p>
            <p className="text-xs text-gray-400">{item.created_at}</p>

            <div className="flex gap-4 items-center mt-2">
              <button onClick={() => handleLike(item.id, item.anime_title ? 'review' : 'forum')} className="px-2 py-1 bg-green-100 rounded">
                👍 {item.likes || 0}
              </button>
              <button onClick={() => handleDislike(item.id, item.anime_title ? 'review' : 'forum')} className="px-2 py-1 bg-red-100 rounded">
                👎 {item.dislikes || 0}
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {(comments[item.id] || []).map((comment, idx) => (
                <div key={idx} className="text-sm text-gray-800">
                  <span className="font-semibold mr-1">{comment.username}:</span>{comment.text}
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-2">
              <input
                value={newComment[item.id] || ''}
                onChange={(e) => setNewComment(prev => ({ ...prev, [item.id]: e.target.value }))}
                className="flex-grow border px-2 py-1 rounded"
                placeholder="Add a comment..."
              />
              <button
                onClick={() => handleComment(item.id, item.anime_title ? 'review' : 'forum')}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Post
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
