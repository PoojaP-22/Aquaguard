import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './pages/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PipelineMonitoring from './pages/PipelineMonitoring';
import PipelineDetails from './pages/PipelineDetails';
import Alerts from './pages/Alerts';
import AlertDetails from './pages/AlertDetails';
import RepairPriority from './pages/RepairPriority';
import MaintenanceLogs from './pages/MaintenanceLogs';
import SensorData from './pages/SensorData';
import AlertConfiguration from './pages/AlertConfiguration';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pipelines" element={<PipelineMonitoring />} />
            <Route path="/pipelines/:id" element={<PipelineDetails />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/alerts/:id" element={<AlertDetails />} />
            <Route path="/repair-priority" element={<RepairPriority />} />
            <Route path="/maintenance" element={<MaintenanceLogs />} />
            <Route path="/sensors" element={<SensorData />} />
            <Route path="/configuration" element={<AlertConfiguration />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
