import React, { useState } from 'react';
import { 
  Compass, 
  CheckCircle2, 
  Circle, 
  Lightbulb,
  Sparkles
} from 'lucide-react';
import { sounds } from '../../engine/audioEffects';

export const GuidedModeAssistant = ({
  analysis,
  isSwitchClosed,
  trialsCount,
  minRequired,
  onUseHint,
}) => {
  const [hintLevel, setHintLevel] = useState(0);

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

  return (
    <div className="w-full rounded-3xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-blue-50 text-blue-700">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase font-mono">
              Guided Laboratory Assistant
            </h3>
            <p className="text-[11px] text-slate-500">
              Interactive experimental procedure & 3-level progressive hint drawer.
            </p>
          </div>
        </div>

        <button
          onClick={requestNextHint}
          disabled={hintLevel >= 3}
          className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 disabled:opacity-40 disabled:cursor-not-allowed border border-amber-200 text-amber-800 text-xs font-mono flex items-center gap-1.5 transition-all"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
          <span>{hintLevel === 0 ? 'Need a Hint? (-1 pt)' : `Level ${hintLevel}/3 Hint`}</span>
        </button>
      </div>

      {/* Procedural Checklist */}
      <div className="space-y-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all text-xs ${
              step.isCompleted
                ? 'bg-emerald-50/70 border-emerald-300 text-slate-700'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            {step.isCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className={`font-semibold ${step.isCompleted ? 'text-emerald-800 line-through' : 'text-slate-800'}`}>
                {step.id}. {step.title}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{step.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Progressive Hint Box */}
      {hintLevel > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1.5 animate-fadeIn text-xs">
          <div className="font-bold text-amber-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            {hintLevel === 1 && 'Level 1 Clue (Conceptual)'}
            {hintLevel === 2 && 'Level 2 Clue (Instrument Placement)'}
            {hintLevel === 3 && 'Level 3 Solution (Exact Connections)'}
          </div>
          <p className="text-slate-700 leading-relaxed font-mono text-[11px]">
            {hintLevel === 1 && 'Remember: Current needs an unbroken path from the Battery (+) through the Resistor and back to (-). The switch controls this flow.'}
            {hintLevel === 2 && 'The ammeter must measure all current flowing through the resistor (connect in SERIES). The voltmeter measures potential difference ACROSS the resistor (connect in PARALLEL).'}
            {hintLevel === 3 && 'Exact Wiring: 1) Battery (+) -> Switch In. 2) Switch Out -> Ammeter (+). 3) Ammeter (-) -> Resistor A. 4) Resistor B -> Battery (-). 5) Voltmeter (+) -> Resistor A. 6) Voltmeter (-) -> Resistor B.'}
          </p>
        </div>
      )}
    </div>
  );
};
