import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  ArrowRight, 
  Layers, 
  Sliders, 
  Gauge, 
  ShieldCheck, 
  Sparkles,
  HelpCircle
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

      // Draw wire
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(30, canvas.height / 2);
      ctx.lineTo(canvas.width - 30, canvas.height / 2);
      ctx.stroke();

      // Inner wire core
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 8;
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

        // Particle
        ctx.shadowColor = 'rgba(2, 132, 199, 0.4)';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(p.x, p.y + p.offset, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Dot core
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y + p.offset, 2, 0, Math.PI * 2);
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
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn text-slate-800">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Discovery
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Theory of Ohm's Law</h1>
          <p className="text-slate-600 text-sm mt-1">
            Discover the direct mathematical relationship governing electric current before entering the laboratory.
          </p>
        </div>

        <button
          onClick={() => { sounds.playTick(); onNavigate('apparatus'); }}
          className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          <Layers className="w-4 h-4" />
          Next: Identify Apparatus
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 4 Interactive Theory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Voltage */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 hover:border-emerald-300 transition-all">
          <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold font-mono text-sm">
            V
          </div>
          <h2 className="text-base font-bold text-slate-900">Voltage (V)</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            The <strong>potential difference</strong> (in Volts) that acts as an electrical pressure, driving charge carriers through the conductor.
          </p>
          <div className="text-[11px] font-mono text-emerald-700 pt-2 border-t border-slate-100">
            Unit: Volt (V) = 1 Joule / Coulomb
          </div>
        </div>

        {/* Current */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 hover:border-amber-300 transition-all">
          <div className="h-8 w-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-bold font-mono text-sm">
            I
          </div>
          <h2 className="text-base font-bold text-slate-900">Current (I)</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            The <strong>rate of flow of electric charge</strong> ($I = \Delta Q / \Delta t$) passing through a cross-section of wire per second.
          </p>
          <div className="text-[11px] font-mono text-amber-700 pt-2 border-t border-slate-100">
            Unit: Ampere (A) = 1 Coulomb / sec
          </div>
        </div>

        {/* Resistance */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2 hover:border-sky-300 transition-all">
          <div className="h-8 w-8 rounded-lg bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700 font-bold font-mono text-sm">
            R
          </div>
          <h2 className="text-base font-bold text-slate-900">Resistance (R)</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            The inherent physical <strong>opposition</strong> that a material offers to the motion of flowing charge carriers.
          </p>
          <div className="text-[11px] font-mono text-sky-700 pt-2 border-t border-slate-100">
            Unit: Ohm (Ω) = 1 Volt / Ampere
          </div>
        </div>

        {/* Ohm's Law */}
        <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 shadow-sm space-y-2 hover:border-blue-300 transition-all">
          <div className="h-8 w-8 rounded-lg bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-700 font-bold text-sm">
            <Zap className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-blue-900">Ohm's Law</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            At constant temperature, $V \propto I$. Hence:
            <span className="block my-1 font-mono font-bold text-slate-900 text-sm bg-white px-2 py-0.5 rounded border border-slate-200 text-center">
              V = I × R
            </span>
          </p>
          <div className="text-[11px] font-mono text-blue-700 pt-2 border-t border-blue-100">
            Linear for Ohmic conductors
          </div>
        </div>
      </div>

      {/* Interactive Theory Discovery Playground */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600" />
              Interactive Relationship Visualizer
            </h2>
            <p className="text-xs text-slate-600">
              Slide the voltage control below. Notice how current and electron flow velocity dynamically respond in real-time.
            </p>
          </div>
          <div className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 self-start sm:self-auto">
            Constant Resistance: <strong className="text-slate-900">R = 50 Ω</strong>
          </div>
        </div>

        {/* Dynamic Wire Animation Canvas */}
        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono mb-2">
            <span>+ POSITIVE TERMINAL</span>
            <span className="text-blue-700 flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              Charge Carrier Drift Speed: {(demoCurrent * 100).toFixed(1)} mm/s (Simulated)
            </span>
            <span>- RETURN TERMINAL</span>
          </div>

          <canvas
            ref={canvasRef}
            width={720}
            height={70}
            className="w-full h-16 rounded-xl bg-white border border-slate-200"
          />

          <p className="text-[11px] text-slate-500 text-center mt-2">
            Particles represent charge packets moving through the resistive element under electrical potential gradient.
          </p>
        </div>

        {/* Live Controls and Readouts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Voltage Slider */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Adjust Voltage (V)
              </label>
              <span className="text-xl font-extrabold font-mono text-emerald-700">
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
              className="w-full h-2 cursor-pointer"
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0 V (Off)</span>
              <span>5.0 V</span>
              <span>10.0 V (Max)</span>
            </div>
          </div>

          {/* Current Calculation Output */}
          <div className="space-y-2 p-4 rounded-xl bg-slate-50 border border-amber-200 text-center">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              Resulting Current (I = V / R)
            </span>
            <div className="text-3xl font-extrabold font-mono text-amber-700">
              {demoCurrent.toFixed(3)} A
              <span className="text-xs font-normal text-slate-500 ml-1">
                ({(demoCurrent * 1000).toFixed(0)} mA)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              {demoVoltage} V / 50 Ω = {demoCurrent.toFixed(3)} A
            </p>
          </div>

          {/* Virtual Needle Dial Preview */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center">
            <div className="relative w-32 h-16 overflow-hidden flex items-end justify-center">
              <div className="absolute inset-0 w-32 h-32 rounded-full border-4 border-slate-300 border-t-amber-500" />
              <div 
                className="absolute bottom-0 w-1 h-14 bg-rose-600 origin-bottom transition-transform duration-200 shadow-sm"
                style={{
                  transform: `rotate(${-60 + (demoCurrent / 0.20) * 120}deg)`
                }}
              />
              <div className="w-3 h-3 rounded-full bg-slate-200 border-2 border-slate-600 z-10" />
            </div>
            <span className="text-[11px] font-mono text-slate-500 mt-2">Ammeter Needle Deflection</span>
          </div>
        </div>

        {/* Discovery Table Walkthrough */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
            Observed Proportional Step Progression
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
            {[1, 2, 4, 6, 8].map(v => {
              const i = (v / demoResistance).toFixed(2);
              const isActive = Math.abs(demoVoltage - v) < 0.5;
              return (
                <div 
                  key={v}
                  className={`p-2 rounded-lg border transition-all ${
                    isActive 
                      ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold scale-105 shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <div>V = {v} V</div>
                  <div className="text-amber-700">I = {i} A</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
