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
  Layers
} from 'lucide-react';
import { sounds } from '../../../engine/audioEffects';

export const ProjectileSim = ({ simulation, activeTab, onUpdateScore }) => {
  // --- Launch Parameters ---
  const [angleDeg, setAngleDeg] = useState(45); // degrees (10 to 80)
  const [launchSpeed, setLaunchSpeed] = useState(25); // m/s (5 to 45)
  const [initialHeight, setInitialHeight] = useState(0); // meters (0 to 25)
  const [gravityPreset, setGravityPreset] = useState('earth'); // earth=9.81, moon=1.62, mars=3.71
  const [targetDist, setTargetDist] = useState(55); // meters

  // --- Flight Animation State ---
  const [isFlying, setIsFlying] = useState(false);
  const [flightTime, setFlightTime] = useState(0);
  const [trajectoryPoints, setTrajectoryPoints] = useState([]);
  const [hitResult, setHitResult] = useState(null); // 'bullseye', 'hit', 'miss'

  // --- Challenge Quiz State ---
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [challengeFeedback, setChallengeFeedback] = useState({});

  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const g = gravityPreset === 'moon' ? 1.62 : gravityPreset === 'mars' ? 3.71 : 9.81;

  // Theoretical analytical values
  const thetaRad = (angleDeg * Math.PI) / 180;
  const v0x = launchSpeed * Math.cos(thetaRad);
  const v0y = launchSpeed * Math.sin(thetaRad);

  // Time of flight: y(t) = h0 + v0y*t - 0.5*g*t^2 = 0
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
  };

  const handleReset = () => {
    sounds.playSnap();
    setIsFlying(false);
    setFlightTime(0);
    setTrajectoryPoints([]);
    setHitResult(null);
  };

  // 60 FPS Flight Animation Loop
  useEffect(() => {
    if (activeTab !== 'sandbox') return;

    let t = flightTime;
    let points = [...trajectoryPoints];
    let lastTime = performance.now();

    const render = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (isFlying && t < maxFlightTime) {
        t = Math.min(maxFlightTime, t + dt * 1.5);
        setFlightTime(t);

        // Coordinates in meters
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
        }
      }

      // Draw onto canvas
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Scale factors: 1 meter = X pixels
      const scaleX = (width - 120) / 75; // 75 meters max range
      const scaleY = (height - 80) / 40;  // 40 meters max height
      const originX = 60;
      const groundY = height - 50;

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

      // 3. Launch Stand Platform (if elevated)
      const launchY = groundY - initialHeight * scaleY;
      if (initialHeight > 0) {
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(originX - 18, launchY, 36, initialHeight * scaleY);
        ctx.strokeStyle = '#64748b';
        ctx.strokeRect(originX - 18, launchY, 36, initialHeight * scaleY);
      }

      // 4. Target Bullseye on Ground
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

      // 5. Cannon / Bow Aiming Barrel
      ctx.save();
      ctx.translate(originX, launchY);
      ctx.rotate(-thetaRad);
      ctx.fillStyle = '#1e293b';
      ctx.roundRect(-4, -6, 32, 12, 4);
      ctx.fill();
      ctx.restore();

      // 6. Draw Trajectory Path (Past Points)
      if (points.length > 1) {
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(originX + points[0].x * scaleX, groundY - points[0].y * scaleY);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(originX + points[i].x * scaleX, groundY - points[i].y * scaleY);
        }
        ctx.stroke();
      }

      // 7. Draw Current Projectile
      if (points.length > 0) {
        const lastPt = points[points.length - 1];
        const projPx = originX + lastPt.x * scaleX;
        const projPy = groundY - lastPt.y * scaleY;

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(projPx, projPy, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [activeTab, isFlying, flightTime, trajectoryPoints, angleDeg, launchSpeed, initialHeight, gravityPreset, targetDist]);

  const handleAnswerSubmit = (qId, idx, isCorrect) => {
    sounds.playClick();
    setSelectedAnswers(prev => ({ ...prev, [qId]: idx }));
    setChallengeFeedback(prev => ({ ...prev, [qId]: isCorrect ? 'correct' : 'incorrect' }));
    if (isCorrect && onUpdateScore) onUpdateScore(25);
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
              {simulation.name || "Bow and Arrow: Projectile Motion"}
            </h2>

            <p className="text-sm font-semibold text-amber-800 italic">
              "{simulation.curiosityQuestion || "Why does a 45-degree launch angle yield the maximum horizontal distance?"}"
            </p>

            <div className="text-xs text-slate-600 space-y-3 font-sans leading-relaxed">
              <p>
                When an object moves through the air under gravity alone, its horizontal and vertical motions are <strong>completely independent</strong>:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs">
                  <div className="font-bold text-slate-800">Horizontal (Constant Velocity):</div>
                  <div>x(t) = v₀ · cos(θ) · t</div>
                  <div>v_x = v₀ · cos(θ) [Constant]</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs">
                  <div className="font-bold text-slate-800">Vertical (Accelerated by Gravity):</div>
                  <div>y(t) = h₀ + v₀ · sin(θ) · t - ½gt²</div>
                  <div>v_y(t) = v₀ · sin(θ) - gt</div>
                </div>
              </div>
              <p>
                On flat ground (h₀ = 0), the range formula R = [v₀² · sin(2θ)] / g achieves its absolute maximum when sin(2θ) = 1, meaning 2θ = 90° and θ = 45°!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SANDBOX */}
      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-left">
          {/* Main Viewport (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-700">
                    60 FPS 2D BALLISTIC TRAJECTORY ENGINE
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFire}
                    disabled={isFlying}
                    className="px-3.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-mono font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Play className="w-3 h-3 fill-white" />
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

              <div className="relative w-full bg-slate-50">
                <canvas
                  ref={canvasRef}
                  width={760}
                  height={350}
                  className="w-full h-auto block"
                />

                {/* Target Result Callout */}
                {hitResult && (
                  <div className={`absolute top-4 right-4 px-3.5 py-2 rounded-xl text-xs font-mono font-bold shadow-md border ${
                    hitResult === 'bullseye' 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                      : hitResult === 'hit'
                      ? 'bg-blue-50 border-blue-300 text-blue-800'
                      : 'bg-rose-50 border-rose-300 text-rose-800'
                  }`}>
                    {hitResult === 'bullseye' && '🎯 DIRECT BULLSEYE HIT! (+25 PTS)'}
                    {hitResult === 'hit' && '✓ CLOSE TARGET HIT (Within 6m)'}
                    {hitResult === 'miss' && '✗ TARGET MISSED (Adjust angle or velocity)'}
                  </div>
                )}
              </div>

              {/* Real-time Telemetry Dashboard */}
              <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Max Range (R)</div>
                  <div className="text-base font-bold text-slate-800">{theoreticalRange.toFixed(1)} m</div>
                  <div className="text-[10px] text-slate-400">Target: {targetDist}m</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Apex Height</div>
                  <div className="text-base font-bold text-amber-700">{maxApexHeight.toFixed(1)} m</div>
                  <div className="text-[10px] text-slate-400">v_y = 0 m/s</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Flight Time</div>
                  <div className="text-base font-bold text-blue-700">{maxFlightTime.toFixed(2)} s</div>
                  <div className="text-[10px] text-slate-400">g = {g} m/s²</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Launch Angle</div>
                  <div className="text-base font-bold text-purple-700">{angleDeg}°</div>
                  <div className="text-[10px] text-slate-400">v₀ = {launchSpeed} m/s</div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Deck (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-900 uppercase">
                  Launch Controls Deck
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Adjust elevation angle, muzzle speed, platform height, and celestial gravity.
                </p>
              </div>

              {/* Slider: Launch Angle */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-700 font-bold">ELEVATION ANGLE (θ):</span>
                  <span className="font-bold text-purple-700">{angleDeg}°</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={85}
                  step={1}
                  value={angleDeg}
                  onChange={(e) => {
                    setAngleDeg(Number(e.target.value));
                    handleReset();
                  }}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              {/* Slider: Launch Velocity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-700 font-bold">LAUNCH SPEED (v₀):</span>
                  <span className="font-bold text-blue-700">{launchSpeed} m/s</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={45}
                  step={1}
                  value={launchSpeed}
                  onChange={(e) => {
                    setLaunchSpeed(Number(e.target.value));
                    handleReset();
                  }}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Slider: Initial Height */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-700 font-bold">PLATFORM HEIGHT (h₀):</span>
                  <span className="font-bold text-slate-800">{initialHeight} m</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  step={1}
                  value={initialHeight}
                  onChange={(e) => {
                    setInitialHeight(Number(e.target.value));
                    handleReset();
                  }}
                  className="w-full accent-slate-700 cursor-pointer"
                />
              </div>

              {/* Celestial Gravity Selector */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="text-[11px] font-mono text-slate-500 uppercase font-bold">
                  Gravitational Field:
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'earth', name: 'Earth', g: '9.8' },
                    { id: 'moon', name: 'Moon', g: '1.6' },
                    { id: 'mars', name: 'Mars', g: '3.7' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setGravityPreset(p.id);
                        handleReset();
                      }}
                      className={`p-2 rounded-lg text-xs font-mono text-center border transition-all ${
                        gravityPreset === p.id
                          ? 'bg-amber-50 border-amber-400 text-amber-900 font-bold shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div>{p.name}</div>
                      <div className="text-[10px] text-slate-400">{p.g} m/s²</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Distance Slider */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-700 font-bold">TARGET DISTANCE:</span>
                  <span className="font-bold text-amber-700">{targetDist} m</span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={70}
                  step={5}
                  value={targetDist}
                  onChange={(e) => {
                    setTargetDist(Number(e.target.value));
                    handleReset();
                  }}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CHALLENGE ME */}
      {activeTab === 'challenge' && (
        <div className="max-w-3xl mx-auto space-y-5 text-left">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-sans">
            <strong>Trajectory Inquiry Challenges:</strong> Apply kinematic equations to predict flight paths.
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase">
              Challenge 1 of 2 // Complementary Angles
            </div>
            <h3 className="text-sm font-bold font-sans text-slate-800">
              Neglecting air resistance, which pair of launch angles produces the exact same horizontal range R on flat ground?
            </h3>

            <div className="space-y-2">
              {[
                { text: "30 degrees and 60 degrees (Complementary angles summing to 90 degrees)", correct: true },
                { text: "30 degrees and 45 degrees", correct: false },
                { text: "45 degrees and 90 degrees", correct: false }
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
                ✓ <strong>Correct! (+25 pts)</strong> Because sin(2(90°-θ)) = sin(180°-2θ) = sin(2θ), any two launch angles that add up to 90° land at the exact same spot!
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
              Real-World Engineering: Orbital Mechanics and ICBM Trajectories
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              On Earth, we treat the ground as a flat plane and gravity as a uniform downward vector. But at high orbital speeds (v₀ &gt; 7.9 km/s), the curvature of the Earth drops away at the exact rate the projectile falls: the projectile enters a permanent free-fall called <strong>Orbit</strong>!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
