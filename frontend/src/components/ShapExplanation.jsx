import { shapData } from '../data/mockData';

export default function ShapExplanation({ data = shapData }) {
  const max = Math.max(...data.map(d => Math.abs(d.value)));
  return (
    <div className="space-y-3">
      {data.map((d) => {
        const pct = Math.abs(d.value) / max * 100;
        const isPos = d.value > 0;
        return (
          <div key={d.feature} className="flex items-center gap-3">
            <div className="w-36 text-xs text-slate-600 text-right flex-shrink-0">{d.feature}</div>
            <div className="flex-1 flex items-center gap-2">
              {isPos ? (
                <>
                  <div className="w-4" />
                  <div className="flex-1 flex items-center">
                    <div
                      className="h-5 rounded-r-md bg-red-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex-1 flex items-center justify-end">
                    <div
                      className="h-5 rounded-l-md bg-sky-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="w-4" />
                </>
              )}
            </div>
            <div className={`w-12 text-xs font-semibold text-right flex-shrink-0 ${isPos ? 'text-red-600' : 'text-sky-600'}`}>
              {isPos ? '+' : ''}{d.value.toFixed(2)}
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-center gap-6 pt-2 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-sky-400 inline-block" /> Decreases risk</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-400 inline-block" /> Increases risk</span>
      </div>
    </div>
  );
}
