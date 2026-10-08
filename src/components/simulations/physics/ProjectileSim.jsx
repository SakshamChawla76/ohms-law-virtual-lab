import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Sparkles, 
  Target, 
  Gauge, 
  Compass, 
  Award, 
  Crosshair, 
  Layers,
  Sliders,
  Wind
} from 'lucide-react';
import { sounds } from '../../../engine/audioEffects';

export const ProjectileSim = ({ simulation = {}, activeTab = 'sandbox', onUpdateScore }) => {
  // --- Launch Parameters ---
  const [angleDeg, setAngleDeg] = useState(45); // degrees (10 to 80)
  const [launchSpeed, setLaunchSpeed] = useState(25); // m/s (5 to 45)
  const [initialHeight, setInitialHeight] = useState(0); // meters (0 to 25)
  const [gravityPreset, setGravityPreset] = useState('earth'); // earth=9.81, moon=1.62, mars=3.71
  const [targetDist, setTargetDist] = useState(55); // meters
  const [showVectors, setShowVectors] = useState(true);

  // --- Flight Animation State ---
  const [isFlying, setIsFlying] = useState(false);
  const [flightTime, setFlightTime] = useState(0);
  const [trajectoryPoints, setTrajectoryPoints] = useState([]);
  const [pastTrajectories, setPastTrajectories] = useState([]);
  const [hitResult, setHitResult] = useState(null); // 'bullseye', 'hit', 'miss'
  const [impactParticles, setImpactParticles] = useState([]);

  // --- Challenge Quiz State ---
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [challengeFeedback, setChallengeFeedback] = useState({});

  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const isDraggingCannonRef = useRef(false);
  const isDraggingTargetRef = useRef(false);

  const g = gravityPreset === 'moon' ? 1.62 : gravityPreset === 'mars' ? 3.71 : 9.81;

  // Theoretical analytical values
  const thetaRad = (angleDeg * Math.PI) / 180;
  const v0x = launchSpeed * Math.cos(thetaRad);
  const v0y = launchSpeed * Math.sin(thetaRad);

  const maxFlightTime = (v0y + Math.sqrt(Math.pow(v0y, 2) + 2 * g * initialHeight)) / g;
  const theoreticalRange = v0x * maxFlightTime;
  const maxApexHeight = initialHeight + Math.pow(v0y, 2) / (2 * g);

  // Launch projectile
  const handleFire = () => {
    sounds.playZap();
    setIsFlying(true);
    setFlightTime(0);
    setTrajectoryPoints([]);
    setHitResult(null);
    setImpactParticles([]);
  };

  const handleReset = () => {
    sounds.playSnap();
    setIsFlying(false);
    setFlightTime(0);
    setTrajectoryPoints([]);
    setPastTrajectories([]);
    setHitResult(null);
    setImpactParticles([]);
  };

  // 60 FPS Flight Animation Loop
  useEffect(() => {
    if (activeTab !== 'sandbox') return;

    let t = flightTime;
    let points = [...trajectoryPoints];
    let particles = [...impactParticles];
    let lastTime = performance.now();

    const scaleX = (760 - 120) / 75; // 75 meters max range
    const scaleY = (380 - 80) / 40;  // 40 meters max height
    const originX = 60;
    const groundY = 380 - 50;

    const render = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (isFlying && t < maxFlightTime) {
        t = Math.min(maxFlightTime, t + dt * 1.5);
        setFlightTime(t);

        const curX = v0x * t;
        const curY = Math.max(0, initialHeight + v0y * t - 0.5 * g * Math.pow(t, 2));
        points.push({ x: curX, y: curY });
        setTrajectoryPoints([...points]);

        // Flight ended upon hitting ground
        if (t >= maxFlightTime) {
          setIsFlying(false);
          sounds.playSpark();
          const distFromTarget = Math.abs(curX - targetDist);
          if (distFromTarget <= 2.0) {
            setHitResult('bullseye');
            sounds.playSuccess();
            if (onUpdateScore) onUpdateScore(25);
          } else if (distFromTarget <= 6.0) {
            setHitResult('hit');
            sounds.playSnap();
          } else {
            setHitResult('miss');
          }

          // Spawn ground impact dust/sparks
          const landingPx = originX + curX * scaleX;
          for (let i = 0; i < 24; i++) {
            const angle = Math.PI + Math.random() * Math.PI; // upward burst
            const speed = 40 + Math.random() * 120;
            particles.push({
              x: landingPx,
              y: groundY,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              life: 1.0,
              color: Math.random() > 0.5 ? '#f59e0b' : '#94a3b8'
            });
          }

          // Save to past ghost trajectories (keep up to 4)
          setPastTrajectories(prev => [
            ...prev.slice(-3),
            { points: [...points], angle: angleDeg, speed: launchSpeed }
          ]);
        }
      }

      // Update particles
      particles = particles.map(p => ({
        ...p,
        x: p.x + p.vx * dt,
        y: p.y + p.vy * dt + 180 * dt,
        life: p.life - dt * 2.5
      })).filter(p => p.life > 0);
      setImpactParticles(particles);

      // Draw onto canvas
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Pale coordinate grid
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      for (let x = 0; x <= 75; x += 10) {
        const px = originX + x * scaleX;
        ctx.beginPath();
        ctx.moveTo(px, 20);
        ctx.lineTo(px, groundY);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${x}m`, px, groundY + 16);
      }
      for (let y = 0; y <= 35; y += 10) {
        const py = groundY - y * scaleY;
        ctx.beginPath();
        ctx.moveTo(originX, py);
        ctx.lineTo(width - 40, py);
        ctx.stroke();

        ctx.fillStyle = '#94a3b8';
        ctx.font = '9px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${y}m`, originX - 8, py + 3);
      }

      // 2. Ground Terrain
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(originX - 30, groundY, width, height - groundY);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(originX - 30, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      // 3. Launch Stand Platform
      const launchY = groundY - initialHeight * scaleY;
      if (initialHeight > 0) {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(originX - 18, launchY, 36, initialHeight * scaleY);
        ctx.strokeStyle = '#64748b';
        ctx.strokeRect(originX - 18, launchY, 36, initialHeight * scaleY);
      }

      // 4. Target Bullseye on Ground (Draggable)
      const targetPx = originX + targetDist * scaleX;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(targetPx - 16, groundY - 4, 32, 8, 4);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(targetPx - 6, groundY - 4, 12, 8, 2);
      ctx.fill();

      // Target Pole & Flag
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(targetPx, groundY);
      ctx.lineTo(targetPx, groundY - 30);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(targetPx, groundY - 30);
      ctx.lineTo(targetPx + 14, groundY - 24);
      ctx.lineTo(targetPx, groundY - 18);
      ctx.fill();

      ctx.fillStyle = '#475569';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`TARGET: ${targetDist}m`, targetPx, groundY - 36);

      // 5. Historical Ghost Trajectories (Comparisons)
      pastTrajectories.forEach((traj, idx) => {
        if (traj.points.length > 1) {
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(originX + traj.points[0].x * scaleX, groundY - traj.points[0].y * scaleY);
          for (let p = 1; p < traj.points.length; p++) {
            ctx.lineTo(originX + traj.points[p].x * scaleX, groundY - traj.points[p].y * scaleY);
          }
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // 6. Active Trajectory Path
      if (points.length > 1) {
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(originX + points[0].x * scaleX, groundY - points[0].y * scaleY);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(originX + points[i].x * scaleX, groundY - points[i].y * scaleY);
        }
        ctx.stroke();
      }

      // 7. Impact Dust Particles
      for (const p of particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // 8. Cannon Turret & Barrel (Draggable Angle)
      ctx.save();
      ctx.translate(originX, launchY);

      // Turret base pivot
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      // Barrel
      ctx.rotate(-thetaRad);
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-4, -6, 36, 12, 4);
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Aiming handle at barrel tip
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(36, 0, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 9. Current Projectile & Live Velocity Decomposition Vectors
      if (points.length > 0) {
        const lastPt = points[points.length - 1];
        const projPx = originX + lastPt.x * scaleX;
        const projPy = groundY - lastPt.y * scaleY;

        // Projectile sphere
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(projPx, projPy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Vector decomposition: vx (horizontal cyan) and vy (vertical emerald/rose)
        if (showVectors && isFlying) {
          const curVy = v0y - g * t;
          const vxLen = v0x * 1.5;
          const vyLen = -curVy * 1.5;

          // Vx (Horizontal - constant)
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(projPx, projPy);
          ctx.lineTo(projPx + vxLen, projPy);
          ctx.stroke();

          // Vy (Vertical - changes with gravity)
          ctx.strokeStyle = curVy >= 0 ? '#10b981' : '#ef4444';
          ctx.beginPath();
          ctx.moveTo(projPx, projPy);
          ctx.lineTo(projPx, projPy + vyLen);
          ctx.stroke();
        }
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [activeTab, isFlying, flightTime, trajectoryPoints, pastTrajectories, impactParticles, angleDeg, launchSpeed, initialHeight, gravityPreset, targetDist, showVectors, g, v0x, v0y, maxFlightTime]);

  // Handle direct Canvas dragging of Cannon Angle or Target
  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const scaleXCoord = (canvas.width - 120) / 75;
    const originX = 60;
    const targetPx = originX + targetDist * scaleXCoord;

    // Check cannon drag
    if (Math.hypot(clickX - 60, clickY - (canvas.height - 50 - initialHeight * 7.5)) < 45) {
      isDraggingCannonRef.current = true;
      sounds.playTick();
      return;
    }

    // Check target flag drag
    if (Math.abs(clickX - targetPx) < 25) {
      isDraggingTargetRef.current = true;
      sounds.playTick();
      return;
    }
  };

  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    if (isDraggingCannonRef.current) {
      const launchY = canvas.height - 50 - initialHeight * ((canvas.height - 80) / 40);
      const dx = mouseX - 60;
      const dy = launchY - mouseY;
      if (dx > 0) {
        const rad = Math.atan2(dy, dx);
        const deg = Math.max(10, Math.min(80, Math.round((rad * 180) / Math.PI)));
        if (deg !== angleDeg) {
          setAngleDeg(deg);
          sounds.playTick();
        }
      }
    } else if (isDraggingTargetRef.current) {
      const scaleXCoord = (canvas.width - 120) / 75;
      const newDist = Math.max(20, Math.min(70, Math.round((mouseX - 60) / scaleXCoord)));
      if (newDist !== targetDist) {
        setTargetDist(newDist);
        sounds.playTick();
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (isDraggingCannonRef.current || isDraggingTargetRef.current) {
      sounds.playSnap();
      isDraggingCannonRef.current = false;
      isDraggingTargetRef.current = false;
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

  return (
    <div className="space-y-6">
      {/* TAB 1: CURIOSITY */}
      {activeTab === 'curiosity' && (
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              BALLISTICS & 2D KINEMATICS
            </div>

            <h2 className="text-2xl md:text-3xl font-bold font-sans text-slate-900 tracking-tight">
              {simulation.name || "Projectile Motion: Target Range & Apex"}
            </h2>

            <p className="text-sm font-semibold text-amber-800 italic">
              "{simulation.curiosityQuestion || "Why does a 45-degree angle maximize horizontal distance?"}"
            </p>

            <div className="text-xs text-slate-600 space-y-3 font-sans leading-relaxed">
              <p>
                In ideal 2-dimensional projectile motion without air drag, the horizontal and vertical motions are <strong>completely independent</strong>:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-slate-500 uppercase text-[10px]">Horizontal (Constant Velocity)</div>
                  <div className="font-bold text-slate-800">x(t) = v₀·cos(θ) · t</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-slate-500 uppercase text-[10px]">Vertical (Constant Gravity)</div>
                  <div className="font-bold text-slate-800">y(t) = h₀ + v₀·sin(θ)·t - ½gt²</div>
                </div>
              </div>
              <p>
                The horizontal range formula is <strong>R = (v₀²·sin(2θ)) / g</strong>. Since the maximum value of sin(2θ) is 1 (occurring at 2θ = 90°), the angle that produces the farthest landing point on flat ground is always <strong>45°</strong>!
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
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-700">
                    60 FPS 2D BALLISTICS ARENA
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { sounds.playTick(); setShowVectors(!showVectors); }}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-all ${
                      showVectors ? 'bg-sky-50 text-sky-800 border-sky-300 font-bold' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Velocity Vectors (Vx, Vy)
                  </button>

                  <button
                    onClick={handleFire}
                    disabled={isFlying}
                    className="px-3 py-1 rounded text-xs font-mono font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm flex items-center gap-1.5 disabled:opacity-50 active:scale-[0.98] transition-transform"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>LAUNCH</span>
                  </button>

                  <button
                    onClick={handleReset}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
                    title="Reset Trajectory"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Canvas with Direct Aiming Drag */}
              <div className="relative w-full bg-slate-50 select-none">
                <canvas
                  ref={canvasRef}
                  width={760}
                  height={380}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  className="w-full h-auto block cursor-crosshair"
                />

                {hitResult && (
                  <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-xs font-mono font-bold border shadow-md flex items-center gap-2 ${
                    hitResult === 'bullseye' 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : hitResult === 'hit'
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-rose-50 border-rose-300 text-rose-800'
                  }`}>
                    {hitResult === 'bullseye' && '🎯 DIRECT BULLSEYE HIT! (+25 PTS)'}
                    {hitResult === 'hit' && '⚠️ CLOSE HIT ON TARGET PERIMETER!'}
                    {hitResult === 'miss' && '❌ TARGET MISSED! ADJUST ANGLE OR VELOCITY.'}
                  </div>
                )}

                <div className="absolute bottom-2 left-3 px-2 py-1 rounded-md bg-white/80 backdrop-blur-sm border border-slate-200 text-[10px] font-mono text-slate-500 pointer-events-none">
                  Drag cannon barrel to aim angle // Drag red flag to move target
                </div>
              </div>

              {/* Telemetry Readouts */}
              <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Theoretical Range</div>
                  <div className="text-base font-bold text-amber-700">{theoreticalRange.toFixed(1)} m</div>
                  <div className="text-[10px] text-slate-400">Target: {targetDist} m</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Apex Peak Height</div>
                  <div className="text-base font-bold text-slate-800">{maxApexHeight.toFixed(1)} m</div>
                  <div className="text-[10px] text-slate-400">y_max above ground</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Flight Duration</div>
                  <div className="text-base font-bold text-blue-700">{maxFlightTime.toFixed(2)} s</div>
                  <div className="text-[10px] text-slate-400">At g = {g.toFixed(2)} m/s²</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Horizontal Speed</div>
                  <div className="text-base font-bold text-sky-700">{v0x.toFixed(1)} m/s</div>
                  <div className="text-[10px] text-slate-400">Vx (Constant)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Controls (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-900 uppercase">
                  Ballistics Controls
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Adjust launch angle, muzzle velocity, and planetary gravity.
                </p>
              </div>

              {/* Slider: Launch Angle */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-700 font-bold">LAUNCH ANGLE (θ):</span>
                  <span className="font-bold text-amber-700">{angleDeg}°</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={80}
                  step={1}
                  value={angleDeg}
                  onChange={(e) => {
                    sounds.playTick();
                    setAngleDeg(Number(e.target.value));
                  }}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>10° (Flat)</span>
                  <span className="text-amber-700 font-bold">45° (Max Range)</span>
                  <span>80° (High Arc)</span>
                </div>
              </div>

              {/* Slider: Launch Speed */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-700 font-bold">MUZZLE VELOCITY (v₀):</span>
                  <span className="font-bold text-slate-800">{launchSpeed} m/s</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={45}
                  step={1}
                  value={launchSpeed}
                  onChange={(e) => {
                    sounds.playTick();
                    setLaunchSpeed(Number(e.target.value));
                  }}
                  className="w-full accent-slate-700 cursor-pointer"
                />
              </div>

              {/* Slider: Initial Height */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-700 font-bold">LAUNCH PLATFORM HEIGHT:</span>
                  <span className="font-bold text-slate-800">{initialHeight} m</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  step={1}
                  value={initialHeight}
                  onChange={(e) => {
                    sounds.playTick();
                    setInitialHeight(Number(e.target.value));
                  }}
                  className="w-full accent-slate-700 cursor-pointer"
                />
              </div>

              {/* Planetary Gravity Presets */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="text-xs font-mono font-bold text-slate-700">GRAVITATIONAL ACCELERATION:</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'earth', label: 'Earth (9.8m/s²)' },
                    { id: 'moon', label: 'Moon (1.6m/s²)' },
                    { id: 'mars', label: 'Mars (3.7m/s²)' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        sounds.playTick();
                        setGravityPreset(p.id);
                      }}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-mono border transition-all ${
                        gravityPreset === p.id 
                          ? 'bg-amber-500 border-amber-600 text-white font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* One-click comparison presets */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-mono text-slate-500 uppercase font-bold">
                  Angle Comparison Presets:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      sounds.playSnap();
                      setAngleDeg(30);
                      setLaunchSpeed(24);
                    }}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono text-left active:scale-[0.98] transition-transform"
                  >
                    <div className="font-bold">30° Low Arc</div>
                    <div className="text-[10px] text-slate-500">Fast flight time</div>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playSnap();
                      setAngleDeg(60);
                      setLaunchSpeed(24);
                    }}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono text-left active:scale-[0.98] transition-transform"
                  >
                    <div className="font-bold">60° High Arc</div>
                    <div className="text-[10px] text-slate-500">Same range as 30°!</div>
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
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-sans">
            <strong>Ballistics Inquiry Laboratory:</strong> Test your understanding of parabolic trajectories and projectile physics. Earn up to 75 laboratory score points!
          </div>

          {/* Question 1 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase">
              Challenge 1 of 3 // Complementary Angles
            </div>
            <h3 className="text-sm font-bold font-sans text-slate-900">
              Why do two launch angles that add up to 90 degrees (such as 30° and 60°, or 20° and 70°) yield the exact same horizontal range on flat ground?
            </h3>

            <div className="space-y-2">
              {[
                { text: "Because sin(2θ) gives the exact same value for complementary angles: sin(2·30°) = sin(60°) = sin(120°) = sin(2·60°)", correct: true },
                { text: "Because Earth's gravity only affects projectiles launched above 45 degrees", correct: false },
                { text: "Because the horizontal velocity is identical in both cases", correct: false },
                { text: "Because the flight times are identical in both cases", correct: false }
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
                        : <Crosshair className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 2 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase">
              Challenge 2 of 3 // Apex Vertical Velocity
            </div>
            <h3 className="text-sm font-bold font-sans text-slate-900">
              At the exact highest point (apex) of a projectile's flight, what is its vertical velocity Vy?
            </h3>

            <div className="space-y-2">
              {[
                { text: "Exactly 0 m/s (instantaneous vertical turning point, while Vx remains unchanged)", correct: true },
                { text: "Equal to the initial launch velocity v₀", correct: false },
                { text: "9.81 m/s downwards", correct: false },
                { text: "Infinity", correct: false }
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
                        : <Crosshair className="w-4 h-4 text-rose-600 flex-shrink-0" />
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
