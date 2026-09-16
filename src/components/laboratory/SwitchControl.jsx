import React from 'react';
import { ToggleRight, Power } from 'lucide-react';
import { sounds } from '../../engine/audioEffects';

export const SwitchControl = ({
  isClosed,
  setIsClosed,
  disabled = false,
}) => {
  const toggle = () => {
    if (disabled) return;
    const nextState = !isClosed;
    setIsClosed(nextState);
    sounds.playSwitch(nextState);
  };

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-slate-900 to-[#0c1424] border border-white/10 p-4 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
            <ToggleRight className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-white tracking-wide uppercase font-mono">
            Key Switch
          </span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
          isClosed 
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
            : 'bg-slate-800 text-slate-400 border-white/10'
        }`}>
          {isClosed ? 'CIRCUIT CLOSED (ON)' : 'CIRCUIT OPEN (OFF)'}
        </span>
      </div>

      {/* Interactive Physical Switch Blade Graphic */}
      <div 
        onClick={toggle}
        className={`bg-slate-950 p-4 rounded-xl border cursor-pointer select-none transition-all flex flex-col items-center justify-center relative overflow-hidden group ${
          isClosed ? 'border-emerald-500/40 shadow-glow-emerald' : 'border-slate-800 hover:border-slate-700'
        }`}
        title="Click to toggle switch state"
      >
        <div className="relative w-48 h-16 flex items-center justify-between px-6">
          <div className="w-4 h-6 rounded bg-amber-600 border-2 border-amber-400 shadow-md flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-slate-900" />
          </div>

          <div 
            className="absolute left-10 w-28 h-2 bg-gradient-to-r from-amber-400 to-amber-300 origin-left transition-transform duration-200 rounded shadow-md z-10"
            style={{
              transform: isClosed ? 'rotate(0deg)' : 'rotate(-32deg)',
            }}
          >
            <div className="absolute right-0 top-[-6px] w-5 h-5 rounded-full bg-rose-600 border border-rose-400 shadow-sm" />
          </div>

          <div className="w-4 h-6 rounded bg-amber-600 border-2 border-amber-400 shadow-md flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-slate-900" />
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <Power className={`w-3.5 h-3.5 ${isClosed ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span className="text-xs font-mono text-slate-300 group-hover:text-white transition-colors">
            {isClosed ? 'Click to OPEN circuit' : 'Click to CLOSE circuit'}
          </span>
        </div>
      </div>
    </div>
  );
};
