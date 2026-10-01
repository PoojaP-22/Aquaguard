const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, { headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

export const api = {
  dashboard: () => request('/dashboard/summary'),
  pipelines: () => request('/pipelines'),
  pipeline: (id) => request(`/pipelines/${id}`),
  prediction: (id) => request(`/predictions/${id}`),
  predictions: () => request('/predictions'),
  modelInfo: () => request('/predictions/model/info'),
  alerts: () => request('/alerts'),
  priority: () => request('/repair-priority'),
  sensors: () => request('/sensors'),
  sensorHistory: (id, limit = 48) => request(`/sensors/${id}/history?limit=${limit}`),
};

export function normalizePipeline(p) {
  return {
    id: p.pipeline_id, pipelineId: p.pipeline_id, zone: p.zone, location: p.location,
    pressure: p.pressure, flow: p.flow, phi: p.phi, leakRisk: p.leak_risk,
    timeToFailure: p.time_to_failure || '> 30 days', status: p.status,
    lastUpdated: p.last_updated ? new Date(p.last_updated).toLocaleString() : 'Now',
  };
}

export function normalizeAlert(a) {
  return {
    id: a.alert_id, pipeline: a.pipeline_id, zone: '', risk: a.risk_score,
    prediction: a.title, reason: a.description, priority: a.priority,
    time: a.created_at ? new Date(a.created_at).toLocaleString() : 'Now', status: a.status,
    shap: a.shap_explanation || [], action: a.recommended_action,
  };
}
