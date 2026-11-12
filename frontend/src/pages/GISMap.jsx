import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Layers3, MapPin, RefreshCw, Search } from 'lucide-react';
import { api, normalizePipeline } from '../api';

const positions = [
  [110,90],[270,105],[440,78],[610,112],[780,88],[950,120],
  [170,260],[340,245],[520,275],[710,250],[890,270],[1050,245],
  [100,430],[285,415],[465,445],[650,420],[830,450],[1010,425],
  [175,600],[365,585],[555,615],[745,585],[925,610],[1080,580],
];
const statusColor = (status) => ({ Healthy:'#159B75', Warning:'#D69A32', 'High Risk':'#E47B43', Critical:'#D94B55' }[status] || '#6B91A8');

function NetworkCanvas({ pipelines, selected, onSelect }) {
  const points = pipelines.map((p,i) => ({ ...p, x:positions[i % positions.length][0], y:positions[i % positions.length][1] }));
  const links = points.slice(1).map((p,i) => [points[i],p]).filter((_,i)=>i%2===0);
  return <svg viewBox="0 0 1180 700" role="img" aria-label="Schematic pipeline asset network" className="w-full h-full min-h-[530px]">
    <defs>
      <pattern id="blocks" width="118" height="92" patternUnits="userSpaceOnUse"><rect x="7" y="7" width="92" height="65" rx="5" fill="#26333D" stroke="#3A4853"/><path d="M18 19h70M18 31h44M18 52h60" stroke="#3A4853" strokeWidth="3"/></pattern>
      <filter id="soft"><feGaussianBlur stdDeviation="5"/></filter>
    </defs>
    <rect width="1180" height="700" fill="#151F28"/>
    <rect width="1180" height="700" fill="url(#blocks)" opacity=".85"/>
    <path d="M0 180 C180 130 280 210 420 165 S730 170 900 210 S1080 180 1180 140 M0 520 C200 490 300 550 480 510 S780 500 930 535 S1080 500 1180 520" fill="none" stroke="#34434D" strokeWidth="34"/>
    <path d="M0 180 C180 130 280 210 420 165 S730 170 900 210 S1080 180 1180 140 M0 520 C200 490 300 550 480 510 S780 500 930 535 S1080 500 1180 520" fill="none" stroke="#202A33" strokeWidth="25"/>
    <path d="M220 0 C190 180 250 290 225 410 S210 590 245 700 M600 0 C570 160 630 300 600 430 S590 600 620 700 M940 0 C900 170 970 330 930 470 S940 600 965 700" fill="none" stroke="#34434D" strokeWidth="26"/>
    <path d="M220 0 C190 180 250 290 225 410 S210 590 245 700 M600 0 C570 160 630 300 600 430 S590 600 620 700 M940 0 C900 170 970 330 930 470 S940 600 965 700" fill="none" stroke="#202A33" strokeWidth="18"/>
    <g fill="#91A4AE" fontSize="13" letterSpacing="2"><text x="55" y="35">NORTH DISTRICT</text><text x="450" y="35">CENTRAL DISTRICT</text><text x="850" y="35">EAST DISTRICT</text><text x="65" y="675">SOUTH RESERVOIR ZONE</text></g>
    <g strokeLinecap="round" fill="none">
      {links.map(([a,b],i)=><path key={i} d={`M${a.x} ${a.y} Q${(a.x+b.x)/2+((i%3)-1)*22} ${(a.y+b.y)/2-35} ${b.x} ${b.y}`} stroke="#46616E" strokeWidth="13" opacity=".5"/>)}
      {links.map(([a,b],i)=><path key={`p${i}`} d={`M${a.x} ${a.y} Q${(a.x+b.x)/2+((i%3)-1)*22} ${(a.y+b.y)/2-35} ${b.x} ${b.y}`} stroke={statusColor(a.status)} strokeWidth="5" opacity=".9"/>)}
    </g>
    {points.map(p=><g key={p.id} onClick={()=>onSelect(p.id)} className="cursor-pointer">
      {selected===p.id&&<circle cx={p.x} cy={p.y} r="23" fill={statusColor(p.status)} opacity=".16"/>}
      <circle cx={p.x} cy={p.y} r={selected===p.id?11:8} fill={statusColor(p.status)} stroke="#fff" strokeWidth="3"/>
      <text x={p.x+13} y={p.y-12} fill="#DCE6EC" fontSize="12" fontWeight="700">{p.id}</text>
    </g>)}
    <g transform="translate(1060 55)"><path d="M0 25L10 0L20 25L10 19Z" fill="#9EB0BA"/><text x="10" y="42" textAnchor="middle" fill="#9EB0BA" fontSize="10">N</text></g>
  </svg>;
}

