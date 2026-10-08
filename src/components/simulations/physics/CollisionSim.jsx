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
  ArrowRight,
  Crosshair,
  Sliders,
  Flame
} from 'lucide-react';
import { sounds } from '../../../engine/audioEffects';

export const CollisionSim = ({ simulation = {}, activeTab = 'sandbox', onUpdateScore }) => {
  // --- Physical Parameters ---
  const [massA, setMassA] = useState(1200); // kg
  const [massB, setMassB] = useState(800);  // kg
  const [velocityA, setVelocityA] = useState(8);  // m/s
  const [velocityB, setVelocityB] = useState(-4); // m/s
  const [elasticity, setElasticity] = useState(1.0); // 0 (inelastic) to 1 (elastic)
  const [isSlowMo, setIsSlowMo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showCenterOfMass, setShowCenterOfMass] = useState(true);

  // --- Real-time Animation State ---
  const [posA, setPosA] = useState(180);
  const [posB, setPosB] = useState(580);
  const [curVelA, setCurVelA] = useState(8);
  const [curVelB, setCurVelB] = useState(-4);
  const [hasCollided, setHasCollided] = useState(false);
  const [sparks, setSparks] = useState([]);
  const [shockwaves, setShockwaves] = useState([]);

  // --- Inquiry Challenge State ---
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [challengeFeedback, setChallengeFeedback] = useState({});

  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const draggingCarRef = useRef(null); // 'A' | 'B' | null

  // Theoretical calculations
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
    setShockwaves([]);
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
    let shockList = [...shockwaves];
    let lastTime = performance.now();

    const carWidth = 64;

    const render = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const timeScale = isSlowMo ? 0.3 : 1.0;

      if (isPlaying && !draggingCarRef.current) {
        pA += vA * 45 * dt * timeScale;
        pB += vB * 45 * dt * timeScale;

        // Collision detection between bumper cars
        if (!collided && (pA + carWidth / 2 >= pB - carWidth / 2)) {
          collided = true;
          setHasCollided(true);
          sounds.playZap();

          const m1 = massA;
          const m2 = massB;
          const u1 = vA;
          const u2 = vB;
          const e = elasticity;

          const newVA = (m1 * u1 + m2 * u2 - m2 * e * (u1 - u2)) / (m1 + m2);
          const newVB = (m1 * u1 + m2 * u2 + m1 * e * (u1 - u2)) / (m1 + m2);

          vA = newVA;
          vB = newVB;

          // Prevent car overlap clipping
          const midX = (pA + pB) / 2;
          pA = midX - carWidth / 2;
          pB = midX + carWidth / 2;

          // Impact sparks
          const impactX = (pA + pB) / 2;
          const impactCount = 20;
          for (let i = 0; i < impactCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 160;
            sparkList.push({
              x: impactX,
              y: 190 + (Math.random() - 0.5) * 16,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1.0,
              color: Math.random() > 0.4 ? '#f59e0b' : '#ef4444'
            });
          }

          // Thermal / sound energy loss shockwave ring (if inelastic)
          if (elasticity < 0.98) {
            shockList.push({
              x: impactX,
              y: 190,
              radius: 5,
              maxRadius: 110,
              alpha: 0.9
            });
          }

          setCurVelA(vA);
          setCurVelB(vB);
        }

        // Boundary walls rebound
        const trackLeft = 80;
        const trackRight = 680;
        if (pA - carWidth / 2 <= trackLeft && vA < 0) {
          vA = -vA * 0.9;
          sounds.playSnap();
          setCurVelA(vA);
        }
        if (pB + carWidth / 2 >= trackRight && vB > 0) {
          vB = -vB * 0.9;
          sounds.playSnap();
          setCurVelB(vB);
        }

        // Update sparks
        sparkList = sparkList.map(s => ({
          ...s,
          x: s.x + s.vx * dt,
          y: s.y + s.vy * dt,
          life: s.life - dt * 2.2
        })).filter(s => s.life > 0);

        // Update shockwaves
        shockList = shockList.map(sw => ({
          ...sw,
          radius: sw.radius + 180 * dt,
          alpha: sw.alpha - dt * 1.8
        })).filter(sw => sw.alpha > 0);

        setPosA(pA);
        setPosB(pB);
        setSparks(sparkList);
        setShockwaves(shockList);
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

      // Arena boundary bumpers with hazard stripes
      const drawBumperWall = (bx) => {
        ctx.fillStyle = '#334155';
        ctx.fillRect(bx - 12, trackY - 55, 24, 110);
        ctx.fillStyle = '#f59e0b';
        for (let y = trackY - 50; y < trackY + 50; y += 18) {
          ctx.beginPath();
          ctx.moveTo(bx - 12, y);
          ctx.lineTo(bx + 12, y + 10);
          ctx.lineTo(bx + 12, y + 14);
          ctx.lineTo(bx - 12, y + 4);
          ctx.fill();
        }
      };
      drawBumperWall(42);
      drawBumperWall(width - 42);

      // Centerline with measurement ticks
      ctx.setLineDash([8, 8]);
      ctx.strokeStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(55, trackY);
      ctx.lineTo(width - 55, trackY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 3. Center of Mass Indicator (Proving Momentum Conservation)
      const cmX = (massA * pA + massB * pB) / (massA + massB);
      const vCM = (massA * vA + massB * vB) / (massA + massB);

      if (showCenterOfMass) {
        ctx.save();
        ctx.translate(cmX, trackY);
        // Diamond icon
        ctx.fillStyle = '#8b5cf6';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -9);
        ctx.lineTo(9, 0);
        ctx.lineTo(0, 9);
        ctx.lineTo(-9, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Label
        ctx.fillStyle = '#7c3aed';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`C.M. (v = ${vCM.toFixed(1)} m/s)`, 0, 22);
        ctx.restore();
      }

      // 4. Inelastic Energy Loss Shockwave Rings
      for (const sw of shockList) {
        ctx.save();
        ctx.strokeStyle = `rgba(168, 85, 247, ${Math.max(0, sw.alpha)})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 5. Draw Spark Particles
      for (const s of sparkList) {
        ctx.fillStyle = s.color;
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.5 * s.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // 6. Helper function to render a bumper car
      const drawBumperCar = (x, y, color, label, mass, vel, isA) => {
        ctx.save();
        ctx.translate(x, y);

        // Soft shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.beginPath();
        ctx.ellipse(0, 18, 38, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Heavy rubber impact bumper ring
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(-35, -20, 70, 40, 16);
        ctx.fill();

        // Car chassis body (shiny gradient)
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(-28, -16, 56, 32, 12);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Chrome bumper highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(-22, -14, 44, 4);

        // Windshield
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.ellipse(vel >= 0 ? 14 : -14, 0, 8, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Driver seat & head
        ctx.fillStyle = isA ? '#60a5fa' : '#fde047';
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();

        // Ceiling power pole with sparking antenna tip
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(vel >= 0 ? -16 : 16, 0);
        ctx.lineTo(vel >= 0 ? -24 : 24, -40);
        ctx.stroke();
        // Antenna contact tip
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(vel >= 0 ? -24 : 24, -40, 3, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(label, 0, -4);

        // Mass readout tag below
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`${mass} kg`, 0, 34);

        // Velocity Vector Arrow
        if (Math.abs(vel) > 0.1) {
          const arrowLen = vel * 5;
          ctx.strokeStyle = isA ? '#2563eb' : '#d97706';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(0, -28);
          ctx.lineTo(arrowLen, -28);
          ctx.stroke();

          // Arrowhead
          ctx.fillStyle = ctx.strokeStyle;
          ctx.beginPath();
          const dir = Math.sign(vel);
          ctx.moveTo(arrowLen, -28);
          ctx.lineTo(arrowLen - dir * 6, -32);
          ctx.lineTo(arrowLen - dir * 6, -24);
          ctx.closePath();
          ctx.fill();

          ctx.font = 'bold 10px monospace';
          ctx.fillText(`v = ${vel.toFixed(1)} m/s`, arrowLen / 2, -36);
        }

        ctx.restore();
      };

      // Draw Car A (Blue) & Car B (Amber)
      drawBumperCar(pA, trackY, '#2563eb', 'CAR A', massA, vA, true);
      drawBumperCar(pB, trackY, '#f59e0b', 'CAR B', massB, vB, false);

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [activeTab, isPlaying, massA, massB, elasticity, isSlowMo, showCenterOfMass]);

  // Handle direct Canvas dragging of Car A and Car B
  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const clickX = (e.clientX - rect.left) * scaleX;

    if (Math.abs(clickX - posA) < 40) {
      draggingCarRef.current = 'A';
      sounds.playTick();
    } else if (Math.abs(clickX - posB) < 40) {
      draggingCarRef.current = 'B';
      sounds.playTick();
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!draggingCarRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;

    if (draggingCarRef.current === 'A') {
      const newPos = Math.max(90, Math.min(posB - 70, mouseX));
      setPosA(newPos);
      setHasCollided(false);
      sounds.playTick();
    } else if (draggingCarRef.current === 'B') {
      const newPos = Math.max(posA + 70, Math.min(670, mouseX));
      setPosB(newPos);
      setHasCollided(false);
      sounds.playTick();
    }
  };

  const handleCanvasMouseUp = () => {
    if (draggingCarRef.current) {
      sounds.playSnap();
      draggingCarRef.current = null;
    }
  };

  const handleAnswerSubmit = (qId, idx, isCorrect) => {
    sounds.playClick();
    setSelectedAnswers(prev => ({ ...prev, [qId]: idx }));
    setChallengeFeedback(prev => ({ ...prev, [qId]: isCorrect ? 'correct' : 'incorrect' }));
    if (isCorrect && onUpdateScore) {
      sounds.playSuccess();
      onUpdateScore(25);
    }
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
                Notice how the <strong>Center of Mass (C.M.)</strong> moves at the exact same constant speed before, during, and after impact! 
                However, <strong>Kinetic Energy is not always conserved</strong>. In a perfectly elastic collision (e = 1.0), kinetic energy is 100% preserved. In an inelastic collision (e &lt; 1.0), kinetic energy is dissipated into heat and sound shockwaves.
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
                    onClick={() => { sounds.playTick(); setShowCenterOfMass(!showCenterOfMass); }}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-all ${
                      showCenterOfMass ? 'bg-purple-50 text-purple-800 border-purple-300 font-bold' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Center of Mass
                  </button>

                  <button
                    onClick={() => { sounds.playTick(); setIsSlowMo(!isSlowMo); }}
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

              {/* Interactive Canvas with Direct Car Dragging */}
              <div className="relative w-full bg-slate-50 select-none">
                <canvas
                  ref={canvasRef}
                  width={760}
                  height={340}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  className="w-full h-auto block cursor-ew-resize"
                />

                {hasCollided && (
                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-white/90 border border-slate-200 shadow-sm text-[11px] font-mono font-bold text-slate-700">
                    ⚡ COLLISION REGISTERED
                  </div>
                )}

                <div className="absolute bottom-2 left-3 px-2 py-1 rounded-md bg-white/80 backdrop-blur-sm border border-slate-200 text-[10px] font-mono text-slate-500 pointer-events-none">
                  Drag Car A or Car B on canvas to reposition
                </div>
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
                    sounds.playTick();
                    setMassA(Number(e.target.value));
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
                    sounds.playTick();
                    setMassB(Number(e.target.value));
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
                    sounds.playTick();
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
                    sounds.playTick();
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
                    sounds.playTick();
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
                      sounds.playSnap();
                      setMassA(2000);
                      setMassB(600);
                      setVelocityA(10);
                      setVelocityB(-2);
                      setElasticity(1.0);
                      handleReset();
                    }}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono text-left active:scale-[0.98] transition-transform"
                  >
                    <div className="font-bold">Truck vs Mini</div>
                    <div className="text-[10px] text-slate-500">Heavy A, Light B</div>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playSnap();
                      setMassA(1000);
                      setMassB(1000);
                      setVelocityA(6);
                      setVelocityB(-6);
                      setElasticity(0.0);
                      handleReset();
                    }}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono text-left active:scale-[0.98] transition-transform"
                  >
                    <div className="font-bold">Sticky Head-On</div>
                    <div className="text-[10px] text-slate-500">e = 0.0 (Stick)</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CHALLENGES */}
      {activeTab === 'challenges' && (
        <div className="max-w-3xl mx-auto space-y-5 text-left">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-sans">
            <strong>Momentum Inquiry Laboratory:</strong> Test your understanding of momentum vectors, impulse, and energy conservation. Earn up to 75 laboratory score points!
          </div>

          {/* Question 1 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase">
              Challenge 1 of 3 // Momentum Vector Sum
            </div>
            <h3 className="text-sm font-bold font-sans text-slate-900">
              In a closed system with no external horizontal forces, is the total momentum ALWAYS conserved, even in a completely inelastic collision where both cars crush and stick together?
            </h3>

            <div className="space-y-2">
              {[
                { text: "No, inelastic collisions destroy momentum", correct: false },
                { text: "Yes, total linear momentum is ALWAYS conserved regardless of collision elasticity", correct: true },
                { text: "Only if the two cars have identical masses", correct: false },
                { text: "Only if the cars are traveling at supersonic speeds", correct: false }
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

          {/* Question 2 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase">
              Challenge 2 of 3 // Kinetic Energy Transformation
            </div>
            <h3 className="text-sm font-bold font-sans text-slate-900">
              When the elasticity coefficient e = 0.0 (completely inelastic), where does the "lost" kinetic energy go?
            </h3>

            <div className="space-y-2">
              {[
                { text: "It vanishes from the universe completely", correct: false },
                { text: "It converts into internal thermal energy, permanent structural deformation, and acoustic sound waves", correct: true },
                { text: "It turns into gravitational potential energy", correct: false },
                { text: "It converts into electrostatic charge on the rubber bumper", correct: false }
              ].map((opt, idx) => {
                const isSelected = selectedAnswers['q2'] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSubmit('q2', idx, opt.correct)}
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
