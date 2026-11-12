import { useEffect, useState } from 'react';
import { Save, Cpu, Brain, Droplets, RefreshCw } from 'lucide-react';
import { api } from '../api';

const preferenceKey = 'aquaguard.preferences';
const defaultPreferences = { refreshSeconds: '30' };

export default function Settings() {
  const [prefs, setPrefs] = useState(defaultPreferences);
  const [saved, setSaved] = useState(false);
  const [backend, setBackend] = useState({ loading: true, status: 'Checking…', version: '—' });

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(preferenceKey) || '{}');
      setPrefs({ ...defaultPreferences, ...stored });
    } catch {
      setPrefs(defaultPreferences);
    }
    api.health()
      .then(data => setBackend({ loading: false, status: data.status || 'Available', version: data.version || '—' }))
      .catch(() => setBackend({ loading: false, status: 'Unavailable', version: '—' }));
  }, []);

  const save = event => {
    event.preventDefault();
    localStorage.setItem(preferenceKey, JSON.stringify(prefs));
    setSaved(true);
  };

  return (
    <div className="p-6 space-y-6 max-w-screen-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage preferences for this browser and view service information.</p>
      </div>

      <form onSubmit={save} className="card space-y-4">
        <div>
          <h2 className="font-semibold text-slate-800">Dashboard Preferences</h2>
          <p className="text-xs text-slate-500 mt-1">These preferences are stored locally in this browser, not in a user account.</p>
        </div>
        <label className="block max-w-xs">
          <span className="text-xs font-medium text-slate-600 block mb-1">Dashboard refresh interval</span>
          <select className="input-field" value={prefs.refreshSeconds} onChange={e => { setPrefs({ refreshSeconds: e.target.value }); setSaved(false); }}>
            {['5','10','30','60'].map(value => <option key={value} value={value}>{value} seconds</option>)}
          </select>
        </label>
        <div className="flex items-center gap-3">
          <button type="submit" className="btn-primary flex items-center gap-2"><Save size={16}/> Save Preferences</button>
          {saved && <span role="status" className="text-xs text-emerald-700">Saved on this device.</span>}
        </div>
      </form>

      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-4">System Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl p-4 border border-slate-100 bg-slate-50">
            <Droplets size={18} className="text-sky-600 mb-2"/>
            <div className="text-xs text-slate-500">AquaGuard AI</div>
            <div className="text-sm font-semibold text-slate-800 mt-1">Prototype v2.1</div>
          </div>
          <div className="rounded-xl p-4 border border-slate-100 bg-slate-50">
            <Cpu size={18} className="text-sky-600 mb-2"/>
            <div className="text-xs text-slate-500">Backend API</div>
            <div className={`text-sm font-semibold mt-1 ${backend.status === 'healthy' ? 'text-emerald-700' : 'text-amber-700'}`}>{backend.loading ? 'Checking…' : backend.status}</div>
          </div>
          <div className="rounded-xl p-4 border border-slate-100 bg-slate-50">
            <Brain size={18} className="text-sky-600 mb-2"/>
            <div className="text-xs text-slate-500">Backend Version</div>
            <div className="text-sm font-semibold text-slate-800 mt-1">{backend.version}</div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-800">
          Authentication and user profiles are not implemented in this prototype. Sensor readings may be seeded or simulated; this screen does not claim a physical gateway is connected. Model evaluation uses synthetic data and is not field-validated.
        </div>
        <button type="button" onClick={() => { setBackend(current => ({ ...current, loading: true })); api.health().then(data => setBackend({ loading: false, status: data.status || 'Available', version: data.version || '—' })).catch(() => setBackend({ loading: false, status: 'Unavailable', version: '—' })); }} className="mt-3 text-xs text-sky-700 flex items-center gap-2"><RefreshCw size={13}/> Check backend again</button>
      </div>
    </div>
  );
}
