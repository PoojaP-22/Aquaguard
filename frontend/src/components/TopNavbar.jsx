import { useEffect, useState } from 'react';
import { Bell, Menu, ChevronDown, X, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function TopNavbar({ onMenuToggle, title }) {
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const activeAlerts = alerts.filter(alert => alert.status === 'Active');
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  useEffect(() => {
    let mounted = true;
    const loadAlerts = () => api.alerts().then(rows => { if (mounted) setAlerts(rows); }).catch(() => { if (mounted) setAlerts([]); });
    loadAlerts();
    const timer = setInterval(loadAlerts, 30000);
    return () => { mounted = false; clearInterval(timer); };
  }, []);

  const close = () => { setShowAlerts(false); setShowProfile(false); };
  const openAlert = id => { close(); navigate(`/alerts/${encodeURIComponent(id)}`); };

  return (
    <header className="bg-[#0A1E2E] border-b border-white/[.08] h-[62px] px-4 lg:px-6 flex items-center justify-between flex-shrink-0 z-10">
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} aria-label="Toggle navigation" className="p-2 rounded-lg hover:bg-white/[.06] text-slate-400"><Menu size={18}/></button>
        <div><div className="text-slate-100 text-sm font-semibold">{title}</div><div className="text-[9px] tracking-[.15em] text-slate-500">WATER NETWORK OPERATIONS</div></div>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden md:inline-flex items-center gap-1.5 border border-amber-300/20 bg-amber-300/[.07] text-amber-200/80 text-[9px] font-bold tracking-wider px-2.5 py-1.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-amber-300"/> SIMULATED TELEMETRY</span>
        <span className="text-slate-500 text-[10px] hidden lg:block px-2">{today}</span>
        <div className="relative">
          <button aria-label="Active alerts" onClick={() => { setShowAlerts(value => !value); setShowProfile(false); }} className="relative p-2 rounded-lg hover:bg-white/[.06] text-slate-400">
            <Bell size={17}/>{activeAlerts.length > 0 && <span className="absolute top-1 right-1 min-w-3 h-3 px-0.5 bg-rose-500 text-white text-[8px] rounded-full flex items-center justify-center">{activeAlerts.length}</span>}
          </button>
          {showAlerts && <div className="absolute right-0 top-11 w-80 bg-[#10283A] rounded-xl shadow-2xl border border-white/10 z-50 text-slate-200">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10"><div><b className="text-xs">Active alerts</b><p className="text-[10px] text-slate-500 mt-1">From the backend alert records</p></div><button aria-label="Close alerts" onClick={close}><X size={14}/></button></div>
            <div className="max-h-72 overflow-y-auto divide-y divide-white/[.06]">
              {activeAlerts.map(alert => <button key={alert.alert_id} onClick={() => openAlert(alert.alert_id)} className="w-full text-left px-4 py-3 text-xs hover:bg-white/[.04] flex items-start gap-2">
                <AlertTriangle size={14} className="text-rose-300 mt-0.5 shrink-0"/><span className="min-w-0"><b className="block text-slate-100">{alert.pipeline_id} · {alert.priority}</b><span className="block text-slate-400 mt-1">{alert.title}</span><span className="block text-[10px] text-slate-500 mt-1">{alert.created_at ? new Date(alert.created_at).toLocaleString() : ''}</span></span>
              </button>)}
              {activeAlerts.length === 0 && <p className="px-4 py-6 text-xs text-slate-500 text-center">No active alerts returned by the API.</p>}
            </div>
            <button onClick={() => { close(); navigate('/alerts'); }} className="w-full border-t border-white/10 px-4 py-3 text-xs text-cyan-300 text-left">Open alert centre</button>
          </div>}
        </div>
        <div className="relative">
          <button onClick={() => { setShowProfile(value => !value); setShowAlerts(false); }} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/[.06]">
            <span className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-teal-600 text-[#06202B] text-[10px] font-bold flex items-center justify-center">AG</span><ChevronDown size={13} className="text-slate-500"/>
          </button>
          {showProfile && <div className="absolute right-0 top-11 w-44 bg-[#10283A] rounded-xl shadow-xl border border-white/10 z-50 py-1 text-xs">
            <div className="px-3 py-2.5 border-b border-white/10"><b className="text-slate-100">Demo workspace</b><p className="text-slate-500 mt-1">No authenticated user</p></div>
            <button onClick={() => { navigate('/settings'); close(); }} className="w-full text-left px-3 py-2 text-slate-300 hover:bg-white/5">Workspace settings</button>
            <button onClick={() => { navigate('/'); close(); }} className="w-full text-left px-3 py-2 text-rose-300 hover:bg-white/5">Exit workspace</button>
          </div>}
        </div>
      </div>
    </header>
  );
}
