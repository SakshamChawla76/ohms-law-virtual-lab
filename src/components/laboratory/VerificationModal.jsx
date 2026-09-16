import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-2xl p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            Hypothesis Verification & Analysis
          </div>
          <h2 className="text-2xl font-black text-white">Was Ohm's Law Verified?</h2>
          <p className="text-xs text-slate-300">
            Examine your experimental V-I graph slope ({slope.toFixed(2)} Ω) and error ({errorPercent.toFixed(2)}%). Make your scientific conclusion.
          </p>
        </div>

        {/* Choices */}
        {!hasSubmitted ? (
          <div className="space-y-3">
            <button
              onClick={() => handleSubmit('yes')}
              className="w-full p-4 rounded-2xl bg-slate-800/80 hover:bg-emerald-950/40 border border-white/10 hover:border-emerald-500 text-left transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-bold text-white text-sm group-hover:text-emerald-300">
                  Yes, Ohm's Law is verified.
                </div>
                <div className="text-xs text-slate-400">
                  The V-I plot is a straight line through origin, confirming constant resistance (V ∝ I).
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-slate-500 group-hover:text-emerald-400" />
            </button>

            <button
              onClick={() => handleSubmit('no')}
              className="w-full p-4 rounded-2xl bg-slate-800/80 hover:bg-rose-950/40 border border-white/10 hover:border-rose-500 text-left transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-bold text-white text-sm group-hover:text-rose-300">
                  No, Ohm's Law was not verified.
                </div>
                <div className="text-xs text-slate-400">
                  The relationship was non-linear or resistance varied significantly.
                </div>
              </div>
              <XCircle className="w-5 h-5 text-slate-500 group-hover:text-rose-400" />
            </button>

            <button
              onClick={() => handleSubmit('cannot_determine')}
              className="w-full p-4 rounded-2xl bg-slate-800/80 hover:bg-amber-950/40 border border-white/10 hover:border-amber-500 text-left transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-bold text-white text-sm group-hover:text-amber-300">
                  Cannot be determined from current data.
                </div>
                <div className="text-xs text-slate-400">
                  Too few data points or excessive experimental scatter.
                </div>
              </div>
              <HelpCircle className="w-5 h-5 text-slate-500 group-hover:text-amber-400" />
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-fadeIn">
            {selectedChoice === 'yes' ? (
              <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 space-y-2">
                <div className="font-bold text-emerald-300 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Correct Conclusion! (+20 Points)
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  "The V-I characteristic relationship is linear passing through origin, proving that resistance remains constant across the applied potential difference. Therefore, <strong>Ohm's Law is verified</strong> within experimental uncertainty."
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-amber-200 space-y-2">
                <div className="font-bold text-amber-300 text-sm flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-400" />
                  Explanation & Scientific Clarification
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  In your experiment, the ratio V/I remained constant within normal experimental variation ({errorPercent.toFixed(1)}% error). Because the plot yields a straight line with constant slope, <strong>Ohm's Law is indeed verified</strong>.
                </p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-white/10"
              >
                Back to Lab
              </button>

              <button
                onClick={onProceedToQuiz}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-glow-cyan"
              >
                Proceed to Conceptual Quiz
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
