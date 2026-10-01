import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Save, User, Cpu, Brain, Droplets } from 'lucide-react';

export default function Settings() {
  const { showToast } = useApp();
  const [profile, setProfile] = useState({ name: 'Arun Kumar', role: 'Senior Maintenance Engineer', email: 'arun@example.com' });
  const [prefs, setPrefs] = useState({ refresh: '10', range: '24 hours' });

  return (
    <div className="p-6 space-y-6 max-w-screen-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage your profile and dashboard preferences.</p>
      </div>

      {/* Profile */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <User size={18} className="text-sky-500" />
          <h2 className="font-semibold text-slate-800">Profile</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Full Name</label>
            <input className="input-field" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Role</label>
            <input className="input-field" value={profile.role} onChange={e => setProfile(p => ({ ...p, role: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Email</label>
            <input className="input-field" type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} />
          </div>
        </div>
      </div>

      {/* Dashboard Preferences */}
      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-4">Dashboard Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Refresh Interval</label>
            <select className="input-field" value={prefs.refresh} onChange={e => setPrefs(p => ({ ...p, refresh: e.target.value }))}>
              {['5', '10', '30', '60'].map(v => <option key={v} value={v}>{v} seconds</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Default Time Range</label>
            <select className="input-field" value={prefs.range} onChange={e => setPrefs(p => ({ ...p, range: e.target.value }))}>
              {['1 hour', '6 hours', '24 hours', '7 days'].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-4">System Information</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Droplets, label: 'AquaGuard AI', value: 'Prototype v1.0', color: 'sky' },
            { icon: Cpu, label: 'ESP32 Gateway', value: 'Connected', color: 'green' },
            { icon: Brain, label: 'ML Model', value: 'RF / XGBoost', color: 'indigo' },
            { icon: Brain, label: 'Explainability', value: 'SHAP', color: 'purple' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className={`bg-${color}-50 rounded-xl p-4 border border-${color}-100`}>
              <Icon size={18} className={`text-${color}-500 mb-2`} />
              <div className="text-xs text-slate-500">{label}</div>
              <div className={`text-sm font-semibold text-${color}-700 mt-0.5`}>{value}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 text-xs text-amber-700">
          ⚠️ This is a frontend prototype using simulated mock data. No real sensors, ML models, or databases are connected.
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => showToast('Settings saved successfully.')} className="btn-primary flex items-center gap-2">
          <Save size={16} /> Save Settings
        </button>
      </div>
    </div>
  );
}
