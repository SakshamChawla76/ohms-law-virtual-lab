import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, ShieldCheck, Award } from 'lucide-react';
import { sounds } from '../../engine/audioEffects';

export const VerificationModal = ({
  isOpen,
  onClose,
  slope,
  errorPercent,
  onVerifiedCorrectly,
  onProceedToQuiz,
}) => {
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (choice) => {
    setSelectedChoice(choice);
    setHasSubmitted(true);

    if (choice === 'yes') {
      sounds.playSuccess();
      onVerifiedCorrectly();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      sounds.playSnap();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-xl rounded-3xl glass-card border border-white/15 shadow-2xl p-6 md:p-8 space-y-5 text-slate-100 bg-slate-900/95 backdrop-blur-2xl">
        {/* Modal Header */}
        <div className="text-center space-y-1.5 border-b border-white/10 pb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold uppercase shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <ShieldCheck className="w-3.5 h-3.5" />
            FORMAL HYPOTHESIS CERTIFICATION
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white font-mono tracking-wide uppercase">
            Is Ohm's Law Verified?
          </h2>
          <p className="text-xs text-slate-300 font-sans">
            Experimental curve slope = <strong className="text-amber-400 font-mono">{slope.toFixed(2)} Ω</strong> • Relative deviation error = <strong className="text-emerald-400 font-mono">{errorPercent.toFixed(2)}%</strong>.
          </p>
        </div>

        {/* Choices */}
        {!hasSubmitted ? (
          <div className="space-y-3">
            <button
              onClick={() => handleSubmit('yes')}
              className="w-full p-4 rounded-2xl bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/50 text-left transition-all flex items-center justify-between group shadow-sm"
            >
              <div>
                <div className="font-bold text-slate-200 text-sm group-hover:text-emerald-300 font-mono">
                  [A] YES — OHM'S LAW IS VERIFIED
                </div>
                <div className="text-xs text-slate-400 mt-1 font-sans">
                  The V-I characteristic forms an invariant linear slope passing through the origin (V ∝ I).
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 shrink-0 ml-3" />
            </button>

            <button
              onClick={() => handleSubmit('no')}
              className="w-full p-4 rounded-2xl bg-white/5 hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/50 text-left transition-all flex items-center justify-between group shadow-sm"
            >
              <div>
                <div className="font-bold text-slate-200 text-sm group-hover:text-rose-300 font-mono">
                  [B] NO — OHM'S LAW IS REFUTED
                </div>
                <div className="text-xs text-slate-400 mt-1 font-sans">
                  Non-linear dispersion or significant resistance drift detected across trials.
                </div>
              </div>
              <XCircle className="w-5 h-5 text-slate-500 group-hover:text-rose-400 shrink-0 ml-3" />
            </button>

            <button
              onClick={() => handleSubmit('cannot_determine')}
              className="w-full p-4 rounded-2xl bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/50 text-left transition-all flex items-center justify-between group shadow-sm"
            >
              <div>
                <div className="font-bold text-slate-200 text-sm group-hover:text-amber-300 font-mono">
                  [C] INSUFFICIENT DATA / EXCESSIVE UNCERTAINTY
                </div>
                <div className="text-xs text-slate-400 mt-1 font-sans">
                  Scatter range exceeds standard experimental tolerance limits.
                </div>
              </div>
              <HelpCircle className="w-5 h-5 text-slate-500 group-hover:text-amber-400 shrink-0 ml-3" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedChoice === 'yes' ? (
              <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 space-y-1.5 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <div className="font-bold text-emerald-300 text-sm flex items-center gap-2 font-mono uppercase">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  HYPOTHESIS CONFIRMED (+20 POINTS)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  "The potential difference V across the conductor remains strictly proportional to the electric current I (V ∝ I) within experimental tolerance ({errorPercent.toFixed(1)}% error). The ratio V/I = R is verified constant."
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-amber-200 space-y-1.5 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
                <div className="font-bold text-amber-300 text-sm flex items-center gap-2 font-mono uppercase">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  SCIENTIFIC CORRECTION
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Within the observed experimental error of {errorPercent.toFixed(1)}%, the linear regression model proves constant ohmic impedance. The physical law holds true for ohmic conductors at constant temperature.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono border border-white/10 transition-colors"
              >
                RETURN TO WORKBENCH
              </button>

              <button
                onClick={onProceedToQuiz}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all"
              >
                <span>PROCEED TO QUIZ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
