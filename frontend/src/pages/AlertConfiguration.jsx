import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Save, ToggleLeft, ToggleRight } from 'lucide-react';

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} className="flex items-center gap-2 text-sm">
      {value
        ? <ToggleRight size={28} className="text-sky-500" />
        : <ToggleLeft size={28} className="text-slate-300" />}
      <span className={value ? 'text-sky-600 font-medium' : 'text-slate-500'}>{value ? 'ON' : 'OFF'}</span>
    </button>
  );
}

function ThresholdRow({ label, range, color }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <span className={`text-sm font-medium ${color}`}>{label}</span>
      <span className="text-sm text-slate-600 font-mono">{range}</span>
    </div>
  );
}

export default function AlertConfiguration() {
  const { showToast } = useApp();
  const [toggles, setToggles] = useState({ critical: true, email: false, dashboard: true });
  const set = (k) => (v) => setToggles(t => ({ ...t, [k]: v }));

  return (
    <div className="p-6 space-y-6 max-w-screen-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Alert Configuration</h1>
        <p className="text-slate-500 text-sm mt-1">Configure thresholds used by the monitoring dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leak Risk Thresholds */}
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">Leak Risk Threshold</h2>
          <ThresholdRow label="Low" range="0 – 30%" color="text-green-600" />
          <ThresholdRow label="Medium" range="31 – 60%" color="text-amber-600" />
          <ThresholdRow label="High" range="61 – 80%" color="text-orange-600" />
          <ThresholdRow label="Critical" range="81 – 100%" color="text-red-600" />
        </div>

        {/* PHI Thresholds */}
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">Pipeline Health Index (PHI) Threshold</h2>
          <ThresholdRow label="Healthy" range="90 – 100" color="text-green-600" />
          <ThresholdRow label="Warning" range="75 – 89" color="text-amber-600" />
          <ThresholdRow label="High Risk" range="60 – 74" color="text-orange-600" />
          <ThresholdRow label="Critical" range="Below 60" color="text-red-600" />
        </div>

        {/* Time-to-Failure */}
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">Time-to-Failure Alerts</h2>
          <ThresholdRow label="Critical" range="< 24 hours" color="text-red-600" />
          <ThresholdRow label="High" range="24 – 72 hours" color="text-orange-600" />
          <ThresholdRow label="Medium" range="> 72 hours" color="text-amber-600" />
        </div>

        {/* Notification Toggles */}
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">Notification Settings</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-700">Enable Critical Alerts</div>
                <div className="text-xs text-slate-500">Trigger alerts for critical risk pipelines</div>
              </div>
              <Toggle value={toggles.critical} onChange={set('critical')} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-700">Enable Email Notifications</div>
                <div className="text-xs text-slate-500">Send alerts to registered email addresses</div>
              </div>
              <Toggle value={toggles.email} onChange={set('email')} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-700">Enable Dashboard Notifications</div>
                <div className="text-xs text-slate-500">Show in-app notification panel</div>
              </div>
              <Toggle value={toggles.dashboard} onChange={set('dashboard')} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => showToast('Configuration saved successfully.')} className="btn-primary flex items-center gap-2">
          <Save size={16} /> Save Configuration
        </button>
      </div>
    </div>
  );
}
