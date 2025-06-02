import React from 'react';
import { Link } from 'react-router-dom';

interface PostCardProps {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
  edited: boolean;
  likes: number;
  dislikes: number;
  isAuthor: boolean;
  onShowComments: () => void;
  isExpanded: boolean;
  onDelete: () => void;
  children?: React.ReactNode;
}

const PostCard: React.FC<PostCardProps> = ({
  id,
  title,
  content,
  author,
  created_at,
  edited,
  likes,
  dislikes,
  isAuthor,
  onShowComments,
  isExpanded,
  onDelete,
  children
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-semibold">{title}</h2>
        {isAuthor && (
          <div className="flex gap-2">
            <Link to={`/forum/edit/${id}`} className="text-blue-600">Edit</Link>
            <button onClick={onDelete} className="text-red-600">Delete</button>
          </div>
        )}
      </div>
      <p className="mt-2 text-gray-700">{content}</p>
      <div className="text-sm text-gray-500 mt-2">
        By {author} • {new Date(created_at).toLocaleString()} {edited && '(Edited)'}
      </div>
      <div className="flex items-center mt-3 gap-4 text-sm">
        <button className="hover:text-blue-600">👍 {likes}</button>
        <button className="hover:text-red-600">👎 {dislikes}</button>
        <button onClick={onShowComments} className="text-blue-500 underline">
          {isExpanded ? 'Hide' : 'Show'} Comments
        </button>
      </div>
      {isExpanded && (
        <div className="mt-4 border-t pt-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default PostCard;
