import React from 'react';
import { Cpu } from 'lucide-react';
import { sounds } from '../../engine/audioEffects';

export const ResistorSelector = ({
  resistance,
  setResistance,
  options = [10, 20, 50, 100],
}) => {
  const getColorBands = (r) => {
    switch (r) {
      case 10:
        return { band1: '#964B00', band2: '#000000', band3: '#000000', band4: '#D4AF37' };
      case 20:
        return { band1: '#FF0000', band2: '#000000', band3: '#000000', band4: '#D4AF37' };
      case 50:
        return { band1: '#008000', band2: '#000000', band3: '#000000', band4: '#D4AF37' };
      case 100:
        return { band1: '#964B00', band2: '#000000', band3: '#964B00', band4: '#D4AF37' };
      default:
        return { band1: '#964B00', band2: '#000000', band3: '#964B00', band4: '#D4AF37' };
    }
  };

  const bands = getColorBands(resistance);

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-slate-900 to-[#0c1424] border border-sky-500/30 p-4 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
            <Cpu className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-white tracking-wide uppercase font-mono">
            Test Resistor Bank
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 text-[10px] font-mono">
          OHMIC LOAD
        </span>
      </div>

      {/* Realistic Skeuomorphic Resistor Graphic with Color Code Bands */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Terminal Lead wires */}
        <div className="w-full flex items-center justify-center relative">
          <div className="w-16 h-1 bg-slate-400 rounded-l" />

          {/* Resistor Body */}
          <div className="relative w-40 h-10 bg-amber-100 rounded-full border-2 border-amber-300 shadow-md flex items-center justify-around px-4">
            <div className="w-2.5 h-full" style={{ backgroundColor: bands.band1 }} title="Significant Digit 1" />
            <div className="w-2.5 h-full" style={{ backgroundColor: bands.band2 }} title="Significant Digit 2" />
            <div className="w-2.5 h-full" style={{ backgroundColor: bands.band3 }} title="Multiplier" />
            <div className="w-4" />
            <div className="w-2.5 h-full" style={{ backgroundColor: bands.band4 }} title="Tolerance (±5%)" />
          </div>

          <div className="w-16 h-1 bg-slate-400 rounded-r" />
        </div>

        {/* Resistance Value Readout */}
        <div className="mt-3 flex items-baseline gap-1 font-mono">
          <span className="text-2xl font-black text-sky-400">{resistance}</span>
          <span className="text-sm font-bold text-slate-300">Ω</span>
          <span className="text-xs text-slate-500 ml-2">(±5% Tolerance)</span>
        </div>
      </div>

      {/* Resistor Selector Chips */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-mono text-slate-400 block">Select Nominal Resistor:</span>
        <div className="grid grid-cols-4 gap-2">
          {options.map((r) => (
            <button
              key={r}
              onClick={() => {
                setResistance(r);
                sounds.playTick();
              }}
              className={`py-2 rounded-xl text-xs font-mono font-bold border transition-all ${
                resistance === r
                  ? 'bg-sky-500 text-slate-950 border-sky-400 shadow-glow-cyan scale-105'
                  : 'bg-slate-800/80 text-slate-300 border-white/5 hover:bg-slate-700 hover:text-white'
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
