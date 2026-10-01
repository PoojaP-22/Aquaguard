import { useApp } from '../context/AppContext';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
      ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
      {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      {toast.message}
    </div>
  );
}
