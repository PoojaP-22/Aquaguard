import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Bell, RefreshCw } from 'lucide-react';
import { api, normalizeAlert } from '../api';
import { StatusBadge, RiskBadge } from '../components/ui';

export default function Alerts() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.alerts();
      setAlerts(data.map(normalizeAlert));
    } catch (err) {
      setError(err.message || 'Could not load alerts from the API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  const filters = ['All', 'Critical', 'High', 'Medium', 'Low'];
  const filtered = alerts.filter(a => filter === 'All' || a.priority === filter);
  const activeCount = alerts.filter(a => a.status === 'Active').length;

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">AI Alerts</h1>
          <p className="text-slate-500 text-sm mt-1">Backend alert records and their current lifecycle status.</p>
          <p className="text-xs text-slate-500 mt-1">{activeCount} active · {alerts.length} total</p>
        </div>
        <button type="button" onClick={load} disabled={loading} className="btn-secondary flex items-center gap-2 disabled:opacity-50">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-sky-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {f}
          </button>
        ))}
      </div>

      {error && <div role="alert" className="card border border-red-200 text-sm text-red-700">{error}</div>}
      {loading && alerts.length === 0 && <div className="card text-center py-12 text-sm text-slate-500">Loading alerts from the backend…</div>}

      <div className="space-y-3">
        {filtered.map(a => (
          <button type="button" key={a.id} className="card w-full text-left hover:shadow-md transition-shadow"
            onClick={() => navigate(`/alerts/${encodeURIComponent(a.id)}`)}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                  ${a.priority === 'Critical' ? 'bg-red-100' : a.priority === 'High' ? 'bg-orange-100' : 'bg-amber-100'}`}>
                  <AlertTriangle size={18} className={
                    a.priority === 'Critical' ? 'text-red-600' : a.priority === 'High' ? 'text-orange-600' : 'text-amber-600'
                  } />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800">{a.pipeline} — {a.zone || 'Pipeline asset'}</span>
                    <StatusBadge status={a.priority} />
                    <RiskBadge risk={a.risk} />
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{a.prediction}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Reason: {a.reason}</p>
                  <p className="text-xs text-slate-500 mt-1">Lifecycle: {a.status || 'Active'}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-slate-500">{a.time}</div>
                <span className="mt-2 block text-xs text-sky-500 font-medium">View Details →</span>
              </div>
            </div>
          </button>
        ))}
        {!loading && !error && filtered.length === 0 && (
          <div className="card text-center py-16">
            <Bell size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-slate-600">No alerts found</p>
            <p className="text-sm text-slate-500 mt-1">Try another priority filter or check again after new telemetry is processed.</p>
          </div>
        )}
      </div>
    </div>
  );
}
