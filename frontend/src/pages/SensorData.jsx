import { sensors, sensorReadings } from '../data/mockData';
import { Wifi, WifiOff, Download, Cpu } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SensorData() {
  const { showToast } = useApp();

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Sensor Data</h1>
        <p className="text-slate-500 text-sm mt-1">Real-time readings from all connected pressure and flow sensors.</p>
      </div>

      {/* Gateway Status */}
      <div className="card flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center">
          <Cpu size={22} className="text-sky-500" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">ESP32 Gateway</span>
            <span className="flex items-center gap-1 text-xs text-green-700 font-medium bg-green-50 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
            </span>
          </div>
          <p className="text-xs text-slate-500">Last communication: 12 seconds ago · 47/50 sensors active</p>
        </div>
      </div>

      {/* Sensor Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {sensors.map(s => (
          <div key={s.id} className="card py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-500">{s.id}</span>
              {s.status === 'Online'
                ? <Wifi size={14} className="text-green-500" />
                : <WifiOff size={14} className="text-red-500" />}
            </div>
            <div className="text-sm font-bold text-slate-800">{s.value}</div>
            <div className="text-xs text-slate-500">{s.type} · {s.pipeline}</div>
            <div className={`text-xs mt-1 font-medium ${s.status === 'Online' ? 'text-green-600' : 'text-red-600'}`}>
              {s.status}
            </div>
            <div className="text-xs text-slate-400">{s.lastReading}</div>
          </div>
        ))}
      </div>

      {/* Readings Table */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 text-sm">Recent Sensor Readings</h2>
          <button onClick={() => showToast('CSV export initiated (prototype — no file generated).')} className="btn-secondary flex items-center gap-2 text-xs">
            <Download size={14} /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-xs text-slate-500">
                <th className="text-left px-4 py-2 font-medium">Timestamp</th>
                <th className="text-left px-4 py-2 font-medium">Pipeline</th>
                <th className="text-left px-4 py-2 font-medium">Pressure (MPa)</th>
                <th className="text-left px-4 py-2 font-medium">Flow (L/min)</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sensorReadings.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-xs text-slate-500 whitespace-nowrap">{r.timestamp}</td>
                  <td className="px-4 py-2 font-medium text-sky-600">{r.pipeline}</td>
                  <td className="px-4 py-2 font-mono text-xs text-slate-700">{r.pressure}</td>
                  <td className="px-4 py-2 font-mono text-xs text-slate-700">{r.flow}</td>
                  <td className="px-4 py-2">
                    <span className={`text-xs font-medium ${r.status === 'Warning' ? 'text-amber-600' : 'text-green-600'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
