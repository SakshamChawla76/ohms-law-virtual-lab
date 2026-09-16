import React from 'react';
import { Gauge } from 'lucide-react';

export const AmmeterWidget = ({
  current,
  isActive,
  isShortCircuit,
}) => {
  const maxScale = 1.0;
  const clampedCurrent = Math.min(Math.max(current, 0), maxScale);
  const needleAngle = -60 + (clampedCurrent / maxScale) * 120;

  return (
    <div className="w-64 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-700 shadow-2xl p-4 flex flex-col items-center select-none">
      {/* Top Banner */}
      <div className="w-full flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 font-mono">
          <Gauge className="w-4 h-4" />
          <span>DC AMMETER</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
          SERIES
        </span>
      </div>

      {/* Analog Galvanometer Arc Dial */}
      <div className="relative w-52 h-28 overflow-hidden flex items-end justify-center bg-slate-950/70 rounded-t-2xl border border-slate-800 p-2 shadow-inner">
        {/* Scale SVG */}
        <svg className="w-full h-full" viewBox="0 0 200 110">
          {/* Main Dial Arc */}
          <path
            d="M 25 100 A 75 75 0 0 1 175 100"
            fill="none"
            stroke="#475569"
            strokeWidth="3"
          />
          {/* Active Progress Arc */}
          {isActive && (
            <path
              d="M 25 100 A 75 75 0 0 1 175 100"
              fill="none"
              stroke="#ffb300"
              strokeWidth="2"
              strokeDasharray={`${(clampedCurrent / maxScale) * 235} 235`}
            />
          )}

          {/* Scale Ticks & Numbers */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((val) => {
            const angle = -60 + (val / maxScale) * 120;
            const rad = (angle - 90) * (Math.PI / 180);
            const x1 = 100 + 75 * Math.cos(rad);
            const y1 = 100 + 75 * Math.sin(rad);
            const x2 = 100 + 64 * Math.cos(rad);
            const y2 = 100 + 64 * Math.sin(rad);
            const tx = 100 + 52 * Math.cos(rad);
            const ty = 100 + 52 * Math.sin(rad);

            return (
              <g key={val}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="1.5" />
                <text
                  x={tx}
                  y={ty + 3}
                  fontSize="8"
                  fill="#94a3b8"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {val.toFixed(1)}
                </text>
              </g>
            );
          })}

          <text x="100" y="82" fontSize="9" fill="#ffb300" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
            AMPERES (A)
          </text>
        </svg>

        {/* Pivot Needle */}
        <div
          className="absolute bottom-0 w-1 h-24 bg-rose-500 origin-bottom transition-transform duration-300 ease-out shadow-lg"
          style={{
            transform: `rotate(${needleAngle}deg)`,
          }}
        >
          <div className="w-1.5 h-3 bg-amber-400 rounded-t-full -ml-[1px]" />
        </div>

        {/* Needle Hub */}
        <div className="absolute bottom-[-6px] w-5 h-5 rounded-full bg-slate-300 border-2 border-slate-900 shadow-md z-10" />
      </div>

      {/* Digital LCD Segment Readout */}
      <div className="w-full mt-3 p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono">
        <span className="text-[11px] text-slate-500 uppercase">DIGITAL READOUT</span>
        <div className="flex items-baseline gap-1">
          <span className={`text-xl font-bold tracking-wider ${
            isShortCircuit 
              ? 'text-rose-500 animate-pulse' 
              : isActive && current > 0 
                ? 'text-amber-400 text-glow-amber' 
                : 'text-slate-600'
          }`}>
            {isActive ? current.toFixed(3) : '0.000'}
          </span>
          <span className="text-xs text-amber-500 font-bold">A</span>
        </div>
      </div>

      {/* Terminal Label Helper */}
      <div className="w-full flex justify-between px-4 mt-2 text-[10px] font-mono text-slate-400">
        <span className="text-rose-400">● (+) Red Pos</span>
        <span className="text-slate-300">● (-) Black Neg</span>
      </div>
    </div>
  );
};
