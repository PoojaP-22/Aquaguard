// Mock pipeline data
export const pipelines = [
  { id: 'P01', zone: 'Central Zone', pressure: 1.18, flow: 49.1, phi: 94, leakRisk: 6, timeToFailure: '> 30 days', status: 'Healthy', lastUpdated: '2 min ago' },
  { id: 'P02', zone: 'Central Zone', pressure: 1.15, flow: 47.8, phi: 91, leakRisk: 8, timeToFailure: '> 30 days', status: 'Healthy', lastUpdated: '1 min ago' },
  { id: 'P03', zone: 'West Zone', pressure: 1.09, flow: 45.3, phi: 88, leakRisk: 14, timeToFailure: '> 20 days', status: 'Healthy', lastUpdated: '3 min ago' },
  { id: 'P04', zone: 'North Zone', pressure: 0.71, flow: 38.2, phi: 62, leakRisk: 82, timeToFailure: '18 hours', status: 'Critical', lastUpdated: '10 min ago' },
  { id: 'P05', zone: 'North Zone', pressure: 0.98, flow: 43.1, phi: 79, leakRisk: 31, timeToFailure: '8.2 days', status: 'Warning', lastUpdated: '4 min ago' },
  { id: 'P06', zone: 'East Zone', pressure: 1.04, flow: 44.9, phi: 85, leakRisk: 18, timeToFailure: '> 15 days', status: 'Healthy', lastUpdated: '2 min ago' },
  { id: 'P07', zone: 'South Zone', pressure: 1.01, flow: 46.2, phi: 81, leakRisk: 54, timeToFailure: '4.1 days', status: 'Warning', lastUpdated: '42 min ago' },
  { id: 'P08', zone: 'South Zone', pressure: 1.12, flow: 48.0, phi: 90, leakRisk: 11, timeToFailure: '> 25 days', status: 'Healthy', lastUpdated: '5 min ago' },
  { id: 'P09', zone: 'West Zone', pressure: 0.94, flow: 41.7, phi: 76, leakRisk: 38, timeToFailure: '6.8 days', status: 'Warning', lastUpdated: '8 min ago' },
  { id: 'P10', zone: 'East Zone', pressure: 1.07, flow: 46.8, phi: 87, leakRisk: 16, timeToFailure: '> 18 days', status: 'Healthy', lastUpdated: '3 min ago' },
  { id: 'P11', zone: 'East Zone', pressure: 0.89, flow: 41.5, phi: 74, leakRisk: 61, timeToFailure: '2.4 days', status: 'High Risk', lastUpdated: '24 min ago' },
  { id: 'P12', zone: 'North Zone', pressure: 1.16, flow: 48.5, phi: 92, leakRisk: 7, timeToFailure: '> 30 days', status: 'Healthy', lastUpdated: '1 min ago' },
];

export const alerts = [
  { id: 'A001', pipeline: 'P04', zone: 'North Zone', risk: 82, prediction: 'High probability of developing leak', reason: 'Pressure drop + abnormal flow', priority: 'Critical', time: '10 min ago', status: 'Active' },
  { id: 'A002', pipeline: 'P11', zone: 'East Zone', risk: 61, prediction: 'Moderate leak risk detected', reason: 'Flow fluctuation', priority: 'High', time: '24 min ago', status: 'Active' },
  { id: 'A003', pipeline: 'P07', zone: 'South Zone', risk: 54, prediction: 'Elevated pressure instability', reason: 'Pressure instability', priority: 'Medium', time: '42 min ago', status: 'Active' },
  { id: 'A004', pipeline: 'P09', zone: 'West Zone', risk: 38, prediction: 'Minor flow deviation observed', reason: 'Flow deviation', priority: 'Medium', time: '1.2 hrs ago', status: 'Active' },
  { id: 'A005', pipeline: 'P05', zone: 'North Zone', risk: 31, prediction: 'Pressure trending downward', reason: 'Pressure trend', priority: 'Low', time: '2.1 hrs ago', status: 'Active' },
];

export const maintenanceLogs = [
  { id: 'M001', date: '16 Sep 2026', pipeline: 'P04', issue: 'High leak risk - pressure drop', action: 'Valve inspection scheduled', engineer: 'Arun Kumar', status: 'In Progress' },
  { id: 'M002', date: '15 Sep 2026', pipeline: 'P11', issue: 'Pressure anomaly detected', action: 'Joint inspection completed', engineer: 'Priya Sharma', status: 'Completed' },
  { id: 'M003', date: '14 Sep 2026', pipeline: 'P07', issue: 'Flow fluctuation', action: 'Sensor recalibration', engineer: 'Ravi Menon', status: 'Completed' },
  { id: 'M004', date: '13 Sep 2026', pipeline: 'P03', issue: 'Routine maintenance', action: 'Full pipeline inspection', engineer: 'Arun Kumar', status: 'Completed' },
  { id: 'M005', date: '12 Sep 2026', pipeline: 'P09', issue: 'Minor pressure variance', action: 'Monitoring increased', engineer: 'Priya Sharma', status: 'Completed' },
];

