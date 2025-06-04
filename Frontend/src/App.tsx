import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Register from './pages/authentication/Register';
import AnimeDetail from './pages/AnimeDetail';
import BrowseAnime from './pages/BrowseAnime';
import { ForgotPasswordPage } from './pages/authentication/ForgotPassword';
import { ResetPasswordPage } from './pages/authentication/ResetPassword';
import LoginPage from './pages/authentication/LoginPage';
import LoginModal from './pages/authentication/LoginModal';
import Profile from './pages/Profile';
import ForumPage from './pages/forum/ForumPage';
import NewPost from './pages/forum/NewPost';
import EditPost from './pages/forum/EditPost';
import AdminDashboard from './pages/admin/AdminDashboard';
import NewsPage from './pages/NewsPage';
import FriendProfilePage from './pages/friendship/FriendProfilePage';
import FriendsList from './pages/friendship/FriendsList';
import MessagePage from './pages/friendship/MessagePage';
import FriendRequestsPanel from './pages/friendship/FriendRequestsPanel';
import axios from '../axiosConfig';

function AppRoutes({ user, onLogin }: { user: any; onLogin: (u: any) => void }) {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/anime/:id" element={<AnimeDetail />} />
      <Route path="/anime" element={<BrowseAnime />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/login" element={<LoginPage onLogin={onLogin} />} />
      <Route path="/profile/:username" element={<Profile key={location.pathname} />} />
      <Route path="/friend/:username" element={<FriendProfilePage />} />
      <Route path="/friends" element={<FriendsList />} />
      <Route path="/messages/:friendUsername" element={<MessagePage />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/friends/requests" element={<FriendRequestsPanel />} />

      {/* Forum Section */}
      <Route path="/forum" element={<ForumPage />} />
      <Route path="/forum/new" element={<NewPost />} />
      <Route path="/forum/edit/:postId" element={<EditPost />} />

      {/* Admin Section */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  );
}

function App() {
  const [user, setUser] = useState<any>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    axios.get('/auth/whoami', { withCredentials: true })
      .then(res => {
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      })
      .catch(() => {
        setUser(null);
        localStorage.removeItem("user");
      });
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    setLoginOpen(false);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const handleLogout = async () => {
    try {
      await axios.post('/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout failed', error);
    }
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <Router>
      <Layout user={user} setUser={setUser} onLoginClick={() => setLoginOpen(true)}>
        <AppRoutes user={user} onLogin={handleLogin} />
      </Layout>

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={handleLogin}
      />
    </Router>
  );
}

export default App;