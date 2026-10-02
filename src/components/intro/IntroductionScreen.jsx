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
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 animate-fade-in-up"
        style={{
          background: 'linear-gradient(135deg, rgba(79,140,255,0.1) 0%, rgba(124,92,252,0.06) 50%, rgba(30,30,58,0.5) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(16px)'
        }}
      >
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(79,140,255,0.08)' }} />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ background: 'rgba(124,92,252,0.06)' }} />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="badge-pill badge-physics inline-flex">
            <Sparkles className="w-3.5 h-3.5" />
            Physics Laboratory Simulation · Standard Experiment
          </div>

          <h1 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight text-white leading-tight">
            Verification of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-400">Ohm's Law</span>
          </h1>

          <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed">
            Conduct a rigorous, hands-on physics experiment to verify that the potential difference across a conductor is directly proportional to the current flowing through it at constant temperature.
          </p>

          {/* Quick Formula Banner */}
          <div className="inline-flex items-center gap-6 p-4 rounded-2xl glass-card-static">
            <div className="text-center border-r border-white/[0.1] pr-6">
              <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-widest block font-data">Core Law</span>
              <span className="text-3xl font-extrabold font-data text-blue-400 tracking-wider">V = IR</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-xs font-data">
              <div>
                <span className="text-[var(--text-muted)] block">V</span>
                <span className="font-semibold text-emerald-400">Voltage (V)</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">I</span>
                <span className="font-semibold text-amber-400">Current (A)</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] block">R</span>
                <span className="font-semibold text-sky-400">Resistance (Ω)</span>
              </div>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => { sounds.playSuccess(); setMode('guided'); onNavigate('lab'); }}
              className="btn-primary text-sm px-6 py-3"
            >
              <Zap className="w-4 h-4 fill-current" />
              Start Experiment (Guided)
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => { sounds.playTick(); onNavigate('theory'); }}
              className="btn-ghost"
            >
              Learn Theory
            </button>

            <button
              onClick={() => { sounds.playTick(); onNavigate('apparatus'); }}
              className="btn-ghost"
            >
              <Layers className="w-4 h-4 text-blue-400" />
              Identify Apparatus
            </button>

            <button
              onClick={() => { sounds.playTick(); setMode('sandbox'); onNavigate('lab'); }}
              className="btn-ghost"
              style={{ borderColor: 'rgba(167,139,250,0.3)', color: '#c4b5fd' }}
            >
              Practice Mode (Sandbox)
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Objectives, Safety & Expected Graph */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Objectives */}
        <div className="glass-card-static p-6 space-y-4 animate-fade-in-up animate-delay-100">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(79,140,255,0.12)', border: '1px solid rgba(79,140,255,0.2)' }}>
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-display font-bold text-white">Experiment Objectives</h2>
          <ul className="space-y-2.5 text-xs text-[var(--text-secondary)] leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
              Correctly assemble a DC series-parallel circuit on the virtual workbench.
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
              Place the ammeter in <strong className="text-white">series</strong> and the voltmeter in <strong className="text-white">parallel</strong> across the test resistor.
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
              Vary DC voltage from 0 to 10 V and record at least 5 sets of simultaneous (V, I) readings.
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
              Plot the V-I characteristic graph, draw the best-fit line, and compute resistance from slope (R = ΔV / ΔI).
            </li>
          </ul>
        </div>

        {/* Safety & Protocol Instructions */}
        <div className="glass-card-static p-6 space-y-4 animate-fade-in-up animate-delay-200">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <h2 className="text-lg font-display font-bold text-white">Safety & Laboratory Rules</h2>
          <ul className="space-y-2.5 text-xs text-[var(--text-secondary)] leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <strong className="text-white">Keep the switch OPEN</strong> while establishing and checking wire connections.
            </li>
            <li className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <strong className="text-white">Never connect an ammeter in parallel</strong> across the power supply (causes instant short-circuit).
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
        <div className="glass-card-static p-6 space-y-4 flex flex-col justify-between animate-fade-in-up animate-delay-300">
          <div>
            <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)' }}>
              <LineChart className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-display font-bold text-white">Expected V-I Graph</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              For an ohmic conductor at constant temperature, the V-I plot is a straight line passing through the origin.
            </p>

            {/* Micro Graph Visualization */}
            <div className="mt-4 h-28 w-full rounded-xl relative p-3 flex items-end" style={{ background: 'rgba(15,15,35,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="absolute left-3 top-2 text-[10px] font-data text-blue-400 font-bold">V (Volts) ↑</div>
              <div className="absolute right-3 bottom-1 text-[10px] font-data text-amber-400 font-bold">→ I (Amps)</div>
              {/* Axes */}
              <div className="absolute left-6 bottom-5 right-4 h-[1px]" style={{ background: 'rgba(255,255,255,0.12)' }} />
              <div className="absolute left-6 bottom-5 top-5 w-[1px]" style={{ background: 'rgba(255,255,255,0.12)' }} />
              {/* Slanted Line */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <line x1="24" y1="90" x2="190" y2="28" stroke="#4f8cff" strokeWidth="2.5" strokeDasharray="3 3" />
                <circle cx="50" cy="78" r="3" fill="#fbbf24" />
                <circle cx="85" cy="65" r="3" fill="#fbbf24" />
                <circle cx="120" cy="52" r="3" fill="#fbbf24" />
                <circle cx="155" cy="40" r="3" fill="#fbbf24" />
              </svg>
              <span className="text-[10px] font-data text-[var(--text-muted)] ml-auto mr-1 mb-1">Slope = ΔV/ΔI = R</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Formula</span>
            <span className="font-data font-bold text-blue-400">R = V / I</span>
          </div>
        </div>
      </div>
    </div>
  );
};
