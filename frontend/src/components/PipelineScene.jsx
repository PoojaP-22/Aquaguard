import { useMemo } from 'react';

const statusColor = { Healthy: '#2BC49A', Warning: '#E9B65D', 'High Risk': '#F18B52', Critical: '#F06470' };

export default function PipelineScene({ pipelines = [], onOpen }) {
  const sensors = useMemo(() => pipelines.slice(0, 8).map((pipeline, index) => ({
    ...pipeline,
    x: [115, 245, 385, 535, 690, 820, 925, 445][index],
    y: [250, 205, 270, 205, 255, 190, 255, 105][index],
  })), [pipelines]);

  const pipe = (d, key, width = 30) => (
    <g key={key} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke="#080F15" strokeWidth={width + 13} opacity=".8" transform="translate(0 9)" />
      <path d={d} stroke="url(#pipeBody)" strokeWidth={width} />
      <path d={d} stroke="url(#pipeHighlight)" strokeWidth={width * .22} transform="translate(0 -5)" opacity=".9" />
      <path d={d} stroke="#0B5965" strokeWidth="2" opacity=".8" transform="translate(0 10)" />
    </g>
  );

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/[.08] bg-[#151F28]">
      <svg viewBox="0 0 1000 420" role="img" aria-label="Illustrative three-dimensional water pipeline infrastructure visualization" className="block w-full h-[300px] lg:h-[350px]">
        <defs>
          <linearGradient id="pipeBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9AF5F1" />
            <stop offset=".18" stopColor="#28C8D0" />
            <stop offset=".58" stopColor="#0795A8" />
            <stop offset="1" stopColor="#07516A" />
          </linearGradient>
          <linearGradient id="pipeHighlight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E1FFFF" />
            <stop offset="1" stopColor="#42DCE0" stopOpacity=".1" />
          </linearGradient>
          <linearGradient id="steel" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#A9BAC2" />
            <stop offset=".5" stopColor="#526A78" />
            <stop offset="1" stopColor="#263B48" />
          </linearGradient>
          <pattern id="sceneGrid" width="42" height="42" patternUnits="userSpaceOnUse">
            <path d="M42 0H0V42" fill="none" stroke="#9CB2BE" strokeOpacity=".09" strokeWidth="1" />
          </pattern>
          <filter id="pipeGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
        </defs>
        <rect width="1000" height="420" fill="#151F28" />
        <rect width="1000" height="420" fill="url(#sceneGrid)" />
        <path d="M0 335L230 260L510 310L790 225L1000 275V420H0Z" fill="#202D37" />
        <path d="M0 335L230 260L510 310L790 225L1000 275" fill="none" stroke="#526775" strokeOpacity=".4" strokeWidth="2" />
        <g stroke="url(#steel)" strokeWidth="9" fill="none" strokeLinecap="round">
          <path d="M95 278V365M260 250V340M430 275V355M610 246V330M785 268V350M925 235V320" />
          <path d="M75 365H125M240 340H280M410 355H450M590 330H630M765 350H805M905 320H945" strokeWidth="7" />
          <path d="M95 320H260M260 300H430M430 320H610M610 295H785M785 305H925" strokeWidth="5" opacity=".75" />
        </g>
        <g opacity=".32" filter="url(#pipeGlow)" fill="none" stroke="#20D7E0" strokeWidth="42">
          <path d="M-25 270L205 225L430 265L650 205L865 245L1025 190" />
        </g>
        {pipe("M-25 270L205 225L430 265L650 205L865 245L1025 190", "main", 34)}
        {pipe("M-20 345L205 300L430 335L650 278L865 315L1025 265", "lower", 25)}
        {pipe("M205 225L205 130L355 100L505 135L650 105L790 145L865 245", "upper", 20)}
        {pipe("M430 265L430 165L505 135", "branch-a", 17)}
        {pipe("M650 205L650 105", "branch-b", 17)}
        <g stroke="url(#steel)" strokeWidth="8" fill="none" strokeLinecap="round">
          {[205,430,650,865].map((x) => <path key={x} d={`M${x} 205V125`} opacity=".65" />)}
        </g>
        <g fill="url(#steel)" stroke="#B5C8D0" strokeWidth="2">
          {[150,350,555,755,955].map((x) => <g key={x} transform={`translate(${x} 0)`}><rect x="-9" y="205" width="18" height="42" rx="4"/><rect x="-15" y="218" width="30" height="8" rx="2"/></g>)}
        </g>
        <g fill="#172832" stroke="#9BAFB8" strokeWidth="3">
          {[205,430,650,865].map((x) => <g key={x} transform={`translate(${x} 0)`}><rect x="-18" y="211" width="36" height="28" rx="5"/><path d="M-13 215V235M13 215V235" /></g>)}
        </g>
        <g stroke="#D2E0E4" strokeWidth="3" fill="none" opacity=".8">
          <path d="M505 98V48H650V98M520 48V32H635V48" />
          <path d="M520 32V15M635 32V15" strokeWidth="2" />
          <path d="M505 98H650" strokeWidth="5" />
        </g>
        <g fill="#263E4B" stroke="#91A8B3" strokeWidth="2">
          <rect x="480" y="12" width="175" height="22" rx="4" />
          <rect x="492" y="0" width="30" height="12" rx="2" />
          <rect x="610" y="0" width="30" height="12" rx="2" />
        </g>
        <g fill="#8FA7B2" fontSize="10" letterSpacing="1.4">
          <text x="32" y="34">DISTRIBUTION MAIN / A</text>
          <text x="32" y="52" fill="#5F7C8B">ISOMETRIC INFRASTRUCTURE VIEW</text>
          <text x="760" y="34">PUMPING STATION</text>
          <text x="760" y="52" fill="#5F7C8B">PRESSURE CONTROL ZONE</text>
        </g>
        {sensors.map((sensor) => (
          <g key={sensor.id} onClick={() => onOpen?.(sensor.id)} className={onOpen ? 'cursor-pointer' : ''}>
            <circle cx={sensor.x} cy={sensor.y} r="13" fill={statusColor[sensor.status] || '#2BC49A'} opacity=".18" />
            <circle cx={sensor.x} cy={sensor.y} r="5.5" fill={statusColor[sensor.status] || '#2BC49A'} stroke="#E7FFFF" strokeWidth="1.5" />
            <text x={sensor.x + 10} y={sensor.y - 10} fill="#C5D6DE" fontSize="10" fontWeight="600">{sensor.id}</text>
          </g>
        ))}
        <g transform="translate(32 385)" fill="#91A8B2" fontSize="10">
          <circle cx="5" cy="0" r="4" fill="#2BC49A" /><text x="16" y="4">HEALTHY</text>
          <circle cx="105" cy="0" r="4" fill="#E9B65D" /><text x="116" y="4">WARNING</text>
          <circle cx="215" cy="0" r="4" fill="#F18B52" /><text x="226" y="4">HIGH RISK</text>
          <circle cx="330" cy="0" r="4" fill="#F06470" /><text x="341" y="4">CRITICAL</text>
        </g>
      </svg>
      <div className="absolute right-3 bottom-3 rounded-md border border-white/10 bg-[#111A22]/90 px-2.5 py-1.5 text-[9px] tracking-wider text-slate-400">CONCEPTUAL 3D VIEW · NOT A FIELD SCAN</div>
    </div>
  );
}
