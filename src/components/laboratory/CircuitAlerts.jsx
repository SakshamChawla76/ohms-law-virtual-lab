import React from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Flame, 
  Sparkles 
} from 'lucide-react';

export const CircuitAlerts = ({ analysis }) => {
  const { state, statusTitle, message, pedagogicalFix, isValid, isShortCircuit } = analysis;

  if (state === 'ACTIVE' && isValid) {
    return (
      <div className="p-3 rounded-xl bg-[#0b1b14] border border-emerald-500/40 text-emerald-300 flex items-start gap-3 shadow-inner">
        <div className="p-1.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 shrink-0 mt-0.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-bold text-emerald-300 font-mono tracking-wide uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-led-emerald animate-pulse" />
            ANNUNCIATOR: {statusTitle}
          </div>
          <p className="text-slate-300 leading-relaxed font-sans">{message}</p>
          {pedagogicalFix && (
            <p className="text-amber-300 font-mono text-[11px] mt-1 bg-black/40 px-2 py-1 rounded border border-amber-500/20">
              💡 {pedagogicalFix}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (isShortCircuit || state === 'SHORT_CIRCUIT' || state === 'AMMETER_PARALLEL') {
    return (
      <div className="p-3 rounded-xl bg-[#230d10] border-2 border-rose-500/80 text-rose-200 flex items-start gap-3 shadow-led-red">
        <div className="p-1.5 rounded bg-rose-950 text-rose-400 shrink-0 mt-0.5 border border-rose-600">
          <Flame className="w-4 h-4 animate-bounce" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-mono font-black text-rose-300 tracking-wider uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-led-red animate-ping" />
            CRITICAL FAULT: {statusTitle}
          </div>
          <p className="text-slate-200 leading-relaxed font-medium">{message}</p>
          {pedagogicalFix && (
            <div className="text-amber-200 text-xs mt-1.5 bg-black/50 p-2 rounded border border-rose-500/40 font-mono">
              <strong className="text-amber-400 uppercase">[RECOVERY PROCEDURE]:</strong> {pedagogicalFix}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (state === 'VOLTMETER_SERIES') {
    return (
      <div className="p-3 rounded-xl bg-[#221708] border border-amber-500/60 text-amber-200 flex items-start gap-3">
        <div className="p-1.5 rounded bg-amber-950 text-amber-400 shrink-0 mt-0.5 border border-amber-600">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-bold text-amber-300 font-mono tracking-wide uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-led-amber" />
            CAUTION: {statusTitle}
          </div>
          <p className="text-slate-200 leading-relaxed">{message}</p>
          {pedagogicalFix && (
            <div className="text-slate-300 text-xs mt-1.5 bg-black/40 p-2 rounded border border-amber-500/20 font-mono">
              <strong className="text-amber-400">[INSPECTION HINT]:</strong> {pedagogicalFix}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (state === 'OPEN_SWITCH') {
    return (
      <div className="p-3 rounded-xl bg-[#111622] border border-[#2b3952] text-slate-300 flex items-start gap-3">
        <div className="p-1.5 rounded bg-[#182133] text-amber-400 shrink-0 mt-0.5 border border-[#374766]">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-bold text-slate-200 font-mono tracking-wide uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            STANDBY: {statusTitle}
          </div>
          <p className="text-slate-300 leading-relaxed">{message}</p>
          {pedagogicalFix && (
            <p className="text-amber-300 font-mono text-[11px] mt-1 bg-black/30 px-2 py-1 rounded border border-white/5">
              👉 {pedagogicalFix}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl bg-[#111622] border border-[#222c3f] text-slate-400 flex items-start gap-3">
      <div className="p-1.5 rounded bg-[#182133] text-slate-400 shrink-0 mt-0.5">
        <Info className="w-4 h-4" />
      </div>
      <div className="space-y-1 text-xs">
        <div className="font-bold text-slate-300 font-mono tracking-wide uppercase">{statusTitle}</div>
        <p className="text-slate-400 leading-relaxed">{message}</p>
        {pedagogicalFix && (
          <p className="text-amber-400/90 font-mono text-[11px] mt-1 bg-black/30 px-2 py-1 rounded border border-white/5">
            💡 {pedagogicalFix}
          </p>
        )}
      </div>
    </div>
  );
};
