import React, { useState } from 'react';
import { LineChart, Sparkles, HelpCircle, CheckCircle2, Crosshair } from 'lucide-react';
import { sounds } from '../../engine/audioEffects';

export const ViGraph = ({
  trials,
  nominalResistance,
  onOpenVerificationModal,
  minRequired = 5,
  liveVoltage,
  liveCurrent,
}) => {
  const [showBestFit, setShowBestFit] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Graph dimensions
  const width = 580;
  const height = 340;
  const padding = { top: 30, right: 30, bottom: 50, left: 60 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  // Axis scales: Current (X) 0 to 0.30 A, Voltage (Y) 0 to 12 V
  const maxI = Math.max(0.25, ...trials.map(t => t.current * 1.2));
  const maxV = Math.max(10.0, ...trials.map(t => t.voltage * 1.15));

  const getX = (i) => padding.left + (i / maxI) * plotW;
  const getY = (v) => padding.top + plotH - (v / maxV) * plotH;

  // Calculate Linear Regression (Best Fit Line passing through or near origin)
  let slope = 0;
  let percentError = 0;
  let rSquared = 0;

  if (trials.length >= 2) {
    const n = trials.length;
    const sumI = trials.reduce((acc, t) => acc + t.current, 0);
    const sumV = trials.reduce((acc, t) => acc + t.voltage, 0);
    const meanI = sumI / n;
    const meanV = sumV / n;

    let num = 0;
    let den = 0;
    let ssTot = 0;
    let ssRes = 0;

    trials.forEach(t => {
      num += (t.current - meanI) * (t.voltage - meanV);
      den += (t.current - meanI) * (t.current - meanI);
      ssTot += Math.pow(t.voltage - meanV, 2);
    });

    slope = den !== 0 ? num / den : nominalResistance;
    percentError = Math.abs(slope - nominalResistance) / nominalResistance * 100;

    trials.forEach(t => {
      const predictedV = slope * t.current;
      ssRes += Math.pow(t.voltage - predictedV, 2);
    });

    rSquared = ssTot !== 0 ? Math.max(0, 1 - (ssRes / ssTot)) : 1.0;
  }

  const isUnlocked = trials.length >= minRequired;

  const toggleBestFit = () => {
    setShowBestFit(!showBestFit);
    sounds.playSuccess();
  };

  return (
    <div className="w-full rounded-2xl p-4 space-y-3.5 select-none border border-outline-variant/30 shadow-sm bg-surface-container-lowest">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-700">
            <LineChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface uppercase font-mono tracking-wider flex items-center gap-2">
              V-I Precision Curve Tracer
              <span className="text-[10px] text-teal-700 font-mono font-semibold">
                [PLOT: V vs I]
              </span>
            </h3>
            <p className="text-[11px] text-on-surface-variant font-sans">
              Cartesian linear coordinate plane with least-squares regression and uncertainty error bounds.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleBestFit}
            disabled={!isUnlocked}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border ${
              showBestFit
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                : 'bg-surface-container text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-high hover:text-on-surface disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {showBestFit ? 'BEST FIT (ACTIVE)' : 'REGRESSION LINE'}
          </button>

          {isUnlocked && showBestFit && (
            <button
              onClick={() => onOpenVerificationModal(slope, percentError)}
              className="px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all transform active:scale-95 border-none"
            >
              <CheckCircle2 className="w-4 h-4" />
              VERIFY LAW
            </button>
          )}
        </div>
      </div>

      {/* Main Oscilloscope / Plotter Canvas */}
      <div className="relative w-full rounded-xl bg-[#060814] border border-cyan-500/30 p-2 flex flex-col items-center justify-center overflow-hidden shadow-[inset_0_0_25px_rgba(6,182,212,0.12)]">
        {/* Reticle / Screen Corner Labels */}
        <div className="absolute top-2 left-3 text-[10px] font-mono text-cyan-400 select-none">
          CH-1: VOLTS/DIV [2.0V] • CH-2: CURR/DIV [50mA]
        </div>
        <div className="absolute top-2 right-3 text-[10px] font-mono text-slate-500 select-none">
          COUPLING: DC • SCALE: LINEAR
        </div>

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-2xl h-auto select-none font-mono"
        >
          <defs>
            {/* Fine Graph Pattern */}
            <pattern id="fineGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(56, 189, 248, 0.08)" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Background Grid Pattern */}
          <rect
            x={padding.left}
            y={padding.top}
            width={plotW}
            height={plotH}
            fill="url(#fineGrid)"
          />

          {/* Major Grid Lines (Voltage Y) */}
          {[0, 2, 4, 6, 8, 10, 12].map(v => (
            <g key={v}>
              <line
                x1={padding.left}
                y1={getY(v)}
                x2={width - padding.right}
                y2={getY(v)}
                stroke="rgba(148, 163, 184, 0.15)"
                strokeDasharray="2 2"
              />
              <text
                x={padding.left - 8}
                y={getY(v) + 3.5}
                fill="#94a3b8"
                fontSize="9"
                textAnchor="end"
                fontFamily="monospace"
              >
                {v}V
              </text>
            </g>
          ))}

          {/* Major Grid Lines (Current X) */}
          {[0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30].filter(i => i <= maxI).map(i => (
            <g key={i}>
              <line
                x1={getX(i)}
                y1={padding.top}
                x2={getX(i)}
                y2={height - padding.bottom}
                stroke="rgba(148, 163, 184, 0.15)"
                strokeDasharray="2 2"
              />
              <text
                x={getX(i)}
                y={height - padding.bottom + 16}
                fill="#94a3b8"
                fontSize="9"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {i.toFixed(2)}A
              </text>
            </g>
          ))}

          {/* Solid Axes with Reticle Ticks */}
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeOpacity="0.8"
          />

          {/* Axis Titles */}
          <text
            x={width / 2}
            y={height - 10}
            fill="#fbbf24"
            fontSize="10"
            fontWeight="bold"
            letterSpacing="0.05em"
            textAnchor="middle"
          >
            CURRENT I (AMPERES) →
          </text>

          <text
            x={-height / 2}
            y={18}
            transform="rotate(-90)"
            fill="#34d399"
            fontSize="10"
            fontWeight="bold"
            letterSpacing="0.05em"
            textAnchor="middle"
          >
            POTENTIAL V (VOLTS) →
          </text>

          {/* Least Squares Regression Line (V = mI) */}
          {showBestFit && trials.length >= 2 && (
            <g>
              <line
                x1={getX(0)}
                y1={getY(0)}
                x2={getX(maxI)}
                y2={getY(slope * maxI)}
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeDasharray="4 2"
                style={{ filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))' }}
              />
            </g>
          )}

          {/* Live Operating Point Dot */}
          {liveVoltage !== undefined && liveCurrent !== undefined && liveVoltage > 0 && liveCurrent > 0 && (
            <g className="pointer-events-none">
              <circle
                cx={getX(liveCurrent)}
                cy={getY(liveVoltage)}
                r="10"
                fill="none"
                stroke="#34d399"
                strokeWidth="1"
                opacity="0.6"
                className="animate-ping"
              />
              <circle
                cx={getX(liveCurrent)}
                cy={getY(liveVoltage)}
                r="4"
                fill="#34d399"
                stroke="#ffffff"
                strokeWidth="1.5"
                style={{ filter: 'drop-shadow(0 0 6px rgba(52, 211, 153, 0.8))' }}
              />
              <text
                x={getX(liveCurrent) + 8}
                y={getY(liveVoltage) - 6}
                fill="#34d399"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                LIVE: ({liveCurrent.toFixed(3)}A, {liveVoltage.toFixed(1)}V)
              </text>
            </g>
          )}

          {/* Plotted Trial Data Points with Error Crosses */}
          {trials.map((t, idx) => {
            const cx = getX(t.current);
            const cy = getY(t.voltage);
            const isHovered = hoveredPoint?.id === t.id;

            return (
              <g
                key={t.id}
                onMouseEnter={() => setHoveredPoint(t)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer group"
              >
                {/* Horizontal & Vertical Error Bars (±0.005A, ±0.1V instrument uncertainty) */}
                <line
                  x1={getX(Math.max(0, t.current - 0.005))}
                  y1={cy}
                  x2={getX(t.current + 0.005)}
                  y2={cy}
                  stroke="#38bdf8"
                  strokeWidth="1"
                  opacity="0.8"
                />
                <line
                  x1={cx}
                  y1={getY(Math.max(0, t.voltage - 0.15))}
                  x2={cx}
                  y2={getY(t.voltage + 0.15)}
                  stroke="#38bdf8"
                  strokeWidth="1"
                  opacity="0.8"
                />

                {/* Outer Reticle Halo */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 8 : 6}
                  fill="none"
                  stroke={isHovered ? '#fbbf24' : '#38bdf8'}
                  strokeWidth="1.5"
                  style={{ filter: isHovered ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))' : 'drop-shadow(0 0 4px rgba(56, 189, 248, 0.5))' }}
                />

                {/* Center Core Dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={2.5}
                  fill={isHovered ? '#fbbf24' : '#38bdf8'}
                />

                {/* Trial Coordinate Tag */}
                <text
                  x={cx + 7}
                  y={cy - 5}
                  fill="#94a3b8"
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  T{idx + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Telemetry Crosshair Card */}
        {hoveredPoint && (
          <div className="absolute top-8 right-4 p-3 rounded-xl bg-slate-900/90 border border-amber-400/60 shadow-xl text-xs font-mono select-none text-slate-100 backdrop-blur-md">
            <div className="text-amber-400 font-bold mb-1 text-[11px] flex items-center gap-1">
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
              TRIAL TELEMETRY
            </div>
            <div>V = <span className="text-emerald-400 font-bold">{hoveredPoint.voltage.toFixed(2)} V</span></div>
            <div>I = <span className="text-amber-400 font-bold">{hoveredPoint.current.toFixed(3)} A</span></div>
            <div>R = <span className="text-cyan-400 font-bold">{hoveredPoint.calculatedResistance.toFixed(2)} Ω</span></div>
          </div>
        )}
      </div>

      {/* Regression Slope & Statistics Banner */}
      {showBestFit && trials.length >= 2 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-3 rounded-xl bg-surface-container border border-outline-variant/20 text-xs font-mono">
          <div>
            <span className="text-on-surface-variant block text-[10px] uppercase">Slope (ΔV / ΔI)</span>
            <span className="text-base font-bold text-teal-800 font-mono">{slope.toFixed(2)} Ω</span>
          </div>
          <div>
            <span className="text-on-surface-variant block text-[10px] uppercase">Linearity R²</span>
            <span className="text-base font-bold text-emerald-800 font-mono">{rSquared.toFixed(4)}</span>
          </div>
          <div>
            <span className="text-on-surface-variant block text-[10px] uppercase">Nominal Standard</span>
            <span className="text-base font-bold text-on-surface font-mono">{nominalResistance.toFixed(0)} Ω</span>
          </div>
          <div>
            <span className="text-on-surface-variant block text-[10px] uppercase">Deviation Error</span>
            <span className={`text-base font-bold font-mono ${percentError < 3.0 ? 'text-emerald-800' : 'text-rose-800'}`}>
              {percentError.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {/* Engineering Footnote */}
      <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant font-mono">
        <HelpCircle className="w-3.5 h-3.5 text-teal-600 shrink-0" />
        <span>
          Mathematical formulation: V = I·R. The linear regression gradient m directly establishes conductor resistance R = ΔV / ΔI.
        </span>
      </div>
    </div>
  );
};
