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
    <div className="w-full rounded-2xl lab-chassis p-4 select-none relative overflow-hidden flex flex-col justify-between">
      {/* Fastener Screws */}
      <div className="absolute top-2 left-2 screw-head" />
      <div className="absolute top-2 right-2 screw-head" />
      <div className="absolute bottom-2 left-2 screw-head" />
      <div className="absolute bottom-2 right-2 screw-head" />

      {/* Header & Anodized Nameplate */}
      <div className="flex items-center justify-between border-b border-chassis-border/80 pb-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-chassis-raised border border-chassis-border text-slate-300">
            <ToggleRight className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              HEAVY-DUTY KNIFE SWITCH
            </div>
            <div className="text-[10px] font-mono text-slate-400">SINGLE-POLE SINGLE-THROW (SPST)</div>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
          isClosed 
            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40' 
            : 'bg-chassis-raised text-slate-400 border-chassis-border'
        }`}>
          {isClosed ? 'CIRCUIT CLOSED' : 'CIRCUIT OPEN'}
        </span>
      </div>

      {/* Interactive Physical Copper Knife Switch Graphic */}
      <div 
        onClick={toggle}
        className={`p-4 rounded-xl lab-inset border cursor-pointer select-none transition-all flex flex-col items-center justify-center relative overflow-hidden group mb-3 ${
          isClosed ? 'border-emerald-500/50 shadow-inner' : 'border-slate-800 hover:border-slate-700'
        }`}
        title="Click to toggle mechanical knife switch"
      >
        <div className="relative w-52 h-20 flex items-center justify-between px-6">
          {/* Left Brass Contact Jaw Socket */}
          <div className="w-6 h-8 rounded-sm bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 border border-amber-300 shadow-md flex items-center justify-center relative">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-amber-300" />
            <div className="absolute -bottom-2 text-[8px] font-mono text-slate-400">IN</div>
          </div>

          {/* Hinged Solid Copper Knife Blade with Insulated Bakelite Knob */}
          <div 
            className="absolute left-11 w-32 h-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 origin-left transition-transform duration-200 ease-out rounded-sm shadow-lg z-10 border border-amber-300"
            style={{
              transform: isClosed ? 'rotate(0deg)' : 'rotate(-36deg)',
            }}
          >
            {/* Insulated Bakelite Ball Handle */}
            <div className="absolute right-0 -top-2 w-7 h-7 rounded-full bg-gradient-to-b from-rose-700 to-rose-950 border-2 border-rose-400 shadow-md flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-rose-400/80" />
            </div>
          </div>

          {/* Right Brass Spring-Loaded Catch Jaw */}
          <div className="w-6 h-8 rounded-sm bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 border border-amber-300 shadow-md flex items-center justify-center relative">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-amber-300" />
            <div className="absolute -bottom-2 text-[8px] font-mono text-slate-400">OUT</div>
          </div>
        </div>

        {/* State Callout */}
        <div className="mt-2 flex items-center gap-2">
          <Power className={`w-3.5 h-3.5 ${isClosed ? 'text-emerald-400' : 'text-slate-500'}`} />
          <span className="text-xs font-mono font-semibold text-slate-300 group-hover:text-white transition-colors">
            {isClosed ? 'CLICK TO OPEN SWITCH' : 'CLICK TO CLOSE SWITCH'}
          </span>
        </div>
      </div>

      {/* Safety Compliance & Operation Rule */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1 pt-1 border-t border-chassis-border/60">
        <span>RATED: 250V / 10A DC</span>
        <span className="text-amber-400/90 font-medium flex items-center gap-1">
          <ShieldAlert className="w-3 h-3" />
          DISCONNECT BEFORE REWIRING
        </span>
      </div>
    </div>
  );
};
