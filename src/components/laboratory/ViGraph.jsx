import React, { useState } from 'react';
import { LineChart, Sparkles, HelpCircle, CheckCircle2 } from 'lucide-react';
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

  // Axis scales: Current (X) 0 to 0.30 A (or max recorded * 1.2), Voltage (Y) 0 to 12 V
  const maxI = Math.max(0.25, ...trials.map(t => t.current * 1.2));
  const maxV = Math.max(10.0, ...trials.map(t => t.voltage * 1.15));

  const getX = (i) => padding.left + (i / maxI) * plotW;
  const getY = (v) => padding.top + plotH - (v / maxV) * plotH;

  // Calculate Linear Regression (Best Fit Line passing through or near origin)
  let slope = 0;
  let percentError = 0;

  if (trials.length >= 2) {
    const n = trials.length;
    const sumI = trials.reduce((acc, t) => acc + t.current, 0);
    const sumV = trials.reduce((acc, t) => acc + t.voltage, 0);
    const meanI = sumI / n;
    const meanV = sumV / n;

    let num = 0;
    let den = 0;
    trials.forEach(t => {
      num += (t.current - meanI) * (t.voltage - meanV);
      den += (t.current - meanI) * (t.current - meanI);
    });

    slope = den !== 0 ? num / den : nominalResistance;
    percentError = Math.abs(slope - nominalResistance) / nominalResistance * 100;
  }

  const isUnlocked = trials.length >= minRequired;

  const toggleBestFit = () => {
    setShowBestFit(!showBestFit);
    sounds.playSuccess();
  };

  return (
    <div className="w-full rounded-3xl glass-panel border border-white/10 p-5 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
            <LineChart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              V-I Characteristic Graph
              <span className="text-xs text-slate-400 font-mono font-normal">
                (Voltage vs Current)
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Y-axis represents Voltage (V); X-axis represents Current (I).
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleBestFit}
            disabled={!isUnlocked}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1.5 border ${
              showBestFit
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-glow-amber'
                : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {showBestFit ? 'Best Fit Line (Active)' : 'Draw Best Fit Line'}
          </button>

          {isUnlocked && showBestFit && (
            <button
              onClick={() => onOpenVerificationModal(slope, percentError)}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-glow-emerald transition-all transform active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              Verify Ohm's Law
            </button>
          )}
        </div>
      </div>

      {/* Main SVG Graph Canvas */}
      <div className="relative w-full rounded-2xl bg-slate-950/80 border border-white/10 p-2 flex flex-col items-center justify-center overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full max-w-2xl h-auto select-none font-mono"
        >
          {/* Grid lines */}
          {[0, 2, 4, 6, 8, 10, 12].map(v => (
            <g key={v}>
              <line
                x1={padding.left}
                y1={getY(v)}
                x2={width - padding.right}
                y2={getY(v)}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="3 3"
              />
              <text
                x={padding.left - 10}
                y={getY(v) + 4}
                fill="#64748b"
                fontSize="10"
                textAnchor="end"
              >
                {v}V
              </text>
            </g>
          ))}

          {[0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30].filter(i => i <= maxI).map(i => (
            <g key={i}>
              <line
                x1={getX(i)}
                y1={padding.top}
                x2={getX(i)}
                y2={height - padding.bottom}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="3 3"
              />
              <text
                x={getX(i)}
                y={height - padding.bottom + 18}
                fill="#64748b"
                fontSize="10"
                textAnchor="middle"
              >
                {i.toFixed(2)}A
              </text>
            </g>
          ))}

          {/* Axes */}
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="#94a3b8"
            strokeWidth="2"
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="#94a3b8"
            strokeWidth="2"
          />

          {/* Axis Labels */}
          <text
            x={width / 2}
            y={height - 12}
            fill="#ffb300"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
          >
            Current I (Amperes) →
          </text>

          <text
            x={-height / 2}
            y={20}
            transform="rotate(-90)"
            fill="#00f2fe"
            fontSize="12"
            fontWeight="bold"
            textAnchor="middle"
          >
            Potential Difference V (Volts) →
          </text>

          {/* Best Fit Line */}
          {showBestFit && trials.length >= 2 && (
            <g>
              <line
                x1={getX(0)}
                y1={getY(0)}
                x2={getX(maxI)}
                y2={getY(slope * maxI)}
                stroke="#ffb300"
                strokeWidth="2.5"
                strokeDasharray="4 4"
              />
            </g>
          )}

          {/* Live Operating Point (CK-12 Dynamic Graph Tracker) */}
          {liveVoltage !== undefined && liveCurrent !== undefined && liveVoltage > 0 && liveCurrent > 0 && (
            <g className="pointer-events-none">
              <circle
                cx={getX(liveCurrent)}
                cy={getY(liveVoltage)}
                r="12"
                fill="rgba(0, 245, 160, 0.2)"
                className="animate-ping"
              />
              <circle
                cx={getX(liveCurrent)}
                cy={getY(liveVoltage)}
                r="5.5"
                fill="#00f5a0"
                stroke="#ffffff"
                strokeWidth="2"
              />
              <text
                x={getX(liveCurrent) + 9}
                y={getY(liveVoltage) - 8}
                fill="#00f5a0"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                Live: ({liveCurrent.toFixed(3)}A, {liveVoltage.toFixed(1)}V)
              </text>
            </g>
          )}

          {/* Plotted Data Points */}
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
                {/* Glow ring */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 10 : 7}
                  fill={isHovered ? 'rgba(0, 242, 254, 0.4)' : 'rgba(0, 242, 254, 0.2)'}
                  className="transition-all"
                />
                {/* Inner point */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={4.5}
                  fill="#00f2fe"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                {/* Trial label */}
                <text
                  x={cx + 8}
                  y={cy - 6}
                  fill="#cbd5e1"
                  fontSize="9"
                  fontWeight="bold"
                >
                  T{idx + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Coordinate Card */}
        {hoveredPoint && (
          <div className="absolute top-4 right-4 p-2.5 rounded-xl bg-slate-900/90 border border-cyan-400 backdrop-blur-md shadow-glow-cyan text-xs font-mono">
            <div className="text-cyan-300 font-bold mb-1">Trial Point Details</div>
            <div>Voltage (V): <span className="text-white">{hoveredPoint.voltage.toFixed(2)} V</span></div>
            <div>Current (I): <span className="text-white">{hoveredPoint.current.toFixed(3)} A</span></div>
            <div>Ratio R = V/I: <span className="text-emerald-400 font-bold">{hoveredPoint.calculatedResistance.toFixed(2)} Ω</span></div>
          </div>
        )}
      </div>

      {/* Slope & Experimental Error Analysis Summary */}
      {showBestFit && trials.length >= 2 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950/60 border border-amber-500/30 text-xs font-mono animate-fadeIn">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Graph Slope (ΔV / ΔI)</span>
            <span className="text-lg font-bold text-amber-400">{slope.toFixed(2)} V/A (Ω)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Experimental Resistance</span>
            <span className="text-lg font-bold text-cyan-400">{slope.toFixed(2)} Ω</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Nominal Resistor Value</span>
            <span className="text-lg font-bold text-slate-200">{nominalResistance.toFixed(0)} Ω</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Percentage Error</span>
            <span className={`text-lg font-bold ${percentError < 3.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {percentError.toFixed(2)} %
            </span>
          </div>
        </div>
      )}

      {/* Helper text */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
        <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
        <span>
          Since V = IR, the slope of the V vs I plot directly yields the experimental resistance: R = ΔV / ΔI.
        </span>
      </div>
    </div>
  );
};
