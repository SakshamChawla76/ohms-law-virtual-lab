import React, { useState, useEffect, useRef } from 'react';
import anime from '../../lib/anime';
import confetti from 'canvas-confetti';
import { Target, CheckCircle2, XCircle, HelpCircle, ArrowRight, ShieldCheck, Award, Play, Sparkles } from 'lucide-react';
import { sounds } from '../../engine/audioEffects';

const springSnappy = { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 };
const springFluid = { type: 'spring', stiffness: 260, damping: 25, mass: 0.9 };

export const ChallengeModeView = ({
  onSelectChallenge,
  activeChallenge,
  analysis,
  onSolveChallenge,
  completedChallenges,
}) => {
  const [feedback, setFeedback] = useState(null);
  const mainRef = useRef(null);
  const challengeCardsRef = useRef(null);
  const activePanelRef = useRef(null);

  useEffect(() => {
    if (!mainRef.current) return;
    anime({
      targets: mainRef.current,
      opacity: [0, 1],
      translateY: [16, 0],
      easing: 'easeOutExpo',
      duration: 600,
    });
  }, []);

  useEffect(() => {
    if (!challengeCardsRef.current) return;
    anime({
      targets: challengeCardsRef.current,
      opacity: [0, 1],
      translateY: [12, 0],
      easing: 'easeOutExpo',
      duration: 500,
      delay: anime.stagger(80),
    });
  }, []);

  useEffect(() => {
    if (activeChallenge && activePanelRef.current) {
      anime({
        targets: activePanelRef.current,
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 400,
        easing: 'easeOutExpo',
      });
    }
  }, [activeChallenge]);

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

  const handleActionButtonHover = (e, animate) => {
    anime({
      targets: e.currentTarget,
      scale: animate ? 1.05 : 1,
      ...springSnappy,
    });
  };

  const handleChallengeCardHover = (e, animate) => {
    anime({
      targets: e.currentTarget,
      scale: animate ? 1.03 : 1,
      borderColor: animate ? 'rgba(245, 158, 11, 0.6)' : 'rgba(255,255,255,0.05)',
      boxShadow: animate ? '0 0 15px rgba(245, 158, 11, 0.2)' : 'none',
      ...springFluid,
    });
  };

  const handleVerifyButtonHover = (e, animate) => {
    anime({
      targets: e.currentTarget,
      scale: animate ? 1.06 : 1,
      ...springSnappy,
    });
  };

  return (
    <div ref={mainRef} className="w-full rounded-2xl glass-card p-5 space-y-4 select-none border border-white/10 shadow-xl bg-slate-900/60 backdrop-blur-xl text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase font-mono">
              Diagnostic & Circuit Challenges
            </h3>
            <p className="text-[11px] text-slate-400">
              Apply scientific reasoning and troubleshoot real circuit anomalies.
            </p>
          </div>
        </div>

        <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-[0_0_8px_rgba(245,158,11,0.2)]">
          {completedChallenges.length} / {CHALLENGE_SCENARIOS.length} Completed
        </span>
      </div>

      {/* Challenge Cards Carousel / List */}
      <div ref={challengeCardsRef} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              onMouseEnter={(e) => handleChallengeCardHover(e, true)}
              onMouseLeave={(e) => handleChallengeCardHover(e, false)}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-2 shadow-sm ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500/60 text-slate-100 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-black/30 border-white/5 text-slate-300 hover:bg-white/5 hover:border-white/15'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 font-mono">
                  {scenario.title}
                </span>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Target className="w-4 h-4 text-slate-500" />
                )}
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {scenario.scenario}
              </p>
              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <span>Criteria:</span>
                <span className="text-cyan-400 font-medium truncate">{scenario.completionCriteria}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Challenge Assessment Panel */}
      {activeChallenge && (
        <div ref={activePanelRef} className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-sm text-slate-100">{activeChallenge.title}</span>
            </div>
            <button
              onClick={checkSolution}
              onMouseEnter={(e) => handleVerifyButtonHover(e, true)}
              onMouseLeave={(e) => handleVerifyButtonHover(e, false)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.3)] border-none"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Verify My Solution
            </button>
          </div>

          <p className="text-xs text-slate-200 bg-black/40 p-3.5 rounded-xl border border-white/5 leading-relaxed font-mono">
            {activeChallenge.scenario}
          </p>

          {feedback && (
            <div className="p-3.5 rounded-xl bg-black/60 border border-amber-500/40 text-xs font-mono text-amber-200 shadow-md">
              {feedback}
            </div>
          )}
        </div>
      )}
    </div>
  );
};