import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { StatusBadge, RiskBadge } from '../components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const filters = ['All', 'Critical', 'High', 'Medium', 'Low'];
const riskColors = { Critical: '#dc2626', High: '#ea580c', Medium: '#d97706', Low: '#16a34a' };

export default function RepairPriority() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [repairPriority, setRepairPriority] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.priority();
      setRepairPriority(data.map(x => ({...x, pipeline:x.pipeline_id, timeToFailure:x.time_to_failure, action:x.recommended_action, impact:x.priority_score ?? x.risk})));
    } catch (err) { setError(err.message || 'Could not load repair priority.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const filtered = repairPriority.filter(r => filter === 'All' || r.priority === filter);

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Repair Priority</h1>
        <p className="text-slate-500 text-sm mt-1">Rule-based maintenance ranking using risk, pipeline health and estimated urgency.</p>
      </div>

      {error && <div role="alert" className="card border border-red-200 text-sm text-red-700">{error} <button onClick={load} className="underline ml-2">Try again</button></div>}
      {loading && <div className="card text-sm text-slate-500">Loading repair ranking…</div>}

      {/* Risk Chart */}
      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-4 text-sm">Risk Score by Pipeline</h2>
        {repairPriority.length > 0 && <ResponsiveContainer width="100%" height={180}>
          <BarChart data={repairPriority} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="pipeline" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v}%`, 'Leak Risk']} />
            <Bar dataKey="risk" radius={[4, 4, 0, 0]}>
              {repairPriority.map(r => (
                <Cell key={r.pipeline} fill={riskColors[r.priority]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>}
        {!loading && repairPriority.length === 0 && <p className="text-sm text-slate-500 py-8 text-center">No pipeline priority records are available.</p>}
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-sky-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {f}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">Repair priority is generated from the prototype risk score and urgency indicators.</span>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-xs text-slate-500">
                <th className="text-left px-4 py-3 font-medium">Rank</th>
                <th className="text-left px-4 py-3 font-medium">Pipeline</th>
                <th className="text-left px-4 py-3 font-medium">Risk</th>
                <th className="text-left px-4 py-3 font-medium">PHI</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Est. Failure</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Impact</th>
                <th className="text-left px-4 py-3 font-medium">Priority</th>
                <th className="text-left px-4 py-3 font-medium">Recommended Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(r => (
                <tr key={r.rank} className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/pipelines/${r.pipeline}`)}>
                  <td className="px-4 py-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white`}
                      style={{ background: riskColors[r.priority] }}>
                      #{r.rank}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-sky-600">{r.pipeline}</div>
                    <div className="text-xs text-slate-500">{r.zone}</div>
                  </td>
                  <td className="px-4 py-3"><RiskBadge risk={r.risk} /></td>
                  <td className="px-4 py-3 font-medium text-slate-700">{r.phi}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-600">{r.timeToFailure}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-600">{r.impact}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.priority} /></td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{r.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
