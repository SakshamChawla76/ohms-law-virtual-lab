import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  Gauge,
  Flame,
  Clock,
  Layers,
  Sliders
} from 'lucide-react';
import { sounds } from '../../../engine/audioEffects';

export const AirbagSim = ({ activeTab, onUpdateScore }) => {
  // --- Stoichiometric & Physical Inputs ---
  const [nan3Mass, setNan3Mass] = useState(130); // grams of NaN3 (60 - 220)
  const [tempCelsius, setTempCelsius] = useState(25); // Celsius (-20 to 50)
  const [bagCapacityLiters, setBagCapacityLiters] = useState(65); // Liters
  const [isSlowMo, setIsSlowMo] = useState(true);

  // --- Animation & Trigger State ---
  const [isCrashed, setIsCrashed] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0); // 0 to 60 milliseconds
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [challengeFeedback, setChallengeFeedback] = useState({});

  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const igniterParticlesRef = useRef([]);

  // --- Physical & Chemical Constants ---
  const molarMassNaN3 = 65.02;
  const molesNaN3 = nan3Mass / molarMassNaN3;
  const molesN2 = molesNaN3 * 1.5;

  const R = 0.08206;
  const tempKelvin = tempCelsius + 273.15;
  const atmosphericPressureAtm = 1.0;

  const targetVolumeLiters = (molesN2 * R * tempKelvin) / atmosphericPressureAtm;
  const finalPressureAtm = (molesN2 * R * tempKelvin) / bagCapacityLiters;

  let outcome = 'optimal';
  if (finalPressureAtm < 0.9) {
    outcome = 'underinflated';
  } else if (finalPressureAtm > 1.6) {
    outcome = 'rupture';
  }

  // Crash Trigger
  const handleTriggerCrash = () => {
    sounds.playZap();
    setIsCrashed(true);
    setElapsedMs(0);
    igniterParticlesRef.current = [];
  };

  const handleReset = () => {
    sounds.playSnap();
    setIsCrashed(false);
    setElapsedMs(0);
    igniterParticlesRef.current = [];
  };

  // High-Speed Millisecond Animation Loop
  useEffect(() => {
    if (activeTab !== 'sandbox') return;

    let curMs = elapsedMs;
    let lastTime = performance.now();

    const render = (now) => {
      const dtReal = (now - lastTime);
      lastTime = now;

      if (isCrashed && curMs < 60) {
        const timeScale = isSlowMo ? 0.015 : 0.06;
        curMs = Math.min(60, curMs + dtReal * timeScale);
        setElapsedMs(curMs);

        // Spawn igniter flame particles during initial combustion (0 to 18 ms)
        if (curMs < 20) {
          for (let i = 0; i < 3; i++) {
            igniterParticlesRef.current.push({
              x: 220,
              y: 210,
              vx: (Math.random() - 0.5) * 80,
              vy: (Math.random() - 0.5) * 80,
              life: 1.0,
              color: Math.random() > 0.4 ? '#f59e0b' : '#ef4444'
            });
          }
        }
      }

      // Update combustion particles
      igniterParticlesRef.current = igniterParticlesRef.current.map(p => ({
        ...p,
        x: p.x + p.vx * 0.04,
        y: p.y + p.vy * 0.04,
        life: p.life - 0.05
      })).filter(p => p.life > 0);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Grid
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Car Interior Dashboard & Steering Wheel
      const wheelX = 220;
      const wheelY = height * 0.55;

      // Dashboard
      ctx.fillStyle = '#475569';
      ctx.fillRect(wheelX - 90, wheelY - 20, 80, 40);

      // Steering wheel rim
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.ellipse(wheelX, wheelY, 40, 90, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Steering canister hub
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.ellipse(wheelX, wheelY, 20, 40, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3. Igniter Spark Flash (0 to 15 ms)
      if (curMs > 0 && curMs < 18) {
        ctx.save();
        ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
        ctx.beginPath();
        ctx.arc(wheelX, wheelY, 35, 0, Math.PI * 2);
        ctx.fill();

        for (const p of igniterParticlesRef.current) {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 4. Airbag Cushion Dynamics
      const inflationT = Math.max(0, Math.min(1, (curMs - 8) / 32));
      const currentLit = targetVolumeLiters * inflationT;
      const maxRadiusX = Math.min(160, 20 + currentLit * 1.8);
      const maxRadiusY = Math.min(140, 30 + currentLit * 1.5);

      if (inflationT > 0) {
        ctx.save();
        ctx.translate(wheelX, wheelY);

        if (outcome === 'rupture' && curMs > 35) {
          // Ruptured bag with tear lines
          ctx.strokeStyle = '#ef4444';
          ctx.fillStyle = 'rgba(254, 226, 226, 0.8)';
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 4]);
          ctx.beginPath();
          ctx.ellipse(maxRadiusX * 0.45, 0, maxRadiusX * 0.8, maxRadiusY * 0.7, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 12px monospace';
          ctx.fillText('⚡ GAS OVERPRESSURE RUPTURE!', maxRadiusX * 0.8, -40);
        } else {
          // Normal inflating nylon cushion with volumetric gradient
          const gradBag = ctx.createRadialGradient(maxRadiusX * 0.3, -10, 10, maxRadiusX * 0.5, 0, maxRadiusX);
          gradBag.addColorStop(0, outcome === 'optimal' ? '#fde68a' : '#f1f5f9');
          gradBag.addColorStop(1, outcome === 'optimal' ? '#f59e0b' : '#cbd5e1');

          ctx.fillStyle = gradBag;
          ctx.strokeStyle = outcome === 'optimal' ? '#b45309' : '#94a3b8';
          ctx.lineWidth = 3;

          ctx.beginPath();
          ctx.ellipse(maxRadiusX * 0.5, 0, maxRadiusX * 0.65, maxRadiusY, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // N2 Gas Molecules inside bag
          ctx.fillStyle = '#1e3a8a';
          const moleculeCount = Math.floor(molesN2 * 8 * inflationT);
          for (let i = 0; i < moleculeCount; i++) {
            const angle = (i * 137.5) * (Math.PI / 180);
            const r = Math.sqrt(i / moleculeCount) * (maxRadiusX * 0.45);
            const mx = maxRadiusX * 0.5 + r * Math.cos(angle);
            const my = (r * 0.8) * Math.sin(angle);
            ctx.beginPath();
            ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      // 5. Crash Test Dummy Head
      const dummyStartX = width - 120;
      const dummyForwardDist = isCrashed ? Math.min(220, Math.pow(curMs / 60, 2) * 220) : 0;
      const dummyX = dummyStartX - dummyForwardDist;
      const dummyY = wheelY;

      // Dummy Head
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(dummyX, dummyY, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Crash test target marker
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(dummyX, dummyY);
      ctx.arc(dummyX, dummyY, 44, 0, Math.PI / 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(dummyX, dummyY);
      ctx.arc(dummyX, dummyY, 44, Math.PI, 1.5 * Math.PI);
      ctx.fill();

      // Millisecond Timer Callout
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`T = ${curMs.toFixed(1)} ms`, 30, 40);

      // Deceleration G-meter badge
      const decelG = isCrashed ? (curMs > 40 && outcome === 'optimal' ? 12 : curMs > 45 && outcome === 'underinflated' ? 55 : 4) : 0;
      ctx.fillStyle = decelG > 35 ? '#ef4444' : '#10b981';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`DECEL: ${decelG} G`, 30, 62);

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [activeTab, isCrashed, elapsedMs, isSlowMo, targetVolumeLiters, molesN2, outcome]);

  const handleAnswerSubmit = (qId, idx, isCorrect) => {
    sounds.playClick();
    setSelectedAnswers(prev => ({ ...prev, [qId]: idx }));
    setChallengeFeedback(prev => ({ ...prev, [qId]: isCorrect ? 'correct' : 'incorrect' }));
    if (isCorrect && onUpdateScore) {
      sounds.playSuccess();
      onUpdateScore(20);
    }
  };

  return (
    <div className="space-y-6">
      {/* TAB 1: CURIOSITY */}
      {activeTab === 'curiosity' && (
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Flame className="w-3.5 h-3.5 text-emerald-600" />
              THE 40-MILLISECOND CHEMICAL EXPLOSION
            </div>

            <h2 className="text-2xl md:text-3xl font-bold font-sans text-slate-900 tracking-tight">
              How does a chemical reaction inflate a life-saving airbag in milliseconds?
            </h2>

            <p className="text-sm font-semibold text-emerald-800 italic">
              "A car travelling at 60 km/h hits a concrete barrier. Within 50 milliseconds, the driver's head will smash into the steering wheel. No mechanical pump or compressed air tank on Earth could open fast enough. Only chemistry can save your life."
            </p>

            <div className="text-xs text-slate-600 space-y-3 font-sans leading-relaxed">
              <p>
                Inside the steering wheel hub is solid <strong>Sodium Azide (NaN₃)</strong>. Upon electric sensor trigger:
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-mono text-xs font-bold text-slate-800">
                2 NaN₃(s) ───[Electric Spark]───► 2 Na(s) + 3 N₂(g)
              </div>
              <p>
                In under 40 milliseconds, this produces pure, inert Nitrogen gas that expands into a 65-liter nylon cushion, absorbing passenger momentum before gently deflating through side exhaust ports.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SANDBOX */}
      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-left">
          {/* Main 60 FPS Viewport (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-700">
                    HIGH-SPEED MILLISECOND BALLISTICS // CRASH IMPACT
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { sounds.playTick(); setIsSlowMo(!isSlowMo); }}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-all ${
                      isSlowMo ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {isSlowMo ? 'Slow-Mo (0.02x)' : 'High Speed'}
                  </button>

                  <button
                    onClick={handleTriggerCrash}
                    disabled={isCrashed && elapsedMs < 60}
                    className="px-3 py-1 rounded text-xs font-mono font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50 active:scale-[0.98] transition-transform"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span>TRIGGER CRASH</span>
                  </button>

                  <button
                    onClick={handleReset}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
                    title="Reset crash sequence"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Canvas */}
              <div className="relative w-full bg-slate-50 select-none">
                <canvas
                  ref={canvasRef}
                  width={760}
                  height={380}
                  className="w-full h-auto block"
                />

                {isCrashed && elapsedMs >= 50 && (
                  <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-xs font-mono font-bold border shadow-md flex items-center gap-2 ${
                    outcome === 'optimal' 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : outcome === 'underinflated'
                      ? 'bg-rose-50 border-rose-300 text-rose-800'
                      : 'bg-amber-50 border-amber-300 text-amber-800'
                  }`}>
                    {outcome === 'optimal' && '🛡️ PERFECT INFLATION! PASSENGER PROTECTED (1.0 ATM)'}
                    {outcome === 'underinflated' && '❌ UNDERINFLATED! PASSENGER HEAD HITS STEERING WHEEL'}
                    {outcome === 'rupture' && '⚠️ OVERPRESSURE RUPTURE! EXCESS GAS BURST NYLON SEAMS'}
                  </div>
                )}
              </div>

              {/* Telemetry Dashboard */}
              <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Reactant NaN3</div>
                  <div className="text-base font-bold text-slate-800">{nan3Mass} g</div>
                  <div className="text-[10px] text-slate-400">{molesNaN3.toFixed(2)} moles</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">N2 Gas Yield</div>
                  <div className="text-base font-bold text-emerald-700">{targetVolumeLiters.toFixed(1)} L</div>
                  <div className="text-[10px] text-slate-400">{molesN2.toFixed(2)} mol N2</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Internal Pressure</div>
                  <div className={`text-base font-bold ${
                    outcome === 'optimal' ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    {finalPressureAtm.toFixed(2)} atm
                  </div>
                  <div className="text-[10px] text-slate-400">Target: ~1.0 - 1.4 atm</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Deployment Time</div>
                  <div className="text-base font-bold text-blue-700">{elapsedMs.toFixed(1)} ms</div>
                  <div className="text-[10px] text-slate-400">Crash duration: 60 ms</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Controls (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-900 uppercase">
                  Stoichiometric Controls
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Calculate reactant mass to achieve perfect equilibrium pressure.
                </p>
              </div>

              {/* Slider: NaN3 Mass */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-700 font-bold">SOLID NaN3 MASS:</span>
                  <span className="font-bold text-emerald-700">{nan3Mass} g</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={220}
                  step={5}
                  value={nan3Mass}
                  onChange={(e) => {
                    sounds.playTick();
                    setNan3Mass(Number(e.target.value));
                  }}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>60g (Under)</span>
                  <span className="text-emerald-700 font-bold">~130g (Optimal)</span>
                  <span>220g (Rupture)</span>
                </div>
              </div>

              {/* Slider: Ambient Temperature */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-700 font-bold">AMBIENT TEMPERATURE:</span>
                  <span className="font-bold text-slate-800">{tempCelsius}°C ({tempKelvin.toFixed(0)} K)</span>
                </div>
                <input
                  type="range"
                  min={-20}
                  max={50}
                  step={5}
                  value={tempCelsius}
                  onChange={(e) => {
                    sounds.playTick();
                    setTempCelsius(Number(e.target.value));
                  }}
                  className="w-full accent-slate-700 cursor-pointer"
                />
              </div>

              {/* Slider: Bag Capacity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-700 font-bold">BAG VOLUME CAPACITY:</span>
                  <span className="font-bold text-slate-800">{bagCapacityLiters} Liters</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={90}
                  step={5}
                  value={bagCapacityLiters}
                  onChange={(e) => {
                    sounds.playTick();
                    setBagCapacityLiters(Number(e.target.value));
                  }}
                  className="w-full accent-slate-700 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CHALLENGES */}
      {activeTab === 'challenges' && (
        <div className="max-w-3xl mx-auto space-y-5 text-left">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-sans">
            <strong>Gas Stoichiometry Laboratory:</strong> Test your understanding of ideal gas laws and reaction kinetics. Earn up to 60 laboratory score points!
          </div>

          {/* Question 1 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase">
              Challenge 1 of 2 // Stoichiometric Mole Ratio
            </div>
            <h3 className="text-sm font-bold font-sans text-slate-900">
              According to the reaction 2 NaN₃(s) → 2 Na(s) + 3 N₂(g), how many moles of Nitrogen gas are generated per mole of Sodium Azide consumed?
            </h3>

            <div className="space-y-2">
              {[
                { text: "1.5 moles of N₂ gas (3 / 2 ratio)", correct: true },
                { text: "1.0 mole of N₂ gas", correct: false },
                { text: "2.0 moles of N₂ gas", correct: false },
                { text: "3.0 moles of N₂ gas", correct: false }
              ].map((opt, idx) => {
                const isSelected = selectedAnswers['q1'] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSubmit('q1', idx, opt.correct)}
                    className={`w-full p-3 rounded-xl border text-left text-xs font-sans transition-all flex items-center justify-between ${
                      isSelected 
                        ? opt.correct 
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                          : 'bg-rose-50 border-rose-400 text-rose-900'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    <span>{opt.text}</span>
                    {isSelected && (
                      opt.correct 
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        : <Flame className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
