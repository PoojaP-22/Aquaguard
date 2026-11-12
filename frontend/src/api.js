const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
async function request(path, options = {}) {
 const res = await fetch(`${API_BASE}${path}`, {headers:{'Content-Type':'application/json',...(options.headers||{})},...options});
 if(!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
 return res.status===204?null:res.json();
}
export const api = {
 health:()=>fetch((API_BASE.endsWith('/api')?API_BASE.slice(0,-4):API_BASE)+'/health').then(async response=>{if(!response.ok) throw new Error(`API ${response.status}`);return response.json();}),
 dashboard:()=>request('/dashboard/summary'),
 dashboardHistory:(hours=24)=>request(`/dashboard/history?hours=${hours}`),
 pipelines:()=>request('/pipelines'), pipeline:id=>request(`/pipelines/${id}`),
 prediction:id=>request(`/predictions/${id}`), predictions:()=>request('/predictions'),
 modelInfo:()=>request('/predictions/model/info'), configuration:()=>request('/configuration'), updateConfiguration:payload=>request('/configuration',{method:'PUT',body:JSON.stringify(payload)}), alerts:()=>request('/alerts'), alert:id=>request(`/alerts/${encodeURIComponent(id)}`), updateAlert:(id,payload)=>request(`/alerts/${encodeURIComponent(id)}`,{method:'PUT',body:JSON.stringify(payload)}),
 priority:()=>request('/repair-priority'),
 maintenance:()=>request('/maintenance'),
 createMaintenance:payload=>request('/maintenance',{method:'POST',body:JSON.stringify(payload)}),
 updateMaintenance:(id,payload)=>request(`/maintenance/${id}`,{method:'PUT',body:JSON.stringify(payload)}),
 sensors:()=>request('/sensors'),
 recentSensors:(limit=100)=>request(`/sensors/recent/all?limit=${limit}`),
 sensorExportUrl:(limit=2000,pipelineId='')=>`${API_BASE}/sensors/export/csv?limit=${limit}${pipelineId?`&pipeline_id=${encodeURIComponent(pipelineId)}`:''}`,
 sensorHistory:(id,limit=48)=>request(`/sensors/${id}/history?limit=${limit}`),
 simulationStatus:()=>request('/simulation/status'), simulationTick:()=>request('/simulation/tick',{method:'POST'}),
 injectFault:payload=>request('/simulation/inject-fault',{method:'POST',body:JSON.stringify(payload)}),
 clearFault:id=>request(`/simulation/clear-fault/${id}`,{method:'POST'}),
 resetSimulation:()=>request('/simulation/reset',{method:'POST'}),
};
export function normalizePipeline(p){return{id:p.pipeline_id,pipelineId:p.pipeline_id,zone:p.zone,location:p.location,pressure:p.pressure,flow:p.flow,phi:p.phi,leakRisk:p.leak_risk,timeToFailure:p.time_to_failure||'> 30 days',status:p.status,lastUpdated:p.last_updated?new Date(p.last_updated).toLocaleString():'Now'};}
export function normalizeAlert(a){return{id:a.alert_id,pipeline:a.pipeline_id,zone:'',risk:a.risk_score,prediction:a.title,reason:a.description,priority:a.priority,time:a.created_at?new Date(a.created_at).toLocaleString():'Now',status:a.status,shap:a.shap_explanation||[],action:a.recommended_action};}
