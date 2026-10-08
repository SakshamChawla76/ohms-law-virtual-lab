import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  CheckCircle2,
  Circle,
  Lightbulb,
  Sparkles
} from 'lucide-react';
import anime from '../../lib/anime';
import { sounds } from '../../engine/audioEffects';

const springSnappy = { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 };
const springFluid = { type: 'spring', stiffness: 260, damping: 25, mass: 0.9 };

export const GuidedModeAssistant = ({
  analysis,
  isSwitchClosed,
  trialsCount,
  minRequired,
  onUseHint,
}) => {
  const [hintLevel, setHintLevel] = useState(0);
  const mainRef = useRef(null);
  const hintBoxRef = useRef(null);
  const stepRefs = useRef([]);

  useEffect(() => {
    if (!mainRef.current) return;
    anime({
      targets: mainRef.current,
      opacity: [0, 1],
      translateY: [12, 0],
      easing: 'easeOutExpo',
      duration: 500,
    });
  }, []);

  useEffect(() => {
    stepRefs.current = stepRefs.current.filter(Boolean);
    if (stepRefs.current.length === 0) return;
    anime({
      targets: stepRefs.current,
      opacity: [0, 1],
      translateX: [-8, 0],
      easing: 'easeOutExpo',
      duration: 400,
      delay: anime.stagger(60),
    });
  }, []);

  useEffect(() => {
    if (hintLevel > 0 && hintBoxRef.current) {
      anime({
        targets: hintBoxRef.current,
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 400,
        easing: 'easeOutExpo',
      });
    }
  }, [hintLevel]);

  const requestNextHint = () => {
    if (hintLevel < 3) {
      setHintLevel(prev => prev + 1);
      onUseHint();
      sounds.playTick();
    }
  };

  // 6 Procedural experiment steps
  const steps = [
    {
      id: 1,
      title: 'Assemble Main Series Loop',
      desc: 'Connect Battery (+) -> Switch -> Ammeter -> Resistor -> Battery (-).',
      isCompleted: analysis.isClosedLoop && !analysis.isShortCircuit,
    },
    {
      id: 2,
      title: 'Connect Voltmeter Across Resistor',
      desc: 'Place Voltmeter in parallel across Resistor terminals A and B.',
      isCompleted: analysis.measuredVoltage > 0 || (analysis.isValid && analysis.message.includes('correctly connected')),
    },
    {
      id: 3,
      title: 'Close Key Switch',
      desc: 'Click on the physical switch blade to complete the circuit path.',
      isCompleted: isSwitchClosed,
    },
    {
      id: 4,
      title: 'Adjust DC Voltage',
      desc: 'Set voltage between 1V and 10V on the power supply control.',
      isCompleted: analysis.supplyVoltage > 0,
    },
    {
      id: 5,
      title: 'Record Trial Observations',
      desc: `Collect at least ${minRequired} sets of readings at varying voltages.`,
      isCompleted: trialsCount >= minRequired,
    },
    {
      id: 6,
      title: 'Plot & Verify V-I Characteristic',
      desc: 'Draw best-fit line, verify resistance slope, and confirm Ohm\'s Law.',
      isCompleted: trialsCount >= minRequired,
    },
  ];

  const handleHintButtonHover = (e, animate) => {
    anime({
      targets: e.currentTarget,
      scale: animate ? 1.05 : 1,
      ...springSnappy,
    });
  };

  const handleStepItemHover = (e, animate) => {
    anime({
      targets: e.currentTarget,
      scale: animate ? 1.02 : 1,
      ...springFluid,
    });
  };

  return (
    <div ref={mainRef} className="w-full rounded-2xl glass-card p-5 space-y-4 select-none border border-white/10 shadow-xl bg-slate-900/60 backdrop-blur-xl text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase font-mono">
              Guided Laboratory Assistant
            </h3>
            <p className="text-[11px] text-slate-400">
              Interactive experimental procedure & 3-level progressive hint drawer.
            </p>
          </div>
        </div>

        <button
          onClick={requestNextHint}
          disabled={hintLevel >= 3}
          onMouseEnter={(e) => handleHintButtonHover(e, true)}
          onMouseLeave={(e) => handleHintButtonHover(e, false)}
          className="px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 disabled:opacity-30 disabled:cursor-not-allowed border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-1.5 shadow-sm"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
          <span>{hintLevel === 0 ? 'Need a Hint? (-1 pt)' : `Level ${hintLevel}/3 Hint`}</span>
        </button>
      </div>

      {/* Procedural Checklist */}
      <div className="space-y-2">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            ref={el => stepRefs.current[idx] = el}
            className={`p-2.5 rounded-xl border flex items-start gap-2.5 text-xs ${
              step.isCompleted
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                : 'bg-black/30 border-white/5 text-slate-300'
            }`}
            onMouseEnter={(e) => handleStepItemHover(e, true)}
            onMouseLeave={(e) => handleStepItemHover(e, false)}
          >
            {step.isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className={`font-semibold ${step.isCompleted ? 'text-emerald-400 line-through opacity-80' : 'text-slate-100'}`}>
                {step.id}. {step.title}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{step.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Progressive Hint Box */}
      {hintLevel > 0 && (
        <div ref={hintBoxRef} className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-1.5 text-xs text-amber-200">
          <div className="font-bold text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {hintLevel === 1 && 'Level 1 Clue (Conceptual)'}
            {hintLevel === 2 && 'Level 2 Clue (Instrument Placement)'}
            {hintLevel === 3 && 'Level 3 Solution (Exact Connections)'}
          </div>
          <p className="text-amber-100/90 leading-relaxed font-mono text-[11px]">
            {hintLevel === 1 && 'Remember: Current needs an unbroken path from the Battery (+) through the Resistor and back to (-). The switch controls this flow.'}
            {hintLevel === 2 && 'The ammeter must measure all current flowing through the resistor (connect in SERIES). The voltmeter measures potential difference ACROSS the resistor (connect in PARALLEL).'}
            {hintLevel === 3 && 'Exact Wiring: 1) Battery (+) -> Switch In. 2) Switch Out -> Ammeter (+). 3) Ammeter (-) -> Resistor A. 4) Resistor B -> Battery (-). 5) Voltmeter (+) -> Resistor A. 6) Voltmeter (-) -> Resistor B.'}
          </p>
        </div>
      )}
    </div>
  );
};