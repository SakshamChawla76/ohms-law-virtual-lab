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
  Layers
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

  // --- Physical & Chemical Constants ---
  // Molar mass of NaN3 = 22.99 + 3*14.01 = 65.02 g/mol
  const molarMassNaN3 = 65.02;
  // Stoichiometry: 2 mol NaN3 yields 3 mol N2 gas (1.5 mol N2 per mol NaN3)
  const molesNaN3 = nan3Mass / molarMassNaN3;
  const molesN2 = molesNaN3 * 1.5;

  // Gas Constant R = 0.0821 L·atm / (mol·K)
  const R = 0.08206;
  const tempKelvin = tempCelsius + 273.15;
  const atmosphericPressureAtm = 1.0;

  // Final Equilibrium Volume at 1.0 atm: V = nRT / P
  const targetVolumeLiters = (molesN2 * R * tempKelvin) / atmosphericPressureAtm;

  // Final internal pressure in the bag (assuming fixed bag volume = bagCapacityLiters)
  // If gas exceeds bag capacity, pressure spikes!
  const finalPressureAtm = (molesN2 * R * tempKelvin) / bagCapacityLiters;

  // Determine outcome
  let outcome = 'optimal';
  if (finalPressureAtm < 0.9) {
    outcome = 'underinflated'; // Dummy hits steering wheel
  } else if (finalPressureAtm > 1.6) {
    outcome = 'rupture'; // Bag ruptures from excessive overpressure
  }

  // Crash Trigger
  const handleTriggerCrash = () => {
    sounds.playZap();
    setIsCrashed(true);
    setElapsedMs(0);
  };

  const handleReset = () => {
    sounds.playSnap();
    setIsCrashed(false);
    setElapsedMs(0);
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
        // Slow-motion factor: 1 real second = 15 ms in sim if slow-mo
        const timeScale = isSlowMo ? 0.015 : 0.06;
        curMs = Math.min(60, curMs + dtReal * timeScale);
        setElapsedMs(curMs);
      }

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Pale grid background
      ctx.strokeStyle = '#e2e8f0';
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

      // 2. Car Interior Schematic (Dashboard & Steering Wheel)
      const wheelX = 220;
      const wheelY = height * 0.55;

      // Steering column
      ctx.fillStyle = '#475569';
      ctx.fillRect(wheelX - 90, wheelY - 20, 80, 40);

      // Steering wheel rim
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 12;
      ctx.beginPath();
      ctx.ellipse(wheelX, wheelY, 40, 90, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Steering hub canister
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.ellipse(wheelX, wheelY, 20, 40, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3. Airbag Cushion Dynamics
      // Inflation takes place mostly between 10 ms and 40 ms
      const inflationT = Math.max(0, Math.min(1, (curMs - 8) / 32));
      const currentLit = targetVolumeLiters * inflationT;
      const maxRadiusX = Math.min(160, 20 + currentLit * 1.8);
      const maxRadiusY = Math.min(140, 30 + currentLit * 1.5);

      if (inflationT > 0) {
        ctx.save();
        ctx.translate(wheelX, wheelY);

        if (outcome === 'rupture' && curMs > 35) {
          // Ruptured bag
          ctx.strokeStyle = '#ef4444';
          ctx.fillStyle = 'rgba(254, 226, 226, 0.8)';
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 4]);
          ctx.beginPath();
          ctx.ellipse(maxRadiusX * 0.45, 0, maxRadiusX * 0.8, maxRadiusY * 0.7, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.setLineDash([]);

          // Gas escape streaks
          ctx.fillStyle = '#ef4444';
          ctx.font = '12px monospace';
          ctx.fillText('⚡ GAS RUPTURE!', maxRadiusX * 0.8, -40);
        } else {
          // Normal / inflating nylon cushion
          const bagColor = outcome === 'optimal' ? 'rgba(251, 191, 36, 0.85)' : 'rgba(226, 232, 240, 0.85)';
          ctx.fillStyle = bagColor;
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

      // 4. Passenger / Crash Test Dummy Head
      // Dummy moves forward due to inertia (t = 0 -> 60 ms)
      const dummyStartX = width - 120;
      const dummyForwardDist = isCrashed ? Math.min(220, Math.pow(curMs / 60, 2) * 220) : 0;
      const dummyX = dummyStartX - dummyForwardDist;
      const dummyY = wheelY;

      // Draw Dummy Head
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(dummyX, dummyY, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Crash test target marker on dummy
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

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [activeTab, isCrashed, elapsedMs, isSlowMo, targetVolumeLiters, molesN2, outcome]);

  const handleAnswerSubmit = (qId, idx, isCorrect) => {
    sounds.playClick();
    setSelectedAnswers(prev => ({ ...prev, [qId]: idx }));
    setChallengeFeedback(prev => ({ ...prev, [qId]: isCorrect ? 'correct' : 'incorrect' }));
    if (isCorrect && onUpdateScore) onUpdateScore(20);
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
                Inside the steering wheel sits an electronic deceleration sensor and a pellet canister containing solid <strong>Sodium Azide (NaN₃)</strong>. Upon impact, an electric igniter sparks, triggering a violent thermal decomposition:
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-mono text-xs font-bold text-slate-800">
                2 NaN₃(s) —[Electric Spark]→ 2 Na(s) + 3 N₂(g) + Heat
              </div>
              <p>
                Solid sodium azide occupies almost no volume. But when decomposed, it liberates enormous quantities of pure nitrogen gas (N₂). Using the <strong>Ideal Gas Law (PV = nRT)</strong>, automotive chemical engineers must calculate the exact gram mass of NaN₃ to generate roughly 65 Liters of nitrogen at ~1.2 atmospheres of cushioning pressure.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SANDBOX */}
      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-left">
          {/* Main Simulation Viewport (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-700">
                    AIRBAG DECOMPOSITION & KINETICS SIMULATOR
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSlowMo(!isSlowMo)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-all ${
                      isSlowMo ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {isSlowMo ? 'Slow-Mo (15x)' : 'Real-Time'}
                  </button>

                  <button
                    onClick={handleReset}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
                    title="Reset Simulator"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="relative w-full bg-slate-50">
                <canvas
                  ref={canvasRef}
                  width={760}
                  height={380}
                  className="w-full h-auto block"
                />

                {/* Outcome Indicator Callout */}
                {isCrashed && elapsedMs >= 40 && (
                  <div className={`absolute top-4 right-4 px-3.5 py-2 rounded-xl text-xs font-mono font-bold shadow-md border ${
                    outcome === 'optimal' 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                      : outcome === 'underinflated'
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-rose-50 border-rose-300 text-rose-800'
                  }`}>
                    {outcome === 'optimal' && '✓ OPTIMAL CUSHION: DRIVER PROTECTED'}
                    {outcome === 'underinflated' && '⚠ UNDER-INFLATED: IMPACT WITH WHEEL'}
                    {outcome === 'rupture' && '⚡ BAG RUPTURED: EXCESSIVE PRESSURE'}
                  </div>
                )}
              </div>

              {/* Chemical Telemetry Readouts */}
              <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Reactant Mass</div>
                  <div className="text-base font-bold text-slate-800">{nan3Mass} g NaN₃</div>
                  <div className="text-[10px] text-slate-400">{molesNaN3.toFixed(2)} moles</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Gas Produced</div>
                  <div className="text-base font-bold text-blue-700">{molesN2.toFixed(2)} mol N₂</div>
                  <div className="text-[10px] text-slate-400">{(molesN2 * 28.01).toFixed(1)} g N₂</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Expanded Volume</div>
                  <div className="text-base font-bold text-amber-700">{targetVolumeLiters.toFixed(1)} L</div>
                  <div className="text-[10px] text-slate-400">Cap: {bagCapacityLiters} L</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Internal Pressure</div>
                  <div className={`text-base font-bold ${
                    finalPressureAtm < 0.9 ? 'text-amber-600' : finalPressureAtm > 1.6 ? 'text-rose-600' : 'text-emerald-700'
                  }`}>
                    {finalPressureAtm.toFixed(2)} atm
                  </div>
                  <div className="text-[10px] text-slate-400">{outcome.toUpperCase()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Control Deck (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-900 uppercase">
                  Airbag Stoichiometry Deck
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Calculate the mass of NaN₃ needed to produce the ideal gas volume.
                </p>
              </div>

              {/* Slider: NaN3 Mass */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-600 font-bold">MASS OF NaN₃:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                    {nan3Mass} grams
                  </span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={220}
                  step={5}
                  value={nan3Mass}
                  onChange={(e) => {
                    setNan3Mass(Number(e.target.value));
                    handleReset();
                  }}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>60g (Low)</span>
                  <span>Optimal: ~130g</span>
                  <span>220g (High)</span>
                </div>
              </div>

              {/* Slider: Temperature */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-600 font-bold">TEMPERATURE (T):</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                    {tempCelsius}°C ({tempKelvin.toFixed(1)} K)
                  </span>
                </div>
                <input
                  type="range"
                  min={-20}
                  max={50}
                  step={5}
                  value={tempCelsius}
                  onChange={(e) => {
                    setTempCelsius(Number(e.target.value));
                    handleReset();
                  }}
                  className="w-full accent-slate-700 cursor-pointer"
                />
              </div>

              {/* Trigger Crash Button */}
              <div className="pt-2">
                <button
                  onClick={handleTriggerCrash}
                  disabled={isCrashed && elapsedMs >= 60}
                  className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-mono font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Flame className="w-4 h-4" />
                  <span>TRIGGER CRASH SENSOR</span>
                </button>
              </div>

              {/* Quick Presets */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-mono text-slate-500 uppercase font-bold">
                  Preset Experiments:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setNan3Mass(70);
                      handleReset();
                    }}
                    className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-mono text-left"
                  >
                    <div className="font-bold">Underfill</div>
                    <div className="text-[10px]">70g NaN₃</div>
                  </button>

                  <button
                    onClick={() => {
                      setNan3Mass(130);
                      handleReset();
                    }}
                    className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-mono text-left"
                  >
                    <div className="font-bold">Balanced</div>
                    <div className="text-[10px]">130g NaN₃</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CHALLENGE ME */}
      {activeTab === 'challenge' && (
        <div className="max-w-3xl mx-auto space-y-5 text-left">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-sans">
            <strong>Stoichiometry & Gas Law Challenges:</strong> Apply $PV=nRT$ and molar ratios to verify the design parameters. Earn up to 40 laboratory points!
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase">
              Challenge 1 of 2 // Molar Stoichiometry
            </div>
            <h3 className="text-sm font-bold font-sans text-slate-800">
              According to the balanced equation 2 NaN₃ → 2 Na + 3 N₂, how many moles of nitrogen gas are produced from 2.0 moles of solid sodium azide?
            </h3>

            <div className="space-y-2">
              {[
                { text: "1.5 moles of N₂", correct: false },
                { text: "2.0 moles of N₂", correct: false },
                { text: "3.0 moles of N₂ (due to 3:2 molar ratio)", correct: true },
                { text: "6.0 moles of N₂", correct: false }
              ].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswerSubmit('ac1', i, opt.correct)}
                  className={`w-full p-3 rounded-xl text-xs font-mono text-left transition-all border ${
                    selectedAnswers['ac1'] === i
                      ? opt.correct
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold'
                        : 'bg-rose-50 border-rose-400 text-rose-800 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  {opt.text}
                </button>
              ))}
            </div>

            {challengeFeedback['ac1'] === 'correct' && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-sans">
                ✓ <strong>Correct! (+20 pts)</strong> The molar ratio is 3 mol N₂ / 2 mol NaN₃ = 1.5. Thus, 2.0 mol NaN₃ × 1.5 = 3.0 mol N₂ gas!
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold font-sans text-slate-900">
              The Secondary Reactions: Why Pure Sodium Must Be Neutralized
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Notice in the primary reaction that pure metallic sodium (Na) is produced alongside nitrogen gas. Sodium metal is dangerously reactive: it ignites spontaneously with moisture on human skin or in air!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-xs font-bold font-mono text-slate-800">Neutralizing Potassium Nitrate</div>
                <p className="text-xs text-slate-600 font-sans">
                  Engineers mix KNO₃ and SiO₂ into the pellet. Sodium reacts with KNO₃ to produce harmless alkaline silicate glass: 10 Na + 2 KNO₃ → K₂O + 5 Na₂O + N₂.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-xs font-bold font-mono text-slate-800">Inert Sand Glass Reaction</div>
                <p className="text-xs text-slate-600 font-sans">
                  The metal oxides then react with silicon dioxide (sand) to form non-hazardous, stable alkaline silicate glass powder, preventing chemical burns to passengers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
