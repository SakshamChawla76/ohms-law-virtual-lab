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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn text-slate-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white via-slate-50 to-blue-50/50 border border-slate-200 p-8 md:p-12 shadow-sm">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-blue-100/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-cyan-100/40 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Physics Laboratory Simulation • Standard Experiment
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Verification of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-sky-600 to-cyan-600">Ohm's Law</span>
          </h1>

          <p className="text-slate-600 text-base md:text-lg leading-relaxed">
            Conduct a rigorous, hands-on physics experiment to verify that the potential difference across a conductor is directly proportional to the current flowing through it at constant temperature.
          </p>

          {/* Quick Formula Banner */}
          <div className="inline-flex items-center gap-6 p-4 rounded-2xl bg-white/90 border border-slate-200 shadow-sm backdrop-blur-md">
            <div className="text-center border-r border-slate-200 pr-6">
              <span className="text-xs text-slate-500 uppercase tracking-widest block font-medium">Core Law</span>
              <span className="text-3xl font-black font-mono text-blue-700 tracking-wider">V = IR</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-500 block">V</span>
                <span className="font-semibold text-emerald-700">Voltage (V)</span>
              </div>
              <div>
                <span className="text-slate-500 block">I</span>
                <span className="font-semibold text-amber-700">Current (A)</span>
              </div>
              <div>
                <span className="text-slate-500 block">R</span>
                <span className="font-semibold text-sky-700">Resistance (Ω)</span>
              </div>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => { sounds.playSuccess(); setMode('guided'); onNavigate('lab'); }}
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Zap className="w-4 h-4 fill-current" />
              Start Experiment (Guided)
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => { sounds.playTick(); onNavigate('theory'); }}
              className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 flex items-center gap-2 transition-all shadow-sm"
            >
              Learn Theory
            </button>

            <button
              onClick={() => { sounds.playTick(); onNavigate('apparatus'); }}
              className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-200 flex items-center gap-2 transition-all shadow-sm"
            >
              <Layers className="w-4 h-4 text-blue-600" />
              Identify Apparatus
            </button>

            <button
              onClick={() => { sounds.playTick(); setMode('sandbox'); onNavigate('lab'); }}
              className="px-5 py-3.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-semibold text-sm border border-purple-200 flex items-center gap-2 transition-all"
            >
              Practice Mode (Sandbox)
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Objectives, Safety & Expected Graph */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Objectives */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="h-10 w-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Experiment Objectives</h2>
          <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              Correctly assemble a DC series-parallel circuit on the virtual workbench.
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              Place the ammeter in <strong>series</strong> and the voltmeter in <strong>parallel</strong> across the test resistor.
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              Vary DC voltage from 0 to 10 V and record at least 5 sets of simultaneous (V, I) readings.
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
              Plot the V-I characteristic graph, draw the best-fit line, and compute resistance from slope ($R = \Delta V / \Delta I$).
            </li>
          </ul>
        </div>

        {/* Safety & Protocol Instructions */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
          <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Safety & Laboratory Rules</h2>
          <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <strong>Keep the switch OPEN</strong> while establishing and checking wire connections.
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <strong>Never connect an ammeter in parallel</strong> across the power supply (causes instant short-circuit).
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              Observe polarity: Connect positive (+) red terminals towards the positive rail of the power source.
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              Take readings promptly to avoid prolonged resistive heating, which alters wire resistance.
            </li>
          </ul>
        </div>

        {/* Expected Graph Preview */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
              <LineChart className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Expected V-I Graph</h2>
            <p className="text-xs text-slate-600 mt-1">
              For an ohmic conductor at constant temperature, the V-I plot is a straight line passing through the origin.
            </p>

            {/* Micro Graph Visualization */}
            <div className="mt-4 h-28 w-full rounded-xl bg-slate-50 border border-slate-200 relative p-3 flex items-end">
              <div className="absolute left-3 top-2 text-[10px] font-mono text-blue-700 font-bold">V (Volts) ↑</div>
              <div className="absolute right-3 bottom-1 text-[10px] font-mono text-amber-700 font-bold">→ I (Amps)</div>
              {/* Axes */}
              <div className="absolute left-6 bottom-5 right-4 h-[1px] bg-slate-300" />
              <div className="absolute left-6 bottom-5 top-5 w-[1px] bg-slate-300" />
              {/* Slanted Line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line x1="24" y1="90" x2="190" y2="28" stroke="#0284c7" strokeWidth="2.5" strokeDasharray="3 3" />
                <circle cx="50" cy="78" r="3" fill="#d97706" />
                <circle cx="85" cy="65" r="3" fill="#d97706" />
                <circle cx="120" cy="52" r="3" fill="#d97706" />
                <circle cx="155" cy="40" r="3" fill="#d97706" />
              </svg>
              <span className="text-[10px] font-mono text-slate-500 ml-auto mr-1 mb-1">Slope = ΔV/ΔI = R</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Formula</span>
            <span className="font-mono font-bold text-blue-700">R = V / I</span>
          </div>
        </div>
      </div>
    </div>
  );
};
