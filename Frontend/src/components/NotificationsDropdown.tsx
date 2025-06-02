// NotificationsDropdown.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bell } from 'lucide-react';

interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

const NotificationsDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (dropdownOpen) {
      axios.get('/notifications', { withCredentials: true })
        .then(res => setNotifications(res.data))
        .catch(err => console.error('Failed to fetch notifications', err));
    }
  }, [dropdownOpen]);

  const markAllAsRead = () => {
    axios.post('/notifications/mark-all-read', {}, { withCredentials: true })
      .then(() => {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      })
      .catch(err => console.error('Failed to mark notifications as read', err));
  };

  return (
    <div className="relative">
      <button onClick={() => setDropdownOpen(!dropdownOpen)} className="relative">
        <Bell className="h-6 w-6" />
        {notifications.some(n => !n.is_read) && (
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        )}
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white text-black border rounded shadow z-50">
          <div className="p-2 font-bold flex justify-between">
            Notifications
            <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:underline">Mark all as read</button>
          </div>
          <ul className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="px-4 py-2 text-gray-500">No notifications</li>
            ) : (
              notifications.map(note => (
                <li
                  key={note.id}
                  className={`px-4 py-2 border-b hover:bg-gray-100 ${note.is_read ? 'text-gray-500' : 'font-semibold'}`}
                >
                  {note.message}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
