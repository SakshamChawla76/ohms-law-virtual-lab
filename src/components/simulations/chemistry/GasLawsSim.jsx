import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Gauge, 
  Flame, 
  Snowflake, 
  Maximize2, 
  ShieldCheck, 
  Layers,
  Thermometer,
  Sliders,
  Activity
} from 'lucide-react';
import { sounds } from '../../../engine/audioEffects';

export const GasLawsSim = ({ simulation = {}, activeTab = 'sandbox', onUpdateScore }) => {
  // Gas state parameters
  const [temperatureK, setTemperatureK] = useState(300); // 150 K to 600 K
  const [volumeL, setVolumeL] = useState(5.0); // 2.0 L to 10.0 L
  const [particleCount, setParticleCount] = useState(40); // 15 to 80 molecules
  const [gasType, setGasType] = useState('helium'); // 'helium', 'nitrogen', 'xenon'
  const [isPlaying, setIsPlaying] = useState(true);

  // Challenge Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [challengeFeedback, setChallengeFeedback] = useState({});

  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);
  const isDraggingPistonRef = useRef(false);

  // Ideal Gas Law calculations: P = (n * R * T) / V
  const nMoles = particleCount * 0.05;
  const R_CONST = 0.0821;
  const calculatedPressureAtm = Number(((nMoles * R_CONST * temperatureK) / volumeL).toFixed(2));
  const calculatedPressureKpa = Number((calculatedPressureAtm * 101.325).toFixed(1));

  // Molecular speed factor
  const molecularSpeedFactor = Math.sqrt(temperatureK / 300) * (gasType === 'helium' ? 1.4 : gasType === 'xenon' ? 0.7 : 1.0);

  // Initialize or re-spawn particles inside cylinder bounds
  const initParticles = (count, vol) => {
    const chamberLeft = 140;
    const chamberBottom = 310;
    const chamberWidth = 360;
    const pistonY = 310 - ((vol / 10.0) * 260);

    const newParticles = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (2 + Math.random() * 2) * molecularSpeedFactor;
      newParticles.push({
        x: chamberLeft + 15 + Math.random() * (chamberWidth - 30),
        y: pistonY + 15 + Math.random() * (chamberBottom - pistonY - 30),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: gasType === 'helium' ? 5 : gasType === 'xenon' ? 8 : 6,
        color: gasType === 'helium' ? '#38bdf8' : gasType === 'xenon' ? '#a855f7' : '#10b981'
      });
    }
    particlesRef.current = newParticles;
  };

  useEffect(() => {
    initParticles(particleCount, volumeL);
  }, [particleCount, volumeL, gasType]);

  const handleReset = () => {
    sounds.playSnap();
    setTemperatureK(300);
    setVolumeL(5.0);
    setParticleCount(40);
    setGasType('helium');
    initParticles(40, 5.0);
    setIsPlaying(true);
  };

  // 60 FPS Kinetic Molecular simulation loop
  useEffect(() => {
    if (activeTab !== 'sandbox') return;

    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.04);
      lastTime = currentTime;

      const chamberLeft = 140;
      const chamberRight = 500;
      const chamberBottom = 310;
      const pistonY = 310 - ((volumeL / 10.0) * 260);

      const speedMult = Math.sqrt(temperatureK / 300) * (gasType === 'helium' ? 1.4 : gasType === 'xenon' ? 0.7 : 1.0);

      if (isPlaying) {
        particlesRef.current.forEach(p => {
          const currentSpeed = Math.hypot(p.vx, p.vy);
          const targetSpeed = 3.5 * speedMult;
          if (currentSpeed > 0.01) {
            p.vx = (p.vx / currentSpeed) * targetSpeed;
            p.vy = (p.vy / currentSpeed) * targetSpeed;
          }

          p.x += p.vx * 60 * dt;
          p.y += p.vy * 60 * dt;

          // Wall collisions (elastic bounce)
          if (p.x - p.radius < chamberLeft) {
            p.x = chamberLeft + p.radius;
            p.vx = Math.abs(p.vx);
          } else if (p.x + p.radius > chamberRight) {
            p.x = chamberRight - p.radius;
            p.vx = -Math.abs(p.vx);
          }

          // Piston lid & cylinder base collisions
          if (p.y - p.radius < pistonY) {
            p.y = pistonY + p.radius;
            p.vy = Math.abs(p.vy);
          } else if (p.y + p.radius > chamberBottom) {
            p.y = chamberBottom - p.radius;
            p.vy = -Math.abs(p.vy);
          }
        });
      }

      // Render to Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, width, height);

        // Grid
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 30) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }

        // Stand / Workbench
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(100, 315, 440, 20);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.strokeRect(100, 315, 440, 20);

        // Bunsen Flame or Cryogenic bath underneath
        if (temperatureK > 350) {
          const flameIntensity = (temperatureK - 350) / 250;
          ctx.fillStyle = `rgba(249, 115, 22, ${0.4 + flameIntensity * 0.5})`;
          ctx.beginPath();
          ctx.ellipse(320, 328, 40 + flameIntensity * 20, 10, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.moveTo(290, 335);
          ctx.quadraticCurveTo(320, 305 - flameIntensity * 18, 350, 335);
          ctx.fill();

          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.moveTo(305, 335);
          ctx.quadraticCurveTo(320, 312 - flameIntensity * 12, 335, 335);
          ctx.fill();
        } else if (temperatureK < 250) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
          ctx.fillRect(260, 322, 120, 14);
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1;
          ctx.strokeRect(260, 322, 120, 14);
          ctx.fillStyle = '#0284c7';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('❄ CRYOGENIC BATH', 270, 333);
        }

        // Cylinder Glass Body
        ctx.fillStyle = 'rgba(241, 245, 249, 0.7)';
        ctx.fillRect(chamberLeft, 50, chamberRight - chamberLeft, 260);

        // Cylinder thick glass walls
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(chamberLeft, 40);
        ctx.lineTo(chamberLeft, chamberBottom);
        ctx.lineTo(chamberRight, chamberBottom);
        ctx.lineTo(chamberRight, 40);
        ctx.stroke();

        // Volume calibration marks on right wall
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#94a3b8';
        ctx.fillStyle = '#64748b';
        ctx.font = '9px monospace';
        for (let v = 2; v <= 10; v += 2) {
          const markY = 310 - ((v / 10.0) * 260);
          ctx.beginPath();
          ctx.moveTo(chamberRight, markY);
          ctx.lineTo(chamberRight + 12, markY);
          ctx.stroke();
          ctx.fillText(`${v}L`, chamberRight + 16, markY + 3);
        }

        // Draw Bouncing Gas Molecules
        particlesRef.current.forEach(p => {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          // Speed vector tail
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
          ctx.stroke();
        });

        // Movable Heavy Piston Lid (Draggable)
        ctx.fillStyle = '#334155';
        ctx.fillRect(chamberLeft + 3, pistonY - 14, (chamberRight - chamberLeft) - 6, 16);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.strokeRect(chamberLeft + 3, pistonY - 14, (chamberRight - chamberLeft) - 6, 16);

        // Piston Rod handle
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(315, 10, 10, Math.max(10, pistonY - 14));
        ctx.fillStyle = '#0284c7';
        ctx.roundRect(295, 8, 50, 14, 4);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('HANDLE', 320, 18);

        // Analog Bourdon Pressure Gauge mounted on top right
        const gaugeX = 620;
        const gaugeY = 160;
        const gaugeRadius = 55;

        // Dial face
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(gaugeX, gaugeY, gaugeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Brass bezel
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Graduations
        for (let a = -140; a <= 140; a += 28) {
          const rad = (a * Math.PI) / 180;
          const x1 = gaugeX + Math.sin(rad) * (gaugeRadius - 10);
          const y1 = gaugeY - Math.cos(rad) * (gaugeRadius - 10);
          const x2 = gaugeX + Math.sin(rad) * (gaugeRadius - 4);
          const y2 = gaugeY - Math.cos(rad) * (gaugeRadius - 4);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        // Needle
        const maxP = 6.0;
        const pRatio = Math.min(1.0, calculatedPressureAtm / maxP);
        const needleAngle = (-140 + pRatio * 280) * (Math.PI / 180);

        ctx.strokeStyle = calculatedPressureAtm > 4.5 ? '#ef4444' : '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(gaugeX, gaugeY);
        ctx.lineTo(gaugeX + Math.sin(needleAngle) * 42, gaugeY - Math.cos(needleAngle) * 42);
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(gaugeX, gaugeY, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${calculatedPressureAtm} atm`, gaugeX, gaugeY + 28);
        ctx.font = '9px monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText(`${calculatedPressureKpa} kPa`, gaugeX, gaugeY + 40);
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [activeTab, isPlaying, volumeL, temperatureK, gasType, calculatedPressureAtm, calculatedPressureKpa]);

  // Handle direct Canvas dragging of Piston Handle
  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleY = canvas.height / rect.height;
    const clickY = (e.clientY - rect.top) * scaleY;

    const pistonY = 310 - ((volumeL / 10.0) * 260);
    if (Math.abs(clickY - pistonY) < 30 || clickY < 40) {
      isDraggingPistonRef.current = true;
      sounds.playTick();
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDraggingPistonRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleY = canvas.height / rect.height;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Convert mouseY to volume L (2.0 to 10.0)
    const newVol = Math.max(2.0, Math.min(10.0, Number(((310 - mouseY) / 260 * 10).toFixed(1))));
    if (newVol !== volumeL) {
      setVolumeL(newVol);
      sounds.playTick();
    }
  };

  const handleCanvasMouseUp = () => {
    if (isDraggingPistonRef.current) {
      sounds.playSnap();
      isDraggingPistonRef.current = false;
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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              KINETIC MOLECULAR THEORY & THERMODYNAMICS
            </div>

            <h2 className="text-2xl md:text-3xl font-bold font-sans text-slate-900 tracking-tight">
              {simulation.name || "Gas Laws: PV = nRT & Molecular Kinetics"}
            </h2>

            <p className="text-sm font-semibold text-indigo-800 italic">
              "{simulation.curiosityQuestion || "What happens to gas pressure when you compress volume or heat molecules?"}"
            </p>

            <div className="text-xs text-slate-600 space-y-3 font-sans leading-relaxed">
              <p>
                Gas pressure is not an invisible static property. It is the cumulative microscopic impact force of billions of gas molecules violently colliding against container walls!
              </p>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center font-mono text-xs font-bold text-slate-800">
                P · V = n · R · T
              </div>
              <p>
                When you halve the container volume (Boyle's Law, P ∝ 1/V), molecules strike the walls twice as frequently, doubling the pressure. When you raise the temperature (Gay-Lussac's Law, P ∝ T), molecules move with higher root-mean-square kinetic energy, striking the walls with greater impulse!
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
                    KINETIC MOLECULAR CHAMBER // IDEAL GAS ENGINE
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={handleReset}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
                    title="Reset chamber"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Canvas with Direct Piston Dragging */}
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
                  Drag the piston handle on canvas to compress or expand gas
                </div>
              </div>

              {/* Telemetry Dashboard */}
              <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Pressure (P)</div>
                  <div className={`text-base font-bold ${calculatedPressureAtm > 4.5 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {calculatedPressureAtm} atm
                  </div>
                  <div className="text-[10px] text-slate-400">{calculatedPressureKpa} kPa</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Volume (V)</div>
                  <div className="text-base font-bold text-sky-700">{volumeL.toFixed(1)} L</div>
                  <div className="text-[10px] text-slate-400">Piston position</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Temperature (T)</div>
                  <div className="text-base font-bold text-amber-700">{temperatureK} K</div>
                  <div className="text-[10px] text-slate-400">{(temperatureK - 273.15).toFixed(0)} °C</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Mole Quantity (n)</div>
                  <div className="text-base font-bold text-indigo-700">{nMoles.toFixed(2)} mol</div>
                  <div className="text-[10px] text-slate-400">{particleCount} particles</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Controls (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-900 uppercase">
                  Thermodynamic Controls
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Regulate temperature, volume, and chemical species.
                </p>
              </div>

              {/* Slider: Volume */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-700 font-bold">VOLUME (V):</span>
                  <span className="font-bold text-sky-700">{volumeL.toFixed(1)} Liters</span>
                </div>
                <input
                  type="range"
                  min={2.0}
                  max={10.0}
                  step={0.5}
                  value={volumeL}
                  onChange={(e) => {
                    sounds.playTick();
                    setVolumeL(Number(e.target.value));
                  }}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              {/* Slider: Temperature */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-700 font-bold">TEMPERATURE (T):</span>
                  <span className="font-bold text-amber-700">{temperatureK} K</span>
                </div>
                <input
                  type="range"
                  min={150}
                  max={600}
                  step={10}
                  value={temperatureK}
                  onChange={(e) => {
                    sounds.playTick();
                    setTemperatureK(Number(e.target.value));
                  }}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>150K (Ice)</span>
                  <span className="text-amber-700 font-bold">300K (Room)</span>
                  <span>600K (Hot)</span>
                </div>
              </div>

              {/* Slider: Particle Count */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-700 font-bold">MOLECULE COUNT (n):</span>
                  <span className="font-bold text-indigo-700">{particleCount}</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={80}
                  step={5}
                  value={particleCount}
                  onChange={(e) => {
                    sounds.playTick();
                    setParticleCount(Number(e.target.value));
                  }}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              {/* Gas Species Selector */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="text-xs font-mono font-bold text-slate-700">GAS ELEMENT SPECIES:</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'helium', label: 'Helium (He)', desc: 'Light & Fast' },
                    { id: 'nitrogen', label: 'Nitrogen (N₂)', desc: 'Medium' },
                    { id: 'xenon', label: 'Xenon (Xe)', desc: 'Heavy & Slow' }
                  ].map(g => (
                    <button
                      key={g.id}
                      onClick={() => { sounds.playTick(); setGasType(g.id); }}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        gasType === g.id 
                          ? 'bg-slate-900 border-slate-950 text-white font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs">{g.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CHALLENGES */}
      {activeTab === 'challenges' && (
        <div className="max-w-3xl mx-auto space-y-5 text-left">
          <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-sans">
            <strong>Ideal Gas Inquiry:</strong> Test your understanding of Boyle's Law, Charles' Law, and the kinetic theory of gases. Earn up to 75 laboratory score points!
          </div>

          {/* Question 1 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase">
              Challenge 1 of 2 // Boyle's Law Proportionality
            </div>
            <h3 className="text-sm font-bold font-sans text-slate-900">
              If temperature and number of moles are kept strictly constant, what happens to the internal pressure P when you push the piston down to halve the volume from 10.0L to 5.0L?
            </h3>

            <div className="space-y-2">
              {[
                { text: "Pressure doubles (P₂ = 2 · P₁) due to inverse proportionality P ∝ 1/V", correct: true },
                { text: "Pressure is cut in half", correct: false },
                { text: "Pressure stays exactly the same", correct: false },
                { text: "Pressure drops to absolute zero", correct: false }
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
