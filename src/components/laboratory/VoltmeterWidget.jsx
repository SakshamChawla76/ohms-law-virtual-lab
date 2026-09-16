import React from 'react';
import { Activity } from 'lucide-react';

export const VoltmeterWidget = ({
  voltage,
  isActive,
}) => {
  const maxScale = 10.0;
  const clampedVoltage = Math.min(Math.max(voltage, 0), maxScale);
  const needleAngle = -60 + (clampedVoltage / maxScale) * 120;

  return (
    <div className="w-64 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-700 shadow-2xl p-4 flex flex-col items-center select-none">
      {/* Top Banner */}
      <div className="w-full flex items-center justify-between border-b border-slate-700 pb-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 font-mono">
          <Activity className="w-4 h-4" />
          <span>DC VOLTMETER</span>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
          PARALLEL
        </span>
      </div>

      {/* Analog Voltmeter Arc Dial */}
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
              stroke="#00f2fe"
              strokeWidth="2"
              strokeDasharray={`${(clampedVoltage / maxScale) * 235} 235`}
            />
          )}

          {/* Scale Ticks & Numbers */}
          {[0, 2, 4, 6, 8, 10].map((val) => {
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
                  {val}
                </text>
              </g>
            );
          })}

          <text x="100" y="82" fontSize="9" fill="#00f2fe" textAnchor="middle" fontWeight="bold" fontFamily="monospace">
            VOLTS (V)
          </text>
        </svg>

        {/* Pivot Needle */}
        <div
          className="absolute bottom-0 w-1 h-24 bg-rose-500 origin-bottom transition-transform duration-300 ease-out shadow-lg"
          style={{
            transform: `rotate(${needleAngle}deg)`,
          }}
        >
          <div className="w-1.5 h-3 bg-cyan-400 rounded-t-full -ml-[1px]" />
        </div>

        {/* Needle Hub */}
        <div className="absolute bottom-[-6px] w-5 h-5 rounded-full bg-slate-300 border-2 border-slate-900 shadow-md z-10" />
      </div>

      {/* Digital OLED Readout */}
      <div className="w-full mt-3 p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between font-mono">
        <span className="text-[11px] text-slate-500 uppercase">DIGITAL READOUT</span>
        <div className="flex items-baseline gap-1">
          <span className={`text-xl font-bold tracking-wider ${
            isActive && voltage > 0 
              ? 'text-cyan-400 text-glow-cyan' 
              : 'text-slate-600'
          }`}>
            {isActive ? voltage.toFixed(2) : '0.00'}
          </span>
          <span className="text-xs text-cyan-400 font-bold">V</span>
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
