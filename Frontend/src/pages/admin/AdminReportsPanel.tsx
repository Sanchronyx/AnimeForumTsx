import React, { useEffect, useState } from 'react';
import axios from '../../../axiosConfig';

interface Report {
  id: number;
  reported_user: string;
  reason: string;
  status: string;
}

const AdminReportsPanel: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [processing, setProcessing] = useState<number | null>(null);

  const fetchReports = async () => {
    try {
      const res = await axios.get('/admin/reports', { withCredentials: true });
      setReports(res.data);
    } catch {
      setError('❌ Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleAction = async (reportId: number, action: 'dismiss' | 'warn' | 'ban') => {
    try {
      setProcessing(reportId);
      const res = await axios.post(`/admin/reports/${reportId}/action`, { action }, { withCredentials: true });
      alert(res.data.message);
      setReports(prev => prev.filter(r => r.id !== res.data.removed_id));
    } catch {
      alert('❌ Failed to perform action.');
    } finally {
      setProcessing(null);
    }
  };

  const start = (currentPage - 1) * itemsPerPage;
  const pageReports = reports.slice(start, start + itemsPerPage);
  const totalPages = Math.ceil(reports.length / itemsPerPage);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">User Reports</h2>
      {loading && <p className="text-gray-500">Loading reports...</p>}
      {error && <p className="text-red-500 mb-2">{error}</p>}
      {!loading && reports.length === 0 && <p className="text-gray-500">No reports available.</p>}
      {pageReports.map((r) => (
        <div key={r.id} className="border p-3 mb-4 rounded shadow bg-white">
          <p className="text-sm text-gray-500">
            Reported User: <span className="font-semibold">{r.reported_user}</span>
          </p>
          <p className="text-gray-800 mt-1">Reason: {r.reason}</p>
          <p className="text-sm mt-1 text-gray-600">Status: {r.status}</p>
          <div className="flex gap-2 mt-2">
            <button
              disabled={processing === r.id}
              onClick={() => handleAction(r.id, 'dismiss')}
              className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded text-sm"
            >
              Dismiss
            </button>
            <button
              disabled={processing === r.id}
              onClick={() => handleAction(r.id, 'warn')}
              className="px-3 py-1 bg-yellow-400 hover:bg-yellow-500 rounded text-sm"
            >
              Send Warning
            </button>
            <button
              disabled={processing === r.id}
              onClick={() => handleAction(r.id, 'ban')}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
            >
              Ban User
            </button>
          </div>
        </div>
      ))}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReportsPanel;
