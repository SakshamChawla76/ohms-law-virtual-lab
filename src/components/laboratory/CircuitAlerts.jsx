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
      <div className="p-3.5 rounded-2xl bg-emerald-950/40 backdrop-blur-md border border-emerald-500/30 text-emerald-200 flex items-start gap-3 shadow-[0_0_20px_rgba(16,185,129,0.12)]">
        <div className="p-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shrink-0 mt-0.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-bold text-emerald-300 font-mono tracking-wide uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            ANNUNCIATOR: {statusTitle}
          </div>
          <p className="text-emerald-200/90 leading-relaxed font-sans">{message}</p>
          {pedagogicalFix && (
            <p className="text-emerald-300 font-mono text-[11px] mt-1 bg-emerald-900/40 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
              💡 {pedagogicalFix}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (isShortCircuit || state === 'SHORT_CIRCUIT' || state === 'AMMETER_PARALLEL') {
    return (
      <div className="p-3.5 rounded-2xl bg-rose-950/40 backdrop-blur-md border border-rose-500/40 text-rose-200 flex items-start gap-3 shadow-[0_0_25px_rgba(244,63,94,0.18)]">
        <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5 border border-rose-500/40">
          <Flame className="w-4 h-4 animate-bounce" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-mono font-bold text-rose-300 tracking-wider uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            CRITICAL FAULT: {statusTitle}
          </div>
          <p className="text-rose-200/90 leading-relaxed font-medium">{message}</p>
          {pedagogicalFix && (
            <div className="text-rose-300 text-xs mt-1.5 bg-rose-900/40 p-2.5 rounded-lg border border-rose-500/30 font-mono">
              <strong className="text-rose-400 uppercase">[RECOVERY PROCEDURE]:</strong> {pedagogicalFix}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (state === 'VOLTMETER_SERIES') {
    return (
      <div className="p-3.5 rounded-2xl bg-amber-950/40 backdrop-blur-md border border-amber-500/40 text-amber-200 flex items-start gap-3 shadow-[0_0_20px_rgba(245,158,11,0.12)]">
        <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5 border border-amber-500/40">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-bold text-amber-300 font-mono tracking-wide uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            CAUTION: {statusTitle}
          </div>
          <p className="text-amber-200/90 leading-relaxed">{message}</p>
          {pedagogicalFix && (
            <div className="text-amber-300 text-xs mt-1.5 bg-amber-900/40 p-2.5 rounded-lg border border-amber-500/30 font-mono">
              <strong className="text-amber-400">[INSPECTION HINT]:</strong> {pedagogicalFix}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (state === 'OPEN_SWITCH') {
    return (
      <div className="p-3.5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-700/60 text-slate-300 flex items-start gap-3 shadow-sm">
        <div className="p-1.5 rounded-xl bg-slate-800 text-slate-400 shrink-0 mt-0.5 border border-slate-700">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-bold text-slate-200 font-mono tracking-wide uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            STANDBY: {statusTitle}
          </div>
          <p className="text-slate-300/80 leading-relaxed">{message}</p>
          {pedagogicalFix && (
            <p className="text-slate-300 font-mono text-[11px] mt-1 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
              👉 {pedagogicalFix}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-2xl bg-slate-900/50 backdrop-blur-md border border-slate-800 text-slate-400 flex items-start gap-3 shadow-sm">
      <div className="p-1.5 rounded-xl bg-slate-800 text-slate-500 shrink-0 mt-0.5 border border-slate-700">
        <Info className="w-4 h-4" />
      </div>
      <div className="space-y-1 text-xs">
        <div className="font-bold text-slate-300 font-mono tracking-wide uppercase">{statusTitle}</div>
        <p className="text-slate-400 leading-relaxed">{message}</p>
        {pedagogicalFix && (
          <p className="text-slate-300 font-mono text-[11px] mt-1 bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-700">
            💡 {pedagogicalFix}
          </p>
        )}
      </div>
    </div>
  );
};
