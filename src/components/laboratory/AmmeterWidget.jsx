import React from 'react';
import { Gauge } from 'lucide-react';

export const AmmeterWidget = ({
  current,
  isActive,
  isShortCircuit,
}) => {
  const maxScale = 1.0;
  const clampedCurrent = Math.min(Math.max(current, 0), maxScale);
  const needleAngle = -50 + (clampedCurrent / maxScale) * 100;

  // Generate 50 fine calibration division ticks
  const ticks = [];
  for (let i = 0; i <= 50; i++) {
    const val = (i / 50) * maxScale;
    const isMajor = i % 10 === 0;
    const isMedium = i % 5 === 0 && !isMajor;
    const angle = -50 + (i / 50) * 100;
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
    <div className="w-72 rounded-2xl lab-chassis p-4 select-none relative overflow-hidden">
      {/* Corner Fastener Screws */}
      <div className="absolute top-2 left-2 screw-head" />
      <div className="absolute top-2 right-2 screw-head" />
      <div className="absolute bottom-2 left-2 screw-head" />
      <div className="absolute bottom-2 right-2 screw-head" />

      {/* Instrument Nameplate */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3 px-1">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 tracking-wider font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse" />
            <span>PRECISION DC AMMETER</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500">MODEL A-101 • CLASS 0.5</div>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 font-semibold">
          SERIES
        </span>
      </div>

      {/* Analog Galvanometer Bezel & Faceplate */}
      <div className="relative w-full h-36 rounded-xl bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100 border-2 border-slate-300 shadow-meter-dial overflow-hidden flex items-end justify-center">
        {/* Anti-Parallax Mirrored Arc Strip (Authentic Precision Lab Feature) */}
        <div className="absolute top-[28px] w-48 h-20 rounded-t-full border-t-8 border-slate-300/80 pointer-events-none opacity-80" />

        {/* Dial Face SVG */}
        <svg className="w-full h-full" viewBox="0 0 220 130">
          {/* Mirrored stripe backing */}
          <path
            d="M 28 118 A 82 82 0 0 1 192 118"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="10"
            strokeLinecap="butt"
          />

          {/* Graduation Arc Line */}
          <path
            d="M 28 118 A 82 82 0 0 1 192 118"
            fill="none"
            stroke="#334155"
            strokeWidth="1.8"
          />

          {/* Ticks and Numerals */}
          {ticks.map((t) => (
            <g key={t.id}>
              <line
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={t.isMajor ? '#0f172a' : '#64748b'}
                strokeWidth={t.isMajor ? '2' : '1'}
              />
              {t.isMajor && (
                <text
                  x={t.xt}
                  y={t.yt + 3}
                  fontSize="9.5"
                  fontWeight="700"
                  fill="#0f172a"
                  textAnchor="middle"
                  fontFamily="'Space Grotesk', sans-serif"
                >
                  {t.val}
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
            fill="#b45309"
            textAnchor="middle"
            fontFamily="'Space Grotesk', monospace"
            letterSpacing="0.08em"
          >
            CURRENT IN AMPERES (A)
          </text>
          <text
            x="110"
            y="108"
            fontSize="7"
            fontWeight="600"
            fill="#64748b"
            textAnchor="middle"
            fontFamily="monospace"
          >
            INTERNAL SHUNT: 0.05 Ω
          </text>
        </svg>

        {/* Dynamic Cast Shadow Beneath Needle */}
        <div
          className="absolute bottom-1 w-0.5 h-24 bg-black/30 origin-bottom transition-transform duration-300 ease-out blur-[1.5px] pointer-events-none"
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
          {/* Vermilion pointer arm */}
          <div className="w-0.5 h-20 bg-rose-600 mx-auto rounded-t-sm shadow-sm" />
          {/* Counter-weight teardrop tail */}
          <div className="w-2 h-4 bg-slate-700 rounded-full mx-auto -mt-1 border border-slate-500" />
        </div>

        {/* Mechanical Pivot Hub / Brass Cap */}
        <div className="absolute bottom-[-10px] w-8 h-8 rounded-full bg-gradient-to-b from-amber-200 via-amber-300 to-amber-500 border-2 border-slate-600 shadow-md z-30 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-amber-200" />
        </div>

        {/* Convex Glass Reflection Glare */}
        <div className="absolute inset-0 meter-glass-glare z-40 rounded-xl pointer-events-none" />
      </div>

      {/* Zero Mechanical Adjustment Screw */}
      <div className="flex items-center justify-center gap-1.5 mt-2">
        <div className="w-3.5 h-3.5 rounded-full bg-slate-200 border border-slate-300 shadow-inner relative">
          <div className="w-2 h-0.5 bg-slate-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">Zero Adjust</span>
      </div>

      {/* Recessed Digital Instrument Readout */}
      <div className="mt-2.5 p-2 rounded-lg lab-inset flex items-center justify-between border border-slate-200">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase">TELEMETRY</span>
        </div>
        <div className="flex items-baseline gap-1 font-digital">
          <span className={`text-xl font-bold tracking-widest ${
            isShortCircuit 
              ? 'text-rose-600 animate-pulse' 
              : isActive && current > 0 
                ? 'text-amber-800' 
                : 'text-slate-400'
          }`}>
            {isActive ? current.toFixed(3) : '0.000'}
          </span>
          <span className="text-xs font-bold text-amber-700">A</span>
        </div>
      </div>

      {/* Color-Coded Banana Binding Terminals */}
      <div className="flex justify-between items-center px-2 mt-2 pt-2 border-t border-slate-200 text-[10px] font-mono">
        <div className="flex items-center gap-1.5 text-rose-700 font-semibold">
          <span className="w-2 h-2 rounded-full bg-rose-600 ring-2 ring-rose-200 inline-block" />
          <span>(+) INPUT RED</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
          <span className="w-2 h-2 rounded-full bg-slate-700 ring-2 ring-slate-200 inline-block" />
          <span>(-) RETURN BLK</span>
        </div>
      </div>
    </div>
  );
};
