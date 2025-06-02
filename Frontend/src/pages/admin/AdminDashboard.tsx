import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../axiosConfig';

import AdminFeedbackPanel from './AdminFeedbackPanel';
import AdminNewsPanel from './AdminNewsPanel';
import EditableNewsPanel from './EditableNewsPanel';
import AdminReportsPanel from './AdminReportsPanel';
import AdminBanTogglePanel from './AdminBanTogglePanel';
import AdminLogsPanel from './AdminLogsPanel';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('feedback');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const res = await axios.get('/auth/whoami', { withCredentials: true });
        if (!res.data.is_admin) {
          navigate('/');
        } else {
          setIsAdmin(true);
        }
      } catch {
        navigate('/');
      }
    };
    verifyAdmin();
  }, [navigate]);

  const tabs = [
    { key: 'feedback', label: 'Dev Feedback', component: <AdminFeedbackPanel /> },
    { key: 'news-create', label: 'Create News', component: <AdminNewsPanel /> },
    { key: 'news-manage', label: 'Manage News', component: <EditableNewsPanel /> },
    { key: 'reports', label: 'User Reports', component: <AdminReportsPanel /> },
    { key: 'ban-toggle', label: 'Ban/Unban User', component: <AdminBanTogglePanel /> },
    { key: 'logs', label: 'Admin Logs', component: <AdminLogsPanel /> }
  ];

  if (isAdmin === null) return <div className="p-6 text-center">Loading admin dashboard...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={tabClass(activeTab === tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-white p-4 shadow rounded">
        {tabs.find(tab => tab.key === activeTab)?.component}
      </div>
    </div>
  );
};

function tabClass(active: boolean): string {
  return `px-4 py-2 rounded ${active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black hover:bg-gray-300'}`;
}

export default AdminDashboard;