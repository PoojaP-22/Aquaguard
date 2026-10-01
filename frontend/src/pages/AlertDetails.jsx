import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Brain } from 'lucide-react';
import { alerts, shapData } from '../data/mockData';
import { StatusBadge, RiskBadge } from '../components/ui';
import ShapExplanation from '../components/ShapExplanation';
import MaintenanceModal from '../components/MaintenanceModal';
import { useApp } from '../context/AppContext';

export default function AlertDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [showModal, setShowModal] = useState(false);
  const alert = alerts.find(a => a.id === id) || alerts[0];

  const isCritical = alert.priority === 'Critical';

  return (
    <div className="p-6 space-y-6 max-w-screen-lg mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/alerts')} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">AI Leak Risk Alert</h1>
      </div>

      {/* Main Alert Card */}
      <div className={`card border-2 ${isCritical ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50'}`}>
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${isCritical ? 'bg-red-100' : 'bg-orange-100'}`}>
            <AlertTriangle size={28} className={isCritical ? 'text-red-600' : 'text-orange-600'} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span className={`text-lg font-bold ${isCritical ? 'text-red-700' : 'text-orange-700'}`}>
                {alert.priority.toUpperCase()} RISK
              </span>
              <StatusBadge status={alert.priority} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
              <div>
                <div className="text-xs text-slate-500">Pipeline</div>
                <div className="font-semibold text-slate-800">{alert.pipeline} — {alert.zone}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Leak Risk</div>
                <div className="font-bold text-red-600 text-xl">{alert.risk}%</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Est. Time to Failure</div>
                <div className="font-semibold text-slate-800">18 hours</div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Detected</div>
                <div className="font-semibold text-slate-800">{alert.time}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Contributions */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Brain size={18} className="text-sky-500" />
          <h2 className="font-semibold text-slate-800">Why This Alert Was Generated</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">SHAP-style feature contributions — prototype mock explanation</p>

        {/* Visual bar contributions */}
        <div className="space-y-3 mb-6">
          {shapData.map(d => {
            const pct = Math.abs(d.value) / 0.38 * 100;
            const isPos = d.value > 0;
            return (
              <div key={d.feature} className="flex items-center gap-3">
                <div className="w-32 text-xs text-slate-600 text-right flex-shrink-0">{d.feature}</div>
                <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                  <div
                    className={`h-full rounded-full flex items-center justify-end pr-2 text-xs font-bold text-white transition-all`}
                    style={{
                      width: `${pct}%`,
                      background: isPos ? '#ef4444' : '#0ea5e9'
                    }}
                  >
                    {Math.round(Math.abs(d.value) * 100)}%
                  </div>
                </div>
                <div className={`w-12 text-xs font-semibold text-right flex-shrink-0 ${isPos ? 'text-red-600' : 'text-sky-600'}`}>
                  {isPos ? '+' : ''}{d.value.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-sm text-slate-700 leading-relaxed">
            "The model detected a combination of abnormal pressure decline and flow fluctuations. These signals increased the predicted probability of pipeline failure. Rapid pressure drop rate is the dominant contributing factor."
          </p>
        </div>
      </div>

      {/* Action */}
      <div className="card">
        <h2 className="font-semibold text-slate-800 mb-3">Recommended Action</h2>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-slate-600">Recommended priority:</span>
          <span className="badge-critical">Immediate Inspection</span>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={() => setShowModal(true)} className="btn-primary">Assign Maintenance</button>
          <button onClick={() => { setShowModal(true); }} className="btn-secondary">Log Action</button>
          <button onClick={() => { showToast('Alert dismissed.'); navigate('/alerts'); }} className="btn-danger">Dismiss Alert</button>
        </div>
      </div>

      {showModal && <MaintenanceModal onClose={() => setShowModal(false)} defaultPipeline={alert.pipeline} />}
    </div>
  );
}
