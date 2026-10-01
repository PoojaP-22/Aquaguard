import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, GitBranch, AlertTriangle, Wrench,
  Radio, ClipboardList, Settings2, LogOut, Droplets, User
} from 'lucide-react';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pipelines', icon: GitBranch, label: 'Pipeline Monitoring' },
  { to: '/repair-priority', icon: Wrench, label: 'Repair Priority' },
  { to: '/alerts', icon: AlertTriangle, label: 'AI Alerts' },
  { to: '/sensors', icon: Radio, label: 'Sensor Data' },
  { to: '/maintenance', icon: ClipboardList, label: 'Maintenance Logs' },
  { to: '/configuration', icon: Settings2, label: 'Alert Configuration' },
];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          flex-shrink-0 flex flex-col h-full z-30 transition-all duration-300 ease-in-out
          ${open ? 'w-60' : 'w-0 lg:w-16'}
          fixed lg:static top-0 left-0
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ backgroundColor: '#0a1628' }}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-[18px] border-b border-white/10 flex-shrink-0 ${!open ? 'lg:justify-center lg:px-0' : ''}`}>
          <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center flex-shrink-0">
            <Droplets size={17} className="text-white" />
          </div>
          {open && (
            <div className="overflow-hidden">
              <div className="text-white font-bold text-sm leading-tight whitespace-nowrap">AquaGuard AI</div>
              <div className="text-slate-400 text-xs whitespace-nowrap">Pipeline Maintenance</div>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
              title={!open ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                ${isActive ? 'bg-sky-500 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}
                ${!open ? 'lg:justify-center lg:px-0' : ''}`
              }
            >
              <Icon size={17} className="flex-shrink-0" />
              {open && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom user + logout */}
        <div className="border-t border-white/10 px-2 py-3 space-y-0.5 flex-shrink-0">
          <NavLink
            to="/settings"
            onClick={() => { if (window.innerWidth < 1024) onClose(); }}
            title={!open ? 'Settings' : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${isActive ? 'bg-sky-500 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}
              ${!open ? 'lg:justify-center lg:px-0' : ''}`
            }
          >
            <User size={17} className="flex-shrink-0" />
            {open && (
              <div className="min-w-0 overflow-hidden">
                <div className="text-white text-xs font-semibold truncate">Arun Kumar</div>
                <div className="text-slate-400 text-xs truncate">Sr. Maintenance Engineer</div>
              </div>
            )}
          </NavLink>

          <button
            onClick={() => navigate('/')}
            title={!open ? 'Logout' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-white/10 hover:text-white text-sm transition-colors
              ${!open ? 'lg:justify-center lg:px-0' : ''}`}
          >
            <LogOut size={17} className="flex-shrink-0" />
            {open && <span>Logout</span>}
          </button>
        </div>
      </aside>

    </>
  );
}
