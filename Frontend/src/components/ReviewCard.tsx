// ReviewCard.tsx - Add created_at and expandable review
import React, { useState, useEffect } from 'react';
import axios from '../../axiosConfig';

interface ReviewCardProps {
  id: number;
  text: string;
  user: string;
  anime_title: string;
  likes: number;
  dislikes: number;
  currentUser: string;
  created_at: string;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ id, text, user, anime_title, likes, dislikes, currentUser, created_at }) => {
  const [likeCount, setLikeCount] = useState(likes || 0);
  const [dislikeCount, setDislikeCount] = useState(dislikes || 0);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [comments, setComments] = useState<{ username: string; text: string }[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const likedKey = `review_${id}_liked`;
    const dislikedKey = `review_${id}_disliked`;
    setLiked(localStorage.getItem(likedKey) === 'true');
    setDisliked(localStorage.getItem(dislikedKey) === 'true');
    fetchComments();
  }, [id]);

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/api/review/${id}/comments`);
      setComments(res.data);
    } catch (err) {
      console.error('Failed to fetch comments');
    }
  };

  const handleLike = async () => {
    if (liked) return;
    try {
      await axios.post(`/api/review/${id}/like`);
      setLikeCount(prev => prev + 1);
      setLiked(true);
      localStorage.setItem(`review_${id}_liked`, 'true');
      if (disliked) {
        setDislikeCount(prev => prev - 1);
        setDisliked(false);
        localStorage.removeItem(`review_${id}_disliked`);
      }
    } catch (err) {
      console.error('Failed to like review');
    }
  };

  const handleDislike = async () => {
    if (disliked) return;
    try {
      await axios.post(`/api/review/${id}/dislike`);
      setDislikeCount(prev => prev + 1);
      setDisliked(true);
      localStorage.setItem(`review_${id}_disliked`, 'true');
      if (liked) {
        setLikeCount(prev => prev - 1);
        setLiked(false);
        localStorage.removeItem(`review_${id}_liked`);
      }
    } catch (err) {
      console.error('Failed to dislike review');
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await axios.post(`/api/review/${id}/comment`, { text: newComment });
      setComments(prev => [...prev, res.data]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/review/${id}`);
      window.location.reload();
    } catch (err) {
      console.error('Failed to delete review');
    }
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`/api/review/${id}`, { text: editedText });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update review');
    }
  };

  return (
    <div className="bg-gray-100 rounded p-4 shadow">
      <div className="text-sm text-gray-500 mb-1">{new Date(created_at).toLocaleString()}</div>

      {isEditing ? (
        <>
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full p-2 mb-2 border rounded"
          />
          <button onClick={handleSaveEdit} className="bg-green-500 text-white px-3 py-1 rounded mr-2">
            Save
          </button>
          <button onClick={() => setIsEditing(false)} className="bg-gray-300 px-3 py-1 rounded">
            Cancel
          </button>
        </>
      ) : (
        <>
          <p className="italic text-gray-800">
            "{expanded || editedText.length < 200 ? editedText : `${editedText.slice(0, 200)}...`}"
          </p>
          {editedText.length > 200 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-sm text-blue-600 hover:underline mt-1"
            >
              {expanded ? 'Show Less' : 'Read More'}
            </button>
          )}
          <p className="text-sm mt-2 text-gray-600">
            — <strong>{user}</strong> on <strong>{anime_title}</strong>
          </p>
        </>
      )}

      <div className="flex gap-4 mt-2">
        <button
          onClick={handleLike}
          className={`text-green-600 hover:underline ${liked ? 'font-bold underline' : ''}`}
        >
          👍 {likeCount}
        </button>
        <button
          onClick={handleDislike}
          className={`text-red-600 hover:underline ${disliked ? 'font-bold underline' : ''}`}
        >
          👎 {dislikeCount}
        </button>
      </div>

      {currentUser === user && !isEditing && (
        <div className="mt-2">
          <button onClick={() => setIsEditing(true)} className="text-blue-500 text-sm mr-2">Edit</button>
          <button onClick={handleDelete} className="text-red-500 text-sm">Delete</button>
        </div>
      )}

      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2">Comments</h4>
        <div className="space-y-2 mb-2">
          {comments.map((comment, idx) => (
            <div key={idx} className="text-sm text-gray-800">
              <span className="font-semibold mr-2">{comment.username}</span>
              {comment.text}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-grow border px-2 py-1 rounded"
          />
          <button
            onClick={handleComment}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
