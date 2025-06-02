import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  user: any;
  onLogout?: () => void;
  onLoginClick?: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, onLoginClick, children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar user={user} onLogout={onLogout} onLoginClick={onLoginClick} />
      <main className="flex-grow p-6">
        {children}
      </main>
      <footer className="bg-gray-900 text-white text-center py-4">
        © Anime Forum. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;