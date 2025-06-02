import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../../axiosConfig';

const currentUsername = localStorage.getItem('username');

interface Message {
  id?: number;
  sender: string;
  recipient?: string;
  content?: string;
  text: string;
  timestamp?: string;
  created_at?: string;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString();
};

const groupMessagesByDate = (messages: Message[]) => {
  return messages.reduce((acc, msg) => {
    const dateKey = formatDate(msg.timestamp || msg.created_at || '');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(msg);
    return acc;
  }, {} as Record<string, Message[]>);
};

const MessagePage: React.FC = () => {
  const { friendUsername } = useParams<{ friendUsername: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!friendUsername) return;
    try {
      const res = await axios.get(`/messages/${friendUsername}`);
      setMessages(res.data);
    } catch (err) {
      console.error(`Failed to fetch messages for ${friendUsername}`, err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [friendUsername]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!friendUsername) {
      console.error('Invalid friend username');
      return;
    }
    try {
      await axios.post(`/messages/${friendUsername}`, {
        text: newMessage
      });
      const newMsg: Message = {
        sender: currentUsername || 'me',
        text: newMessage,
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, newMsg]);
      setNewMessage('');
    } catch (err) {
      console.error(`Failed to send message to ${friendUsername}`, err);
    }
  };

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="max-w-3xl mx-auto mt-8 p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Chat with {friendUsername}</h2>
      <div className="h-96 overflow-y-auto border p-4 rounded mb-4 bg-gray-50">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className="text-center text-gray-500 text-xs my-2">{date}</div>
            {msgs.map((msg, idx) => {
              const isMe = msg.sender === currentUsername;
              return (
                <div key={idx} className={`mb-3 flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`px-3 py-2 rounded text-sm max-w-xs whitespace-pre-line break-words ${
                      isMe ? 'bg-blue-500 text-white' : 'bg-white text-black border'
                    }`}
                  >
                    <p className="font-semibold text-xs mb-1">{msg.sender}</p>
                    <p>{msg.text || msg.content}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      {msg.timestamp
                        ? new Date(msg.timestamp).toLocaleTimeString()
                        : msg.created_at
                        ? new Date(msg.created_at).toLocaleTimeString()
                        : ''}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow px-4 py-2 border rounded"
          placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MessagePage;
