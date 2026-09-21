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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm select-none animate-fadeIn">
      <div className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 md:p-8 space-y-5 text-slate-800">
        {/* Modal Header */}
        <div className="text-center space-y-1.5 border-b border-slate-200 pb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-bold uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            FORMAL HYPOTHESIS CERTIFICATION
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 font-mono tracking-wide uppercase">
            Is Ohm's Law Verified?
          </h2>
          <p className="text-xs text-slate-600 font-sans">
            Experimental curve slope = <strong className="text-amber-700 font-mono">{slope.toFixed(2)} Ω</strong> • Relative deviation error = <strong className="text-emerald-700 font-mono">{errorPercent.toFixed(2)}%</strong>.
          </p>
        </div>

        {/* Choices */}
        {!hasSubmitted ? (
          <div className="space-y-2.5">
            <button
              onClick={() => handleSubmit('yes')}
              className="w-full p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-400 text-left transition-all flex items-center justify-between group shadow-sm"
            >
              <div>
                <div className="font-bold text-slate-800 text-sm group-hover:text-emerald-800 font-mono">
                  [A] YES — OHM'S LAW IS VERIFIED
                </div>
                <div className="text-xs text-slate-600 mt-0.5 font-sans">
                  The V-I characteristic forms an invariant linear slope passing through the origin (V ∝ I).
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 shrink-0 ml-3" />
            </button>

            <button
              onClick={() => handleSubmit('no')}
              className="w-full p-3.5 rounded-xl bg-slate-50 hover:bg-rose-50/60 border border-slate-200 hover:border-rose-400 text-left transition-all flex items-center justify-between group shadow-sm"
            >
              <div>
                <div className="font-bold text-slate-800 text-sm group-hover:text-rose-800 font-mono">
                  [B] NO — OHM'S LAW IS REFUTED
                </div>
                <div className="text-xs text-slate-600 mt-0.5 font-sans">
                  Non-linear dispersion or significant resistance drift detected across trials.
                </div>
              </div>
              <XCircle className="w-5 h-5 text-slate-400 group-hover:text-rose-600 shrink-0 ml-3" />
            </button>

            <button
              onClick={() => handleSubmit('cannot_determine')}
              className="w-full p-3.5 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200 hover:border-amber-400 text-left transition-all flex items-center justify-between group shadow-sm"
            >
              <div>
                <div className="font-bold text-slate-800 text-sm group-hover:text-amber-800 font-mono">
                  [C] INSUFFICIENT DATA / EXCESSIVE UNCERTAINTY
                </div>
                <div className="text-xs text-slate-600 mt-0.5 font-sans">
                  Scatter range exceeds standard experimental tolerance limits.
                </div>
              </div>
              <HelpCircle className="w-5 h-5 text-slate-400 group-hover:text-amber-600 shrink-0 ml-3" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedChoice === 'yes' ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 space-y-1.5">
                <div className="font-bold text-emerald-800 text-sm flex items-center gap-2 font-mono uppercase">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  HYPOTHESIS CONFIRMED (+20 POINTS)
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  "The potential difference V across the conductor remains strictly proportional to the electric current I (V ∝ I) within experimental tolerance ({errorPercent.toFixed(1)}% error). The ratio V/I = R is verified constant."
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 space-y-1.5">
                <div className="font-bold text-amber-800 text-sm flex items-center gap-2 font-mono uppercase">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  SCIENTIFIC CORRECTION
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  Within the observed experimental error of {errorPercent.toFixed(1)}%, the linear regression model proves constant ohmic impedance. The physical law holds true for ohmic conductors at constant temperature.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-mono border border-slate-200"
              >
                RETURN TO WORKBENCH
              </button>

              <button
                onClick={onProceedToQuiz}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-sm"
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
