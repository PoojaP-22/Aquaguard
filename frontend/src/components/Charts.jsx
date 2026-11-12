import { useState, useEffect } from 'react';
import { api } from '../api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const ranges = ['1H', '6H', '24H', '7D'];

export function PressureChart({ pipelineId }) {
  const [range, setRange] = useState('24H');
  const [data, setData] = useState([]);
  useEffect(() => {
    api.sensorHistory(pipelineId, range === '1H' ? 2 : range === '6H' ? 12 : range === '7D' ? 336 : 48)
      .then(rows => setData(rows.filter(x => x.sensor_type === 'pressure').reverse().map(x => ({time: new Date(x.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), value: Number(x.value)}))))
      .catch(() => setData([]));
  }, [range, pipelineId]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Pressure Over Time</h3>
          <p className="text-xs text-slate-500">MPa</p>
        </div>
        <div className="flex gap-1">
          {ranges.map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${range === r ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v} MPa`, 'Pressure']} />
          <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FlowChart({ pipelineId }) {
  const [range, setRange] = useState('24H');
  const [data, setData] = useState([]);
  useEffect(() => {
    api.sensorHistory(pipelineId, range === '1H' ? 2 : range === '6H' ? 12 : range === '7D' ? 336 : 48)
      .then(rows => setData(rows.filter(x => x.sensor_type === 'flow').reverse().map(x => ({time: new Date(x.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), value: Number(x.value)}))))
      .catch(() => setData([]));
  }, [range, pipelineId]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm">Flow Rate Over Time</h3>
          <p className="text-xs text-slate-500">L/min</p>
        </div>
        <div className="flex gap-1">
          {ranges.map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${range === r ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {r}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="time" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v} L/min`, 'Flow']} />
          <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PhiHistoryChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 18, left: -16, bottom: 2 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,169,184,.13)" />
        <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94A9B8' }} interval="preserveStartEnd" />
        <YAxis yAxisId="phi" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94A9B8' }} />
        <YAxis yAxisId="pressure" orientation="right" domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#94A9B8' }} />
        <YAxis yAxisId="flow" orientation="right" hide domain={['auto', 'auto']} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, background: '#10283A', border: '1px solid rgba(255,255,255,.12)', color: '#E5EEF4' }} />
        <Legend wrapperStyle={{ fontSize: 11, color: '#94A9B8' }} />
        <Line yAxisId="phi" type="monotone" dataKey="phi" name="Pipeline Health Index" stroke="#35C7B0" strokeWidth={2.5} dot={false} connectNulls />
        <Line yAxisId="pressure" type="monotone" dataKey="pressure" name="Pressure (MPa)" stroke="#59B9F2" strokeWidth={1.8} dot={false} connectNulls />
        <Line yAxisId="flow" type="monotone" dataKey="flow" name="Flow (L/min)" stroke="#E8B44F" strokeWidth={1.8} dot={false} connectNulls />
      </LineChart>
    </ResponsiveContainer>
  );
}
