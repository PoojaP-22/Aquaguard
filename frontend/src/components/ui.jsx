export function StatusBadge({ status }) {
  const map = {
    Critical: 'badge-critical',
    'High Risk': 'badge-high',
    Warning: 'badge-medium',
    Healthy: 'badge-healthy',
    High: 'badge-high',
    Medium: 'badge-medium',
    Low: 'bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-semibold',
  };
  return <span className={map[status] || 'badge-low'}>{status}</span>;
}

export function RiskBadge({ risk }) {
  const cls = risk >= 81 ? 'badge-critical' : risk >= 61 ? 'badge-high' : risk >= 31 ? 'badge-medium' : 'badge-healthy';
  return <span className={cls}>{risk}%</span>;
}

export function PhiGauge({ value, size = 'md' }) {
  const color = value >= 90 ? '#16a34a' : value >= 75 ? '#d97706' : value >= 60 ? '#ea580c' : '#dc2626';
  const label = value >= 90 ? 'Healthy' : value >= 75 ? 'Warning' : value >= 60 ? 'High Risk' : 'Critical';
  const r = size === 'lg' ? 52 : 38;
  const cx = size === 'lg' ? 60 : 44;
  const circumference = 2 * Math.PI * r;
  const dash = (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={cx * 2} height={cx * 2} className="-rotate-90">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#e2e8f0" strokeWidth={size === 'lg' ? 8 : 6} />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={size === 'lg' ? 8 : 6}
          strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round" />
      </svg>
      <div className="text-center -mt-2">
        <div className={`font-bold ${size === 'lg' ? 'text-3xl' : 'text-xl'}`} style={{ color }}>{value}</div>
        <div className="text-xs text-slate-500">{label}</div>
      </div>
    </div>
  );
}

export function KpiCard({ title, value, subtitle, trend, icon: Icon, color = 'sky' }) {
  return (
    <div className="card flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${color}-50`}>
            <Icon size={16} className={`text-${color}-500`} />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      {subtitle && <div className="text-xs text-slate-500">{subtitle}</div>}
      {trend && <div className="text-xs text-green-600 font-medium">{trend}</div>}
    </div>
  );
}
