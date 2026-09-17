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
        return { band1: '#78350f', band2: '#000000', band3: '#000000', band4: '#eab308' };
      case 20:
        return { band1: '#dc2626', band2: '#000000', band3: '#000000', band4: '#eab308' };
      case 50:
        return { band1: '#16a34a', band2: '#000000', band3: '#000000', band4: '#eab308' };
      case 100:
        return { band1: '#78350f', band2: '#000000', band3: '#78350f', band4: '#eab308' };
      default:
        return { band1: '#78350f', band2: '#000000', band3: '#78350f', band4: '#eab308' };
    }
  };

  const bands = getColorBands(resistance);

  return (
    <div className="w-full rounded-2xl lab-chassis p-4 select-none relative overflow-hidden flex flex-col justify-between">
      {/* Fastener Screws */}
      <div className="absolute top-2 left-2 screw-head" />
      <div className="absolute top-2 right-2 screw-head" />
      <div className="absolute bottom-2 left-2 screw-head" />
      <div className="absolute bottom-2 right-2 screw-head" />

      {/* Header & Anodized Nameplate */}
      <div className="flex items-center justify-between border-b border-chassis-border/80 pb-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-chassis-raised border border-chassis-border text-cyan-400">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              STANDARD RESISTOR BANK
            </div>
            <div className="text-[10px] font-mono text-slate-400">CERAMIC WIRE-WOUND • 50W</div>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-chassis-raised border border-chassis-border text-cyan-300 text-[10px] font-mono font-bold">
          OHMIC LOAD
        </span>
      </div>

      {/* Heavy-Duty Ceramic Vitreous Tube Resistor Graphic */}
      <div className="p-3.5 rounded-xl lab-inset border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden mb-3">
        {/* Ceramic Mounting Standoff Brackets */}
        <div className="w-full flex items-center justify-center relative py-2">
          {/* Left Standoff Lug */}
          <div className="w-5 h-8 bg-gradient-to-r from-slate-400 to-slate-300 rounded-l border border-slate-600 shadow-sm flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
          </div>

          {/* Thick Ceramic Vitreous Tube Core */}
          <div className="relative w-44 h-12 rounded-lg bg-gradient-to-b from-[#f8fafc] via-[#e2e8f0] to-[#cbd5e1] border-2 border-slate-400 shadow-md flex items-center justify-between px-3 overflow-hidden">
            {/* Fine Nichrome Wire Coil Grooves */}
            <div className="absolute inset-0 opacity-15 flex justify-between px-1 pointer-events-none">
              {Array.from({ length: 22 }).map((_, idx) => (
                <div key={idx} className="w-[2px] h-full bg-slate-950" />
              ))}
            </div>

            {/* Precision EIA Identification Bands */}
            <div className="relative z-10 flex items-center justify-between w-full px-2">
              <div className="flex gap-2">
                <div className="w-3 h-11 rounded-sm shadow-sm" style={{ backgroundColor: bands.band1 }} title="1st Significant Digit" />
                <div className="w-3 h-11 rounded-sm shadow-sm" style={{ backgroundColor: bands.band2 }} title="2nd Significant Digit" />
                <div className="w-3 h-11 rounded-sm shadow-sm" style={{ backgroundColor: bands.band3 }} title="Multiplier" />
              </div>
              <div className="w-3 h-11 rounded-sm shadow-sm" style={{ backgroundColor: bands.band4 }} title="Tolerance (Gold ±5%)" />
            </div>
          </div>

          {/* Right Standoff Lug */}
          <div className="w-5 h-8 bg-gradient-to-r from-slate-300 to-slate-400 rounded-r border border-slate-600 shadow-sm flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
          </div>
        </div>

        {/* Value Readout & Specification Badge */}
        <div className="mt-2 flex items-center justify-between w-full px-2 pt-1 border-t border-slate-800/80 font-mono">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-cyan-300 font-digital">{resistance}</span>
            <span className="text-xs font-bold text-slate-300">Ω</span>
            <span className="text-[10px] text-slate-500 ml-1">(±5% TOL)</span>
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
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md font-extrabold scale-102'
                  : 'bg-chassis-raised text-slate-300 border-chassis-border hover:bg-slate-700 hover:text-white'
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
