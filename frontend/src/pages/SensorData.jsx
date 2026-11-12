import { useCallback, useEffect, useState } from 'react';
import { Wifi, WifiOff, Download, Cpu, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../api';

function formatTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
}

export default function SensorData() {
  const [sensors, setSensors] = useState([]);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError('');
    try {
      const [latest, recent] = await Promise.all([
        api.sensors(),
        api.recentSensors(100),
      ]);
      setSensors(latest);
      setReadings(recent);
    } catch (err) {
      setError(err.message || 'Unable to load sensor telemetry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const onlineCount = sensors.filter(sensor => sensor.status === 'Online').length;
  const offlineCount = sensors.length - onlineCount;
  const pipelineCount = new Set(sensors.map(sensor => sensor.pipeline_id)).size;

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Sensor Telemetry</h1>
          <p className="text-slate-500 text-sm mt-1">Latest sensor status and recent readings received by the AquaGuard API.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => loadData(true)} disabled={refreshing} className="btn-secondary flex items-center gap-2 text-xs disabled:opacity-50">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
          <a href={api.sensorExportUrl(2000)} className="btn-primary flex items-center gap-2 text-xs">
            <Download size={14} /> Export CSV
          </a>
        </div>
      </div>

      <div className="card flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center">
          <Cpu size={22} className="text-sky-500" />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-slate-800">Backend telemetry service</div>
          <p className="text-xs text-slate-500">Connection status is based on the sensor records returned by the API, not a physical gateway heartbeat.</p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-sm font-semibold text-slate-700">{sensors.length} sensors</div>
          <div className="text-xs text-slate-500">{pipelineCount} pipelines represented</div>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 text-sm text-red-800">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div><div className="font-semibold">Could not load live API data</div><p className="mt-1">{error}</p></div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="card"><div className="text-xs text-slate-500">Sensors reporting</div><div className="text-2xl font-bold text-slate-800 mt-1">{loading ? '—' : sensors.length}</div></div>
        <div className="card"><div className="text-xs text-slate-500">Online</div><div className="text-2xl font-bold text-emerald-600 mt-1">{loading ? '—' : onlineCount}</div></div>
        <div className="card"><div className="text-xs text-slate-500">Offline</div><div className="text-2xl font-bold text-rose-600 mt-1">{loading ? '—' : offlineCount}</div></div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between"><h2 className="font-semibold text-slate-800">Latest reading per sensor</h2><span className="text-xs text-slate-500">API-backed records</span></div>
        {loading ? <div className="card text-sm text-slate-500">Loading sensor records…</div> : sensors.length === 0 ? (
          <div className="card text-sm text-slate-500">No sensor records are available yet. Start the backend and seed or ingest telemetry.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {sensors.map(sensor => (
              <div key={sensor.id} className="card py-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-slate-500">{sensor.sensor_id}</span>
                  {sensor.status === 'Online' ? <Wifi size={14} className="text-green-500" /> : <WifiOff size={14} className="text-red-500" />}
                </div>
                <div className="text-lg font-bold text-slate-800">{Number(sensor.value).toFixed(2)} <span className="text-xs font-medium text-slate-500">{sensor.unit}</span></div>
                <div className="text-xs text-slate-500 capitalize">{sensor.sensor_type} · {sensor.pipeline_id}</div>
                <div className={`text-xs mt-1 font-medium ${sensor.status === 'Online' ? 'text-green-600' : 'text-red-600'}`}>{sensor.status}</div>
                <div className="text-xs text-slate-400 mt-1">{formatTime(sensor.timestamp)}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800 text-sm">Recent sensor readings</h2>
          <span className="text-xs text-slate-500">Newest first · up to 100</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100"><tr className="text-xs text-slate-500">
              <th className="text-left px-4 py-2 font-medium">Timestamp</th><th className="text-left px-4 py-2 font-medium">Sensor</th><th className="text-left px-4 py-2 font-medium">Pipeline</th><th className="text-left px-4 py-2 font-medium">Type</th><th className="text-left px-4 py-2 font-medium">Value</th><th className="text-left px-4 py-2 font-medium">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {readings.map(reading => (
                <tr key={reading.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-xs text-slate-500 whitespace-nowrap">{formatTime(reading.timestamp)}</td>
                  <td className="px-4 py-2 font-mono text-xs text-slate-700">{reading.sensor_id}</td>
                  <td className="px-4 py-2 font-medium text-sky-600">{reading.pipeline_id}</td>
                  <td className="px-4 py-2 text-xs text-slate-600 capitalize">{reading.sensor_type}</td>
                  <td className="px-4 py-2 font-mono text-xs text-slate-700">{Number(reading.value).toFixed(2)} {reading.unit}</td>
                  <td className="px-4 py-2 text-xs"><span className={reading.status === 'Online' ? 'text-green-600' : 'text-red-600'}>{reading.status}</span></td>
                </tr>
              ))}
              {!loading && readings.length === 0 && <tr><td colSpan="6" className="px-4 py-10 text-center text-sm text-slate-500">No readings returned by the API.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
