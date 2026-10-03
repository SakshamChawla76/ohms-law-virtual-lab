import React from 'react';
import { Activity } from 'lucide-react';

export const VoltmeterWidget = ({
  voltage,
  isActive,
}) => {
  const maxScale = 12.0;
  const clampedVoltage = Math.min(Math.max(voltage, 0), maxScale);
  const needleAngle = -50 + (clampedVoltage / maxScale) * 100;

  // Generate 60 fine calibration division ticks (0 to 12V in 0.2V increments)
  const ticks = [];
  for (let i = 0; i <= 60; i++) {
    const val = (i / 60) * maxScale;
    const isMajor = i % 10 === 0; // 0, 2, 4, 6, 8, 10, 12 V
    const isMedium = i % 5 === 0 && !isMajor;
    const angle = -50 + (i / 60) * 100;
    const rad = (angle - 90) * (Math.PI / 180);
    
    // Radii
    const rOuter = 82;
    const rInner = isMajor ? 68 : isMedium ? 73 : 76;
    const rText = 58;

    const x1 = 110 + rOuter * Math.cos(rad);
    const y1 = 118 + rOuter * Math.sin(rad);
    const x2 = 110 + rInner * Math.cos(rad);
    const y2 = 118 + rInner * Math.sin(rad);
    const xt = 110 + rText * Math.cos(rad);
    const yt = 118 + rText * Math.sin(rad);

    ticks.push({
      id: i,
      x1, y1, x2, y2, xt, yt,
      isMajor,
      val: val.toFixed(1),
    });
  }

  return (
    <div className="w-72 rounded-2xl p-4 select-none relative overflow-hidden border border-outline-variant/30 shadow-sm bg-surface-container-lowest">
      {/* Corner Fastener Screws */}
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-slate-300 border border-slate-400 shadow-inner" />
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-300 border border-slate-400 shadow-inner" />
      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-slate-300 border border-slate-400 shadow-inner" />
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-slate-300 border border-slate-400 shadow-inner" />

      {/* Instrument Nameplate */}
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2 mb-3 px-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface tracking-wider font-mono">
            <span className="w-2 h-2 rounded-full bg-teal-600 inline-block animate-pulse" />
            <span>PRECISION DC VOLTMETER</span>
          </div>
          <div className="text-[10px] font-mono text-on-surface-variant">MODEL V-120 • 20,000 Ω/V</div>
        </div>
        <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-300 text-teal-800 font-bold">
          PARALLEL
        </span>
      </div>

      {/* Analog Galvanometer Bezel & Faceplate */}
      <div className="relative w-full h-36 rounded-xl bg-slate-950/80 border border-white/10 shadow-inner overflow-hidden flex items-end justify-center">
        {/* Anti-Parallax Mirrored Arc Strip */}
        <div className="absolute top-[28px] w-48 h-20 rounded-t-full border-t-8 border-slate-700/60 pointer-events-none opacity-80" />

        {/* Dial Face SVG */}
        <svg className="w-full h-full" viewBox="0 0 220 130">
          {/* Mirrored stripe backing */}
          <path
            d="M 28 118 A 82 82 0 0 1 192 118"
            fill="none"
            stroke="#1e293b"
            strokeWidth="10"
            strokeLinecap="butt"
          />

          {/* Graduation Arc Line */}
          <path
            d="M 28 118 A 82 82 0 0 1 192 118"
            fill="none"
            stroke="#06b6d4"
            strokeWidth="1.8"
            strokeOpacity="0.8"
          />

          {/* Ticks and Numerals */}
          {ticks.map((t) => (
            <g key={t.id}>
              <line
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={t.isMajor ? '#f1f5f9' : '#64748b'}
                strokeWidth={t.isMajor ? '2' : '1'}
              />
              {t.isMajor && (
                <text
                  x={t.xt}
                  y={t.yt + 3}
                  fontSize="9.5"
                  fontWeight="700"
                  fill="#f1f5f9"
                  textAnchor="middle"
                  fontFamily="'Space Grotesk', sans-serif"
                >
                  {t.val}V
                </text>
              )}
            </g>
          ))}

          {/* Galvanometer Sub-Label */}
          <text
            x="110"
            y="98"
            fontSize="10"
            fontWeight="800"
            fill="#38bdf8"
            textAnchor="middle"
            fontFamily="'Space Grotesk', monospace"
            letterSpacing="0.08em"
          >
            POTENTIAL DIFFERENCE (V)
          </text>
          <text
            x="110"
            y="108"
            fontSize="7"
            fontWeight="600"
            fill="#94a3b8"
            textAnchor="middle"
            fontFamily="monospace"
          >
            HIGH IMPEDANCE SENSING: 10 MΩ
          </text>
        </svg>

        {/* Dynamic Cast Shadow Beneath Needle */}
        <div
          className="absolute bottom-1 w-0.5 h-24 bg-black/60 origin-bottom transition-transform duration-300 ease-out blur-[1.5px] pointer-events-none"
          style={{
            transform: `rotate(${needleAngle + 2}deg) translate(2px, 0)`,
          }}
        />

        {/* Precision Knife-Edge Needle Pointer */}
        <div
          className="absolute bottom-1 w-1 h-25 origin-bottom transition-transform duration-300 ease-out z-20 pointer-events-none"
          style={{
            transform: `rotate(${needleAngle}deg)`,
          }}
        >
          {/* Vermilion pointer arm with glow */}
          <div className="w-0.5 h-20 bg-rose-500 mx-auto rounded-t-sm shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
          {/* Counter-weight teardrop tail */}
          <div className="w-2 h-4 bg-slate-700 rounded-full mx-auto -mt-1 border border-slate-500" />
        </div>

        {/* Mechanical Pivot Hub / Brass Cap */}
        <div className="absolute bottom-[-10px] w-8 h-8 rounded-full bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 border-2 border-slate-700 shadow-md z-30 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-amber-300" />
        </div>

        {/* Convex Glass Reflection Glare */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent z-40 rounded-xl pointer-events-none" />
      </div>

      {/* Zero Mechanical Adjustment Screw */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        <div className="w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-700 shadow-inner relative">
          <div className="w-2 h-0.5 bg-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Zero Adjust</span>
      </div>

      {/* Recessed Digital Instrument Readout */}
      <div className="mt-2.5 p-2 rounded-xl bg-black/60 flex items-center justify-between border border-white/5 shadow-inner">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]" />
          <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">TELEMETRY</span>
        </div>
        <div className="flex items-baseline gap-1 font-mono">
          <span className={`text-xl font-bold tracking-widest ${
            isActive && voltage > 0 
              ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]' 
              : 'text-slate-500'
          }`}>
            {isActive ? voltage.toFixed(2) : '0.00'}
          </span>
          <span className="text-xs font-bold text-cyan-400/80">V</span>
        </div>
      </div>

      {/* Color-Coded Banana Binding Terminals */}
      <div className="flex justify-between items-center px-2 mt-2 pt-2 border-t border-white/10 text-[10px] font-mono">
        <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-500/30 inline-block shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
          <span>(+) SENSE RED</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-slate-700 ring-2 ring-slate-600 inline-block" />
          <span>(-) RETURN BLK</span>
        </div>
      </div>
    </div>
  );
};
