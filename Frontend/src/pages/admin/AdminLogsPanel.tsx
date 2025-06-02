import React, { useEffect, useState } from 'react';
import axios from '../../../axiosConfig';

interface AdminLog {
  admin: string;
  action_type: string;
  target: string;
  detail: string;
  time: string;
}

const AdminLogsPanel: React.FC = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [processingUndo, setProcessingUndo] = useState<number | null>(null);
  const itemsPerPage = 10;

  const fetchLogs = async () => {
    try {
      const res = await axios.get('/admin/logs', { withCredentials: true });
      setLogs(res.data);
    } catch {
      setError('❌ Failed to load admin logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleUndo = async (detail: string, index: number) => {
    const match = detail.match(/report #(\d+)/i);
    if (!match) return alert('Could not extract report ID');
    const reportId = parseInt(match[1]);

    try {
      setProcessingUndo(index);
      const res = await axios.post(`/admin/reports/${reportId}/undo`, {}, { withCredentials: true });
      alert(res.data.message);
      fetchLogs();
    } catch {
      alert('❌ Undo failed.');
    } finally {
      setProcessingUndo(null);
    }
  };

  const start = (currentPage - 1) * itemsPerPage;
  const pageLogs = logs.slice(start, start + itemsPerPage);
  const totalPages = Math.ceil(logs.length / itemsPerPage);

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Admin Action Logs</h2>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500 mb-2">{error}</p>
      ) : logs.length === 0 ? (
        <p className="text-gray-500">No logs available.</p>
      ) : (
        <div className="space-y-3">
          {pageLogs.map((log, i) => (
            <div key={i} className="border rounded shadow-sm p-3 bg-white">
              <p className="text-sm text-gray-600">
                [{new Date(log.time).toLocaleString()}] <span className="font-semibold text-indigo-700">{log.admin}</span> {log.action_type} <span className="text-gray-800">{log.target}</span>
              </p>
              <p className="text-xs text-gray-500 mb-1">{log.detail}</p>
              {(log.action_type === 'ADMIN_WARN' || log.action_type === 'ADMIN_BAN') && (
                <button
                  onClick={() => handleUndo(log.detail, i)}
                  disabled={processingUndo === i}
                  className="px-3 py-1 text-xs bg-red-200 hover:bg-red-300 rounded"
                >
                  {processingUndo === i ? 'Undoing...' : 'Undo Action'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
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

export default AdminLogsPanel;
