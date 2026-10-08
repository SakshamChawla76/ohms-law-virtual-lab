import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  Gauge, 
  Waves, 
  Layers, 
  ShieldCheck, 
  Activity,
  Sliders,
  Droplet
} from 'lucide-react';
import { sounds } from '../../../engine/audioEffects';

// Fluids database
const FLUIDS = {
  water: { name: 'Pure Water', density: 1.00, color: '#0284c7' },
  saltwater: { name: 'Ocean Saltwater', density: 1.03, color: '#0369a1' },
  mercury: { name: 'Liquid Mercury', density: 13.60, color: '#64748b' },
  oil: { name: 'Olive Oil', density: 0.92, color: '#ca8a04' }
};

// Material presets
const PRESETS = {
  wood: { name: 'Oak Wood Block', mass: 180, volume: 250 },
  ice: { name: 'Ice Cube', mass: 230, volume: 250 },
  aluminum: { name: 'Solid Aluminum Block', mass: 675, volume: 250 },
  custom: { name: 'Custom Object', mass: 250, volume: 250 }
};

export const DensitySim = ({ simulation = {}, activeTab = 'sandbox', onUpdateScore }) => {
  const [fluid, setFluid] = useState('water');
  const [material, setMaterial] = useState('wood');
  const [massGrams, setMassGrams] = useState(180);
  const [volumeCm3, setVolumeCm3] = useState(250);

  // Challenges
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [challengeFeedback, setChallengeFeedback] = useState({});

  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const splashParticlesRef = useRef([]);
  const isDraggingBlockRef = useRef(false);
  const userBlockYRef = useRef(null);
  const bobbingPhaseRef = useRef(0);

  const handleSelectPreset = (key) => {
    sounds.playSnap();
    setMaterial(key);
    setMassGrams(PRESETS[key].mass);
    setVolumeCm3(PRESETS[key].volume);
    userBlockYRef.current = null;
  };

  const currentFluid = FLUIDS[fluid];
  const currentDensity = massGrams / Math.max(1, volumeCm3); // g/cm³

  // Buoyant equilibrium physics
  const fractionSubmerged = Math.min(1.0, currentDensity / currentFluid.density);
  const willFloat = currentDensity <= currentFluid.density;

  // Forces in Newtons: Fg = m * g, Fb = rho_fluid * V_disp * g
  const g = 9.81;
  const fgNewtons = (massGrams / 1000) * g;
  const displacedVolumeCm3 = volumeCm3 * fractionSubmerged;
  const fbNewtons = ((displacedVolumeCm3 * currentFluid.density) / 1000) * g;

  // 60 FPS Fluid & Buoyancy Simulation Loop
  useEffect(() => {
    if (activeTab !== 'sandbox') return;
    let lastTime = performance.now();

    const loop = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      bobbingPhaseRef.current += dt * 3.5;

      // Update splash particles
      splashParticlesRef.current = splashParticlesRef.current.map(p => ({
        ...p,
        x: p.x + p.vx * dt,
        y: p.y + p.vy * dt + 200 * dt,
        life: p.life - dt * 2.5
      })).filter(p => p.life > 0);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Pale grid
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

      // Glass Tank Geometry
      const tankX = width * 0.16;
      const tankW = width * 0.68;
      const tankTopY = 60;
      const tankBottomY = height - 40;
      const tankH = tankBottomY - tankTopY;

      // Fluid surface level
      const baseWaterY = tankTopY + 80;
      const displacedRiseY = (displacedVolumeCm3 / 2500) * 18; // water level rises slightly with displacement
      const waterLevelY = baseWaterY - displacedRiseY;

      // Fill Fluid with gradient
      const gradFluid = ctx.createLinearGradient(0, waterLevelY, 0, tankBottomY);
      gradFluid.addColorStop(0, currentFluid.color + '44');
      gradFluid.addColorStop(1, currentFluid.color + '88');
      ctx.fillStyle = gradFluid;
      ctx.fillRect(tankX, waterLevelY, tankW, tankBottomY - waterLevelY);

      // Fluid top line (meniscus)
      ctx.strokeStyle = currentFluid.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tankX, waterLevelY);
      ctx.lineTo(tankX + tankW, waterLevelY);
      ctx.stroke();

      // Glass Tank Outer Walls & Floor
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      ctx.strokeRect(tankX, tankTopY, tankW, tankH);

      // Scale block from volume
      const blockSidePx = Math.max(50, Math.min(130, Math.cbrt(volumeCm3) * 12));
      const blockX = width / 2 - blockSidePx / 2;

      // Equilibrium Resting Y position
      let targetEquilibriumY = 0;
      if (willFloat) {
        const bobOffset = Math.sin(bobbingPhaseRef.current) * 1.5;
        targetEquilibriumY = waterLevelY - (1 - fractionSubmerged) * blockSidePx + bobOffset;
      } else {
        targetEquilibriumY = tankBottomY - blockSidePx;
      }

      const activeBlockY = userBlockYRef.current !== null ? userBlockYRef.current : targetEquilibriumY;

      // Render Block Body
      const blockColor = material === 'wood' ? '#d97706' : material === 'ice' ? '#bae6fd' : material === 'aluminum' ? '#94a3b8' : '#8b5cf6';
      ctx.fillStyle = blockColor;
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.fillRect(blockX, activeBlockY, blockSidePx, blockSidePx);
      ctx.strokeRect(blockX, activeBlockY, blockSidePx, blockSidePx);

      // Wood grain / Metallic texture lines
      if (material === 'wood') {
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        for (let l = 10; l < blockSidePx; l += 14) {
          ctx.beginPath();
          ctx.moveTo(blockX + 4, activeBlockY + l);
          ctx.lineTo(blockX + blockSidePx - 4, activeBlockY + l);
          ctx.stroke();
        }
      }

      // Splash droplets
      for (const sp of splashParticlesRef.current) {
        ctx.fillStyle = currentFluid.color;
        ctx.globalAlpha = Math.max(0, sp.life);
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 2.5 * sp.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // Force Vectors Overlay
      const centerBlockX = blockX + blockSidePx / 2;
      const centerBlockY = activeBlockY + blockSidePx / 2;

      // Gravity Force Arrow (Fg - Red Down)
      const fgArrowLen = Math.min(100, fgNewtons * 14);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerBlockX, centerBlockY);
      ctx.lineTo(centerBlockX, centerBlockY + fgArrowLen);
      ctx.stroke();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(centerBlockX, centerBlockY + fgArrowLen + 6);
      ctx.lineTo(centerBlockX - 5, centerBlockY + fgArrowLen - 4);
      ctx.lineTo(centerBlockX + 5, centerBlockY + fgArrowLen - 4);
      ctx.fill();
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`Fg = ${fgNewtons.toFixed(2)} N`, centerBlockX + 8, centerBlockY + fgArrowLen * 0.7);

      // Buoyant Force Arrow (Fb - Green Up)
      const fbArrowLen = Math.min(100, fbNewtons * 14);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerBlockX, centerBlockY);
      ctx.lineTo(centerBlockX, centerBlockY - fbArrowLen);
      ctx.stroke();
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(centerBlockX, centerBlockY - fbArrowLen - 6);
      ctx.lineTo(centerBlockX - 5, centerBlockY - fbArrowLen + 4);
      ctx.lineTo(centerBlockX + 5, centerBlockY - fbArrowLen + 4);
      ctx.fill();
      ctx.fillText(`Fb = ${fbNewtons.toFixed(2)} N`, centerBlockX + 8, centerBlockY - fbArrowLen * 0.7);

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [activeTab, fluid, material, massGrams, volumeCm3, currentFluid, fractionSubmerged, willFloat, fgNewtons, fbNewtons, displacedVolumeCm3]);

  // Handle direct Canvas dragging of the block
  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const blockSidePx = Math.max(50, Math.min(130, Math.cbrt(volumeCm3) * 12));
    const blockX = canvas.width / 2 - blockSidePx / 2;

    if (clickX >= blockX - 10 && clickX <= blockX + blockSidePx + 10) {
      isDraggingBlockRef.current = true;
      sounds.playTick();
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDraggingBlockRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleY = canvas.height / rect.height;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const blockSidePx = Math.max(50, Math.min(130, Math.cbrt(volumeCm3) * 12));
    const minY = 30;
    const maxY = canvas.height - 40 - blockSidePx;
    userBlockYRef.current = Math.max(minY, Math.min(maxY, mouseY - blockSidePx / 2));

    // Spawn water splash droplets when dragging near surface
    if (Math.abs(mouseY - 140) < 20 && Math.random() < 0.3) {
      splashParticlesRef.current.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * blockSidePx,
        y: 140,
        vx: (Math.random() - 0.5) * 80,
        vy: -50 - Math.random() * 80,
        life: 1.0
      });
    }
  };

  const handleCanvasMouseUp = () => {
    if (isDraggingBlockRef.current) {
      sounds.playSnap();
      isDraggingBlockRef.current = false;
      userBlockYRef.current = null; // restore equilibrium
    }
  };

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
                Flotation is not determined by weight alone, but by <strong>Density (ρ = m/V)</strong> and <strong>Archimedes' Principle</strong>. When an object is placed in fluid, the fluid exerts an upward <strong>Buoyant Force (Fb)</strong> equal to the weight of the fluid displaced by the object:
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-mono text-xs font-bold text-slate-800">
                F_buoyant = ρ_fluid · V_displaced · g
              </div>
              <p>
                If an object's overall density is less than the fluid's density (ρ_obj &lt; ρ_fluid), the upward buoyant force balances its weight before it is fully submerged, and it floats! The exact fraction of the object submerged equals ρ_obj / ρ_fluid.
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

              {/* Canvas with Direct Dragging */}
              <div className="relative w-full bg-slate-50 select-none">
                <canvas
                  ref={canvasRef}
                  width={760}
                  height={380}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  className="w-full h-auto block cursor-ns-resize"
                />

                <div className="absolute bottom-2 left-3 px-2 py-1 rounded-md bg-white/80 backdrop-blur-sm border border-slate-200 text-[10px] font-mono text-slate-500 pointer-events-none">
                  Drag the block vertically on canvas to test water resistance & splash
                </div>
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
                      sounds.playTick();
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
                    min={50}
                    max={500}
                    step={10}
                    value={volumeCm3}
                    onChange={(e) => {
                      sounds.playTick();
                      setMaterial('custom');
                      setVolumeCm3(Number(e.target.value));
                    }}
                    className="w-full accent-slate-700 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CHALLENGES */}
      {activeTab === 'challenges' && (
        <div className="max-w-3xl mx-auto space-y-5 text-left">
          <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs font-sans">
            <strong>Buoyancy Inquiry Laboratory:</strong> Test your understanding of Archimedes' principle, fluid displacement, and hydrostatic equilibrium. Earn up to 60 laboratory score points!
          </div>

          {/* Question 1 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase">
              Challenge 1 of 2 // Archimedes' Principle
            </div>
            <h3 className="text-sm font-bold font-sans text-slate-900">
              According to Archimedes' Principle, what determines the upward buoyant force Fb exerted on a fully or partially submerged object?
            </h3>

            <div className="space-y-2">
              {[
                { text: "The weight of the fluid displaced by the object (Fb = ρ_fluid · V_submerged · g)", correct: true },
                { text: "The total atmospheric pressure on the surface of the fluid", correct: false },
                { text: "The surface tension of the fluid container walls", correct: false },
                { text: "The magnetic field of the submerged material", correct: false }
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
                        : <Activity className="w-4 h-4 text-rose-600 flex-shrink-0" />
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