export const sensors = [
  { id: 'PS-01', type: 'Pressure', pipeline: 'P04', value: '0.71 MPa', status: 'Online', lastReading: '12s ago' },
  { id: 'PS-02', type: 'Pressure', pipeline: 'P11', value: '0.89 MPa', status: 'Online', lastReading: '8s ago' },
  { id: 'PS-03', type: 'Pressure', pipeline: 'P01', value: '1.18 MPa', status: 'Online', lastReading: '5s ago' },
  { id: 'PS-04', type: 'Pressure', pipeline: 'P07', value: '1.01 MPa', status: 'Online', lastReading: '15s ago' },
  { id: 'FS-01', type: 'Flow', pipeline: 'P04', value: '38.2 L/min', status: 'Online', lastReading: '12s ago' },
  { id: 'FS-02', type: 'Flow', pipeline: 'P11', value: '41.5 L/min', status: 'Online', lastReading: '8s ago' },
  { id: 'FS-03', type: 'Flow', pipeline: 'P01', value: '49.1 L/min', status: 'Online', lastReading: '5s ago' },
  { id: 'FS-04', type: 'Flow', pipeline: 'P07', value: '46.2 L/min', status: 'Online', lastReading: '15s ago' },
  { id: 'PS-05', type: 'Pressure', pipeline: 'P02', value: '1.15 MPa', status: 'Online', lastReading: '6s ago' },
  { id: 'FS-05', type: 'Flow', pipeline: 'P02', value: '47.8 L/min', status: 'Online', lastReading: '6s ago' },
  { id: 'PS-06', type: 'Pressure', pipeline: 'P05', value: '0.98 MPa', status: 'Online', lastReading: '9s ago' },
  { id: 'FS-06', type: 'Flow', pipeline: 'P05', value: '43.1 L/min', status: 'Offline', lastReading: '8 min ago' },
  { id: 'PS-07', type: 'Pressure', pipeline: 'P09', value: '0.94 MPa', status: 'Online', lastReading: '11s ago' },
  { id: 'FS-07', type: 'Flow', pipeline: 'P09', value: '41.7 L/min', status: 'Online', lastReading: '11s ago' },
];

const now = Date.now();
const hour = 3600000;

export function generatePressureData(pipelineId, range = '24H') {
  const points = range === '1H' ? 12 : range === '6H' ? 24 : range === '7D' ? 56 : 48;
  const interval = range === '1H' ? 5 : range === '6H' ? 15 : range === '7D' ? 180 : 30;
  const base = pipelineId === 'P04' ? 1.05 : pipelineId === 'P11' ? 1.0 : 1.1;
  return Array.from({ length: points }, (_, i) => {
    const t = now - (points - i) * interval * 60000;
    const drop = pipelineId === 'P04' && i > points * 0.6 ? (i - points * 0.6) * 0.018 : 0;
    const noise = (Math.random() - 0.5) * 0.04;
    return {
      time: new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: Math.max(0.5, +(base - drop + noise).toFixed(3)),
    };
  });
}

export function generateFlowData(pipelineId, range = '24H') {
  const points = range === '1H' ? 12 : range === '6H' ? 24 : range === '7D' ? 56 : 48;
  const interval = range === '1H' ? 5 : range === '6H' ? 15 : range === '7D' ? 180 : 30;
  const base = pipelineId === 'P04' ? 47 : pipelineId === 'P11' ? 46 : 48;
  return Array.from({ length: points }, (_, i) => {
    const t = now - (points - i) * interval * 60000;
    const drop = pipelineId === 'P04' && i > points * 0.6 ? (i - points * 0.6) * 0.4 : 0;
    const noise = (Math.random() - 0.5) * 2;
    return {
      time: new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: Math.max(20, +(base - drop + noise).toFixed(1)),
    };
  });
}

export function generatePhiHistory() {
  return Array.from({ length: 24 }, (_, i) => {
    const t = now - (24 - i) * hour;
    return {
      time: new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      phi: +(87 + Math.sin(i * 0.4) * 3 + (Math.random() - 0.5) * 2).toFixed(1),
      pressure: +(1.05 + Math.sin(i * 0.3) * 0.05 + (Math.random() - 0.5) * 0.02).toFixed(3),
      flow: +(46 + Math.sin(i * 0.5) * 2 + (Math.random() - 0.5) * 1).toFixed(1),
    };
  });
}

export const shapData = [
  { feature: 'Pressure Drop Rate', value: 0.38, direction: 'positive' },
  { feature: 'Flow Anomaly', value: 0.24, direction: 'positive' },
  { feature: 'Pressure Variance', value: 0.16, direction: 'positive' },
  { feature: 'Recent Fluctuation', value: 0.09, direction: 'positive' },
  { feature: 'Temperature', value: -0.03, direction: 'negative' },
];

export const repairPriority = [
  { rank: 1, pipeline: 'P04', zone: 'North Zone', risk: 82, phi: 62, timeToFailure: '18 hours', impact: 'High', priority: 'Critical', action: 'Inspect immediately' },
  { rank: 2, pipeline: 'P11', zone: 'East Zone', risk: 61, phi: 74, timeToFailure: '2.4 days', impact: 'Medium', priority: 'High', action: 'Schedule inspection' },
  { rank: 3, pipeline: 'P07', zone: 'South Zone', risk: 54, phi: 81, timeToFailure: '4.1 days', impact: 'Medium', priority: 'Medium', action: 'Monitor closely' },
  { rank: 4, pipeline: 'P09', zone: 'West Zone', risk: 38, phi: 76, timeToFailure: '6.8 days', impact: 'Low', priority: 'Medium', action: 'Schedule routine check' },
  { rank: 5, pipeline: 'P05', zone: 'North Zone', risk: 31, phi: 79, timeToFailure: '8.2 days', impact: 'Low', priority: 'Low', action: 'Continue monitoring' },
];

export const sensorReadings = Array.from({ length: 20 }, (_, i) => {
  const t = new Date(now - i * 30000);
  return {
    timestamp: t.toLocaleString(),
    pipeline: ['P04', 'P11', 'P01', 'P07', 'P02'][i % 5],
    pressure: (0.71 + Math.random() * 0.5).toFixed(2),
    flow: (38 + Math.random() * 12).toFixed(1),
    status: i === 3 ? 'Warning' : 'Normal',
  };
});
