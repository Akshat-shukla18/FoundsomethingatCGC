import { useState, useEffect } from 'react';
import { moderationService } from '../services/moderation.service';
import { Loading, ErrorState, EmptyState } from '../components/ui/States';

export const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('REPORTS'); // REPORTS or LOGS

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (activeTab === 'REPORTS') {
        const data = await moderationService.getPendingReports();
        setReports(data.reports || []);
      } else {
        const data = await moderationService.getAuditLogs();
        setLogs(data.logs || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch admin data (Are you an admin?)');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id, resolution) => {
    try {
      await moderationService.resolveReport(id, resolution);
      setReports(reports.filter(r => r._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to resolve report');
    }
  };

  const handleUpdateItemStatus = async (itemId, newStatus) => {
     try {
       const reason = window.prompt("Reason for status change:");
       if (reason === null) return;
       await moderationService.updateItemStatus(itemId, newStatus, reason);
       alert("Status updated");
     } catch (err) {
       alert(err.message || 'Failed to update item');
     }
  };

  if (loading && reports.length === 0 && logs.length === 0) return <Loading fullscreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
      
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('REPORTS')}
          className={`py-2 px-4 font-medium border-b-2 ${activeTab === 'REPORTS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Pending Reports
        </button>
        <button 
          onClick={() => setActiveTab('LOGS')}
          className={`py-2 px-4 font-medium border-b-2 ${activeTab === 'LOGS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Audit Logs
        </button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : activeTab === 'REPORTS' ? (
        reports.length === 0 ? <EmptyState message="No pending moderation reports." /> : (
          <div className="space-y-4">
            {reports.map(report => (
              <div key={report._id} className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <p className="font-semibold text-gray-900">Target {report.targetType}: <span className="font-mono text-sm">{report.targetId}</span></p>
                  <p className="text-sm text-red-600 font-medium">Reason: {report.reason}</p>
                  {report.details && <p className="text-sm text-gray-600 mt-1">{report.details}</p>}
                  <p className="text-xs text-gray-400 mt-2">Reported by: {report.reportedBy?.name} ({report.reportedBy?.collegeEmail}) on {new Date(report.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                   {report.targetType === 'REPORT' && (
                     <button onClick={() => handleUpdateItemStatus(report.targetId, 'REMOVED')} className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium">Remove Target Item</button>
                   )}
                  <div className="flex gap-2">
                    <button onClick={() => handleResolve(report._id, 'RESOLVED')} className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium">Mark Resolved</button>
                    <button onClick={() => handleResolve(report._id, 'DISMISSED')} className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium">Dismiss</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        logs.length === 0 ? <EmptyState message="No audit logs found." /> : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {logs.map(log => (
                  <tr key={log._id}>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{log.action}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{log.targetType} ({log.targetId})</td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">{log.actorId?.collegeEmail || 'System'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

