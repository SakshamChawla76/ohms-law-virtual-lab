import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  Award, 
  ArrowDown, 
  ArrowUp,
  Waves,
  ShieldCheck
} from 'lucide-react';
import { sounds } from '../../../engine/audioEffects';

export const DensitySim = ({ activeTab, onUpdateScore }) => {
  // Fluid selection
  const [fluid, setFluid] = useState('water'); // 'water' | 'oil' | 'syrup' | 'seawater'
  // Object selection
  const [material, setMaterial] = useState('wood'); // 'wood' | 'ice' | 'aluminum' | 'custom'
  // Custom mass & volume
  const [massGrams, setMassGrams] = useState(250); // grams
  const [volumeCm3, setVolumeCm3] = useState(380); // cm3

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [challengeFeedback, setChallengeFeedback] = useState({});

  const canvasRef = useRef(null);

  // Fluid densities (g/cm³)
  const FLUIDS = {
    water: { name: 'Fresh Water', density: 1.00, color: '#38bdf8' },
    seawater: { name: 'Ocean Water', density: 1.03, color: '#0284c7' },
    oil: { name: 'Vegetable Oil', density: 0.92, color: '#facc15' },
    syrup: { name: 'Dense Syrup', density: 1.40, color: '#fb923c' }
  };

  // Material presets
  const PRESETS = {
    wood: { name: 'Oak Wood', density: 0.65, mass: 260, volume: 400 },
    ice: { name: 'Ice Cube', density: 0.92, mass: 368, volume: 400 },
    aluminum: { name: 'Aluminum Block', density: 2.70, mass: 540, volume: 200 }
  };

  const handleSelectPreset = (key) => {
    sounds.playTick();
    setMaterial(key);
    if (key !== 'custom') {
      setMassGrams(PRESETS[key].mass);
      setVolumeCm3(PRESETS[key].volume);
    }
  };

  const currentFluid = FLUIDS[fluid];
  const currentDensity = massGrams / Math.max(1, volumeCm3); // g/cm³

  // Buoyant equilibrium physics
  // Fraction submerged = rho_obj / rho_fluid
  const fractionSubmerged = Math.min(1.0, currentDensity / currentFluid.density);
  const willFloat = currentDensity <= currentFluid.density;

  // Forces in Newtons: Fg = m * g, Fb = rho_fluid * V_disp * g
  const g = 9.81;
  const fgNewtons = (massGrams / 1000) * g;
  const displacedVolumeCm3 = volumeCm3 * fractionSubmerged;
  const fbNewtons = ((displacedVolumeCm3 * currentFluid.density) / 1000) * g;

  // Draw Tank Simulation
  useEffect(() => {
    if (activeTab !== 'sandbox') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Pale grid
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

    // Glass Tank Boundaries
    const tankX = width * 0.18;
    const tankW = width * 0.64;
    const tankTopY = 60;
    const tankBottomY = height - 40;
    const tankH = tankBottomY - tankTopY;

    // Water Surface Level
    const waterLevelY = tankTopY + 70;

    // Fill Fluid
    ctx.fillStyle = currentFluid.color + '33'; // 20% opacity
    ctx.fillRect(tankX, waterLevelY, tankW, tankBottomY - waterLevelY);

    // Fluid top line (meniscus)
    ctx.strokeStyle = currentFluid.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(tankX, waterLevelY);
    ctx.lineTo(tankX + tankW, waterLevelY);
    ctx.stroke();

    // Draw Glass Tank Walls
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 4;
    ctx.strokeRect(tankX, tankTopY, tankW, tankH);

    // Draw Object (Block)
    // Scale block width/height from volume (assuming cube)
    const blockSidePx = Math.max(50, Math.min(130, Math.cbrt(volumeCm3) * 12));
    const blockX = width / 2 - blockSidePx / 2;

    // Calculate block Y resting position
    let blockY = 0;
    if (willFloat) {
      // Resting on surface: fractionSubmerged of height is below waterLevelY
      blockY = waterLevelY - (1 - fractionSubmerged) * blockSidePx;
    } else {
      // Sinks to bottom of tank
      blockY = tankBottomY - blockSidePx;
    }

    // Block Body
    ctx.fillStyle = material === 'wood' ? '#d97706' : material === 'ice' ? '#bae6fd' : material === 'aluminum' ? '#94a3b8' : '#8b5cf6';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.fillRect(blockX, blockY, blockSidePx, blockSidePx);
    ctx.strokeRect(blockX, blockY, blockSidePx, blockSidePx);

    // Water displacement ripple
    ctx.strokeStyle = currentFluid.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(blockX - 10, waterLevelY, 15, 0, Math.PI / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(blockX + blockSidePx + 10, waterLevelY, 15, Math.PI / 2, Math.PI);
    ctx.stroke();

    // Force Vectors Overlay
    const centerBlockX = blockX + blockSidePx / 2;
    const centerBlockY = blockY + blockSidePx / 2;

    // F_gravity arrow (pointing down)
    const fgArrowLen = Math.min(100, fgNewtons * 14);
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerBlockX, centerBlockY);
    ctx.lineTo(centerBlockX, centerBlockY + fgArrowLen);
    ctx.stroke();
    // Arrowhead
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(centerBlockX, centerBlockY + fgArrowLen + 6);
    ctx.lineTo(centerBlockX - 5, centerBlockY + fgArrowLen - 4);
    ctx.lineTo(centerBlockX + 5, centerBlockY + fgArrowLen - 4);
    ctx.fill();
    ctx.fillText(`Fg = ${fgNewtons.toFixed(2)} N`, centerBlockX + 8, centerBlockY + fgArrowLen * 0.7);

    // F_buoyant arrow (pointing up)
    const fbArrowLen = Math.min(100, fbNewtons * 14);
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerBlockX, centerBlockY);
    ctx.lineTo(centerBlockX, centerBlockY - fbArrowLen);
    ctx.stroke();
    // Arrowhead
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(centerBlockX, centerBlockY - fbArrowLen - 6);
    ctx.lineTo(centerBlockX - 5, centerBlockY - fbArrowLen + 4);
    ctx.lineTo(centerBlockX + 5, centerBlockY - fbArrowLen + 4);
    ctx.fill();
    ctx.fillText(`Fb = ${fbNewtons.toFixed(2)} N`, centerBlockX + 8, centerBlockY - fbArrowLen * 0.7);

  }, [activeTab, fluid, material, massGrams, volumeCm3, currentFluid, fractionSubmerged, willFloat, fgNewtons, fbNewtons]);

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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
              <Waves className="w-3.5 h-3.5 text-cyan-600" />
              THE BUOYANCY EQUILIBRIUM
            </div>

            <h2 className="text-2xl md:text-3xl font-bold font-sans text-slate-900 tracking-tight">
              What determines whether an object floats or sinks in water?
            </h2>

            <p className="text-sm font-semibold text-cyan-800 italic">
              "A tiny steel pebble drops straight to the bottom of the ocean, yet a massive 100,000-ton aircraft carrier made of steel floats serenely across the sea."
            </p>

            <div className="text-xs text-slate-600 space-y-3 font-sans leading-relaxed">
              <p>
                Flotation is not determined by weight alone, but by <strong>Density ($\rho = m/V$)</strong> and <strong>Archimedes' Principle</strong>. When an object is placed in fluid, the fluid exerts an upward <strong>Buoyant Force ($F_b$)</strong> equal to the weight of the fluid displaced by the object:
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-mono text-xs font-bold text-slate-800">
                F_buoyant = ρ_fluid · V_displaced · g
              </div>
              <p>
                If an object's overall density is less than the fluid's density ($\rho_{obj} &lt; \rho_{fluid}$), the upward buoyant force balances its weight before it is fully submerged, and it floats! The exact fraction of the object submerged equals $\rho_{obj} / \rho_{fluid}$.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SANDBOX */}
      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-left">
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-700">
                  ARCHIMEDES' PRINCIPLE & TANK FLUID SIMULATOR
                </span>

                <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                  willFloat ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-rose-50 text-rose-800 border border-rose-300'
                }`}>
                  {willFloat ? `FLOATING (${(fractionSubmerged * 100).toFixed(0)}% SUBMERGED)` : 'SINKS TO BOTTOM'}
                </span>
              </div>

              <div className="relative w-full bg-slate-50">
                <canvas
                  ref={canvasRef}
                  width={760}
                  height={380}
                  className="w-full h-auto block"
                />
              </div>

              {/* Physical Telemetry */}
              <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Object Density</div>
                  <div className="text-base font-bold text-slate-800">{currentDensity.toFixed(2)} g/cm³</div>
                  <div className="text-[10px] text-slate-400">m / V</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Fluid Density</div>
                  <div className="text-base font-bold text-sky-700">{currentFluid.density.toFixed(2)} g/cm³</div>
                  <div className="text-[10px] text-slate-400">{currentFluid.name}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Gravity Force (Fg)</div>
                  <div className="text-base font-bold text-rose-600">{fgNewtons.toFixed(2)} N</div>
                  <div className="text-[10px] text-slate-400">Downward</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Buoyant Force (Fb)</div>
                  <div className="text-base font-bold text-emerald-700">{fbNewtons.toFixed(2)} N</div>
                  <div className="text-[10px] text-slate-400">Upward</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-900 uppercase">
                  Tank & Object Controls
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Select fluid medium and test material properties.
                </p>
              </div>

              {/* Fluid Selector */}
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-slate-700">FLUID MEDIUM:</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(FLUIDS).map(([key, f]) => (
                    <button
                      key={key}
                      onClick={() => { sounds.playTick(); setFluid(key); }}
                      className={`p-2 rounded-lg text-xs font-mono transition-all border text-left ${
                        fluid === key
                          ? 'bg-sky-50 border-sky-400 text-sky-800 font-bold shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div className="font-bold">{f.name}</div>
                      <div className="text-[10px] text-slate-400">ρ = {f.density}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Material Preset Buttons */}
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-slate-700">TEST MATERIAL:</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {['wood', 'ice', 'aluminum'].map((key) => (
                    <button
                      key={key}
                      onClick={() => handleSelectPreset(key)}
                      className={`p-2 rounded-lg text-xs font-mono transition-all border text-center ${
                        material === key
                          ? 'bg-amber-50 border-amber-400 text-amber-800 font-bold shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      {PRESETS[key].name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders for Custom Mass & Volume */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-600">MASS (m):</span>
                    <span className="font-bold text-slate-800">{massGrams} g</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={800}
                    step={10}
                    value={massGrams}
                    onChange={(e) => {
                      setMaterial('custom');
                      setMassGrams(Number(e.target.value));
                    }}
                    className="w-full accent-slate-700 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-600">VOLUME (V):</span>
                    <span className="font-bold text-slate-800">{volumeCm3} cm³</span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={600}
                    step={10}
                    value={volumeCm3}
                    onChange={(e) => {
                      setMaterial('custom');
                      setVolumeCm3(Number(e.target.value));
                    }}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CHALLENGE ME */}
      {activeTab === 'challenge' && (
        <div className="max-w-3xl mx-auto space-y-5 text-left">
          <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs font-sans">
            <strong>Density & Flotation Inquiries:</strong> Earn up to 20 laboratory score points!
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase">
              Challenge 1 of 1 // Iceberg Submersion
            </div>
            <h3 className="text-sm font-bold font-sans text-slate-800">
              Why is approximately 92% of an iceberg hidden underwater in the ocean?
            </h3>

            <div className="space-y-2">
              {[
                { text: "Because the density of ice (0.92 g/cm³) is exactly 92% of water's density (1.00 g/cm³)", correct: true },
                { text: "Because ocean waves compress the ice down", correct: false },
                { text: "Because gravity pulls harder on ice than on liquid water", correct: false }
              ].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswerSubmit('den1', i, opt.correct)}
                  className={`w-full p-3 rounded-xl text-xs font-mono text-left transition-all border ${
                    selectedAnswers['den1'] === i
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

            {challengeFeedback['den1'] === 'correct' && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-sans">
                ✓ <strong>Correct! (+20 pts)</strong> By Archimedes' principle, the submerged fraction of any floating object is strictly equal to $\rho_{object} / \rho_{fluid} = 0.92 / 1.00 = 0.92$ (or 92%)!
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
              Submarine Ballast Tanks: Controlling Variable Density
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Submarines can freely cruise on the ocean surface, hover at depth, or submerge to the sea floor by manipulating their effective density using ballast tanks.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs font-bold font-mono text-slate-800">To Dive (Sinking)</div>
                <p className="text-xs text-slate-600 font-sans">
                  Vents open at the top of the ballast tanks, flooding them with seawater. Mass increases while volume remains constant, causing overall density to exceed seawater.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs font-bold font-mono text-slate-800">To Surface (Floating)</div>
                <p className="text-xs text-slate-600 font-sans">
                  Compressed air is blown into the tanks, expelling the seawater out through bottom vents. Mass drops, decreasing density below seawater to float back to the surface.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
