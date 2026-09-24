import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Gauge, 
  Layers, 
  ShieldCheck, 
  Activity, 
  Volume2, 
  ArrowRight
} from 'lucide-react';
import { sounds } from '../../../engine/audioEffects';

export const CollisionSim = ({ simulation, activeTab, onUpdateScore }) => {
  // --- Physical Parameters ---
  const [massA, setMassA] = useState(1200); // kg
  const [massB, setMassB] = useState(800);  // kg
  const [velocityA, setVelocityA] = useState(8);  // m/s
  const [velocityB, setVelocityB] = useState(-4); // m/s
  const [elasticity, setElasticity] = useState(1.0); // 0 (inelastic) to 1 (elastic)
  const [isSlowMo, setIsSlowMo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  // --- Real-time Animation State ---
  const [posA, setPosA] = useState(180);
  const [posB, setPosB] = useState(580);
  const [curVelA, setCurVelA] = useState(8);
  const [curVelB, setCurVelB] = useState(-4);
  const [hasCollided, setHasCollided] = useState(false);
  const [sparks, setSparks] = useState([]);

  // --- Inquiry Challenge State ---
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [challengeFeedback, setChallengeFeedback] = useState({});

  const canvasRef = useRef(null);
  const animRef = useRef(null);

  // Theoretical calculations
  // Momentum conservation: p = m1*v1 + m2*v2
  const initialMomentum = massA * velocityA + massB * velocityB;
  const initialKE = 0.5 * massA * Math.pow(velocityA, 2) + 0.5 * massB * Math.pow(velocityB, 2);

  // Reset simulator
  const handleReset = () => {
    sounds.playSnap();
    setPosA(180);
    setPosB(580);
    setCurVelA(velocityA);
    setCurVelB(velocityB);
    setHasCollided(false);
    setSparks([]);
    setIsPlaying(true);
  };

  // Main 60 FPS Canvas Animation Loop
  useEffect(() => {
    if (activeTab !== 'sandbox') return;

    let pA = posA;
    let pB = posB;
    let vA = curVelA;
    let vB = curVelB;
    let collided = hasCollided;
    let sparkList = [...sparks];
    let lastTime = performance.now();

    const carWidth = 64;
    const carHeight = 36;

    const render = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const timeScale = isSlowMo ? 0.3 : 1.0;

      if (isPlaying) {
        pA += vA * 45 * dt * timeScale;
        pB += vB * 45 * dt * timeScale;

        // Collision detection between bumper cars
        if (!collided && (pA + carWidth / 2 >= pB - carWidth / 2)) {
          collided = true;
          setHasCollided(true);
          sounds.playZap();

          // 1D Collision with Coefficient of Restitution (e)
          // v1' = (m1*v1 + m2*v2 - m2*e*(v1 - v2)) / (m1 + m2)
          // v2' = (m1*v1 + m2*v2 + m1*e*(v1 - v2)) / (m1 + m2)
          const m1 = massA;
          const m2 = massB;
          const u1 = vA;
          const u2 = vB;
          const e = elasticity;

          const newVA = (m1 * u1 + m2 * u2 - m2 * e * (u1 - u2)) / (m1 + m2);
          const newVB = (m1 * u1 + m2 * u2 + m1 * e * (u1 - u2)) / (m1 + m2);

          vA = newVA;
          vB = newVB;
          setCurVelA(newVA);
          setCurVelB(newVB);

          // Generate spark particles
          const midX = (pA + pB) / 2;
          for (let i = 0; i < 20; i++) {
            sparkList.push({
              x: midX,
              y: 190 + (Math.random() - 0.5) * 20,
              vx: (Math.random() - 0.5) * 180,
              vy: (Math.random() - 0.5) * 180,
              life: 1.0,
              color: Math.random() > 0.5 ? '#f59e0b' : '#38bdf8'
            });
          }
        }

        // Wall bounce constraints
        if (pA <= 50) {
          pA = 50;
          vA = -vA * 0.8;
          setCurVelA(vA);
        }
        if (pB >= 710) {
          pB = 710;
          vB = -vB * 0.8;
          setCurVelB(vB);
        }

        // Update sparks
        sparkList = sparkList.map(s => ({
          ...s,
          x: s.x + s.vx * dt,
          y: s.y + s.vy * dt,
          life: s.life - dt * 2
        })).filter(s => s.life > 0);

        setPosA(pA);
        setPosB(pB);
        setSparks(sparkList);
      }

      // Draw onto canvas
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Sleek arena grid floor
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      const gridSize = 30;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Track rails & safety barriers
      const trackY = 190;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(30, trackY - 55, width - 60, 110);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, trackY - 55, width - 60, 110);

      // Centerline
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(30, trackY);
      ctx.lineTo(width - 30, trackY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Draw Spark Particles
      for (const s of sparkList) {
        ctx.fillStyle = s.color;
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.5 * s.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // 4. Helper function to render a bumper car
      const drawBumperCar = (x, y, color, label, mass, vel) => {
        ctx.save();
        ctx.translate(x, y);

        // Soft shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.beginPath();
        ctx.ellipse(0, 18, 36, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Outer rubber bumper ring
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(-34, -20, 68, 40, 16);
        ctx.fill();

        // Car chassis
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(-28, -16, 56, 32, 12);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Headlights / Windshield
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(vel >= 0 ? 14 : -14, 0, 7, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Steering wheel & seat
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(vel >= 0 ? 0 : 0, 0, 6, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(label, 0, -4);

        // Mass readout
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`${mass} kg`, 0, 32);

        // Velocity Vector Arrow
        if (Math.abs(vel) > 0.1) {
          const arrowLen = vel * 6;
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(0, -28);
          ctx.lineTo(arrowLen, -28);
          ctx.stroke();

          // Arrowhead
          ctx.fillStyle = '#2563eb';
          ctx.beginPath();
          const dir = Math.sign(vel);
          ctx.moveTo(arrowLen, -28);
          ctx.lineTo(arrowLen - dir * 6, -32);
          ctx.lineTo(arrowLen - dir * 6, -24);
          ctx.closePath();
          ctx.fill();

          ctx.font = '10px monospace';
          ctx.fillStyle = '#1e3a8a';
          ctx.fillText(`v = ${vel.toFixed(1)} m/s`, arrowLen / 2, -36);
        }

        ctx.restore();
      };

      // Draw Car A (Blue) & Car B (Amber)
      drawBumperCar(pA, trackY, '#2563eb', 'CAR A', massA, vA);
      drawBumperCar(pB, trackY, '#f59e0b', 'CAR B', massB, vB);

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [activeTab, isPlaying, massA, massB, elasticity, isSlowMo]);

  const handleAnswerSubmit = (qId, idx, isCorrect) => {
    sounds.playClick();
    setSelectedAnswers(prev => ({ ...prev, [qId]: idx }));
    setChallengeFeedback(prev => ({ ...prev, [qId]: isCorrect ? 'correct' : 'incorrect' }));
    if (isCorrect && onUpdateScore) onUpdateScore(25);
  };

  const currentTotalMomentum = massA * curVelA + massB * curVelB;
  const currentTotalKE = 0.5 * massA * Math.pow(curVelA, 2) + 0.5 * massB * Math.pow(curVelB, 2);
  const keLossPercent = initialKE > 0 ? Math.max(0, ((initialKE - currentTotalKE) / initialKE) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* TAB 1: CURIOSITY */}
      {activeTab === 'curiosity' && (
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              CONSERVATION OF MOMENTUM & IMPULSE
            </div>

            <h2 className="text-2xl md:text-3xl font-bold font-sans text-slate-900 tracking-tight">
              {simulation.name || "Bumper Cars: Collisions & Momentum"}
            </h2>

            <p className="text-sm font-semibold text-blue-800 italic">
              "{simulation.curiosityQuestion || "Why do heavy vehicles push lighter ones backwards in collisions?"}"
            </p>

            <div className="text-xs text-slate-600 space-y-3 font-sans leading-relaxed">
              <p>
                In any closed system without external friction, <strong>total linear momentum is always conserved</strong>:
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-mono text-xs font-bold text-slate-800">
                p_total = m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'
              </div>
              <p>
                However, <strong>Kinetic Energy is not always conserved</strong>. In a perfectly elastic collision (like billiard balls, e = 1.0), kinetic energy is 100% preserved. In an inelastic collision (like real cars with crumple zones, e &lt; 1.0), kinetic energy is converted into heat, sound, and material deformation.
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
              {/* Toolbar Header */}
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-700">
                    60 FPS 2D MOMENTUM ARENA
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSlowMo(!isSlowMo)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-all ${
                      isSlowMo ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {isSlowMo ? 'Slow-Mo (0.3x)' : 'Real-Time'}
                  </button>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
                    title={isPlaying ? "Pause Simulation" : "Resume Simulation"}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>

                  <button
                    onClick={handleReset}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
                    title="Reset Positions"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Interactive Canvas */}
              <div className="relative w-full bg-slate-50">
                <canvas
                  ref={canvasRef}
                  width={760}
                  height={340}
                  className="w-full h-auto block"
                />

                {hasCollided && (
                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white/90 border border-slate-200 shadow-sm text-[11px] font-mono font-bold text-slate-700">
                    ⚡ COLLISION REGISTERED
                  </div>
                )}
              </div>

              {/* Real-time Telemetry Dashboard */}
              <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Total Momentum</div>
                  <div className="text-base font-bold text-blue-700">{currentTotalMomentum.toFixed(0)} kg·m/s</div>
                  <div className="text-[10px] text-slate-400">Δp = 0 (Conserved)</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Kinetic Energy</div>
                  <div className="text-base font-bold text-emerald-700">{(currentTotalKE / 1000).toFixed(1)} kJ</div>
                  <div className="text-[10px] text-slate-400">Loss: {keLossPercent.toFixed(1)}%</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Velocity Car A</div>
                  <div className="text-base font-bold text-blue-600">{curVelA.toFixed(1)} m/s</div>
                  <div className="text-[10px] text-slate-400">{(curVelA * 3.6).toFixed(0)} km/h</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Velocity Car B</div>
                  <div className="text-base font-bold text-amber-600">{curVelB.toFixed(1)} m/s</div>
                  <div className="text-[10px] text-slate-400">{(curVelB * 3.6).toFixed(0)} km/h</div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Deck (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-900 uppercase">
                  Collision Parameters Deck
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Tune masses, approach speeds, and elasticity coefficient.
                </p>
              </div>

              {/* Slider: Mass A */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-blue-700 font-bold">MASS CAR A:</span>
                  <span className="font-bold text-slate-800">{massA} kg</span>
                </div>
                <input
                  type="range"
                  min={400}
                  max={2500}
                  step={50}
                  value={massA}
                  onChange={(e) => {
                    setMassA(Number(e.target.value));
                    handleReset();
                  }}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Slider: Mass B */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-amber-700 font-bold">MASS CAR B:</span>
                  <span className="font-bold text-slate-800">{massB} kg</span>
                </div>
                <input
                  type="range"
                  min={400}
                  max={2500}
                  step={50}
                  value={massB}
                  onChange={(e) => {
                    setMassB(Number(e.target.value));
                    handleReset();
                  }}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              {/* Slider: Initial Velocity A */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-600 font-bold">VELOCITY A:</span>
                  <span className="font-bold text-slate-800">{velocityA} m/s</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={15}
                  step={1}
                  value={velocityA}
                  onChange={(e) => {
                    setVelocityA(Number(e.target.value));
                    handleReset();
                  }}
                  className="w-full accent-slate-700 cursor-pointer"
                />
              </div>

              {/* Slider: Initial Velocity B */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-600 font-bold">VELOCITY B:</span>
                  <span className="font-bold text-slate-800">{velocityB} m/s</span>
                </div>
                <input
                  type="range"
                  min={-15}
                  max={-1}
                  step={1}
                  value={velocityB}
                  onChange={(e) => {
                    setVelocityB(Number(e.target.value));
                    handleReset();
                  }}
                  className="w-full accent-slate-700 cursor-pointer"
                />
              </div>

              {/* Slider: Elasticity Coefficient */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-700 font-bold">ELASTICITY (e):</span>
                  <span className="font-bold text-purple-700">{elasticity.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={1.0}
                  step={0.05}
                  value={elasticity}
                  onChange={(e) => {
                    setElasticity(Number(e.target.value));
                    handleReset();
                  }}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>0.0 (Inelastic Stick)</span>
                  <span>1.0 (Elastic Bounce)</span>
                </div>
              </div>

              {/* Presets */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-mono text-slate-500 uppercase font-bold">
                  Quick Testing Scenarios:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMassA(2000);
                      setMassB(500);
                      setVelocityA(10);
                      setVelocityB(0);
                      setElasticity(1.0);
                      handleReset();
                    }}
                    className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-mono text-left"
                  >
                    <div className="font-bold">Heavy Truck</div>
                    <div className="text-[10px]">2000kg vs 500kg</div>
                  </button>

                  <button
                    onClick={() => {
                      setMassA(1000);
                      setMassB(1000);
                      setVelocityA(8);
                      setVelocityB(-8);
                      setElasticity(0.0);
                      handleReset();
                    }}
                    className="p-2 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-mono text-left"
                  >
                    <div className="font-bold">Total Inelastic</div>
                    <div className="text-[10px]">Lock & Stop</div>
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
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-sans">
            <strong>Momentum Challenges:</strong> Solve analytical collision problems and earn laboratory points!
          </div>

          {/* Question 1 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase">
              Challenge 1 of 2 // Equal Mass Elastic Swap
            </div>
            <h3 className="text-sm font-bold font-sans text-slate-800">
              When two identical cars of equal mass collide in a 100% elastic head-on collision, what happens to their velocities?
            </h3>

            <div className="space-y-2">
              {[
                { text: "Both cars stick together and come to a dead stop", correct: false },
                { text: "The cars completely swap their velocities (Car A gets Car B's velocity and vice versa)", correct: true },
                { text: "Both cars bounce back with twice their original speeds", correct: false }
              ].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswerSubmit('q1', i, opt.correct)}
                  className={`w-full p-3 rounded-xl text-xs font-mono text-left transition-all border ${
                    selectedAnswers['q1'] === i
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

            {challengeFeedback['q1'] === 'correct' && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-sans">
                ✓ <strong>Correct! (+25 pts)</strong> For equal masses in a 1D elastic collision, conservation of both momentum and kinetic energy uniquely requires an exact exchange of velocities!
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: REAL-WORLD APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold font-sans text-slate-900">
              Real-World Engineering: Crumple Zones and Impulse Control
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Why aren't real passenger cars made out of rigid titanium? Because of the <strong>Impulse-Momentum Theorem</strong>:
            </p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-mono text-xs font-bold text-slate-800">
              J = F_avg · Δt = Δp
            </div>
            <p className="text-xs text-slate-600 font-sans leading-relaxed">
              When a car crashes, the change in momentum (Δp) is fixed by vehicle speed and mass. If the car is completely rigid, the collision duration (Δt) is only a few milliseconds, making the average impact force (F_avg) catastrophic to human passengers. By deliberately engineering accordion crumple zones, the impact duration is lengthened by 5x to 10x, reducing peak deceleration forces on passengers to survivable levels.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
