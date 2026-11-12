import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNavbar from '../components/TopNavbar';
import Toast from '../components/Toast';
const pageTitles={'/dashboard':'Operations Command Center','/map':'GIS Network Map','/simulation':'Simulation Lab','/pipelines':'Pipeline Assets','/repair-priority':'Repair Priority','/alerts':'AI Alerts','/sensors':'Sensor Telemetry','/maintenance':'Maintenance Work History','/configuration':'Alert Configuration','/settings':'Workspace Settings'};
export default function Layout(){const[sidebarOpen,setSidebarOpen]=useState(true);const location=useLocation();const title=pageTitles[location.pathname]||'AquaGuard AI';return <div className="flex h-screen overflow-hidden bg-[#071725]"><Sidebar open={sidebarOpen} onClose={()=>setSidebarOpen(false)}/><div className="flex-1 flex flex-col min-w-0 overflow-hidden"><TopNavbar onMenuToggle={()=>setSidebarOpen(v=>!v)} title={title}/><main className="flex-1 overflow-y-auto"><Outlet/></main></div><Toast/></div>;}
