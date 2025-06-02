import React from 'react';

interface PostCardProps {
  title: string;
  content: string;
  user: string;
  likes: number;
}

const PostCard: React.FC<PostCardProps> = ({ title, content, user, likes }) => {
  return (
    <div className="bg-white border p-4 rounded shadow">
      <h4 className="font-bold text-lg">{title}</h4>
      <p className="text-sm text-gray-700 mt-1">{content}</p>
      <div className="text-sm text-gray-500 mt-2 flex justify-between">
        <span>by {user}</span>
        <span>👍 {likes}</span>
      </div>
    </div>
  );
};

export default PostCard;
