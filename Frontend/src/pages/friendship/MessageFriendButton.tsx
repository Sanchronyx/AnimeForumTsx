import React from 'react';
import { useNavigate } from 'react-router-dom';

interface MessageFriendButtonProps {
  friendUsername: string;
}

const MessageFriendButton: React.FC<MessageFriendButtonProps> = ({ friendUsername }) => {
  const navigate = useNavigate();

  const startChat = () => {
    navigate(`/messages/${friendUsername}`);
  };

  return (
    <button
      onClick={startChat}
      className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
    >
      Message
    </button>
  );
};

export default MessageFriendButton;