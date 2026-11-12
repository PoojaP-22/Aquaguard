import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Brain, RefreshCw } from 'lucide-react';
import { api } from '../api';
import { StatusBadge } from '../components/ui';
import MaintenanceModal from '../components/MaintenanceModal';

export default function AlertDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setAlert(await api.alert(id));
    } catch (err) {
      setError(err.message || 'Could not load this alert.');
      setAlert(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async status => {
    setSaving(true);
    setError('');
    try {
      const updated = await api.updateAlert(id, { status });
      setAlert(updated);
    } catch (err) {
      setError(err.message || 'Could not update the alert status.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-sm text-slate-500">Loading alert details…</div>;
  if (!alert) return (
    <div className="p-6 max-w-screen-lg mx-auto space-y-4">
      <button onClick={() => navigate('/alerts')} className="flex items-center gap-2 text-sm text-slate-600"><ArrowLeft size={16}/> Back to alerts</button>
      <div role="alert" className="card text-sm text-red-700">{error || 'Alert not found.'}</div>
      <button onClick={load} className="btn-secondary">Try again</button>
    </div>
  );

  const isCritical = alert.priority === 'Critical';
  const features = alert.shap_explanation || [];

  return (
    <div className="p-6 space-y-6 max-w-screen-lg mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/alerts')} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">AI Leak Risk Alert</h1>
        </div>
        <button onClick={load} disabled={loading} className="btn-secondary flex items-center gap-2"><RefreshCw size={14}/> Refresh</button>
      </div>

      {error && <div role="alert" className="card border border-red-200 text-sm text-red-700">{error}</div>}

      <div className={`card border-2 ${isCritical ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${isCritical ? 'bg-red-100' : 'bg-orange-100'}`}>
            <AlertTriangle size={28} className={isCritical ? 'text-red-600' : 'text-orange-600'} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span className={`text-lg font-bold ${isCritical ? 'text-red-700' : 'text-orange-700'}`}>
                {alert.priority.toUpperCase()} RISK
              </span>
              <StatusBadge status={alert.priority} />
              <span className="text-xs rounded-full bg-white/80 border border-slate-200 px-2 py-1 text-slate-600">{alert.status}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
              <div><div className="text-xs text-slate-500">Pipeline</div><div className="font-semibold text-slate-800">{alert.pipeline_id}</div></div>
              <div><div className="text-xs text-slate-500">Leak Risk</div><div className="font-bold text-red-600 text-xl">{alert.risk_score}%</div></div>
              <div><div className="text-xs text-slate-500">Detected</div><div className="font-semibold text-slate-800">{alert.created_at ? new Date(alert.created_at).toLocaleString() : '—'}</div></div>
              {alert.resolved_at && <div><div className="text-xs text-slate-500">Closed</div><div className="font-semibold text-slate-800">{new Date(alert.resolved_at).toLocaleString()}</div></div>}
            </div>
            <p className="text-sm text-slate-700 mt-4">{alert.description}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={18} className="text-sky-500" />
          <h2 className="font-semibold text-slate-800">Why This Alert Was Generated</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">Feature contributions stored with this alert record.</p>
        {features.length ? (
          <div className="space-y-3">
            {features.map((feature, index) => {
              const impact = Number(feature.impact || 0);
              const width = Math.min(100, Math.abs(impact) * 100);
              return <div key={feature.feature || index} className="flex items-center gap-3">
                <div className="w-32 text-xs text-slate-600 text-right flex-shrink-0">{feature.feature}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                  <div className={`h-full rounded-full ${impact >= 0 ? 'bg-red-400' : 'bg-sky-400'}`} style={{ width: `${width}%` }}/>
                </div>
                <div className="w-14 text-xs font-semibold text-right">{impact > 0 ? '+' : ''}{impact.toFixed(3)}</div>
              </div>;
            })}
          </div>
        ) : <p className="text-sm text-slate-500">No feature-contribution data was saved for this alert.</p>}
        <p className="text-xs text-slate-500 mt-4">Feature explanations are only shown when supplied by the backend; no placeholder explanation is substituted.</p>
      </div>

      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-3">Alert actions</h2>
        {alert.recommended_action && <p className="text-sm text-slate-600 mb-4">Recommended: {alert.recommended_action}</p>}
        <div className="flex gap-3 flex-wrap">
          {alert.status === 'Active' && <button disabled={saving} onClick={() => changeStatus('Acknowledged')} className="btn-primary disabled:opacity-50">{saving ? 'Saving…' : 'Acknowledge'}</button>}
          {['Active', 'Acknowledged'].includes(alert.status) && <button disabled={saving} onClick={() => changeStatus('Resolved')} className="btn-secondary disabled:opacity-50">Mark Resolved</button>}
          {['Active', 'Acknowledged'].includes(alert.status) && <button disabled={saving} onClick={() => changeStatus('Dismissed')} className="btn-danger disabled:opacity-50">Dismiss Alert</button>}
          <button onClick={() => setShowModal(true)} className="btn-secondary">Create Maintenance Record</button>
        </div>
        {['Resolved', 'Dismissed'].includes(alert.status) && <p className="text-sm text-slate-500 mt-3">This alert is closed. Its lifecycle status is stored in the backend.</p>}
      </div>

      {showModal && <MaintenanceModal onClose={() => setShowModal(false)} onSaved={load} defaultPipeline={alert.pipeline_id} />}
    </div>
  );
}
