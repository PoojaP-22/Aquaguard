import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import Toast from '../components/Toast';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/pipelines': 'Pipeline Monitoring',
  '/repair-priority': 'Repair Priority',
  '/alerts': 'AI Alerts',
  '/sensors': 'Sensor Data',
  '/maintenance': 'Maintenance Logs',
  '/configuration': 'Alert Configuration',
  '/settings': 'Settings',
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'AquaGuard AI';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNavbar onMenuToggle={() => setSidebarOpen(v => !v)} title={title} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  );
}
