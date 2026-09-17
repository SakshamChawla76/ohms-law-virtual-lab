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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="w-full max-w-xl rounded-xl bg-[#0e1420] border-2 border-[#2b3a58] shadow-2xl p-6 md:p-8 space-y-5">
        {/* Modal Header */}
        <div className="text-center space-y-1.5 border-b border-[#1f2c42] pb-4">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            FORMAL HYPOTHESIS CERTIFICATION
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 font-mono tracking-wide uppercase">
            Is Ohm's Law Verified?
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            Experimental curve slope = <strong className="text-amber-400 font-mono">{slope.toFixed(2)} Ω</strong> • Relative deviation error = <strong className="text-emerald-400 font-mono">{errorPercent.toFixed(2)}%</strong>.
          </p>
        </div>

        {/* Choices */}
        {!hasSubmitted ? (
          <div className="space-y-2.5">
            <button
              onClick={() => handleSubmit('yes')}
              className="w-full p-3.5 rounded-lg bg-[#141b2b] hover:bg-[#19243b] border border-[#23324d] hover:border-emerald-500/60 text-left transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-bold text-slate-200 text-sm group-hover:text-emerald-300 font-mono">
                  [A] YES — OHM'S LAW IS VERIFIED
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-sans">
                  The V-I characteristic forms an invariant linear slope passing through the origin (V ∝ I).
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 shrink-0 ml-3" />
            </button>

            <button
              onClick={() => handleSubmit('no')}
              className="w-full p-3.5 rounded-lg bg-[#141b2b] hover:bg-[#19243b] border border-[#23324d] hover:border-rose-500/60 text-left transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-bold text-slate-200 text-sm group-hover:text-rose-300 font-mono">
                  [B] NO — OHM'S LAW IS REFUTED
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-sans">
                  Non-linear dispersion or significant resistance drift detected across trials.
                </div>
              </div>
              <XCircle className="w-5 h-5 text-slate-500 group-hover:text-rose-400 shrink-0 ml-3" />
            </button>

            <button
              onClick={() => handleSubmit('cannot_determine')}
              className="w-full p-3.5 rounded-lg bg-[#141b2b] hover:bg-[#19243b] border border-[#23324d] hover:border-amber-500/60 text-left transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-bold text-slate-200 text-sm group-hover:text-amber-300 font-mono">
                  [C] INSUFFICIENT DATA / EXCESSIVE UNCERTAINTY
                </div>
                <div className="text-xs text-slate-400 mt-0.5 font-sans">
                  Scatter range exceeds standard experimental tolerance limits.
                </div>
              </div>
              <HelpCircle className="w-5 h-5 text-slate-500 group-hover:text-amber-400 shrink-0 ml-3" />
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedChoice === 'yes' ? (
              <div className="p-4 rounded-lg bg-[#0d1e15] border border-emerald-500/50 text-emerald-200 space-y-1.5">
                <div className="font-bold text-emerald-300 text-sm flex items-center gap-2 font-mono uppercase">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  HYPOTHESIS CONFIRMED (+20 POINTS)
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  "The potential difference V across the conductor remains strictly proportional to the electric current I (V ∝ I) within experimental tolerance ({errorPercent.toFixed(1)}% error). The ratio V/I = R is verified constant."
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-[#221708] border border-amber-500/50 text-amber-200 space-y-1.5">
                <div className="font-bold text-amber-300 text-sm flex items-center gap-2 font-mono uppercase">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  SCIENTIFIC CORRECTION
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Within the observed experimental error of {errorPercent.toFixed(1)}%, the linear regression model proves constant ohmic impedance. The physical law holds true for ohmic conductors at constant temperature.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[#1f2c42]">
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded bg-[#162030] text-slate-300 hover:text-white text-xs font-mono border border-[#2b3a58]"
              >
                RETURN TO WORKBENCH
              </button>

              <button
                onClick={onProceedToQuiz}
                className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold flex items-center gap-2 shadow-led-amber"
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
