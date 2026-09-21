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
      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3 shadow-sm">
        <div className="p-1.5 rounded bg-emerald-100 border border-emerald-300 text-emerald-700 shrink-0 mt-0.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-bold text-emerald-900 font-mono tracking-wide uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            ANNUNCIATOR: {statusTitle}
          </div>
          <p className="text-emerald-800 leading-relaxed font-sans">{message}</p>
          {pedagogicalFix && (
            <p className="text-emerald-900 font-mono text-[11px] mt-1 bg-emerald-100/70 px-2 py-1 rounded border border-emerald-200">
              💡 {pedagogicalFix}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (isShortCircuit || state === 'SHORT_CIRCUIT' || state === 'AMMETER_PARALLEL') {
    return (
      <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-3 shadow-sm">
        <div className="p-1.5 rounded bg-rose-100 text-rose-700 shrink-0 mt-0.5 border border-rose-300">
          <Flame className="w-4 h-4 animate-bounce" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-mono font-bold text-rose-900 tracking-wider uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            CRITICAL FAULT: {statusTitle}
          </div>
          <p className="text-rose-800 leading-relaxed font-medium">{message}</p>
          {pedagogicalFix && (
            <div className="text-rose-900 text-xs mt-1.5 bg-rose-100/80 p-2 rounded border border-rose-200 font-mono">
              <strong className="text-rose-950 uppercase">[RECOVERY PROCEDURE]:</strong> {pedagogicalFix}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (state === 'VOLTMETER_SERIES') {
    return (
      <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 shadow-sm">
        <div className="p-1.5 rounded bg-amber-100 text-amber-700 shrink-0 mt-0.5 border border-amber-300">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-bold text-amber-900 font-mono tracking-wide uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            CAUTION: {statusTitle}
          </div>
          <p className="text-amber-800 leading-relaxed">{message}</p>
          {pedagogicalFix && (
            <div className="text-amber-900 text-xs mt-1.5 bg-amber-100/80 p-2 rounded border border-amber-200 font-mono">
              <strong className="text-amber-950">[INSPECTION HINT]:</strong> {pedagogicalFix}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (state === 'OPEN_SWITCH') {
    return (
      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-start gap-3 shadow-sm">
        <div className="p-1.5 rounded bg-white text-slate-600 shrink-0 mt-0.5 border border-slate-300">
          <Info className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-bold text-slate-800 font-mono tracking-wide uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            STANDBY: {statusTitle}
          </div>
          <p className="text-slate-600 leading-relaxed">{message}</p>
          {pedagogicalFix && (
            <p className="text-slate-700 font-mono text-[11px] mt-1 bg-white px-2 py-1 rounded border border-slate-200">
              👉 {pedagogicalFix}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-start gap-3 shadow-sm">
      <div className="p-1.5 rounded bg-white text-slate-500 shrink-0 mt-0.5 border border-slate-200">
        <Info className="w-4 h-4" />
      </div>
      <div className="space-y-1 text-xs">
        <div className="font-bold text-slate-700 font-mono tracking-wide uppercase">{statusTitle}</div>
        <p className="text-slate-600 leading-relaxed">{message}</p>
        {pedagogicalFix && (
          <p className="text-slate-700 font-mono text-[11px] mt-1 bg-white px-2 py-1 rounded border border-slate-200">
            💡 {pedagogicalFix}
          </p>
        )}
      </div>
    </div>
  );
};
