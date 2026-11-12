import { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../api';

const issueTypes = ['High Leak Risk', 'Pressure Anomaly', 'Flow Fluctuation', 'Sensor Fault', 'Routine Maintenance'];
const priorities = ['Critical', 'High', 'Medium', 'Low'];

export default function MaintenanceModal({ onClose, onSaved, defaultPipeline = '' }) {
  const [form, setForm] = useState({
    pipeline: defaultPipeline,
    issue: '',
    priority: 'High',
    action: '',
    engineer: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));

  const handleSubmit = async event => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.createMaintenance({
        pipeline_id: form.pipeline.trim(),
        issue_type: form.issue,
        priority: form.priority,
        action_taken: form.action.trim() || null,
        assigned_engineer: form.engineer.trim() || null,
        notes: form.notes.trim() || null,
        status: 'In Progress',
      });
      if (onSaved) await onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Could not save the maintenance record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Add Maintenance Record</h2>
          <button type="button" onClick={onClose} disabled={saving} className="p-1 rounded-lg hover:bg-slate-100"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1" htmlFor="maintenance-pipeline">Pipeline ID</label>
              <input id="maintenance-pipeline" className="input-field" value={form.pipeline} onChange={e => set('pipeline', e.target.value)} placeholder="e.g. P04" maxLength={10} required />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1" htmlFor="maintenance-priority">Priority</label>
              <select id="maintenance-priority" className="input-field" value={form.priority} onChange={e => set('priority', e.target.value)}>
                {priorities.map(priority => <option key={priority}>{priority}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1" htmlFor="maintenance-issue">Issue Type</label>
            <select id="maintenance-issue" className="input-field" value={form.issue} onChange={e => set('issue', e.target.value)} required>
              <option value="">Select issue type</option>
              {issueTypes.map(issue => <option key={issue}>{issue}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1" htmlFor="maintenance-action">Action Taken / Planned</label>
            <input id="maintenance-action" className="input-field" value={form.action} onChange={e => set('action', e.target.value)} placeholder="Describe the maintenance work" maxLength={200} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1" htmlFor="maintenance-engineer">Assigned Engineer</label>
            <input id="maintenance-engineer" className="input-field" value={form.engineer} onChange={e => set('engineer', e.target.value)} placeholder="Engineer name" maxLength={100} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1" htmlFor="maintenance-notes">Notes</label>
            <textarea id="maintenance-notes" className="input-field resize-none" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Optional notes..." />
          </div>
          {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={saving} className="btn-secondary flex-1 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-50">{saving ? 'Saving…' : 'Save Record'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
