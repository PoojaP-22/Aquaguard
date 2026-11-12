export default function ShapExplanation({ data = [] }) {
  const values = data.map(item => Number(item.impact ?? item.value ?? 0));
  const max = Math.max(0, ...values.map(Math.abs));

  if (!data.length) {
    return <p className="text-sm text-slate-500">No feature-contribution data is available for this prediction.</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => {
        const value = Number(item.impact ?? item.value ?? 0);
        const pct = max ? Math.abs(value) / max * 100 : 0;
        const positive = value > 0;
        return (
          <div key={item.feature || index} className="flex items-center gap-3">
            <div className="w-36 text-xs text-slate-600 text-right flex-shrink-0">{item.feature}</div>
            <div className="flex-1 flex items-center gap-2">
              {positive ? (
                <><div className="w-4" /><div className="flex-1"><div className="h-5 rounded-r-md bg-red-400" style={{ width: `${pct}%` }}/></div></>
              ) : (
                <><div className="flex-1 flex justify-end"><div className="h-5 rounded-l-md bg-sky-400" style={{ width: `${pct}%` }}/></div><div className="w-4"/></>
              )}
            </div>
            <div className={`w-12 text-xs font-semibold text-right flex-shrink-0 ${positive ? 'text-red-600' : 'text-sky-600'}`}>{positive ? '+' : ''}{value.toFixed(2)}</div>
          </div>
        );
      })}
      <div className="flex items-center justify-center gap-6 pt-2 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-sky-400 inline-block"/> Decreases risk</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-400 inline-block"/> Increases risk</span>
      </div>
    </div>
  );
}
