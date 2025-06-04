import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationsDropdown from './NotificationsDropdown';
import { User } from 'lucide-react';
import axios from '../../axiosConfig';

interface NavbarProps {
  user: any;
  setUser: (user: any) => void;
  onLoginClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, setUser, onLoginClick }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      axios.get(`/api/search/anime?query=${searchTerm}`)
        .then(res => {
          setSearchResults(res.data);
          setShowDropdown(true);
        })
        .catch(() => setSearchResults([]));
    } else {
      setShowDropdown(false);
      setSearchResults([]);
    }
  }, [searchTerm]);

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout', {}, { withCredentials: true });
      setUser(null);
      navigate('/');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const handleProfileClick = () => {
    navigate(`/profile/${user.username}`);
    setDropdownOpen(false);
  };

  const submitFeedback = async () => {
    if (!topic.trim() || !message.trim()) {
      setSubmitStatus('Please fill out both fields.');
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/feedback/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ topic, message })
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitStatus('✅ Feedback sent. Thank you!');
        setTopic('');
        setMessage('');
      } else {
        setSubmitStatus(`❌ ${data.error || 'Error sending feedback'}`);
      }
    } catch (err) {
      setSubmitStatus('❌ Network error');
    }
  };

  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-6">
        <Link to="/" className="text-xl font-bold">Anime Forum</Link>
        <Link to="/anime" className="hover:underline">Anime</Link>
        <Link to="/forum" className="hover:underline">Forums</Link>
        <Link to="/news" className="hover:underline">News</Link>
        <Link to="/friends/requests" className="hover:underline">Friend Requests</Link>
        {user?.is_admin && (
          <Link to="/admin/dashboard" className="hover:underline text-yellow-400">Admin Tools</Link>
        )}
      </div>

      <div className="flex items-center space-x-4 relative" ref={searchRef}>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search anime..."
            className="px-4 py-2 rounded text-black w-64"
          />
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute z-50 bg-white text-black w-full mt-1 rounded shadow">
              {searchResults.map((anime, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    navigate(`/anime/${anime.id}`);
                    setSearchTerm('');
                    setShowDropdown(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {anime.title}
                </div>
              ))}
            </div>
          )}
        </div>

        {user && (
          <Link to="/friends" className="hover:text-blue-300">
            <User className="w-5 h-5" />
          </Link>
        )}

        {!user ? (
          <>
            <button onClick={onLoginClick} className="hover:underline">Login</button>
            <Link to="/register" className="hover:underline">Register</Link>
          </>
        ) : (
          <>
            <NotificationsDropdown />
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="hover:underline text-sm"
              >
                Hi, {user.username}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 bg-white text-black border rounded shadow-md z-50 w-44">
                  <button
                    onClick={handleProfileClick}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Profile
                  </button>
                  {user.is_admin && (
                    <Link
                      to="/admin/dashboard"
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-yellow-600"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => setFeedbackOpen(true)}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Send Feedback
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {feedbackOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-lg font-semibold mb-2">Send Feedback</h2>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Topic"
                className="w-full border px-3 py-2 mb-2 rounded"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Your comments..."
                className="w-full border px-3 py-2 mb-2 rounded"
              ></textarea>
              {submitStatus && <div className="text-sm text-gray-600 mb-2">{submitStatus}</div>}
              <div className="flex justify-end gap-2">
                <button onClick={() => setFeedbackOpen(false)} className="px-4 py-1 bg-gray-300 rounded">Cancel</button>
                <button onClick={submitFeedback} className="px-4 py-1 bg-blue-600 text-white rounded">Send</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;