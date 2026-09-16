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
      <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 flex items-start gap-3 shadow-glow-emerald animate-fadeIn">
        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            {statusTitle}
          </div>
          <p className="text-slate-300 leading-relaxed">{message}</p>
          {pedagogicalFix && (
            <p className="text-amber-300 font-mono text-[11px] mt-1 bg-black/30 px-2 py-1 rounded">
              💡 {pedagogicalFix}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (isShortCircuit || state === 'SHORT_CIRCUIT' || state === 'AMMETER_PARALLEL') {
    return (
      <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/60 text-rose-200 flex items-start gap-3 shadow-glow-red animate-pulse">
        <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
          <Flame className="w-5 h-5 animate-bounce" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-extrabold text-rose-300 text-sm uppercase tracking-wide">
            ⚠️ {statusTitle}
          </div>
          <p className="text-slate-200 leading-relaxed font-medium">{message}</p>
          {pedagogicalFix && (
            <div className="text-amber-200 text-xs mt-1.5 bg-rose-950/80 p-2 rounded-lg border border-rose-500/30">
              <strong className="text-amber-300">Pedagogical Guidance:</strong> {pedagogicalFix}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (state === 'VOLTMETER_SERIES') {
    return (
      <div className="p-3.5 rounded-2xl bg-amber-950/50 border border-amber-500/50 text-amber-200 flex items-start gap-3 animate-fadeIn">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-bold text-amber-300 text-sm">{statusTitle}</div>
          <p className="text-slate-200 leading-relaxed">{message}</p>
          {pedagogicalFix && (
            <div className="text-cyan-200 text-xs mt-1.5 bg-black/40 p-2 rounded-lg border border-white/10">
              <strong className="text-cyan-300">How to Fix:</strong> {pedagogicalFix}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (state === 'OPEN_SWITCH') {
    return (
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/30 text-cyan-200 flex items-start gap-3 animate-fadeIn">
        <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-bold text-cyan-300 text-sm">{statusTitle}</div>
          <p className="text-slate-300 leading-relaxed">{message}</p>
          {pedagogicalFix && (
            <p className="text-amber-300 font-mono text-[11px] mt-1 bg-black/30 px-2 py-1 rounded">
              👉 {pedagogicalFix}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-white/10 text-slate-300 flex items-start gap-3">
      <div className="p-2 rounded-xl bg-slate-800 text-slate-400 shrink-0">
        <Info className="w-5 h-5" />
      </div>
      <div className="space-y-1 text-xs">
        <div className="font-bold text-white text-sm">{statusTitle}</div>
        <p className="text-slate-400 leading-relaxed">{message}</p>
        {pedagogicalFix && (
          <p className="text-cyan-300 font-mono text-[11px] mt-1 bg-black/30 px-2 py-1 rounded">
            💡 {pedagogicalFix}
          </p>
        )}
      </div>
    </div>
  );
};
