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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#0f1d38] to-[#0c1830] border border-cyan-500/20 p-8 md:p-12 shadow-2xl">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Physics Laboratory Simulation • Standard Experiment
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Verification of <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">Ohm's Law</span>
          </h1>

          <p className="text-slate-300 text-base md:text-lg leading-relaxed">
            Conduct a rigorous, hands-on physics experiment to verify that the potential difference across a conductor is directly proportional to the current flowing through it at constant temperature.
          </p>

          {/* Quick Formula Banner */}
          <div className="inline-flex items-center gap-6 p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-md">
            <div className="text-center border-r border-white/10 pr-6">
              <span className="text-xs text-slate-400 uppercase tracking-widest block font-medium">Core Law</span>
              <span className="text-3xl font-black font-mono text-cyan-300 tracking-wider">V = IR</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 block">V</span>
                <span className="font-semibold text-emerald-300">Voltage (V)</span>
              </div>
              <div>
                <span className="text-slate-400 block">I</span>
                <span className="font-semibold text-amber-300">Current (A)</span>
              </div>
              <div>
                <span className="text-slate-400 block">R</span>
                <span className="font-semibold text-sky-300">Resistance (Ω)</span>
              </div>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => { sounds.playSuccess(); setMode('guided'); onNavigate('lab'); }}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-glow-cyan flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Zap className="w-4 h-4 fill-current" />
              Start Experiment (Guided)
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => { sounds.playTick(); onNavigate('theory'); }}
              className="px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold text-sm border border-white/10 flex items-center gap-2 transition-all hover:border-cyan-500/40"
            >
              Learn Theory
            </button>

            <button
              onClick={() => { sounds.playTick(); onNavigate('apparatus'); }}
              className="px-5 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold text-sm border border-white/10 flex items-center gap-2 transition-all hover:border-cyan-500/40"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              Identify Apparatus
            </button>

            <button
              onClick={() => { sounds.playTick(); setMode('sandbox'); onNavigate('lab'); }}
              className="px-5 py-3.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 font-semibold text-sm border border-purple-500/30 flex items-center gap-2 transition-all"
            >
              Practice Mode (Sandbox)
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Objectives, Safety & Expected Graph */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Objectives */}
        <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">Experiment Objectives</h2>
          <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              Correctly assemble a DC series-parallel circuit on the virtual workbench.
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              Place the ammeter in <strong>series</strong> and the voltmeter in <strong>parallel</strong> across the test resistor.
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              Vary DC voltage from 0 to 10 V and record at least 5 sets of simultaneous (V, I) readings.
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              Plot the V-I characteristic graph, draw the best-fit line, and compute resistance from slope ($R = \Delta V / \Delta I$).
            </li>
          </ul>
        </div>

        {/* Safety & Protocol Instructions */}
        <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white">Safety & Laboratory Rules</h2>
          <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <strong>Keep the switch OPEN</strong> while establishing and checking wire connections.
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <strong>Never connect an ammeter in parallel</strong> across the power supply (causes instant short-circuit).
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              Observe polarity: Connect positive (+) red terminals towards the positive rail of the power source.
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              Take readings promptly to avoid prolonged resistive heating, which alters wire resistance.
            </li>
          </ul>
        </div>

        {/* Expected Graph Preview */}
        <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4 flex flex-col justify-between">
          <div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
              <LineChart className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white">Expected V-I Graph</h2>
            <p className="text-xs text-slate-400 mt-1">
              For an ohmic conductor at constant temperature, the V-I plot is a straight line passing through the origin.
            </p>

            {/* Micro Graph Visualization */}
            <div className="mt-4 h-28 w-full rounded-xl bg-slate-950/60 border border-white/10 relative p-3 flex items-end">
              <div className="absolute left-3 top-2 text-[10px] font-mono text-cyan-400">V (Volts) ↑</div>
              <div className="absolute right-3 bottom-1 text-[10px] font-mono text-amber-400">→ I (Amps)</div>
              {/* Axes */}
              <div className="absolute left-6 bottom-5 right-4 h-[1px] bg-slate-700" />
              <div className="absolute left-6 bottom-5 top-5 w-[1px] bg-slate-700" />
              {/* Slanted Line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line x1="24" y1="90" x2="190" y2="28" stroke="#00f2fe" strokeWidth="2.5" strokeDasharray="3 3" />
                <circle cx="50" cy="78" r="3" fill="#ffb300" />
                <circle cx="85" cy="65" r="3" fill="#ffb300" />
                <circle cx="120" cy="52" r="3" fill="#ffb300" />
                <circle cx="155" cy="40" r="3" fill="#ffb300" />
              </svg>
              <span className="text-[10px] font-mono text-slate-400 ml-auto mr-1 mb-1">Slope = ΔV/ΔI = R</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Formula</span>
            <span className="font-mono font-bold text-cyan-300">R = V / I</span>
          </div>
        </div>
      </div>
    </div>
  );
};
