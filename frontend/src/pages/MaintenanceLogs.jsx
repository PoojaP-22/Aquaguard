import { useCallback, useEffect, useState } from 'react';
import { Plus, CheckCircle, Clock, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../api';
import MaintenanceModal from '../components/MaintenanceModal';

const statuses = ['Pending', 'In Progress', 'Completed'];

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function MaintenanceLogs() {
  const [logs, setLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadLogs = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const records = await api.maintenance();
      setLogs(records);
    } catch (err) {
      setError(err.message || 'Unable to load maintenance records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const updateStatus = async (record, status) => {
    setUpdatingId(record.id);
    setError('');
    try {
      await api.updateMaintenance(record.id, { status });
      await loadLogs(true);
    } catch (err) {
      setError(err.message || 'Could not update this maintenance record.');
    } finally {
      setUpdatingId(null);
    }
  };

  const completedCount = logs.filter(log => log.status === 'Completed').length;
  const openCount = logs.filter(log => log.status !== 'Completed').length;

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Maintenance Logs</h1>
          <p className="text-slate-500 text-sm mt-1">Create work records and track their progress in the maintenance database.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => loadLogs(true)} disabled={refreshing} className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Record
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 text-sm text-red-800">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div><b>Maintenance API issue</b><p className="mt-1">{error}</p></div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card"><div className="text-xs text-slate-500">Total records</div><div className="text-2xl font-bold text-slate-800 mt-1">{loading ? '—' : logs.length}</div></div>
        <div className="card"><div className="text-xs text-slate-500">Open / in progress</div><div className="text-2xl font-bold text-amber-600 mt-1">{loading ? '—' : openCount}</div></div>
        <div className="card"><div className="text-xs text-slate-500">Completed</div><div className="text-2xl font-bold text-emerald-600 mt-1">{loading ? '—' : completedCount}</div></div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800 text-sm">Maintenance history</h2>
          <span className="text-xs text-slate-500">Newest first · database records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-xs text-slate-500">
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Pipeline</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Issue</th>
                <th className="text-left px-4 py-3 font-medium">Action</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Engineer</th>
                <th className="text-left px-4 py-3 font-medium">Priority</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{formatDate(log.created_at)}</td>
                  <td className="px-4 py-3 font-semibold text-sky-600">{log.pipeline_id}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-600 text-xs max-w-[180px] truncate">{log.issue_type}</td>
                  <td className="px-4 py-3 text-slate-700 text-xs max-w-[200px] truncate">{log.action_taken || '—'}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-slate-600 text-xs">{log.assigned_engineer || '—'}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{log.priority}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {log.status === 'Completed' ? <CheckCircle size={13} className="text-green-600" /> : <Clock size={13} className="text-amber-600" />}
                      <select aria-label={`Status for maintenance record ${log.id}`} value={log.status} disabled={updatingId === log.id} onChange={event => updateStatus(log, event.target.value)} className="text-xs bg-transparent border border-slate-200 rounded-md px-1.5 py-1 text-slate-700 disabled:opacity-50">
                        {statuses.map(status => <option key={status}>{status}</option>)}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && logs.length === 0 && (
                <tr><td colSpan="7" className="px-4 py-12 text-center text-sm text-slate-500">No maintenance records found. Add a record to get started.</td></tr>
              )}
              {loading && <tr><td colSpan="7" className="px-4 py-12 text-center text-sm text-slate-500">Loading maintenance records…</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <MaintenanceModal onClose={() => setShowModal(false)} onSaved={() => loadLogs(true)} />}
    </div>
  );
}
