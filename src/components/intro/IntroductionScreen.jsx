import React from 'react';
import { 
  Zap, 
  ArrowRight, 
  ShieldAlert, 
  Activity, 
  CheckCircle2, 
  Layers,
  Sparkles,
  LineChart
} from 'lucide-react';
import { sounds } from '../../engine/audioEffects';

export const IntroductionScreen = ({
  onNavigate,
  setMode,
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 bg-surface-container-lowest border border-outline-variant/30 shadow-md">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full blur-3xl pointer-events-none bg-teal-500/10" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full blur-3xl pointer-events-none bg-emerald-500/10" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Physics Laboratory Simulation · Standard Experiment
          </div>

          <h1 className="font-display font-extrabold text-3xl md:text-5xl tracking-tight text-on-surface leading-tight">
            Verification of <span className="text-teal-700">Ohm's Law</span>
          </h1>

          <p className="text-on-surface-variant text-base md:text-lg leading-relaxed">
            Conduct a rigorous, hands-on physics experiment to verify that the potential difference across a conductor is directly proportional to the current flowing through it at constant temperature.
          </p>

          {/* Quick Formula Banner */}
          <div className="inline-flex flex-wrap items-center gap-6 p-4 rounded-2xl bg-surface-container border border-outline-variant/20 shadow-sm">
            <div className="text-center border-r border-outline-variant/30 pr-6">
              <span className="text-[11px] text-on-surface-variant uppercase tracking-widest block font-mono font-bold">Core Law</span>
              <span className="text-3xl font-extrabold font-mono text-teal-700 tracking-wider">V = IR</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <span className="text-on-surface-variant block">V</span>
                <span className="font-bold text-emerald-700">Voltage (V)</span>
              </div>
              <div>
                <span className="text-on-surface-variant block">I</span>
                <span className="font-bold text-amber-700">Current (A)</span>
              </div>
              <div>
                <span className="text-on-surface-variant block">R</span>
                <span className="font-bold text-teal-700">Resistance (Ω)</span>
              </div>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => { sounds.playSuccess(); setMode('guided'); onNavigate('lab'); }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-sm transition-all active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current" />
              Start Experiment (Guided)
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => { sounds.playTick(); onNavigate('theory'); }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-surface-container hover:bg-teal-50 text-on-surface-variant hover:text-teal-700 border border-outline-variant/30 text-sm font-bold transition-all"
            >
              Learn Theory
            </button>

            <button
              onClick={() => { sounds.playTick(); onNavigate('apparatus'); }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-surface-container hover:bg-teal-50 text-on-surface-variant hover:text-teal-700 border border-outline-variant/30 text-sm font-bold transition-all"
            >
              <Layers className="w-4 h-4 text-teal-600" />
              Identify Apparatus
            </button>

            <button
              onClick={() => { sounds.playTick(); setMode('sandbox'); onNavigate('lab'); }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-surface-container hover:bg-teal-50 text-teal-700 border border-teal-200 text-sm font-bold transition-all"
            >
              Practice Mode (Sandbox)
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Objectives, Safety & Expected Graph */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Objectives */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-4">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-teal-50 border border-teal-200 text-teal-600 shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-display font-bold text-on-surface">Experiment Objectives</h2>
          <ul className="space-y-2.5 text-xs text-on-surface-variant leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
              <span>Correctly assemble a DC series-parallel circuit on the virtual workbench.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
              <span>Place the ammeter in <strong className="text-on-surface font-extrabold">series</strong> and the voltmeter in <strong className="text-on-surface font-extrabold">parallel</strong> across the test resistor.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
              <span>Vary DC voltage from 0 to 10 V and record at least 5 sets of simultaneous (V, I) readings.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
              <span>Plot the V-I characteristic graph, draw the best-fit line, and compute resistance from slope (R = ΔV / ΔI).</span>
            </li>
          </ul>
        </div>

        {/* Safety & Protocol Instructions */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-4">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-amber-50 border border-amber-200 text-amber-600 shadow-sm">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-display font-bold text-on-surface">Safety &amp; Laboratory Rules</h2>
          <ul className="space-y-2.5 text-xs text-on-surface-variant leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <span><strong className="text-on-surface font-extrabold">Keep the switch OPEN</strong> while establishing and checking wire connections.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <span><strong className="text-on-surface font-extrabold">Never connect an ammeter in parallel</strong> across the power supply (causes instant short-circuit).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <span>Observe polarity: Connect positive (+) red terminals towards the positive rail of the power source.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <span>Take readings promptly to avoid prolonged resistive heating, which alters wire resistance.</span>
            </li>
          </ul>
        </div>

        {/* Expected Graph Characteristic Preview */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-teal-50 border border-teal-200 text-teal-600 shadow-sm mb-4">
              <LineChart className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-display font-bold text-on-surface">Expected V-I Graph</h2>
            <p className="text-xs text-on-surface-variant leading-relaxed mt-2">
              For an ohmic conductor at constant temperature, the V-I plot is a straight line passing through the origin.
            </p>

            {/* Visual plot representation */}
            <div className="mt-4 p-3 bg-surface-container rounded-xl border border-outline-variant/20 relative h-28 flex items-center justify-center overflow-hidden">
              {/* Axes */}
              <div className="absolute left-6 bottom-4 top-2 w-0.5 bg-outline-variant" />
              <div className="absolute left-6 right-4 bottom-4 h-0.5 bg-outline-variant" />
              
              {/* Linear trendline */}
              <svg className="w-full h-full" viewBox="0 0 100 60">
                <line x1="24" y1="52" x2="80" y2="12" stroke="#0f766e" strokeWidth="2" strokeDasharray="3 2" />
                <circle cx="35" cy="44" r="2.5" fill="#f59e0b" />
                <circle cx="48" cy="34" r="2.5" fill="#f59e0b" />
                <circle cx="61" cy="24" r="2.5" fill="#f59e0b" />
                <circle cx="74" cy="16" r="2.5" fill="#f59e0b" />
              </svg>
              
              <span className="absolute left-1 top-2 text-[9px] font-mono font-bold text-teal-700">V (Volts) ↑</span>
              <span className="absolute right-4 bottom-1 text-[9px] font-mono font-bold text-amber-700">→ I (Amps)</span>
              <span className="absolute right-6 top-6 text-[8px] font-mono text-on-surface-variant font-bold">Slope = ΔV/ΔI = R</span>
            </div>
          </div>

          <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-xs font-mono font-bold text-on-surface-variant">
            <span>Formula</span>
            <span className="text-teal-700">R = V / I</span>
          </div>
        </div>
      </div>
    </div>
  );
};
