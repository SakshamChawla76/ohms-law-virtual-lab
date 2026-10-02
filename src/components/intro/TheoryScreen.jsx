import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  ArrowRight, 
  Layers, 
  Sliders, 
  Gauge, 
  ShieldCheck, 
  Sparkles,
  HelpCircle,
  Activity
} from 'lucide-react';
import { sounds } from '../../engine/audioEffects';

export const TheoryScreen = ({ onNavigate }) => {
  const [demoVoltage, setDemoVoltage] = useState(4.0);
  const demoResistance = 50; // Constant 50 Ω
  const demoCurrent = demoVoltage / demoResistance; // in Amps

  // Particle animation on canvas
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let particles = [];
    const numParticles = 24;

    for (let i = 0; i < numParticles; i++) {
      particles.push({
        x: (i / numParticles) * canvas.width,
        y: canvas.height / 2,
        offset: Math.random() * 4 - 2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw wire background
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 16;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(30, canvas.height / 2);
      ctx.lineTo(canvas.width - 30, canvas.height / 2);
      ctx.stroke();

      // Inner wire core
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(30, canvas.height / 2);
      ctx.lineTo(canvas.width - 30, canvas.height / 2);
      ctx.stroke();

      // Speed proportional to current
      const speed = demoCurrent > 0 ? demoCurrent * 28 + 0.5 : 0;

      // Draw moving charges
      particles.forEach(p => {
        p.x += speed;
        if (p.x > canvas.width - 30) {
          p.x = 30;
        }

        // Particle glow
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(p.x, p.y + p.offset, 5, 0, Math.PI * 2);
        ctx.fill();

        // White core
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y + p.offset, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [demoCurrent]);

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    setDemoVoltage(val);
    sounds.playTick();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn text-slate-100">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Interactive Discovery
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Theory of Ohm's Law</h1>
          <p className="text-slate-400 text-sm mt-1">
            Discover the direct mathematical relationship governing electric current before entering the laboratory.
          </p>
        </div>

        <button
          onClick={() => { sounds.playTick(); onNavigate('apparatus'); }}
          className="self-start md:self-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
        >
          <Layers className="w-4 h-4" />
          Next: Identify Apparatus
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Interactive Theory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Voltage */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-lg space-y-2 hover:border-emerald-500/40 transition-all group">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold font-mono text-sm shadow-sm group-hover:scale-105 transition-transform">
            V
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">Voltage (V)</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The <strong className="text-slate-200">potential difference</strong> (in Volts) that acts as an electrical pressure, driving charge carriers through the conductor.
          </p>
          <div className="text-[11px] font-mono text-emerald-400 pt-2 border-t border-white/5">
            Unit: Volt (V) = 1 Joule / Coulomb
          </div>
        </div>

        {/* Current */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-lg space-y-2 hover:border-amber-500/40 transition-all group">
          <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold font-mono text-sm shadow-sm group-hover:scale-105 transition-transform">
            I
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">Current (I)</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The <strong className="text-slate-200">rate of flow of electric charge</strong> ($I = \Delta Q / \Delta t$) passing through a cross-section of wire per second.
          </p>
          <div className="text-[11px] font-mono text-amber-400 pt-2 border-t border-white/5">
            Unit: Ampere (A) = 1 Coulomb / sec
          </div>
        </div>

        {/* Resistance */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-lg space-y-2 hover:border-cyan-500/40 transition-all group">
          <div className="h-9 w-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold font-mono text-sm shadow-sm group-hover:scale-105 transition-transform">
            R
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">Resistance (R)</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            The inherent physical <strong className="text-slate-200">opposition</strong> that a material offers to the motion of flowing charge carriers.
          </p>
          <div className="text-[11px] font-mono text-cyan-400 pt-2 border-t border-white/5">
            Unit: Ohm (Ω) = 1 Volt / Ampere
          </div>
        </div>

        {/* Ohm's Law */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950/40 to-slate-900/60 border border-blue-500/30 backdrop-blur-xl shadow-lg space-y-2 hover:border-blue-400/50 transition-all group">
          <div className="h-9 w-9 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-cyan-300 font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4 text-cyan-300" />
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">Ohm's Law</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            At constant temperature, $V \propto I$. Hence:
            <span className="block my-1.5 font-mono font-bold text-cyan-300 text-sm bg-slate-950/80 px-2.5 py-1 rounded-lg border border-cyan-500/30 text-center shadow-inner">
              V = I × R
            </span>
          </p>
          <div className="text-[11px] font-mono text-cyan-400 pt-2 border-t border-white/5">
            Linear for Ohmic conductors
          </div>
        </div>
      </div>

      {/* Interactive Theory Discovery Playground */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2 tracking-tight">
              <Sliders className="w-5 h-5 text-cyan-400" />
              Interactive Relationship Visualizer
            </h2>
            <p className="text-xs text-slate-400">
              Slide the voltage control below. Notice how current and electron flow velocity dynamically respond in real-time.
            </p>
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-white/10 text-xs font-mono text-slate-300 self-start sm:self-auto flex items-center gap-1.5 shadow-sm">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Constant Load: <strong className="text-cyan-400">R = 50 Ω</strong>
          </div>
        </div>

        {/* Dynamic Wire Animation Canvas */}
        <div className="rounded-2xl bg-slate-950/80 p-5 border border-white/10 relative overflow-hidden shadow-inner">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-3">
            <span className="text-rose-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              + POSITIVE TERMINAL
            </span>
            <span className="text-cyan-400 flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Charge Carrier Drift Speed: {(demoCurrent * 100).toFixed(1)} mm/s (Simulated)
            </span>
            <span className="text-slate-400 font-semibold">- RETURN TERMINAL</span>
          </div>

          <canvas
            ref={canvasRef}
            width={720}
            height={70}
            className="w-full h-16 rounded-xl bg-[#0b0e1b] border border-white/10 shadow-inner"
          />

          <p className="text-[11px] text-slate-500 text-center mt-3 font-mono">
            Particles represent charge packets moving through the resistive element under electrical potential gradient.
          </p>
        </div>

        {/* Live Controls and Readouts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Voltage Slider */}
          <div className="space-y-3 p-5 rounded-2xl bg-slate-800/40 border border-white/10">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Adjust Voltage (V)
              </label>
              <span className="text-2xl font-extrabold font-mono text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">
                {demoVoltage.toFixed(1)} V
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={demoVoltage}
              onChange={handleSliderChange}
              className="w-full h-2 cursor-pointer accent-cyan-400 bg-slate-700 rounded-lg"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span>0 V (Off)</span>
              <span>5.0 V</span>
              <span>10.0 V (Max)</span>
            </div>
          </div>

          {/* Current Calculation Output */}
          <div className="space-y-2 p-5 rounded-2xl bg-slate-800/40 border border-amber-500/30 text-center shadow-lg">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Resulting Current (I = V / R)
            </span>
            <div className="text-3xl font-extrabold font-mono text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
              {demoCurrent.toFixed(3)} A
              <span className="text-xs font-normal text-slate-400 ml-1.5 font-sans">
                ({(demoCurrent * 1000).toFixed(0)} mA)
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              {demoVoltage} V / 50 Ω = {demoCurrent.toFixed(3)} A
            </p>
          </div>

          {/* Virtual Needle Dial Preview */}
          <div className="p-5 rounded-2xl bg-slate-800/40 border border-white/10 flex flex-col items-center justify-center">
            <div className="relative w-36 h-20 overflow-hidden flex items-end justify-center">
              <div className="absolute inset-0 w-36 h-36 rounded-full border-4 border-slate-700 border-t-cyan-400" />
              <div 
                className="absolute bottom-0 w-1.5 h-16 bg-rose-500 origin-bottom transition-transform duration-200 shadow-md"
                style={{
                  transform: `rotate(${-60 + (demoCurrent / 0.20) * 120}deg)`,
                  filter: 'drop-shadow(0 0 4px rgba(244, 63, 94, 0.8))'
                }}
              />
              <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-cyan-400 z-10 shadow" />
            </div>
            <span className="text-[11px] font-mono text-slate-400 mt-2">Ammeter Needle Deflection</span>
          </div>
        </div>

        {/* Discovery Table Walkthrough */}
        <div className="p-5 rounded-2xl bg-slate-800/40 border border-white/10 space-y-2.5">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Observed Proportional Step Progression
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center text-xs font-mono">
            {[1, 2, 4, 6, 8].map(v => {
              const i = (v / demoResistance).toFixed(2);
              const isActive = Math.abs(demoVoltage - v) < 0.5;
              return (
                <div 
                  key={v}
                  className={`p-3 rounded-xl border transition-all ${
                    isActive 
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 font-bold scale-105 shadow-md shadow-cyan-500/20' 
                      : 'bg-slate-900/60 border-white/10 text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className="text-white font-semibold">V = {v} V</div>
                  <div className="text-amber-400 mt-0.5">I = {i} A</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

