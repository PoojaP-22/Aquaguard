export default function ShapExplanation({ data = [] }) {
  const max = Math.max(0, ...data.map(item => Math.abs(Number(item.impact ?? item.value ?? 0))));

  if (!data.length) {
    return <p className="text-sm text-slate-500">No feature-contribution data is available for this prediction.</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const value = Number(item.impact ?? item.value ?? 0);
        const pct = max ? Math.abs(value) / max * 100 : 0;
        return (
          <div key={item.feature || index} className="flex items-center gap-3">
            <div className="w-36 text-xs text-slate-600 text-right flex-shrink-0">{item.feature}</div>
            <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
              <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${pct}%` }}/>
            </div>
            <div className="w-12 text-xs font-semibold text-right flex-shrink-0 text-slate-600">{value.toFixed(2)}</div>
          </div>
        );
      })}
      <p className="text-xs text-slate-500 pt-1">Relative contribution magnitude. Directional impact is not supplied by the current inference API.</p>
    </div>
  );
}
