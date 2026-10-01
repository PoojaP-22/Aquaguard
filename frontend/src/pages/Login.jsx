import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('arun@aquaguard.io');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e) => { e.preventDefault(); navigate('/dashboard'); };

  return (
    <div className="h-screen flex overflow-hidden">

      {/* ── Left Panel ─────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[55%] p-14 text-white relative overflow-hidden h-full"
        style={{ background: 'linear-gradient(145deg, #0a1628 0%, #0c2040 55%, #0a1e3d 100%)' }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-[-100px] right-[-100px] w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.07), transparent 70%)' }} />
        <div className="absolute bottom-[-80px] left-[-80px] w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)' }} />
        <div className="absolute top-[40%] right-[10%] w-48 h-48 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.04), transparent 70%)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Droplets size={22} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-lg tracking-tight">AquaGuard AI</div>
            <div className="text-sky-400 text-xs tracking-wide">Predictive Pipeline Maintenance</div>
          </div>
        </div>

        {/* Centre content */}
        <div className="space-y-10 relative z-10">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 rounded-full px-4 py-1.5 w-fit">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-sky-300 text-xs font-medium tracking-wide">AI-Powered Infrastructure Monitoring</span>
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl font-bold leading-[1.15] tracking-tight">
              Predict pipeline<br />
              failures{' '}
              <span className="text-sky-400">before</span><br />
              they happen.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed max-w-sm">
              Intelligent predictive maintenance for water distribution networks —
              combining real-time data analysis with explainable AI.
            </p>
          </div>

          {/* SVG illustration */}
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <svg viewBox="0 0 500 160" className="w-full">
              {/* Main pipe */}
              <rect x="30" y="72" width="440" height="16" rx="8" fill="#1e3a5f" stroke="#1e6fa8" strokeWidth="1" />
              {/* Flow */}
              <rect x="30" y="75" width="55" height="10" rx="5" fill="#0ea5e9" opacity="0.3">
                <animateTransform attributeName="transform" type="translate" values="0,0;390,0;0,0" dur="5s" repeatCount="indefinite" />
              </rect>
              {/* Branch pipes */}
              {[122, 242, 362].map((x, i) => (
                <g key={i}>
                  <rect x={x - 4} y="32" width="8" height="40" rx="4" fill="#1e3a5f" stroke="#1e6fa8" strokeWidth="1" />
                  {/* Node */}
                  <circle cx={x} cy="22" r="16" fill="#0f2744" stroke="#0ea5e9" strokeWidth="1.5" />
                  <circle cx={x} cy="22" r="7" fill="#0ea5e9" opacity="0.85">
                    <animate attributeName="opacity" values="0.85;0.35;0.85" dur={`${1.8 + i * 0.6}s`} repeatCount="indefinite" />
                  </circle>
                  <circle cx={x} cy="22" r="16" fill="none" stroke="#0ea5e9" strokeWidth="1" opacity="0">
                    <animate attributeName="r" values="16;26;16" dur={`${2.2 + i * 0.5}s`} repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.35;0;0.35" dur={`${2.2 + i * 0.5}s`} repeatCount="indefinite" />
                  </circle>
                </g>
              ))}
              {/* Down arrow */}
              <line x1="242" y1="88" x2="242" y2="112" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 3">
                <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite" />
              </line>
              {/* AI box */}
              <rect x="168" y="112" width="148" height="38" rx="10" fill="#0f2744" stroke="#6366f1" strokeWidth="1.5" />
              <text x="242" y="129" textAnchor="middle" fill="#a5b4fc" fontSize="10" fontWeight="bold">AI Analysis Engine</text>
              <text x="242" y="143" textAnchor="middle" fill="#475569" fontSize="8.5">Risk · Prediction · Explanation</text>
              {/* Side boxes */}
              <rect x="28" y="118" width="108" height="26" rx="7" fill="#0f2744" stroke="#10b981" strokeWidth="1" />
              <text x="82" y="135" textAnchor="middle" fill="#34d399" fontSize="9" fontWeight="600">Risk Score</text>
              <rect x="364" y="118" width="108" height="26" rx="7" fill="#0f2744" stroke="#f59e0b" strokeWidth="1" />
              <text x="418" y="135" textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="600">Priority Queue</text>
              {/* Connectors */}
              <line x1="168" y1="131" x2="136" y2="131" stroke="#10b981" strokeWidth="1" strokeDasharray="3 2" opacity="0.5" />
              <line x1="316" y1="131" x2="364" y2="131" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 2" opacity="0.5" />
            </svg>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-6">
            {[
              { val: '24', label: 'Pipelines Monitored', color: 'text-sky-400' },
              { val: '94%', label: 'Sensor Uptime', color: 'text-emerald-400' },
              { val: '18h', label: 'Earliest Failure Est.', color: 'text-amber-400' },
            ].map(({ val, label, color }) => (
              <div key={label} className="flex flex-col">
                <span className={`text-2xl font-bold ${color}`}>{val}</span>
                <span className="text-slate-500 text-xs mt-0.5">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer — clean, no text clutter */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-600 text-xs">All systems operational</span>
        </div>
      </div>

      {/* ── Right Panel ────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 self-stretch">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center">
              <Droplets size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-800">AquaGuard AI</span>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
              <p className="text-slate-500 text-sm mt-1">Sign in to your monitoring dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5 uppercase tracking-wider">
                  Email address
                </label>
                <input
                  type="email"
                  className="input-field"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="input-field pr-10"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                    className="rounded border-slate-300 accent-sky-500" />
                  Remember me
                </label>
                <button type="button" className="text-xs text-sky-500 hover:underline">Forgot password?</button>
              </div>

              <button type="submit" className="btn-primary w-full py-3 text-sm font-semibold">
                Sign In
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400">or</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 rounded-xl border-2 border-dashed border-sky-200 text-sky-600 text-sm font-semibold hover:bg-sky-50 transition-colors flex items-center justify-center gap-2"
            >
              <Droplets size={15} />
              Continue with Demo Account
            </button>
          </div>

          {/* Bottom stat cards */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            {[
              { val: '24', label: 'Pipelines', color: 'text-sky-600' },
              { val: '94%', label: 'Uptime', color: 'text-emerald-600' },
              { val: '5', label: 'Active Alerts', color: 'text-red-500' },
            ].map(({ val, label, color }) => (
              <div key={label} className="bg-white rounded-xl border border-slate-100 p-3 text-center shadow-sm">
                <div className={`text-lg font-bold ${color}`}>{val}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
