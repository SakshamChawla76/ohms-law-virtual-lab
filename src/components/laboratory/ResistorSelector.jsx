import React from 'react';
import { Cpu, Flame } from 'lucide-react';
import { sounds } from '../../engine/audioEffects';

export const ResistorSelector = ({
  resistance,
  setResistance,
  options = [10, 20, 50, 100],
}) => {
  const getColorBands = (r) => {
    switch (r) {
      case 10:
        return { band1: '#92400e', band2: '#000000', band3: '#000000', band4: '#facc15' };
      case 20:
        return { band1: '#ef4444', band2: '#000000', band3: '#000000', band4: '#facc15' };
      case 50:
        return { band1: '#22c55e', band2: '#000000', band3: '#000000', band4: '#facc15' };
      case 100:
        return { band1: '#92400e', band2: '#000000', band3: '#92400e', band4: '#facc15' };
      default:
        return { band1: '#92400e', band2: '#000000', band3: '#92400e', band4: '#facc15' };
    }
  };

  const bands = getColorBands(resistance);

  return (
    <div className="w-full rounded-2xl glass-card p-4 select-none relative overflow-hidden flex flex-col justify-between border border-white/10 shadow-xl bg-slate-900/60 backdrop-blur-xl">
      {/* Fastener Screws */}
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-slate-700 border border-slate-600 shadow-inner" />
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-700 border border-slate-600 shadow-inner" />
      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-slate-700 border border-slate-600 shadow-inner" />
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-slate-700 border border-slate-600 shadow-inner" />

      {/* Header & Anodized Nameplate */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
              STANDARD RESISTOR BANK
            </div>
            <div className="text-[10px] font-mono text-slate-400">CERAMIC WIRE-WOUND • 50W</div>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]">
          OHMIC LOAD
        </span>
      </div>

      {/* Heavy-Duty Ceramic Vitreous Tube Resistor Graphic */}
      <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex flex-col items-center justify-center relative overflow-hidden mb-3">
        {/* Ceramic Mounting Standoff Brackets */}
        <div className="w-full flex items-center justify-center relative py-2">
          {/* Left Standoff Lug */}
          <div className="w-5 h-8 bg-gradient-to-r from-slate-700 to-slate-600 rounded-l border border-slate-600 shadow-sm flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
          </div>

          {/* Thick Ceramic Vitreous Tube Core */}
          <div className="relative w-44 h-12 rounded-lg bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800 border-2 border-slate-600 shadow-inner flex items-center justify-between px-3 overflow-hidden">
            {/* Fine Nichrome Wire Coil Grooves */}
            <div className="absolute inset-0 opacity-20 flex justify-between px-1 pointer-events-none">
              {Array.from({ length: 22 }).map((_, idx) => (
                <div key={idx} className="w-[2px] h-full bg-cyan-300" />
              ))}
            </div>

            {/* Precision EIA Identification Bands */}
            <div className="relative z-10 flex items-center justify-between w-full px-2">
              <div className="flex gap-2">
                <div className="w-3 h-11 rounded-sm shadow-md" style={{ backgroundColor: bands.band1 }} title="1st Significant Digit" />
                <div className="w-3 h-11 rounded-sm shadow-md" style={{ backgroundColor: bands.band2 }} title="2nd Significant Digit" />
                <div className="w-3 h-11 rounded-sm shadow-md" style={{ backgroundColor: bands.band3 }} title="Multiplier" />
              </div>
              <div className="w-3 h-11 rounded-sm shadow-md" style={{ backgroundColor: bands.band4 }} title="Tolerance (Gold ±5%)" />
            </div>
          </div>

          {/* Right Standoff Lug */}
          <div className="w-5 h-8 bg-gradient-to-r from-slate-600 to-slate-700 rounded-r border border-slate-600 shadow-sm flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
          </div>
        </div>

        {/* Value Readout & Specification Badge */}
        <div className="mt-2 flex items-center justify-between w-full px-2 pt-2 border-t border-white/5 font-mono">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] font-mono">{resistance}</span>
            <span className="text-xs font-bold text-cyan-300">Ω</span>
            <span className="text-[10px] text-slate-400 ml-1">(±5% TOL)</span>
          </div>
          <div className="text-[10px] text-slate-400 font-bold">
            MAX 50W • NON-INDUCTIVE
          </div>
        </div>
      </div>

      {/* Tactile Rotary Resistor Selection Keys */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-mono text-slate-400 block uppercase">SELECT NOMINAL VALUE:</span>
        <div className="grid grid-cols-4 gap-2">
          {options.map((r) => (
            <button
              key={r}
              onClick={() => {
                setResistance(r);
                sounds.playTick();
              }}
              className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all active:translate-y-0.5 ${
                resistance === r
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.3)] font-extrabold scale-102'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {r} Ω
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
