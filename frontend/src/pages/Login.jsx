import { useNavigate } from 'react-router-dom';
import { Droplets, ShieldAlert } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="bg-[#0B2030] text-white p-8">
          <div className="w-12 h-12 rounded-xl bg-sky-500 flex items-center justify-center mb-5"><Droplets size={26}/></div>
          <p className="text-xs tracking-[.2em] font-bold text-cyan-300">AQUAGUARD AI</p>
          <h1 className="text-3xl font-semibold mt-2">Water Operations Workspace</h1>
          <p className="text-sm text-slate-300 mt-3 leading-relaxed">Predictive-maintenance decision support for water distribution pipeline assets.</p>
        </div>
        <div className="p-8 space-y-5">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3">
            <ShieldAlert size={19} className="text-amber-700 flex-shrink-0 mt-0.5"/>
            <div>
              <p className="text-sm font-semibold text-amber-900">Demo access only</p>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">User authentication, password verification and account management are not implemented. This entry point does not provide access control.</p>
            </div>
          </div>
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-primary w-full py-3">Open Demo Workspace</button>
          <p className="text-xs text-slate-500 text-center">Use with a locally running FastAPI backend and seeded demo database.</p>
        </div>
      </section>
    </main>
  );
}
