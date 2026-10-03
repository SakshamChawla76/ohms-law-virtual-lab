import React from 'react';
import { ToggleRight, Power, ShieldAlert } from 'lucide-react';
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
    <div className="w-full rounded-2xl p-4 select-none relative overflow-hidden flex flex-col justify-between border border-outline-variant/30 shadow-sm bg-surface-container-lowest">
      {/* Fastener Screws */}
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-slate-300 border border-slate-400 shadow-inner" />
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-300 border border-slate-400 shadow-inner" />
      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-slate-300 border border-slate-400 shadow-inner" />
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-slate-300 border border-slate-400 shadow-inner" />

      {/* Header & Anodized Nameplate */}
      <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-700">
            <ToggleRight className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-on-surface uppercase tracking-wider font-mono">
              HEAVY-DUTY KNIFE SWITCH
            </div>
            <div className="text-[10px] font-mono text-on-surface-variant">SINGLE-POLE SINGLE-THROW (SPST)</div>
          </div>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-all ${
          isClosed 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
            : 'bg-surface-container text-on-surface-variant border-outline-variant/30'
        }`}>
          {isClosed ? 'CIRCUIT CLOSED' : 'CIRCUIT OPEN'}
        </span>
      </div>

      {/* Interactive Physical Copper Knife Switch Graphic */}
      <div 
        onClick={toggle}
        className={`p-4 rounded-xl bg-black/40 border cursor-pointer select-none transition-all flex flex-col items-center justify-center relative overflow-hidden group mb-3 ${
          isClosed 
            ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
            : 'border-white/5 hover:border-white/20'
        }`}
        title="Click to toggle mechanical knife switch"
      >
        <div className="relative w-52 h-20 flex items-center justify-between px-6">
          {/* Left Brass Contact Jaw Socket */}
          <div className="w-6 h-8 rounded-sm bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 border border-amber-400 shadow-md flex items-center justify-center relative">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-amber-300" />
            <div className="absolute -bottom-2 text-[8px] font-mono text-amber-300 font-bold">IN</div>
          </div>

          {/* Hinged Solid Copper Knife Blade with Insulated Bakelite Knob */}
          <div 
            className="absolute left-11 w-32 h-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 origin-left transition-transform duration-200 ease-out rounded-sm shadow-lg z-10 border border-amber-300"
            style={{
              transform: isClosed ? 'rotate(0deg)' : 'rotate(-36deg)',
            }}
          >
            {/* Insulated Bakelite Ball Handle */}
            <div className="absolute right-0 -top-2 w-7 h-7 rounded-full bg-gradient-to-b from-rose-500 to-rose-700 border-2 border-rose-300 shadow-md flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-rose-200" />
            </div>
          </div>

          {/* Right Brass Spring-Loaded Catch Jaw */}
          <div className="w-6 h-8 rounded-sm bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 border border-amber-400 shadow-md flex items-center justify-center relative">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-amber-300" />
            <div className="absolute -bottom-2 text-[8px] font-mono text-amber-300 font-bold">OUT</div>
          </div>
        </div>

        {/* State Callout */}
        <div className="mt-2 flex items-center gap-2">
          <Power className={`w-3.5 h-3.5 ${isClosed ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="text-xs font-mono font-semibold text-slate-300 group-hover:text-white transition-colors">
            {isClosed ? 'CLICK TO OPEN SWITCH' : 'CLICK TO CLOSE SWITCH'}
          </span>
        </div>
      </div>

      {/* Safety Compliance & Operation Rule */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1 pt-1.5 border-t border-white/10">
        <span>RATED: 250V / 10A DC</span>
        <span className="text-amber-400 font-medium flex items-center gap-1">
          <ShieldAlert className="w-3 h-3" />
          DISCONNECT BEFORE REWIRING
        </span>
      </div>
    </div>
  );
};
