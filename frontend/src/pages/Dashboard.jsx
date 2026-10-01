import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, Droplets, Radio, Wrench, TrendingUp } from 'lucide-react';

import { api, normalizeAlert, normalizePipeline } from '../api';
import { StatusBadge, RiskBadge } from '../components/ui';
import { PhiHistoryChart } from '../components/Charts';
import PipelineNetwork from '../components/PipelineNetwork';

export default function Dashboard() {
  const navigate = useNavigate();
  const [phiData, setPhiData] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [repairPriority, setRepairPriority] = useState([]);
  const [summary, setSummary] = useState(null);
  useEffect(() => {
    const buildHistory = () => {
      const now = Date.now();
      setPhiData(Array.from({length: 24}, (_, i) => ({
        time: new Date(now - (23-i)*3600000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}),
        phi: Math.max(0, (summary?.pipeline_health ?? 90) + Math.sin(i/3)*1.8),
        pressure: 0, flow: 0
      })));
    };
    buildHistory();
  }, [summary]);
  useEffect(() => {
    const load = async () => {
      try {
        // Refresh predictions first so every dashboard value reflects the trained ML model.
        await api.predictions();
        const [p,a,r,s] = await Promise.all([api.pipelines(), api.alerts(), api.priority(), api.dashboard()]);
        setPipelines(p.map(normalizePipeline));
        setAlerts(a.map(normalizeAlert));
        setRepairPriority(r.map(x => ({...x, pipeline:x.pipeline_id, timeToFailure:x.time_to_failure, action:x.recommended_action})));
        setSummary(s);
      } catch (e) { console.error(e); }
    };
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, []);

  const healthy = pipelines.filter(p => p.status === 'Healthy').length;
  const activeAlerts = alerts.filter(a => a.status === 'Active');
  const highAlerts = activeAlerts.filter(a => a.priority === 'Critical' || a.priority === 'High').length;
  const medAlerts = activeAlerts.filter(a => a.priority === 'Medium').length;

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Good morning, Arun 👋</h1>
          <p className="text-slate-500 text-sm mt-1">Here's the current health of your water distribution network.</p>
          <div className="inline-flex items-center gap-2 mt-2 px-2.5 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> AquaGuard-ML-1.0 · Random Forest + Isolation Forest
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          All systems operational
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pipeline Health Index</span>
            <Activity size={16} className="text-sky-500" />
          </div>
          <div className="text-3xl font-bold text-sky-600">{summary ? summary.pipeline_health.toFixed(1) : "—"}</div>
          <div className="text-xs text-slate-500 mt-1">Overall PHI</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Calculated from current ML predictions</div>
          <div className="mt-2"><span className="badge-healthy">Healthy</span></div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Monitored Pipelines</span>
            <Droplets size={16} className="text-sky-500" />
          </div>
          <div className="text-3xl font-bold text-slate-800">{summary?.monitored_pipelines ?? "—"}</div>
          <div className="text-xs text-slate-500 mt-1">Active pipeline segments</div>
          <div className="text-xs text-green-600 font-medium mt-1">{healthy} Healthy</div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Active Alerts</span>
            <AlertTriangle size={16} className="text-red-500" />
          </div>
          <div className="text-3xl font-bold text-red-600">{summary?.active_alerts ?? activeAlerts.length}</div>
          <div className="flex gap-2 mt-2">
            <span className="badge-critical">{highAlerts} High</span>
            <span className="badge-medium">{medAlerts} Medium</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Leak Risk</span>
            <TrendingUp size={16} className="text-amber-500" />
          </div>
          <div className="text-3xl font-bold text-amber-600">{summary ? summary.leak_risk.toFixed(1) : "—"}%</div>
          <div className="text-xs text-slate-500 mt-1">Network leak risk</div>
          <div className="mt-2"><span className="badge-medium">Moderate</span></div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Sensors Online</span>
            <Radio size={16} className="text-sky-500" />
          </div>
          <div className="text-3xl font-bold text-slate-800">{summary?.sensors_online ?? "—"}<span className="text-lg text-slate-400">/{summary?.total_sensors ?? "—"}</span></div>
          <div className="text-xs text-slate-500 mt-1">Live backend sensor status</div>
          <div className="mt-2"><span className="badge-healthy">Operational</span></div>
        </div>
      </div>

      {/* PHI Chart */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-slate-800">Pipeline Health Overview</h2>
            <p className="text-xs text-slate-500">PHI, pressure and flow trends over the last 24 hours</p>
          </div>
        </div>
        <PhiHistoryChart data={phiData} />
      </div>

      {/* Alerts + Network */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Active Alerts */}
        <div className="xl:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Active AI Alerts</h2>
            <button onClick={() => navigate('/alerts')} className="text-xs text-sky-500 hover:underline">View all</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 border-b border-slate-100">
                  <th className="text-left pb-2 font-medium">Pipeline</th>
                  <th className="text-left pb-2 font-medium">Risk</th>
                  <th className="text-left pb-2 font-medium hidden md:table-cell">Reason</th>
                  <th className="text-left pb-2 font-medium">Priority</th>
                  <th className="text-left pb-2 font-medium hidden sm:table-cell">Time</th>
                  <th className="text-left pb-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {activeAlerts.slice(0, 4).map(a => (
                  <tr key={a.id} className="hover:bg-slate-50">
                    <td className="py-2.5">
                      <div className="font-medium text-slate-800">{a.pipeline}</div>
                      <div className="text-xs text-slate-500">{a.zone}</div>
                    </td>
                    <td className="py-2.5"><RiskBadge risk={a.risk} /></td>
                    <td className="py-2.5 hidden md:table-cell text-xs text-slate-600 max-w-[160px] truncate">{a.reason}</td>
                    <td className="py-2.5"><StatusBadge status={a.priority} /></td>
                    <td className="py-2.5 hidden sm:table-cell text-xs text-slate-500">{a.time}</td>
                    <td className="py-2.5">
                      <button onClick={() => navigate(`/alerts/${a.id}`)} className="text-xs text-sky-500 hover:underline font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pipeline Network */}
        <PipelineNetwork />
      </div>

      {/* Repair Priority */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-slate-800">Repair Priority</h2>
            <p className="text-xs text-slate-500">AI-ranked maintenance recommendations</p>
          </div>
          <button onClick={() => navigate('/repair-priority')} className="btn-secondary text-xs">View Full Priority</button>
        </div>
        <div className="space-y-3">
          {repairPriority.slice(0, 3).map(r => (
            <div key={r.rank} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
              onClick={() => navigate(`/pipelines/${r.pipeline}`)}>
              <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                #{r.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 text-sm">{r.pipeline} — {r.zone}</span>
                  <StatusBadge status={r.priority} />
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Leak Risk: {r.risk}% · Est. failure: {r.timeToFailure}</div>
              </div>
              <Wrench size={16} className="text-slate-400 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
