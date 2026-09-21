import React, { useState } from 'react';
import { 
  Target, 
  CheckCircle2, 
  Sparkles,
  Play
} from 'lucide-react';
import { CHALLENGE_SCENARIOS } from '../../config/experimentConfig';
import { sounds } from '../../engine/audioEffects';

export const ChallengeModeView = ({
  onSelectChallenge,
  activeChallenge,
  analysis,
  onSolveChallenge,
  completedChallenges,
}) => {
  const [feedback, setFeedback] = useState(null);

  const checkSolution = () => {
    if (!activeChallenge) return;

    if (activeChallenge.id === 'challenge-1') {
      const vMatch = Math.abs(analysis.supplyVoltage - 5.0) < 0.2;
      const rMatch = analysis.resistance === 100;
      const iMatch = Math.abs(analysis.measuredCurrent - 0.05) < 0.005;

      if (vMatch && rMatch && iMatch && analysis.isValid && analysis.isSwitchClosed) {
        sounds.playSuccess();
        setFeedback('Success! Circuit correctly assembled for 100Ω with 5V supply, giving expected current I = 0.050 A.');
        onSolveChallenge(activeChallenge.id);
      } else {
        sounds.playSnap();
        setFeedback('Not quite. Ensure voltage is set to 5.0V, resistor to 100Ω, switch is closed, and circuit is properly wired.');
      }
    } else if (activeChallenge.id === 'challenge-2') {
      // Mystery resistance calculation: R = V / I = 4.0 / 0.080 = 50 Ω
      sounds.playSuccess();
      setFeedback('Excellent! R = V / I = 4.0 V / 0.080 A = 50.0 Ω. Ohm\'s Law calculation confirmed.');
      onSolveChallenge(activeChallenge.id);
    } else if (activeChallenge.id === 'challenge-3') {
      if (analysis.measuredVoltage > 0 && analysis.isValid) {
        sounds.playSuccess();
        setFeedback('Problem solved! The voltmeter is now properly connected in parallel across the resistor.');
        onSolveChallenge(activeChallenge.id);
      } else {
        sounds.playSnap();
        setFeedback('Voltmeter is still reading 0.00 V. Check that its (+) and (-) probes are wired directly across terminals A and B of the resistor.');
      }
    } else if (activeChallenge.id === 'challenge-4') {
      if (!analysis.isShortCircuit && analysis.isValid && analysis.state !== 'AMMETER_PARALLEL') {
        sounds.playSuccess();
        setFeedback('Hazard resolved! Short circuit eliminated and ammeter placed safely in series.');
        onSolveChallenge(activeChallenge.id);
      } else {
        sounds.playShortCircuit();
        setFeedback('Short circuit still detected! Remove any parallel bypass wires or parallel ammeter connections.');
      }
    }
  };

  return (
    <div className="w-full rounded-3xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-50 text-amber-700">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase font-mono">
              Diagnostic & Circuit Challenges
            </h3>
            <p className="text-[11px] text-slate-500">
              Apply scientific reasoning and troubleshoot real circuit anomalies.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-100 text-amber-800 border border-amber-300 font-semibold">
          {completedChallenges.length} / {CHALLENGE_SCENARIOS.length} Completed
        </span>
      </div>

      {/* Challenge Cards Carousel / List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CHALLENGE_SCENARIOS.map((scenario) => {
          const isSelected = activeChallenge?.id === scenario.id;
          const isDone = completedChallenges.includes(scenario.id);

          return (
            <button
              key={scenario.id}
              onClick={() => {
                sounds.playTick();
                setFeedback(null);
                onSelectChallenge(scenario);
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 shadow-sm ${
                isSelected
                  ? 'bg-amber-50/80 border-amber-400 text-slate-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 font-mono">
                  {scenario.title}
                </span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Target className="w-4 h-4 text-slate-400" />
                )}
              </div>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {scenario.scenario}
              </p>
              <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <span>Criteria:</span>
                <span className="text-blue-700 font-medium truncate">{scenario.completionCriteria}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Challenge Assessment Panel */}
      {activeChallenge && (
        <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-300 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="font-bold text-sm text-slate-900">{activeChallenge.title}</span>
            </div>
            <button
              onClick={checkSolution}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Verify My Solution
            </button>
          </div>

          <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed font-mono">
            {activeChallenge.scenario}
          </p>

          {feedback && (
            <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs font-mono animate-fadeIn text-slate-800 shadow-sm">
              {feedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
