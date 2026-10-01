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
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={5} />
        <YAxis tick={{ fontSize: 10 }} domain={[70, 100]} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="phi" name="Overall PHI" stroke="#0ea5e9" strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="pressure" name="Pressure (MPa)" stroke="#6366f1" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
        <Line type="monotone" dataKey="flow" name="Flow (L/min)" stroke="#10b981" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
      </LineChart>
    </ResponsiveContainer>
  );
}
