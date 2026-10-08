import React, { useEffect, useRef } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Flame,
  Sparkles
} from 'lucide-react';
import anime from '../../lib/anime';

export const CircuitAlerts = ({ analysis }) => {
  const { state, statusTitle, message, pedagogicalFix, isValid, isShortCircuit } = analysis;
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    anime({
      targets: containerRef.current,
      opacity: [0, 1],
      translateY: [8, 0],
      duration: 400,
      easing: 'spring(300, 25, 8)',
    });
  }, [state]);

  if (state === 'ACTIVE' && isValid) {
    return (
      <div ref={containerRef} className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-start gap-3 shadow-xs">
        <div className="p-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-700 shrink-0 mt-0.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-bold text-emerald-900 font-mono tracking-wide uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" style={{ animation: 'pulse-glow 2s ease-in-out infinite' }} />
            ANNUNCIATOR: {statusTitle}
          </div>
          <p className="text-emerald-900/90 leading-relaxed font-sans">{message}</p>
          {pedagogicalFix && (
            <p className="text-emerald-900 font-mono text-[11px] mt-1 bg-emerald-100/70 px-2.5 py-1.5 rounded-lg border border-emerald-200">
              💡 {pedagogicalFix}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (isShortCircuit || state === 'SHORT_CIRCUIT' || state === 'AMMETER_PARALLEL') {
    return (
      <div ref={containerRef} className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 flex items-start gap-3 shadow-xs">
        <div className="p-1.5 rounded-xl bg-rose-100 text-rose-700 shrink-0 mt-0.5 border border-rose-300">
          <Flame className="w-4 h-4" style={{ animation: 'bounce-subtle 3s ease-in-out infinite' }} />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-mono font-bold text-rose-900 tracking-wider uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" style={{ animation: 'pulse-glow 2s ease-in-out infinite' }} />
            CRITICAL FAULT: {statusTitle}
          </div>
          <p className="text-rose-900/90 leading-relaxed font-medium">{message}</p>
          {pedagogicalFix && (
            <div className="text-rose-900 text-xs mt-1.5 bg-rose-100/80 p-2.5 rounded-lg border border-rose-200 font-mono">
              <strong className="text-rose-700 uppercase">[RECOVERY PROCEDURE]:</strong> {pedagogicalFix}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (state === 'VOLTMETER_SERIES') {
    return (
      <div ref={containerRef} className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3 shadow-xs">
        <div className="p-1.5 rounded-xl bg-amber-100 text-amber-700 shrink-0 mt-0.5 border border-amber-300">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-bold text-amber-900 font-mono tracking-wide uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            CAUTION: {statusTitle}
          </div>
          <p className="text-amber-900/90 leading-relaxed">{message}</p>
          {pedagogicalFix && (
            <div className="text-amber-900 text-xs mt-1.5 bg-amber-100/80 p-2.5 rounded-lg border border-amber-200 font-mono">
              <strong className="text-amber-700">[INSPECTION HINT]:</strong> {pedagogicalFix}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (state === 'OPEN_SWITCH') {
    return (
      <div ref={containerRef} className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 text-on-surface flex items-start gap-3 shadow-xs">
        <div className="p-1.5 rounded-xl bg-surface-container text-on-surface-variant shrink-0 mt-0.5 border border-outline-variant/20">
          <Info className="w-4 h-4 text-teal-700" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-bold text-on-surface font-mono tracking-wide uppercase flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            STANDBY: {statusTitle}
          </div>
          <p className="text-on-surface-variant leading-relaxed">{message}</p>
          {pedagogicalFix && (
            <p className="text-on-surface font-mono text-[11px] mt-1 bg-surface-container px-2.5 py-1.5 rounded-lg border border-outline-variant/20">
              👉 {pedagogicalFix}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 text-on-surface flex items-start gap-3 shadow-xs">
      <div className="p-1.5 rounded-xl bg-surface-container text-on-surface-variant shrink-0 mt-0.5 border border-outline-variant/20">
        <Info className="w-4 h-4 text-teal-700" />
      </div>
      <div className="space-y-1 text-xs">
        <div className="font-bold text-on-surface font-mono tracking-wide uppercase">{statusTitle}</div>
        <p className="text-on-surface-variant leading-relaxed">{message}</p>
        {pedagogicalFix && (
          <p className="text-on-surface font-mono text-[11px] mt-1 bg-surface-container px-2.5 py-1.5 rounded-lg border border-outline-variant/20">
            💡 {pedagogicalFix}
          </p>
        )}
      </div>
    </div>
  );
};