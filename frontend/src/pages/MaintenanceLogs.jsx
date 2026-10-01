import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, CheckCircle, Clock } from 'lucide-react';
import MaintenanceModal from '../components/MaintenanceModal';

export default function MaintenanceLogs() {
  const { logs } = useApp();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Maintenance Logs</h1>
          <p className="text-slate-500 text-sm mt-1">Track and manage all maintenance activities.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Record
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-xs text-slate-500">
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Pipeline</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Issue</th>
                <th className="text-left px-4 py-3 font-medium">Action Taken</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Engineer</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{log.date}</td>
                  <td className="px-4 py-3 font-semibold text-sky-600">{log.pipeline}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-600 text-xs max-w-[180px] truncate">{log.issue}</td>
                  <td className="px-4 py-3 text-slate-700 text-xs max-w-[200px] truncate">{log.action}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-slate-600 text-xs">{log.engineer}</td>
                  <td className="px-4 py-3">
                    {log.status === 'Completed' ? (
                      <span className="flex items-center gap-1 text-xs text-green-700 font-medium">
                        <CheckCircle size={12} /> Completed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-amber-700 font-medium">
                        <Clock size={12} /> In Progress
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <MaintenanceModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
