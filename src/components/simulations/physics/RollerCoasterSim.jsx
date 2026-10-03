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

export const RollerCoasterSim = ({ activeTab = 'sandbox', onUpdateScore }) => {
  // --- Sandbox Physics Parameters ---
  const [initialHeight, setInitialHeight] = useState(35); // meters (10 - 50)
  const [loopRadius, setLoopRadius] = useState(10); // meters (5 - 18)
  const [mass, setMass] = useState(1000); // kg
  const [hasFriction, setHasFriction] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showFBD, setShowFBD] = useState(true);

  // --- Real-Time State (Updated throttled for DOM) ---
  const [telemetry, setTelemetry] = useState({
    velocity: 0,
    height: 35,
    gForce: 1,
    ke: 0,
    pe: 0,
    totalE: 1000 * 9.81 * 35,
    fellOff: false
  });

  // --- Challenge Quiz State ---
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [challengeFeedback, setChallengeFeedback] = useState({});

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const progressRef = useRef(0);
  const frameCountRef = useRef(0);

  // Gravity constant
  const g = 9.81;

  // Minimum initial height for circular loop: h >= 2.5 * r
  const criticalHeight = 2.5 * loopRadius;

  // Reset coaster simulation
  const handleReset = () => {
    sounds.playSnap();
    progressRef.current = 0;
    setIsPlaying(true);
  };

  // Main 60 FPS Animation & Physics Loop
  useEffect(() => {
    if (activeTab !== 'sandbox') return;

    let lastTime = performance.now();

    const render = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.04);
      lastTime = time;

      const canvas = canvasRef.current;
      if (!canvas) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }

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

      let currentProg = progressRef.current;

      // Physics: Speed from conservation of mechanical energy
      const frictionLoss = hasFriction ? currentProg * 0.15 * (mass * g * initialHeight) : 0;
      
      let simHeight = initialHeight;
      if (currentProg < 0.35) {
        // Drop down (from startY to groundY)
        const t = currentProg / 0.35;
        simHeight = initialHeight * (1 - Math.pow(t, 1.6));
      } else if (currentProg <= 0.75) {
        // Vertical Loop
        const t = (currentProg - 0.35) / 0.4;
        // At t=0, bottom; t=0.5, apex (2*loopRadius); t=1.0, bottom
        simHeight = loopRadius * (1 - Math.cos(t * 2 * Math.PI));
      } else {
        // Exit runout
        simHeight = 0;
      }

      const potEnergy = mass * g * Math.max(0, simHeight);
      const totEnergy = mass * g * initialHeight - frictionLoss;
      const kinEnergy = Math.max(0, totEnergy - potEnergy);
      const curVelocity = Math.sqrt((2 * kinEnergy) / mass);

      // Check apex detachment condition
      const fell = initialHeight < criticalHeight && currentProg > 0.48 && currentProg < 0.62;

      // Normal force at current point
      let normalG = 1;
      if (currentProg >= 0.35 && currentProg <= 0.75) {
        const t = (currentProg - 0.35) / 0.4;
        const an = (curVelocity * curVelocity) / Math.max(1, loopRadius);
        // At bottom (t=0, t=1): an/g + 1; at apex (t=0.5): an/g - 1
        normalG = Math.max(0, (an + g * Math.cos(t * 2 * Math.PI)) / g);
      } else if (currentProg < 0.35) {
        normalG = 1 + (curVelocity / 20);
      }

      if (isPlaying) {
        // Advance progress based on real velocity
        const speedFactor = Math.max(0.1, (curVelocity / 35) * 0.28);
        currentProg += speedFactor * dt;
        if (currentProg > 1) {
          currentProg = 0;
        }
        progressRef.current = currentProg;
      }

      // Throttle telemetry state updates to ~15 Hz to keep UI smooth
      frameCountRef.current += 1;
      if (frameCountRef.current % 4 === 0) {
        setTelemetry({
          velocity: curVelocity,
          height: simHeight,
          gForce: normalG,
          ke: kinEnergy,
          pe: potEnergy,
          totalE: totEnergy,
          fellOff: fell
        });
      }

      // --- Draw Canvas Scene ---
      ctx.clearRect(0, 0, width, height);

      // 1. Grid background
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

      // Ground plane
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(0, groundY, width, height - groundY);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      // Track support trestles
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      for (let x = startX + 40; x < loopCenterX; x += 55) {
        const tDrop = (x - startX) / (loopCenterX - startX);
        const trestleTop = startY + Math.pow(tDrop, 1.8) * (groundY - startY);
        ctx.beginPath();
        ctx.moveTo(x, trestleTop);
        ctx.lineTo(x, groundY);
        ctx.stroke();
      }

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
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`CRITICAL DROP HEIGHT (2.5r = ${criticalHeight.toFixed(1)}m)`, startX, critY - 6);

      // Apex label
      const apexY = groundY - 2 * loopRadius * trackScale;
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`Apex (2r = ${(2 * loopRadius).toFixed(1)}m)`, loopCenterX - 35, apexY - 8);

      // --- Draw Track Curve ---
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();

      // 1. Drop curve to loop bottom (loopCenterX, groundY)
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(startX + 80, groundY, loopCenterX, groundY);

      // 2. Circular Loop (starts at bottom (loopCenterX, groundY), goes anticlockwise forward through circle)
      ctx.arc(loopCenterX, loopCenterY, loopR, Math.PI / 2, -1.5 * Math.PI, true);

      // 3. Exit flat to end
      ctx.lineTo(endX, groundY);
      ctx.stroke();

      // Rails highlight line
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(startX, startY - 2);
      ctx.quadraticCurveTo(startX + 80, groundY - 2, loopCenterX, groundY - 2);
      ctx.arc(loopCenterX, loopCenterY, loopR - 2, Math.PI / 2, -1.5 * Math.PI, true);
      ctx.lineTo(endX, groundY - 2);
      ctx.stroke();

      // --- Compute Car Position & Rotation smoothly along track ---
      let carX = startX;
      let carY = startY;
      let carAngle = 0;

      if (currentProg < 0.35) {
        const t = currentProg / 0.35;
        // Bezier points matching drop curve: P0 = (startX, startY), P1 = (startX + 80, groundY), P2 = (loopCenterX, groundY)
        const p0x = startX, p0y = startY;
        const p1x = startX + 80, p1y = groundY;
        const p2x = loopCenterX, p2y = groundY;

        carX = Math.pow(1 - t, 2) * p0x + 2 * (1 - t) * t * p1x + Math.pow(t, 2) * p2x;
        carY = Math.pow(1 - t, 2) * p0y + 2 * (1 - t) * t * p1y + Math.pow(t, 2) * p2y;

        // Tangent
        const dx = 2 * (1 - t) * (p1x - p0x) + 2 * t * (p2x - p1x);
        const dy = 2 * (1 - t) * (p1y - p0y) + 2 * t * (p2y - p1y);
        carAngle = Math.atan2(dy, dx);
      } else if (currentProg <= 0.75) {
        const t = (currentProg - 0.35) / 0.4;
        const theta = Math.PI / 2 - t * 2 * Math.PI;

        carX = loopCenterX + loopR * Math.cos(theta);
        carY = loopCenterY + loopR * Math.sin(theta);
        carAngle = Math.atan2(-Math.cos(theta), Math.sin(theta));
      } else {
        const t = (currentProg - 0.75) / 0.25;
        carX = loopCenterX + t * (endX - loopCenterX);
        carY = groundY;
        carAngle = 0;
      }

      // Draw Coaster Car
      ctx.save();
      ctx.translate(carX, carY);
      ctx.rotate(carAngle);

      // Car body
      ctx.fillStyle = fell ? '#ef4444' : '#0f766e';
      ctx.strokeStyle = '#042f2c';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-14, -10, 28, 14, 3);
      ctx.fill();
      ctx.stroke();

      // Front bumper
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(10, -8, 3, 10);

      // Wheels
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(-8, 4, 3.5, 0, Math.PI * 2);
      ctx.arc(8, 4, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Free Body Diagram Vectors
      if (showFBD) {
        ctx.restore();
        ctx.save();
        ctx.translate(carX, carY);

        // F_gravity (always downwards)
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 32);
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('Fg', 5, 26);

        // Normal force vector (points towards loop center when inside loop)
        if (currentProg >= 0.35 && currentProg <= 0.75) {
          const normLength = Math.max(0, normalG * 20);
          const nx = ((loopCenterX - carX) / loopR) * normLength;
          const ny = ((loopCenterY - carY) / loopR) * normLength;
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

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [activeTab, initialHeight, loopRadius, mass, hasFriction, isPlaying, showFBD]);

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
          <div className="p-6 md:p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              THE ROLLER COASTER PARADOX
            </div>

            <h2 className="text-2xl md:text-3xl font-bold font-display text-on-surface tracking-tight">
              Why don't passengers plunge to the ground at the top of a loop?
            </h2>

            <p className="text-sm font-semibold text-teal-800 italic bg-teal-50/50 p-3 rounded-xl border border-teal-100">
              "At the apex of a vertical loop-the-loop, you are completely upside down. Gravity is pulling you straight toward the Earth at 9.8 m/s². Yet, you remain firmly planted against your seat."
            </p>

            <div className="text-xs text-on-surface-variant space-y-3 font-sans leading-relaxed">
              <p>
                In 1895, the world's first vertical loop coaster, the <em>Flip Flap Railway</em> at Coney Island, was built with a circular loop. The circular loop created an astonishing and dangerous <strong>12 Gs of centrifugal acceleration</strong>, causing severe neck injuries among early riders.
              </p>
              <p>
                Modern roller coasters use the principle of <strong>Conservation of Mechanical Energy</strong> (E = K + U) combined with <strong>Centripetal Acceleration</strong> (a_c = v²/r). To avoid falling out without seat belts, the inward normal force N from the track must be greater than or equal to zero. This leads to a famous mathematical proof: the starting drop must be at least <strong>2.5 times the radius</strong> of the loop!
              </p>
            </div>

            {/* Formula Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20 text-center font-mono">
                <div className="text-[10px] text-on-surface-variant uppercase">Mechanical Energy</div>
                <div className="text-base font-bold text-on-surface">E = mgh + ½mv²</div>
              </div>
              <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20 text-center font-mono">
                <div className="text-[10px] text-on-surface-variant uppercase">Apex Min Velocity</div>
                <div className="text-base font-bold text-teal-700">v_top ≥ √(g·r)</div>
              </div>
              <div className="p-3 rounded-xl bg-surface-container border border-outline-variant/20 text-center font-mono">
                <div className="text-[10px] text-on-surface-variant uppercase">Critical Height</div>
                <div className="text-base font-bold text-amber-700">h_min = 2.5·r</div>
              </div>
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
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col">
              {/* Canvas Header */}
              <div className="px-4 py-2.5 bg-surface-container-low border-b border-outline-variant/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-on-surface">
                    60 FPS NUMERICAL RUNTIME // VERTICAL LOOP SIMULATOR
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFBD(!showFBD)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all border ${
                      showFBD 
                        ? 'bg-teal-50 text-teal-700 border-teal-300 font-bold' 
                        : 'bg-white text-on-surface-variant border-outline-variant/30'
                    }`}
                  >
                    Force Vectors (FBD)
                  </button>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 rounded-lg bg-surface-container hover:bg-teal-50 border border-outline-variant/30 text-on-surface"
                    title={isPlaying ? "Pause Simulation" : "Resume Simulation"}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={handleReset}
                    className="p-1.5 rounded-lg bg-surface-container hover:bg-teal-50 border border-outline-variant/30 text-on-surface"
                    title="Reset to Top"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* HTML5 Canvas */}
              <div className="relative w-full bg-surface-container-low">
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
              <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20">
                  <div className="text-[10px] text-on-surface-variant uppercase">Velocity</div>
                  <div className="text-base font-bold text-on-surface">
                    {telemetry.velocity.toFixed(1)} <span className="text-xs font-normal">m/s</span>
                  </div>
                  <div className="text-[10px] text-on-surface-variant">
                    {(telemetry.velocity * 3.6).toFixed(0)} km/h
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20">
                  <div className="text-[10px] text-on-surface-variant uppercase">Track Height</div>
                  <div className="text-base font-bold text-on-surface">
                    {telemetry.height.toFixed(1)} <span className="text-xs font-normal">m</span>
                  </div>
                  <div className="text-[10px] text-on-surface-variant">
                    Apex: {(2 * loopRadius).toFixed(1)} m
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20">
                  <div className="text-[10px] text-on-surface-variant uppercase">Normal G-Force</div>
                  <div className={`text-base font-bold ${
                    telemetry.gForce < 0 ? 'text-rose-600' : telemetry.gForce > 4 ? 'text-amber-600' : 'text-emerald-700'
                  }`}>
                    {telemetry.gForce.toFixed(2)} <span className="text-xs font-normal">G</span>
                  </div>
                  <div className="text-[10px] text-on-surface-variant">
                    N / (mg)
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20">
                  <div className="text-[10px] text-on-surface-variant uppercase">Condition at Top</div>
                  <div className={`text-xs font-bold mt-1 ${
                    initialHeight >= criticalHeight ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    {initialHeight >= criticalHeight ? 'SAFE TO LOOP' : 'WILL DETACH'}
                  </div>
                  <div className="text-[10px] text-on-surface-variant">
                    Req: {criticalHeight.toFixed(1)} m
                  </div>
                </div>
              </div>
            </div>

            {/* Energy Distribution Bar Chart */}
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-on-surface">
                <span>MECHANICAL ENERGY BREAKDOWN (JOULES)</span>
                <span className="text-on-surface-variant">Total: {(telemetry.totalE / 1000).toFixed(1)} kJ</span>
              </div>

              <div className="h-4 w-full bg-surface-container rounded-full overflow-hidden flex">
                <div 
                  className="bg-teal-600 transition-all duration-75"
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
                <div className="flex items-center gap-1.5 text-teal-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
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
            <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/30 shadow-sm space-y-5">
              <div className="border-b border-outline-variant/20 pb-3">
                <h3 className="text-sm font-bold font-mono text-on-surface uppercase tracking-wide">
                  Laboratory Control Deck
                </h3>
                <p className="text-xs text-on-surface-variant font-sans">
                  Adjust track geometry and physical parameters to test loop threshold.
                </p>
              </div>

              {/* Slider: Initial Drop Height */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-on-surface-variant font-bold">DROP HEIGHT (h₀):</span>
                  <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-bold border border-teal-200">
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
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-on-surface-variant">
                  <span>10m</span>
                  <span>Critical: {criticalHeight.toFixed(1)}m</span>
                  <span>50m</span>
                </div>
              </div>

              {/* Slider: Loop Radius */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-on-surface-variant font-bold">LOOP RADIUS (r):</span>
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
                <div className="flex justify-between text-[10px] font-mono text-on-surface-variant">
                  <span>5m (Tight)</span>
                  <span>18m (Broad)</span>
                </div>
              </div>

              {/* Slider: Coaster Mass */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-on-surface-variant font-bold">COASTER MASS (m):</span>
                  <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-bold border border-outline-variant/20">
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
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              {/* Toggle: Friction */}
              <div className="pt-2 border-t border-outline-variant/20">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-mono text-on-surface font-bold">
                    TRACK FRICTION & AIR RESISTANCE
                  </span>
                  <input
                    type="checkbox"
                    checked={hasFriction}
                    onChange={(e) => setHasFriction(e.target.checked)}
                    className="w-4 h-4 accent-teal-600 rounded"
                  />
                </label>
                <p className="text-[11px] text-on-surface-variant font-sans mt-1">
                  When enabled, non-conservative mechanical work converts into thermal energy along the track.
                </p>
              </div>

              {/* Quick Testing Presets */}
              <div className="pt-2 border-t border-outline-variant/20 space-y-2">
                <div className="text-[10px] font-mono text-on-surface-variant uppercase font-bold">
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
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-sans">
            <strong>Guided Physical Inquiry:</strong> Use your experimental findings from the 60 FPS sandbox to answer these conceptual challenges. Earn up to 60 laboratory score points!
          </div>

          {/* Question 1 */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm space-y-3">
            <div className="text-xs font-mono text-on-surface-variant font-bold uppercase">
              Challenge 1 of 3 // Analytical Derivation
            </div>
            <h3 className="text-sm font-bold font-sans text-on-surface">
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
                      : 'bg-surface-container hover:bg-teal-50 border-outline-variant/20 text-on-surface'
                  }`}
                >
                  {opt.text}
                </button>
              ))}
            </div>

            {challengeFeedback['q1'] === 'correct' && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-sans">
                ✓ <strong>Correct! (+20 pts)</strong> At the apex, N = 0 gives mg = mv²/r, so v² = gr. By conservation of energy, mgh = mg(2r) + ½mv² = 2mgr + ½mgr = 2.5mgr. Hence, h_min = 2.5r!
              </div>
            )}
          </div>

          {/* Question 2 */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm space-y-3">
            <div className="text-xs font-mono text-on-surface-variant font-bold uppercase">
              Challenge 2 of 3 // Inertial G-Forces
            </div>
            <h3 className="text-sm font-bold font-sans text-on-surface">
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
                      : 'bg-surface-container hover:bg-teal-50 border-outline-variant/20 text-on-surface'
                  }`}
                >
                  {opt.text}
                </button>
              ))}
            </div>

            {challengeFeedback['q2'] === 'correct' && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-sans">
                ✓ <strong>Correct! (+20 pts)</strong> At the bottom, N - mg = mv²/r, giving N = mg + mv²/r. Because velocity v is highest at the bottom, the normal force peaks at upwards of 5 to 6 Gs!
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: REAL-WORLD APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm space-y-4">
            <h2 className="text-xl font-bold font-display text-on-surface">
              Real-World Engineering: Why Modern Coasters Use Teardrop Loops
            </h2>
            <p className="text-xs text-on-surface-variant leading-relaxed font-sans">
              Notice in our sandbox how a pure circular loop creates punishing G-forces at the bottom to ensure safety at the top. To solve this, roller coaster legend Werner Stengel introduced the <strong>Clothoid Loop (Euler Spiral)</strong> in 1976 with <em>The New Revolution</em> at Six Flags Magic Mountain.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 space-y-1.5">
                <div className="text-xs font-bold font-mono text-on-surface">1. Clothoid Teardrop Curvature</div>
                <p className="text-xs text-on-surface-variant font-sans">
                  The radius of curvature varies continuously (r ∝ 1/L). At the bottom where speed is highest, the radius is large (r ≈ 25 m), capping G-force at a comfortable 3.5 Gs. At the apex where speed is low, the radius tightens (r ≈ 8 m), satisfying v²/r ≥ g.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 space-y-1.5">
                <div className="text-xs font-bold font-mono text-on-surface">2. Eddy Current Magnetic Brakes</div>
                <p className="text-xs text-on-surface-variant font-sans">
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
