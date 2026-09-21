import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Gauge, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { sounds } from '../../../engine/audioEffects';

export const RollerCoasterSim = ({ activeTab, onUpdateScore }) => {
  // --- Sandbox Physics Parameters ---
  const [initialHeight, setInitialHeight] = useState(35); // meters (10 - 50)
  const [loopRadius, setLoopRadius] = useState(10); // meters (5 - 18)
  const [mass, setMass] = useState(1000); // kg
  const [hasFriction, setHasFriction] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showFBD, setShowFBD] = useState(true);

  // --- Real-Time State ---
  const [progress, setProgress] = useState(0); // 0 to 1 along track
  const [telemetry, setTelemetry] = useState({
    velocity: 0,
    height: 35,
    gForce: 1,
    ke: 0,
    pe: 0,
    totalE: 0,
    fellOff: false
  });

  // --- Challenge Quiz State ---
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [challengeFeedback, setChallengeFeedback] = useState({});

  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Gravity constant
  const g = 9.81;

  // Minimum initial height for circular loop: h >= 2.5 * r
  const criticalHeight = 2.5 * loopRadius;

  // Reset coaster simulation
  const handleReset = () => {
    sounds.playSnap();
    setProgress(0);
    setIsPlaying(true);
  };

  // Main 60 FPS Animation & Physics Loop
  useEffect(() => {
    if (activeTab !== 'sandbox') return;

    let currentProgress = progress;
    let lastTime = performance.now();

    const render = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      // Track layout coordinates
      const startX = 60;
      const groundY = height - 70;
      const trackScale = (groundY - 60) / 50; // pixels per meter

      const startY = groundY - initialHeight * trackScale;
      const loopCenterX = width * 0.52;
      const loopR = loopRadius * trackScale;
      const loopCenterY = groundY - loopR;
      const endX = width - 60;

      // Calculate track geometry
      // Segment 1: Incline drop (progress 0 -> 0.35)
      // Segment 2: Circular loop (progress 0.35 -> 0.75)
      // Segment 3: Exit runout (progress 0.75 -> 1.0)
      let carX = startX;
      let carY = startY;
      let carAngle = 0;
      let curHeightMeters = initialHeight;

      if (isPlaying) {
        // Compute speed from conservation of mechanical energy
        // Total mechanical energy E0 = m * g * initialHeight
        // At any point, E = m * g * y + 0.5 * m * v^2 + frictionLoss
        const frictionLoss = hasFriction ? currentProgress * 0.15 * (m * g * initialHeight) : 0;
        
        let simHeight = initialHeight;
        if (currentProgress < 0.35) {
          // Drop down
          const t = currentProgress / 0.35;
          simHeight = initialHeight * (1 - t);
        } else if (currentProgress <= 0.75) {
          // Loop-the-loop
          const t = (currentProgress - 0.35) / 0.4;
          const theta = -Math.PI / 2 + t * 2 * Math.PI;
          simHeight = loopRadius * (1 - Math.cos(theta + Math.PI / 2));
        } else {
          // Exit flat
          simHeight = 0;
        }

        const potEnergy = mass * g * Math.max(0, simHeight);
        const totEnergy = mass * g * initialHeight - frictionLoss;
        const kinEnergy = Math.max(0, totEnergy - potEnergy);
        const curVelocity = Math.sqrt((2 * kinEnergy) / mass);

        // Check apex condition (t = 0.5 of loop)
        const fell = initialHeight < criticalHeight && currentProgress > 0.48 && currentProgress < 0.62;

        // Normal force at current point
        let normalG = 1;
        if (currentProgress >= 0.35 && currentProgress <= 0.75) {
          const t = (currentProgress - 0.35) / 0.4;
          const theta = -Math.PI / 2 + t * 2 * Math.PI;
          const an = (curVelocity * curVelocity) / Math.max(1, loopRadius);
          const gComponent = g * Math.cos(theta + Math.PI / 2);
          normalG = (an - gComponent) / g;
        }

        setTelemetry({
          velocity: curVelocity,
          height: simHeight,
          gForce: normalG,
          ke: kinEnergy,
          pe: potEnergy,
          totalE: totEnergy,
          fellOff: fell
        });

        // Advance progress based on velocity
        const speedFactor = Math.max(0.08, (curVelocity / 30) * 0.28);
        currentProgress += speedFactor * dt;
        if (currentProgress > 1) {
          currentProgress = 0;
        }
        setProgress(currentProgress);
      }

      // --- Draw Canvas Scene ---
      ctx.clearRect(0, 0, width, height);

      // 1. Pale academic grid background
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

      // Ground plane
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(0, groundY, width, height - groundY);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      // Track support trestles
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      for (let x = startX + 30; x < loopCenterX - loopR; x += 60) {
        const dropT = (x - startX) / (loopCenterX - loopR - startX);
        const trestleTop = startY + dropT * (groundY - startY);
        ctx.beginPath();
        ctx.moveTo(x, trestleTop);
        ctx.lineTo(x, groundY);
        ctx.stroke();
      }

      // Track path
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();

      // Drop
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(startX + 80, groundY, loopCenterX - loopR, groundY);

      // Loop
      ctx.arc(loopCenterX, loopCenterY, loopR, Math.PI / 2, -1.5 * Math.PI, false);

      // Runout
      ctx.lineTo(endX, groundY);
      ctx.stroke();

      // Critical height dashed line
      const critY = groundY - criticalHeight * trackScale;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(startX - 20, critY);
      ctx.lineTo(width - 40, critY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#b45309';
      ctx.font = '10px monospace';
      ctx.fillText(`CRITICAL HEIGHT (2.5r = ${criticalHeight.toFixed(1)}m)`, startX, critY - 5);

      // Compute Car Position along Path
      if (progress < 0.35) {
        const t = progress / 0.35;
        carX = startX + t * (loopCenterX - loopR - startX);
        carY = startY + Math.pow(t, 2) * (groundY - startY);
        carAngle = Math.atan2(groundY - startY, loopCenterX - loopR - startX);
      } else if (progress <= 0.75) {
        const t = (progress - 0.35) / 0.4;
        const theta = Math.PI / 2 + t * 2 * Math.PI;
        carX = loopCenterX + loopR * Math.cos(theta);
        carY = loopCenterY + loopR * Math.sin(theta);
        carAngle = theta + Math.PI / 2;
      } else {
        const t = (progress - 0.75) / 0.25;
        carX = loopCenterX + loopR + t * (endX - (loopCenterX + loopR));
        carY = groundY;
        carAngle = 0;
      }

      // Draw Coaster Car
      ctx.save();
      ctx.translate(carX, carY);
      ctx.rotate(carAngle);

      // Car body
      ctx.fillStyle = telemetry.fellOff ? '#ef4444' : '#2563eb';
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.fillRect(-14, -10, 28, 14);
      ctx.strokeRect(-14, -10, 28, 14);

      // Wheels
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(-8, 4, 3.5, 0, Math.PI * 2);
      ctx.arc(8, 4, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Free Body Diagram Vectors
      if (showFBD) {
        // Gravity Vector (always points down in world space)
        ctx.restore();
        ctx.save();
        ctx.translate(carX, carY);

        // F_gravity (down)
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 30);
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.fillText('Fg', 5, 25);

        // Normal force vector (points inward towards loop center)
        if (progress >= 0.35 && progress <= 0.75) {
          const normLength = Math.max(0, telemetry.gForce * 20);
          const nx = (loopCenterX - carX) / loopR * normLength;
          const ny = (loopCenterY - carY) / loopR * normLength;
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(nx, ny);
          ctx.stroke();
          ctx.fillStyle = '#10b981';
          ctx.fillText('N', nx + 4, ny);
        }
      }

      ctx.restore();

      // Loop Apex callout
      const apexY = groundY - 2 * loopRadius * trackScale;
      ctx.fillStyle = '#64748b';
      ctx.font = '11px monospace';
      ctx.fillText(`Apex (2r = ${(2 * loopRadius).toFixed(1)}m)`, loopCenterX - 35, apexY - 10);

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [activeTab, initialHeight, loopRadius, mass, hasFriction, isPlaying, showFBD, progress]);

  // Quiz submission handler
  const handleAnswerSubmit = (questionId, optionIndex, isCorrect) => {
    sounds.playClick();
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    setChallengeFeedback(prev => ({
      ...prev,
      [questionId]: isCorrect ? 'correct' : 'incorrect'
    }));

    if (isCorrect && onUpdateScore) {
      onUpdateScore(20);
    }
  };

  return (
    <div className="space-y-6">
      {/* TAB 1: CURIOSITY & REAL-WORLD FRAMING */}
      {activeTab === 'curiosity' && (
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          {/* Hero Framing Card */}
          <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              THE ROLLER COASTER PARADOX
            </div>

            <h2 className="text-2xl md:text-3xl font-bold font-sans text-slate-900 tracking-tight">
              Why don't passengers plunge to the ground at the top of a loop?
            </h2>

            <p className="text-sm font-semibold text-amber-800 italic">
              "At the apex of a vertical loop-the-loop, you are completely upside down. Gravity is pulling you straight toward the Earth at 9.8 m/s². Yet, you remain firmly planted against your seat."
            </p>

            <div className="text-xs text-slate-600 space-y-3 font-sans leading-relaxed">
              <p>
                In 1895, the world's first vertical loop coaster, the <em>Flip Flap Railway</em> at Coney Island, was built with a circular loop. The circular loop created an astonishing and dangerous <strong>12 Gs of centrifugal acceleration</strong>, causing severe neck injuries and whiplash among early riders.
              </p>
              <p>
                Modern roller coasters use the principle of <strong>Conservation of Mechanical Energy</strong> ($E = K + U$) combined with <strong>Centripetal Acceleration</strong> ($a_c = v^2/r$). To avoid falling out without seat belts, the inward normal force $N$ from the track must be greater than or equal to zero. This leads to a famous mathematical proof: the starting drop must be at least <strong>2.5 times the radius</strong> of the loop!
              </p>
            </div>

            {/* Formula Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-mono">
                <div className="text-[10px] text-slate-500 uppercase">Mechanical Energy</div>
                <div className="text-base font-bold text-slate-800">E = mgh + ½mv²</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-mono">
                <div className="text-[10px] text-slate-500 uppercase">Apex Min Velocity</div>
                <div className="text-base font-bold text-blue-700">v_top ≥ √(g·r)</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-mono">
                <div className="text-[10px] text-slate-500 uppercase">Critical Height</div>
                <div className="text-base font-bold text-amber-700">h_min = 2.5·r</div>
              </div>
            </div>
          </div>

          {/* Key Concepts Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
              <h3 className="text-sm font-bold font-mono text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Key Learning Objectives
              </h3>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside font-sans">
                <li>Verify energy transfer between gravitational potential and kinetic energy.</li>
                <li>Derive the minimum velocity required at the top of a vertical loop ($v_{min} = \sqrt{gr}$).</li>
                <li>Understand why circular loops produce extreme G-forces compared to teardrop clothoid loops.</li>
                <li>Analyze the free body diagram vectors ($F_g$ and $N$) at the bottom and top of the loop.</li>
              </ul>
            </div>

            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
              <h3 className="text-sm font-bold font-mono text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Physical Principles Checklist
              </h3>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside font-sans">
                <li><strong>Potential Energy (U):</strong> Maximized at release height $h_0$.</li>
                <li><strong>Kinetic Energy (K):</strong> Maximized at bottom of the drop ($y=0$).</li>
                <li><strong>Centripetal Acceleration ($a_c$):</strong> Directed inward toward loop center ($v^2/r$).</li>
                <li><strong>Apparent Weight ($N$):</strong> Felt as heavy Gs at bottom and weightlessness at top.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE 60 FPS SANDBOX */}
      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-left">
          {/* Left / Main Simulation Canvas & Live Viewport (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Viewport Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              {/* Canvas Header */}
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-700">
                    60 FPS NUMERICAL RUNTIME // VERTICAL LOOP SIMULATOR
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFBD(!showFBD)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all border ${
                      showFBD 
                        ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold' 
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Force Vectors (FBD)
                  </button>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
                    title={isPlaying ? "Pause Simulation" : "Resume Simulation"}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={handleReset}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
                    title="Reset to Top"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* HTML5 Canvas */}
              <div className="relative w-full bg-slate-50">
                <canvas 
                  ref={canvasRef}
                  width={760}
                  height={420}
                  className="w-full h-auto block"
                />

                {/* Over-the-canvas Status Banner if Car Falls */}
                {telemetry.fellOff && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-mono font-bold flex items-center gap-2 shadow-md">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>INSUFFICIENT VELOCITY! COASTER DETACHED AT APEX (h &lt; 2.5r)</span>
                  </div>
                )}
              </div>

              {/* Real-Time Telemetry Readout Deck */}
              <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Velocity</div>
                  <div className="text-base font-bold text-slate-800">
                    {telemetry.velocity.toFixed(1)} <span className="text-xs font-normal">m/s</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {(telemetry.velocity * 3.6).toFixed(0)} km/h
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Track Height</div>
                  <div className="text-base font-bold text-slate-800">
                    {telemetry.height.toFixed(1)} <span className="text-xs font-normal">m</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Apex: {(2 * loopRadius).toFixed(1)} m
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Normal G-Force</div>
                  <div className={`text-base font-bold ${
                    telemetry.gForce < 0 ? 'text-rose-600' : telemetry.gForce > 4 ? 'text-amber-600' : 'text-emerald-700'
                  }`}>
                    {telemetry.gForce.toFixed(2)} <span className="text-xs font-normal">G</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    N / (mg)
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Condition at Top</div>
                  <div className={`text-xs font-bold mt-1 ${
                    initialHeight >= criticalHeight ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    {initialHeight >= criticalHeight ? 'SAFE TO LOOP' : 'WILL DETACH'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Req: {criticalHeight.toFixed(1)} m
                  </div>
                </div>
              </div>
            </div>

            {/* Energy Distribution Bar Chart */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700">
                <span>MECHANICAL ENERGY BREAKDOWN (JOULES)</span>
                <span className="text-slate-500">Total: {(telemetry.totalE / 1000).toFixed(1)} kJ</span>
              </div>

              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div 
                  className="bg-blue-600 transition-all duration-75"
                  style={{ width: `${Math.min(100, (telemetry.ke / Math.max(1, telemetry.totalE)) * 100)}%` }}
                  title="Kinetic Energy (K)"
                />
                <div 
                  className="bg-amber-500 transition-all duration-75"
                  style={{ width: `${Math.min(100, (telemetry.pe / Math.max(1, telemetry.totalE)) * 100)}%` }}
                  title="Gravitational Potential Energy (U)"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-blue-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                  <span>Kinetic: {(telemetry.ke / 1000).toFixed(1)} kJ</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span>Potential: {(telemetry.pe / 1000).toFixed(1)} kJ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Precision Control Deck (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold font-mono text-slate-900 uppercase tracking-wide">
                  Laboratory Control Deck
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Adjust track geometry and physical parameters to test loop threshold.
                </p>
              </div>

              {/* Slider: Initial Drop Height */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-600 font-bold">DROP HEIGHT (h₀):</span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                    {initialHeight} meters
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={50}
                  step={1}
                  value={initialHeight}
                  onChange={(e) => {
                    setInitialHeight(Number(e.target.value));
                    handleReset();
                  }}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>10m</span>
                  <span>Critical: {criticalHeight.toFixed(1)}m</span>
                  <span>50m</span>
                </div>
              </div>

              {/* Slider: Loop Radius */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-600 font-bold">LOOP RADIUS (r):</span>
                  <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200">
                    {loopRadius} meters
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={18}
                  step={1}
                  value={loopRadius}
                  onChange={(e) => {
                    setLoopRadius(Number(e.target.value));
                    handleReset();
                  }}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>5m (Tight)</span>
                  <span>18m (Broad)</span>
                </div>
              </div>

              {/* Slider: Coaster Mass */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-600 font-bold">COASTER MASS (m):</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                    {mass} kg
                  </span>
                </div>
                <input
                  type="range"
                  min={400}
                  max={2500}
                  step={100}
                  value={mass}
                  onChange={(e) => setMass(Number(e.target.value))}
                  className="w-full accent-slate-700 cursor-pointer"
                />
              </div>

              {/* Toggle: Friction */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-mono text-slate-700 font-bold">
                    TRACK FRICTION & AIR RESISTANCE
                  </span>
                  <input
                    type="checkbox"
                    checked={hasFriction}
                    onChange={(e) => setHasFriction(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded"
                  />
                </label>
                <p className="text-[11px] text-slate-400 font-sans mt-1">
                  When enabled, non-conservative mechanical work converts into thermal energy along the track.
                </p>
              </div>

              {/* Preset Scenario Buttons */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-mono text-slate-500 uppercase font-bold">
                  Quick Testing Presets:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setInitialHeight(20);
                      setLoopRadius(12);
                      handleReset();
                    }}
                    className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-mono text-left"
                  >
                    <div className="font-bold">Fail Preset</div>
                    <div className="text-[10px] text-rose-600">h = 20m &lt; 2.5r</div>
                  </button>

                  <button
                    onClick={() => {
                      setInitialHeight(35);
                      setLoopRadius(10);
                      handleReset();
                    }}
                    className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-mono text-left"
                  >
                    <div className="font-bold">Safe Pass</div>
                    <div className="text-[10px] text-emerald-600">h = 35m &gt; 2.5r</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CHALLENGE ME (GUIDED INQUIRY) */}
      {activeTab === 'challenge' && (
        <div className="max-w-3xl mx-auto space-y-5 text-left">
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-sans">
            <strong>Guided Physical Inquiry:</strong> Use your experimental findings from the 60 FPS sandbox to answer these conceptual challenges. Earn up to 60 laboratory score points!
          </div>

          {/* Question 1 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase">
              Challenge 1 of 3 // Analytical Derivation
            </div>
            <h3 className="text-sm font-bold font-sans text-slate-800">
              In a frictionless circular loop of radius r, what is the absolute minimum drop height h required so the coaster car does not fall off the track at the highest point?
            </h3>

            <div className="space-y-2">
              {[
                { text: "h = 1.0 r (same as apex height)", correct: false },
                { text: "h = 2.0 r (twice the radius)", correct: false },
                { text: "h = 2.5 r (deriving from v_top = √(gr) and conservation of energy)", correct: true },
                { text: "h = 4.0 r (four times the radius)", correct: false }
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
                ✓ <strong>Correct! (+20 pts)</strong> At the apex, $N=0 \implies mg = mv^2/r \implies v^2 = gr$. By conservation of energy, $mgh = mg(2r) + \frac{1}{2}mv^2 = 2mgr + \frac{1}{2}mgr = 2.5mgr$. Hence, $h_{min} = 2.5r$!
              </div>
            )}
          </div>

          {/* Question 2 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase">
              Challenge 2 of 3 // Inertial G-Forces
            </div>
            <h3 className="text-sm font-bold font-sans text-slate-800">
              Where on the vertical loop do riders experience the highest normal force (maximum G-force)?
            </h3>

            <div className="space-y-2">
              {[
                { text: "At the very top (apex) of the loop", correct: false },
                { text: "At the very bottom upon entering the loop (where speed is maximum and gravity points against normal force)", correct: true },
                { text: "Halfway through the loop at 90 degrees", correct: false }
              ].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswerSubmit('q2', i, opt.correct)}
                  className={`w-full p-3 rounded-xl text-xs font-mono text-left transition-all border ${
                    selectedAnswers['q2'] === i
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

            {challengeFeedback['q2'] === 'correct' && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-sans">
                ✓ <strong>Correct! (+20 pts)</strong> At the bottom, $N - mg = mv^2/r \implies N = mg + mv^2/r$. Because velocity $v$ is highest at the bottom, the normal force peaks at upwards of 5 to 6 Gs!
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
              Real-World Engineering: Why Modern Coasters Use Teardrop Loops
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Notice in our sandbox how a pure circular loop creates punishing G-forces at the bottom to ensure safety at the top. To solve this, roller coaster legend Werner Stengel introduced the <strong>Clothoid Loop (Euler Spiral)</strong> in 1976 with <em>The New Revolution</em> at Six Flags Magic Mountain.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-xs font-bold font-mono text-slate-800">1. Clothoid Teardrop Curvature</div>
                <p className="text-xs text-slate-600 font-sans">
                  The radius of curvature varies continuously ($r \propto 1/L$). At the bottom where speed is highest, the radius is large ($r \approx 25\text{m}$), capping G-force at a comfortable 3.5 Gs. At the apex where speed is low, the radius tightens ($r \approx 8\text{m}$), satisfying $v^2/r \ge g$.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-xs font-bold font-mono text-slate-800">2. Eddy Current Magnetic Brakes</div>
                <p className="text-xs text-slate-600 font-sans">
                  Permanent rare-earth neodymium magnets induce opposing eddy currents in copper fins on the train (Lenz's Law), providing completely frictionless, fail-safe deceleration without wear or tear.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
