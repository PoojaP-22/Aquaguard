import { useNavigate } from 'react-router-dom';

// Simple SVG pipeline network schematic
const nodes = [
  { id: 'P01', x: 200, y: 60, status: 'Healthy' },
  { id: 'P02', x: 100, y: 160, status: 'Healthy' },
  { id: 'P03', x: 60, y: 260, status: 'Healthy' },
  { id: 'P04', x: 200, y: 160, status: 'Critical' },
  { id: 'P05', x: 320, y: 160, status: 'Warning' },
  { id: 'P06', x: 380, y: 260, status: 'Healthy' },
  { id: 'P07', x: 200, y: 260, status: 'Warning' },
  { id: 'P08', x: 140, y: 340, status: 'Healthy' },
  { id: 'P09', x: 260, y: 340, status: 'Warning' },
  { id: 'P10', x: 380, y: 160, status: 'Healthy' },
  { id: 'P11', x: 320, y: 260, status: 'High Risk' },
  { id: 'P12', x: 320, y: 60, status: 'Healthy' },
];

const edges = [
  ['P01', 'P04'], ['P12', 'P04'], ['P04', 'P02'], ['P04', 'P05'],
  ['P02', 'P03'], ['P04', 'P07'], ['P05', 'P11'], ['P11', 'P06'],
  ['P07', 'P08'], ['P07', 'P09'], ['P05', 'P10'],
];

const statusColor = {
  Healthy: '#16a34a',
  Warning: '#d97706',
  'High Risk': '#ea580c',
  Critical: '#dc2626',
};

export default function PipelineNetwork() {
  const navigate = useNavigate();
  const getNode = (id) => nodes.find(n => n.id === id);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Pipeline Network</h3>
          <p className="text-xs text-slate-500">24 pipeline segments monitored</p>
        </div>
        <div className="flex gap-3 text-xs">
          {Object.entries(statusColor).map(([s, c]) => (
            <span key={s} className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: c }} />
              {s}
            </span>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox="0 0 460 400" className="w-full max-w-lg mx-auto" style={{ minWidth: 300 }}>
          {/* Edges */}
          {edges.map(([a, b]) => {
            const na = getNode(a), nb = getNode(b);
            if (!na || !nb) return null;
            return (
              <line key={`${a}-${b}`} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                stroke="#cbd5e1" strokeWidth={2} />
            );
          })}
          {/* Nodes */}
          {nodes.map(n => (
            <g key={n.id} className="cursor-pointer" onClick={() => navigate(`/pipelines/${n.id}`)}>
              <circle cx={n.x} cy={n.y} r={18} fill={statusColor[n.status]} opacity={0.15} />
              <circle cx={n.x} cy={n.y} r={13} fill={statusColor[n.status]} />
              {n.status === 'Critical' && (
                <circle cx={n.x} cy={n.y} r={18} fill="none" stroke={statusColor[n.status]} strokeWidth={2} opacity={0.6}>
                  <animate attributeName="r" values="13;20;13" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
              <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle"
                fill="white" fontSize={9} fontWeight="bold">{n.id}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
