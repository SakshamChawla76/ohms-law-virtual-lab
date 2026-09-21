import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Award, 
  HelpCircle, 
  ShieldCheck, 
  Layers,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { sounds } from '../../../engine/audioEffects';

export const GenericGuidedLab = ({ simulation, activeTab, onUpdateScore }) => {
  const [param1, setParam1] = useState(50);
  const [param2, setParam2] = useState(25);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [challengeFeedback, setChallengeFeedback] = useState({});

  const handleAnswerSubmit = (qId, idx, isCorrect) => {
    sounds.playClick();
    setSelectedAnswers(prev => ({ ...prev, [qId]: idx }));
    setChallengeFeedback(prev => ({ ...prev, [qId]: isCorrect ? 'correct' : 'incorrect' }));
    if (isCorrect && onUpdateScore) onUpdateScore(20);
  };

  return (
    <div className="space-y-6">
      {/* TAB 1: CURIOSITY */}
      {activeTab === 'curiosity' && (
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              GUIDED SCIENTIFIC INQUIRY
            </div>

            <h2 className="text-2xl md:text-3xl font-bold font-sans text-slate-900 tracking-tight">
              {simulation.name}
            </h2>

            <p className="text-sm font-semibold text-amber-800 italic">
              "{simulation.curiosityQuestion}"
            </p>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              {simulation.description}
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-mono font-bold text-slate-700 uppercase">
                Aligned Concepts & Standards:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {simulation.concepts.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 rounded text-[11px] font-mono bg-white text-slate-700 border border-slate-200">
                    {c}
                  </span>
                ))}
              </div>
              <div className="text-[11px] font-mono text-slate-500 pt-1">
                NGSS Standards: {simulation.standards.join(', ')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SANDBOX */}
      {activeTab === 'sandbox' && (
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
            <div>
              <h3 className="text-sm font-bold font-mono text-slate-900 uppercase">
                Interactive Parameter Explorer
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                Manipulate core independent variables to observe simulated mathematical outcomes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-700 font-bold">PRIMARY VARIABLE (X):</span>
                  <span className="font-bold text-blue-700">{param1}</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={param1}
                  onChange={(e) => setParam1(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-700 font-bold">SECONDARY VARIABLE (Y):</span>
                  <span className="font-bold text-amber-700">{param2}</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  value={param2}
                  onChange={(e) => setParam2(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-inner grid grid-cols-1 sm:grid-cols-3 gap-3 text-center font-mono">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase">Calculated Ratio</div>
                <div className="text-lg font-bold text-slate-800">{(param1 / Math.max(1, param2)).toFixed(2)}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase">Integrated Product</div>
                <div className="text-lg font-bold text-blue-700">{(param1 * param2).toFixed(0)}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="text-[10px] text-slate-500 uppercase">Normalized Index</div>
                <div className="text-lg font-bold text-emerald-700">{((param1 + param2 * 2) / 2).toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CHALLENGE ME */}
      {activeTab === 'challenge' && (
        <div className="max-w-3xl mx-auto space-y-5 text-left">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase">
              Conceptual Challenge // {simulation.name}
            </div>
            <h3 className="text-sm font-bold font-sans text-slate-800">
              Which core physical or chemical law directly dictates the behavior explored in this simulation?
            </h3>

            <div className="space-y-2">
              {[
                { text: `Conservation Law & Proportionality (${simulation.concepts[0] || 'Core Principle'})`, correct: true },
                { text: "Inverse random dispersion without constant bounds", correct: false },
                { text: "Thermal decay neglecting energy conservation", correct: false }
              ].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswerSubmit('gen1', i, opt.correct)}
                  className={`w-full p-3 rounded-xl text-xs font-mono text-left transition-all border ${
                    selectedAnswers['gen1'] === i
                      ? opt.correct
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold'
                        : 'bg-rose-50 border-rose-400 text-rose-800 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  {opt.text}
                </button>
              ))}
            </div>

            {challengeFeedback['gen1'] === 'correct' && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-sans">
                ✓ <strong>Correct! (+20 pts)</strong> The system is strictly governed by {simulation.concepts[0] || 'the governing physical law'}!
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-xl font-bold font-sans text-slate-900">
              Everyday Applications of {simulation.name}
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Understanding these scientific principles allows modern engineers to design safer vehicles, high-efficiency electrical infrastructure, medical diagnostic tools, and materials capable of withstanding extreme physical environments.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
