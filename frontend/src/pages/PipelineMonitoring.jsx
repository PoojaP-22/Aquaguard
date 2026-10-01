import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api, normalizePipeline } from '../api';
import { StatusBadge, RiskBadge } from '../components/ui';

const filters = ['All', 'Healthy', 'Warning', 'High Risk', 'Critical'];
const sorts = ['Risk', 'PHI', 'Pressure', 'Flow'];

export default function PipelineMonitoring() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('Risk');
  const [pipelines, setPipelines] = useState([]);
  useEffect(() => {
    const load = async () => {
      try {
        await api.predictions();
        const data = await api.pipelines();
        setPipelines(data.map(normalizePipeline));
      } catch (e) { console.error(e); }
    };
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, []);

  const filtered = pipelines
    .filter(p => filter === 'All' || p.status === filter)
    .filter(p => p.id.toLowerCase().includes(search.toLowerCase()) || p.zone.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'Risk') return b.leakRisk - a.leakRisk;
      if (sort === 'PHI') return a.phi - b.phi;
      if (sort === 'Pressure') return a.pressure - b.pressure;
      if (sort === 'Flow') return a.flow - b.flow;
      return 0;
    });

  return (
    <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Pipeline Monitoring</h1>
        <p className="text-slate-500 text-sm mt-1">Live pipeline state refreshed from the trained ML prediction service.</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input className="input-field pl-9" placeholder="Search pipeline or zone..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1 flex-wrap">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? 'bg-sky-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {f}
            </button>
          ))}
        </div>
        <select className="input-field w-auto text-xs" value={sort} onChange={e => setSort(e.target.value)}>
          {sorts.map(s => <option key={s}>Sort by {s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-xs text-slate-500">
                <th className="text-left px-4 py-3 font-medium">Pipeline</th>
                <th className="text-left px-4 py-3 font-medium">Zone</th>
                <th className="text-left px-4 py-3 font-medium">Pressure</th>
                <th className="text-left px-4 py-3 font-medium">Flow</th>
                <th className="text-left px-4 py-3 font-medium">PHI</th>
                <th className="text-left px-4 py-3 font-medium">Leak Risk</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/pipelines/${p.id}`)}>
                  <td className="px-4 py-3 font-semibold text-sky-600">{p.id}</td>
                  <td className="px-4 py-3 text-slate-600">{p.zone}</td>
                  <td className="px-4 py-3 text-slate-700 font-mono text-xs">{p.pressure} MPa</td>
                  <td className="px-4 py-3 text-slate-700 font-mono text-xs">{p.flow} L/min</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: `${p.phi}%`,
                          background: p.phi >= 90 ? '#16a34a' : p.phi >= 75 ? '#d97706' : p.phi >= 60 ? '#ea580c' : '#dc2626'
                        }} />
                      </div>
                      <span className="text-xs font-medium text-slate-700">{p.phi}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><RiskBadge risk={p.leakRisk} /></td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-slate-500">{p.lastUpdated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p className="font-medium">No pipelines found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