export default function GISMap() {
  const navigate=useNavigate();
  const [pipelines,setPipelines]=useState([]);
  const [selected,setSelected]=useState('');
  const [query,setQuery]=useState('');
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const load=async()=>{setLoading(true);setError('');try{const rows=(await api.pipelines()).map(normalizePipeline);setPipelines(rows);setSelected(v=>rows.some(p=>p.id===v)?v:(rows[0]?.id||''));}catch(e){setError('Unable to load pipeline assets. Check that the AquaGuard API is running.');}finally{setLoading(false);}};
  useEffect(()=>{load();const t=setInterval(load,30000);return()=>clearInterval(t);},[]);
  const filtered=useMemo(()=>pipelines.filter(p=>p.id.toLowerCase().includes(query.toLowerCase())||(p.zone||'').toLowerCase().includes(query.toLowerCase())),[pipelines,query]);
  const active=pipelines.find(p=>p.id===selected);
  const counts=pipelines.reduce((a,p)=>(a[p.status]=(a[p.status]||0)+1,a),{});
  return <div className="min-h-full bg-[#111A22] text-[#E5EDF2]">
    <div className="px-6 py-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#34434D] bg-[#202A33]">
      <div><div className="flex items-center gap-2 text-xs uppercase tracking-[.18em] text-cyan-300 font-semibold"><MapPin size={14}/> Asset intelligence / GIS</div><h1 className="text-2xl font-bold mt-1">Pipeline Network Map</h1><p className="text-sm text-[#A8B6BF] mt-1">Explore pipeline condition, risk distribution and asset details.</p></div>
      <div className="flex gap-2"><button onClick={load} className="px-3 py-2 border border-[#40505C] rounded-lg text-sm flex items-center gap-2 hover:bg-[#303C46]"><RefreshCw size={15}/> Refresh assets</button><button onClick={()=>navigate('/pipelines')} className="px-3 py-2 bg-cyan-700 text-white rounded-lg text-sm flex items-center gap-2">Asset register <ArrowUpRight size={15}/></button></div>
    </div>
    <div className="p-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[['TOTAL ASSETS',pipelines.length,'#A9BAC4'],['HEALTHY',counts.Healthy||0,'#159B75'],['HIGH / CRITICAL',(counts['High Risk']||0)+(counts.Critical||0),'#D94B55'],['MONITORING',loading?'…':'LIVE API','#367E9A']].map(([label,value,color])=><div key={label} className="bg-[#202A33] border border-[#34434D] rounded-xl p-4"><div className="text-[10px] tracking-[.15em] font-bold text-[#A8B6BF]">{label}</div><div className="text-2xl font-bold mt-2" style={{color}}>{value}</div></div>)}
    </div>
    {error&&<div className="mx-5 mb-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm p-3">{error}</div>}
    <div className="px-5 pb-6 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-4">
      <section className="bg-[#202A33] border border-[#34434D] rounded-xl overflow-hidden shadow-sm">
        <div className="p-3 border-b border-[#3A4853] flex flex-wrap justify-between items-center gap-3"><div className="flex gap-3 flex-wrap text-xs">{[['Healthy','#159B75'],['Warning','#D69A32'],['High risk','#E47B43'],['Critical','#D94B55']].map(([n,c])=><span key={n} className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-full" style={{background:c}}/>{n}</span>)}</div><span className="text-xs text-[#9BAAB4]">Schematic network view · asset positions illustrative</span></div>
        <div className="relative overflow-hidden"><NetworkCanvas pipelines={pipelines} selected={selected} onSelect={setSelected}/><div className="absolute left-4 top-4 bg-[#202A33]/95 border border-[#40505C] rounded-lg shadow-sm flex items-center px-3 py-2 gap-2"><Search size={15} className="text-[#A8B6BF]"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find pipeline or zone" className="outline-none text-sm w-40"/></div><div className="absolute bottom-4 left-4 rounded-lg bg-[#202A33]/95 border border-[#40505C] px-3 py-2 text-xs text-[#C2CED5] flex gap-2 items-center"><Layers3 size={14}/> Pipeline condition layer</div></div>
      </section>
      <aside className="bg-[#202A33] border border-[#34434D] rounded-xl shadow-sm overflow-hidden h-fit">
        <div className="p-4 border-b border-[#3A4853]"><div className="text-[10px] tracking-[.16em] font-bold text-[#A8B6BF]">ASSET INSPECTOR</div><h2 className="text-lg font-bold mt-1">{active?active.id:'Select a pipeline'}</h2><p className="text-xs text-[#9BAAB4]">{active?.zone||'Choose a segment on the map'}</p></div>
        {active&&<div className="p-4 space-y-4">
          <div className="flex justify-between items-center"><span className="text-sm text-[#A8B6BF]">Condition status</span><span className="px-2.5 py-1 rounded-full text-xs font-semibold" style={{background:`${statusColor(active.status)}18`,color:statusColor(active.status)}}>{active.status}</span></div>
          <div className="grid grid-cols-2 gap-3">{[['PIPELINE HEALTH',`${active.phi} / 100`],['FAILURE RISK',`${active.leakRisk}%`],['PRESSURE',`${active.pressure} MPa`],['FLOW RATE',`${active.flow} L/min`]].map(([k,v])=><div key={k} className="bg-[#293640] rounded-lg p-3"><div className="text-[9px] tracking-wider font-bold text-[#9BAAB4]">{k}</div><div className="font-bold text-lg mt-1">{v}</div></div>)}</div>
          <div><div className="flex justify-between text-xs mb-1"><span className="text-[#A8B6BF]">Health index</span><b>{active.phi}%</b></div><div className="h-2 rounded-full bg-[#34434D] overflow-hidden"><div className="h-full rounded-full bg-[#159B75]" style={{width:`${Math.max(0,Math.min(100,active.phi))}%`}}/></div></div>
          <button onClick={()=>navigate(`/pipelines/${active.id}`)} className="w-full rounded-lg bg-cyan-700 text-white py-2.5 text-sm font-semibold flex justify-center items-center gap-2">Open asset details <ArrowUpRight size={15}/></button>
        </div>}
        <div className="border-t border-[#3A4853] p-3"><div className="text-[10px] font-bold tracking-wider text-[#9BAAB4] mb-2">PIPELINE ASSETS</div><div className="max-h-64 overflow-y-auto space-y-1">{filtered.map(p=><button key={p.id} onClick={()=>setSelected(p.id)} className={`w-full flex justify-between items-center rounded-lg px-2.5 py-2 text-left text-sm ${selected===p.id?'bg-[#34434D]':'hover:bg-[#303C46]'}`}><span className="font-semibold">{p.id}<small className="block text-xs font-normal text-[#9BAAB4]">{p.zone}</small></span><span className="text-xs font-bold" style={{color:statusColor(p.status)}}>{p.leakRisk}%</span></button>)}</div></div>
      </aside>
    </div>
    <div className="px-5 pb-5 text-[11px] text-[#8799A4]">Live asset metrics are retrieved from the AquaGuard backend. Geographic coordinates and pipe geometry are not yet available; this network layout is an illustrative schematic, not a surveyed GIS map.</div>
  </div>;
}
