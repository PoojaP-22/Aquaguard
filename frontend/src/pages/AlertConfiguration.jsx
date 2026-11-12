import { useEffect, useState } from 'react';
import { Save, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';
import { api } from '../api';

const defaults = {
  low_risk_max: 30,
  medium_risk_max: 60,
  high_risk_max: 80,
  critical_risk_min: 81,
  phi_healthy_min: 90,
  phi_warning_min: 75,
  phi_high_risk_min: 60,
  critical_alerts_enabled: true,
  email_notifications_enabled: false,
  dashboard_notifications_enabled: true,
};

function Toggle({ value, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} className="flex items-center gap-2 text-sm">
      {value ? <ToggleRight size={28} className="text-sky-500" /> : <ToggleLeft size={28} className="text-slate-300" />}
      <span className={value ? 'text-sky-600 font-medium' : 'text-slate-500'}>{value ? 'ON' : 'OFF'}</span>
    </button>
  );
}

function NumberField({ label, value, onChange }) {
  return <label className="block">
    <span className="text-xs font-medium text-slate-600 block mb-1">{label}</span>
    <input type="number" min="0" max="100" step="1" className="input-field" value={value} onChange={event => onChange(Number(event.target.value))} />
  </label>;
}

export default function AlertConfiguration() {
  const [config, setConfig] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const saved = await api.configuration();
      setConfig(Object.fromEntries(Object.keys(defaults).map(key => [key, saved[key] ?? defaults[key]])));
    } catch (err) {
      setError(err.message || 'Could not load alert configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const set = (key, value) => setConfig(current => ({ ...current, [key]: value }));
  const valid = config.low_risk_max < config.medium_risk_max
    && config.medium_risk_max < config.high_risk_max
    && config.high_risk_max < config.critical_risk_min
    && config.phi_healthy_min > config.phi_warning_min
    && config.phi_warning_min > config.phi_high_risk_min
    && Object.entries(config).filter(([key]) => key.endsWith('_max') || key.endsWith('_min')).every(([, value]) => Number.isFinite(value) && value >= 0 && value <= 100);

  const save = async event => {
    event.preventDefault();
    if (!valid) {
      setError('Risk thresholds must increase in order; PHI thresholds must decrease in order. All values must be between 0 and 100.');
      return;
    }
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const saved = await api.updateConfiguration(config);
      setConfig(current => ({ ...current, ...saved }));
      setMessage('Configuration saved to the backend.');
    } catch (err) {
      setError(err.message || 'Could not save alert configuration.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-screen-lg mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Alert Configuration</h1>
          <p className="text-slate-500 text-sm mt-1">Thresholds and notification flags stored by the backend.</p>
        </div>
        <button type="button" onClick={load} disabled={loading} className="btn-secondary flex items-center gap-2"><RefreshCw size={14}/> Refresh</button>
      </div>

      {error && <div role="alert" className="card border border-red-200 text-sm text-red-700">{error}</div>}
      {message && <div role="status" className="card border border-emerald-200 text-sm text-emerald-700">{message}</div>}
      {loading ? <div className="card py-12 text-center text-sm text-slate-500">Loading saved configuration…</div> : (
        <form onSubmit={save} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="font-semibold text-slate-800 mb-4">Leak Risk Thresholds (%)</h2>
              <div className="space-y-3">
                <NumberField label="Low risk maximum" value={config.low_risk_max} onChange={v => set('low_risk_max',v)}/>
                <NumberField label="Medium risk maximum" value={config.medium_risk_max} onChange={v => set('medium_risk_max',v)}/>
                <NumberField label="High risk maximum" value={config.high_risk_max} onChange={v => set('high_risk_max',v)}/>
                <NumberField label="Critical risk minimum" value={config.critical_risk_min} onChange={v => set('critical_risk_min',v)}/>
              </div>
            </div>
            <div className="card">
              <h2 className="font-semibold text-slate-800 mb-4">Pipeline Health Index Thresholds</h2>
              <div className="space-y-3">
                <NumberField label="Healthy minimum" value={config.phi_healthy_min} onChange={v => set('phi_healthy_min',v)}/>
                <NumberField label="Warning minimum" value={config.phi_warning_min} onChange={v => set('phi_warning_min',v)}/>
                <NumberField label="High risk minimum" value={config.phi_high_risk_min} onChange={v => set('phi_high_risk_min',v)}/>
              </div>
              <p className="text-xs text-slate-500 mt-3">Values below the high-risk minimum fall into the critical band.</p>
            </div>
            <div className="card md:col-span-2">
              <h2 className="font-semibold text-slate-800 mb-4">Notification Flags</h2>
              <div className="space-y-4">
                {[
                  ['critical_alerts_enabled','Enable critical alerts','Controls the stored critical-alert preference.'],
                  ['email_notifications_enabled','Enable email notifications','Preference only; no email delivery provider is configured.'],
                  ['dashboard_notifications_enabled','Enable dashboard notifications','Preference only; a notification delivery panel is not connected.'],
                ].map(([key,label,description]) => <div key={key} className="flex items-center justify-between gap-4">
                  <div><div className="text-sm font-medium text-slate-700">{label}</div><div className="text-xs text-slate-500">{description}</div></div>
                  <Toggle label={label} value={config[key]} onChange={v => set(key,v)}/>
                </div>)}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={saving || !valid} className="btn-primary flex items-center gap-2 disabled:opacity-50">
              <Save size={16}/>{saving ? 'Saving…' : 'Save Configuration'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
