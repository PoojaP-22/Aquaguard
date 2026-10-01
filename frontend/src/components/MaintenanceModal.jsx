import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X } from 'lucide-react';

const engineers = ['Arun Kumar', 'Priya Sharma', 'Ravi Menon', 'Deepa Nair'];
const issueTypes = ['High Leak Risk', 'Pressure Anomaly', 'Flow Fluctuation', 'Sensor Fault', 'Routine Maintenance'];

export default function MaintenanceModal({ onClose, defaultPipeline = '' }) {
  const { addLog } = useApp();
  const [form, setForm] = useState({
    pipeline: defaultPipeline,
    issue: '',
    priority: 'High',
    action: '',
    engineer: 'Arun Kumar',
    notes: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    addLog({ pipeline: form.pipeline, issue: form.issue, action: form.action, engineer: form.engineer });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Add Maintenance Record</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Pipeline ID</label>
              <input className="input-field" value={form.pipeline} onChange={e => set('pipeline', e.target.value)} placeholder="e.g. P04" required />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Priority</label>
              <select className="input-field" value={form.priority} onChange={e => set('priority', e.target.value)}>
                {['Critical', 'High', 'Medium', 'Low'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Issue Type</label>
            <select className="input-field" value={form.issue} onChange={e => set('issue', e.target.value)} required>
              <option value="">Select issue type</option>
              {issueTypes.map(i => <option key={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Action Taken</label>
            <input className="input-field" value={form.action} onChange={e => set('action', e.target.value)} placeholder="Describe the action taken" required />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Assigned Engineer</label>
            <select className="input-field" value={form.engineer} onChange={e => set('engineer', e.target.value)}>
              {engineers.map(eng => <option key={eng}>{eng}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">Notes</label>
            <textarea className="input-field resize-none" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Save Record</button>
          </div>
        </form>
      </div>
    </div>
  );
}
