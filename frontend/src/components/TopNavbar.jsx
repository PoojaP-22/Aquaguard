import { useState } from 'react';
import { Bell, Menu, ChevronDown, X, CheckCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function TopNavbar({ onMenuToggle, title }) {
  const { notifications, markAllRead } = useApp();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();
  const unread = notifications.filter(n => !n.read).length;
  const now = new Date().toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });

  const closeAll = () => { setShowNotif(false); setShowProfile(false); };

  return (
    <header className="bg-white border-b border-slate-100 h-14 px-4 flex items-center justify-between flex-shrink-0 z-10">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <Menu size={19} />
        </button>
        {title && (
          <h1 className="text-slate-800 font-semibold text-sm hidden sm:block">{title}</h1>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5">
        {/* Demo badge */}
        <span
          className="hidden sm:inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full"
          title="Displaying simulated sensor and AI prediction data."
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          DEMO MODE
        </span>

        <span className="text-slate-400 text-xs hidden md:block px-2">{now}</span>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotif(v => !v); setShowProfile(false); }}
            className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold leading-none">
                {unread}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                <span className="font-semibold text-sm text-slate-800">Notifications</span>
                <div className="flex items-center gap-2">
                  <button onClick={markAllRead} className="text-xs text-sky-500 hover:underline flex items-center gap-1">
                    <CheckCheck size={11} /> Mark all read
                  </button>
                  <button onClick={closeAll} className="text-slate-400 hover:text-slate-600">
                    <X size={15} />
                  </button>
                </div>
              </div>
              <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className={`px-4 py-3 flex items-start gap-2.5 ${n.read ? 'opacity-50' : ''}`}>
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? 'bg-slate-300' : 'bg-sky-500'}`} />
                    <div>
                      <p className="text-xs text-slate-700 leading-relaxed">{n.text}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(v => !v); setShowNotif(false); }}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-sky-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              AK
            </div>
            <ChevronDown size={13} className="text-slate-400 hidden sm:block" />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-11 w-44 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-1 overflow-hidden">
              <div className="px-3 py-2.5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-800">Arun Kumar</p>
                <p className="text-xs text-slate-500">Sr. Maintenance Engineer</p>
              </div>
              <button
                onClick={() => { navigate('/settings'); closeAll(); }}
                className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Settings
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-slate-50 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
