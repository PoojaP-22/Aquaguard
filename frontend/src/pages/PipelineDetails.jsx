import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Clock, Gauge, Droplets, CheckSquare, Brain } from 'lucide-react';
import { shapData } from '../data/mockData';
import { api, normalizePipeline } from '../api';
import { StatusBadge, RiskBadge, PhiGauge } from '../components/ui';
import { PressureChart, FlowChart } from '../components/Charts';
import ShapExplanation from '../components/ShapExplanation';
import MaintenanceModal from '../components/MaintenanceModal';

export default function PipelineDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [pipeline, setPipeline] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const loadPrediction = async () => {
    if (!id) return;
    try {
      const pred = await api.prediction(id);
      setPrediction(pred);
      const p = await api.pipeline(id);
      setPipeline(normalizePipeline(p));
    } catch (e) { console.error(e); }
  };
  useEffect(() => { loadPrediction(); }, [id]);
  if (!pipeline) return <div className="p-6 text-slate-500">Loading pipeline data…</div>;

  const isCritical = pipeline.status === 'Critical';

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/pipelines')} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-800">Pipeline {pipeline.id}</h1>
              <StatusBadge status={pipeline.status} />
            </div>
            <p className="text-slate-500 text-sm">{pipeline.zone}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowModal(true)} className="btn-primary">Log Maintenance</button>
          <button onClick={loadPrediction} className="btn-secondary">Refresh ML Prediction</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="card flex flex-col items-center justify-center py-4">
          <PhiGauge value={pipeline.phi} size="lg" />
          <div className="text-xs text-slate-500 mt-2 text-center">Pipeline Health Index</div>
        </div>
        <div className="card flex flex-col justify-center">
          <div className="text-xs text-slate-500 mb-1">Leak Risk</div>
          <div className="text-3xl font-bold text-red-600">{pipeline.leakRisk}%</div>
          <RiskBadge risk={pipeline.leakRisk} />
        </div>
        <div className="card flex flex-col justify-center">
          <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Clock size={12} />Est. Time to Failure</div>
          <div className={`text-2xl font-bold ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>{pipeline.timeToFailure}</div>
        </div>
        <div className="card flex flex-col justify-center">
          <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Gauge size={12} />Current Pressure</div>
          <div className="text-2xl font-bold text-slate-800">{pipeline.pressure}</div>
          <div className="text-xs text-slate-500">MPa</div>
        </div>
        <div className="card flex flex-col justify-center">
          <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Droplets size={12} />Current Flow</div>
          <div className="text-2xl font-bold text-slate-800">{pipeline.flow}</div>
          <div className="text-xs text-slate-500">L/min</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PressureChart pipelineId={pipeline.id} />
        <FlowChart pipelineId={pipeline.id} />
      </div>

      {/* AI Prediction + SHAP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Prediction */}
        <div className={`card border-l-4 ${isCritical ? 'border-l-red-500' : 'border-l-amber-500'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Brain size={18} className="text-sky-500" />
            <h2 className="font-semibold text-slate-800">AI Prediction</h2>
            <span className="ml-auto text-xs text-green-600 font-medium">● Live ML inference</span>
          </div>
          <div className={`text-lg font-bold mb-3 ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>
            {prediction?.risk_level || pipeline.status} risk prediction
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-600">{prediction?.risk_score ?? pipeline.leakRisk}%</div>
              <div className="text-xs text-slate-500">Leak Risk</div>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-amber-600">{prediction?.time_to_failure ?? pipeline.timeToFailure}</div>
              <div className="text-xs text-slate-500">Time to Failure</div>
            </div>
            <div className="bg-sky-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-sky-600">{prediction?.confidence ?? "—"}%</div>
              <div className="text-xs text-slate-500">Confidence</div>
            </div>
          </div>
          <div className="text-xs bg-slate-50 rounded-lg p-2 space-y-1">
            <div className="text-sky-700 font-medium">Input → sensors → trained models → hybrid risk → SHAP explanation</div>
            <div className="font-medium text-slate-600">Model: {prediction?.model_type || 'AquaGuard ML'}</div>
            <div className="text-slate-400">Version: {prediction?.model_version || '—'} · Trained on synthetic multi-sensor pipeline data</div>
          </div>
        </div>

        {/* SHAP Explanation */}
        <div className="card">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-amber-500" />
            <h2 className="font-semibold text-slate-800">Why is AquaGuard AI predicting high risk?</h2>
          </div>
          <p className="text-xs text-slate-500 mb-4">Model feature contribution — live API inference</p>
          <ShapExplanation data={prediction?.shap_explanation || shapData} />
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-xs text-amber-800">{prediction?.recommended_action || "Review the highest-contributing sensor features and recent trend."}</p>
          </div>
        </div>
      </div>

      {/* Recommended Action */}
      <div className={`card border-l-4 ${isCritical ? 'border-l-red-500' : 'border-l-amber-500'}`}>
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CheckSquare size={18} className="text-sky-500" />
              <h2 className="font-semibold text-slate-800">Recommended Maintenance Action</h2>
              <StatusBadge status={pipeline.status} />
            </div>
            <p className="text-slate-700 font-medium mb-3">Inspect pipeline {pipeline.id} within the next {pipeline.timeToFailure}.</p>
            <div className="grid grid-cols-2 gap-2">
              {['Inspect pressure valve', 'Check for visible leakage', 'Inspect pipe joints', 'Verify sensor calibration'].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="text-green-500">✓</span> {item}
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">Log Maintenance Action</button>
        </div>
      </div>

      {showModal && <MaintenanceModal onClose={() => setShowModal(false)} defaultPipeline={pipeline.id} />}
    </div>
  );
}
