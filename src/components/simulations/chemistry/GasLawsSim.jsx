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
  Thermometer
} from 'lucide-react';
import { sounds } from '../../../engine/audioEffects';

export const GasLawsSim = ({ simulation, activeTab, onUpdateScore }) => {
  // Gas state parameters
  const [temperatureK, setTemperatureK] = useState(300); // 150 K to 600 K
  const [volumeL, setVolumeL] = useState(5.0); // 2.0 L to 10.0 L
  const [particleCount, setParticleCount] = useState(40); // 15 to 80 molecules
  const [gasType, setGasType] = useState('helium'); // 'helium' (light), 'nitrogen' (medium), 'xenon' (heavy)
  const [isPlaying, setIsPlaying] = useState(true);

  // Challenge Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [challengeFeedback, setChallengeFeedback] = useState({});

  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  // Ideal Gas Law calculations: P = (n * R * T) / V
  // R = 0.08206 L·atm/(mol·K). We scale n for student clarity:
  const nMoles = particleCount * 0.05; // effective moles
  const R_CONST = 0.0821;
  const calculatedPressureAtm = Number(((nMoles * R_CONST * temperatureK) / volumeL).toFixed(2));
  const calculatedPressureKpa = Number((calculatedPressureAtm * 101.325).toFixed(1));

  // Average molecular kinetic energy: KE = 3/2 k_B T
  const molecularSpeedFactor = Math.sqrt(temperatureK / 300) * (gasType === 'helium' ? 1.4 : gasType === 'xenon' ? 0.7 : 1.0);

  // Initialize or re-spawn particles inside cylinder bounds
  const initParticles = (count, vol) => {
    // Chamber dimensions in canvas pixels
    const chamberLeft = 140;
    const chamberBottom = 310;
    const chamberWidth = 360;
    // Piston height depends on volume (2.0L = high piston y, 10.0L = low piston y)
    // Range: 2.0L => top y = 220; 10.0L => top y = 50
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
          // Normalize speed with temperature
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

        // Background
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, width, height);

        // Stand / Workbench
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(100, 315, 440, 20);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.strokeRect(100, 315, 440, 20);

        // Bunsen Flame or Ice bath underneath
        if (temperatureK > 350) {
          // Flame glow
          const flameIntensity = (temperatureK - 350) / 250;
          ctx.fillStyle = `rgba(249, 115, 22, ${0.4 + flameIntensity * 0.5})`;
          ctx.beginPath();
          ctx.ellipse(320, 328, 40 + flameIntensity * 20, 10, 0, 0, Math.PI * 2);
          ctx.fill();

          // Flames
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
          // Ice bath frosty mat
          ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
          ctx.fillRect(260, 322, 120, 14);
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1;
          ctx.strokeRect(260, 322, 120, 14);
          ctx.fillStyle = '#0284c7';
          ctx.font = '10px monospace';
          ctx.fillText('❄ CRYOGENIC BATH', 270, 333);
        }

        // Cylinder Glass Body
        ctx.fillStyle = 'rgba(241, 245, 249, 0.6)';
        ctx.fillRect(chamberLeft, 50, chamberRight - chamberLeft, 260);

        // Cylinder thick glass walls
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 6;
        ctx.beginPath();
        // Left wall
        ctx.moveTo(chamberLeft, 40);
        ctx.lineTo(chamberLeft, chamberBottom);
        // Base
        ctx.lineTo(chamberRight, chamberBottom);
        // Right wall
        ctx.lineTo(chamberRight, 40);
        ctx.stroke();

        // Volume calibration ruler marks on right wall
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

        // Draw Bouncing Gas Particles
        particlesRef.current.forEach(p => {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();

          // Particle velocity trail
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
          ctx.stroke();
        });

        // Movable Heavy Piston Lid
        ctx.fillStyle = '#334155';
        ctx.fillRect(chamberLeft + 3, pistonY - 14, (chamberRight - chamberLeft) - 6, 16);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.strokeRect(chamberLeft + 3, pistonY - 14, (chamberRight - chamberLeft) - 6, 16);

        // Piston Rod handle
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(315, 10, 10, Math.max(10, pistonY - 14));
        ctx.fillStyle = '#475569';
        ctx.fillRect(300, 10, 40, 10);

        // Analog Bourdon Pressure Gauge mounted on top right
        const gaugeX = 610;
        const gaugeY = 160;
        const gaugeRadius = 55;

        // Dial face
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(gaugeX, gaugeY, gaugeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Dial ticks
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        for (let a = 0; a <= 10; a++) {
          const angle = Math.PI * 0.75 + (a / 10) * (Math.PI * 1.5);
          const x1 = gaugeX + Math.cos(angle) * (gaugeRadius - 10);
          const y1 = gaugeY + Math.sin(angle) * (gaugeRadius - 10);
          const x2 = gaugeX + Math.cos(angle) * (gaugeRadius - 3);
          const y2 = gaugeY + Math.sin(angle) * (gaugeRadius - 3);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        // Dial needle pointing according to pressure (0 to 15 atm)
        const needleAngle = Math.PI * 0.75 + Math.min(calculatedPressureAtm / 15, 1.0) * (Math.PI * 1.5);
        ctx.strokeStyle = calculatedPressureAtm > 10 ? '#dc2626' : '#2563eb';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(gaugeX, gaugeY);
        ctx.lineTo(gaugeX + Math.cos(needleAngle) * (gaugeRadius - 14), gaugeY + Math.sin(needleAngle) * (gaugeRadius - 14));
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(gaugeX, gaugeY, 5, 0, Math.PI * 2);
        ctx.fill();

        // Gauge Text labels
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText('PRESSURE', gaugeX - 28, gaugeY + 28);
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = calculatedPressureAtm > 10 ? '#dc2626' : '#2563eb';
        ctx.fillText(`${calculatedPressureAtm} atm`, gaugeX - 25, gaugeY + 44);

        // Pipe connecting chamber to gauge
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(chamberRight, 160);
        ctx.lineTo(gaugeX - gaugeRadius, gaugeY);
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, temperatureK, volumeL, particleCount, gasType, calculatedPressureAtm, molecularSpeedFactor]);

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
              KINETIC MOLECULAR THEORY & THERMODYNAMICS
            </div>

            <h2 className="text-2xl md:text-3xl font-bold font-sans text-slate-900 tracking-tight">
              {simulation.name}
            </h2>

            <p className="text-sm font-semibold text-amber-800 italic">
              "{simulation.curiosityQuestion}"
            </p>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Gas pressure is the physical cumulative force per unit area exerted by trillions of microscopic molecules colliding elastically with the container walls. When gas is heated, molecules absorb thermal energy, increasing their root-mean-square speed (v_rms ∝ √T) and striking the walls more frequently and with greater momentum. Compressing the volume forces these molecules into closer quarters, dramatically escalating the frequency of impacts.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-mono text-slate-500 uppercase">Boyle's Law (P ∝ 1/V)</div>
                <div className="text-sm font-bold text-slate-800 mt-1">Pressure vs. Volume</div>
                <p className="text-[11px] text-slate-600 mt-1">Halving chamber volume doubles wall collision frequency, doubling pressure.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-mono text-slate-500 uppercase">Charles's Law (V ∝ T)</div>
                <div className="text-sm font-bold text-slate-800 mt-1">Volume vs. Temperature</div>
                <p className="text-[11px] text-slate-600 mt-1">Heating gas particles increases velocity; at constant pressure, the gas expands.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-mono text-slate-500 uppercase">Gay-Lussac's Law (P ∝ T)</div>
                <div className="text-sm font-bold text-slate-800 mt-1">Pressure vs. Temperature</div>
                <p className="text-[11px] text-slate-600 mt-1">In a rigid container, raising temperature linearly escalates internal pressure.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE SANDBOX */}
      {activeTab === 'sandbox' && (
        <div className="space-y-5 text-left">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-600 uppercase">Gas Species:</span>
              <button
                onClick={() => setGasType('helium')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                  gasType === 'helium' ? 'bg-sky-100 text-sky-900 border-sky-300' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Helium (He, 4 g/mol)
              </button>
              <button
                onClick={() => setGasType('nitrogen')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                  gasType === 'nitrogen' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Nitrogen (N₂, 28 g/mol)
              </button>
              <button
                onClick={() => setGasType('xenon')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                  gasType === 'xenon' ? 'bg-purple-100 text-purple-900 border-purple-300' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Xenon (Xe, 131 g/mol)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? 'Freeze Frame' : 'Resume'}
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>

          {/* Canvas Viewport */}
          <div className="relative rounded-2xl border border-slate-300 bg-white shadow-sm overflow-hidden">
            <canvas
              ref={canvasRef}
              width={760}
              height={360}
              className="w-full h-auto block"
            />

            {/* Overlaid Live Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2 pointer-events-none">
              <div className="px-2.5 py-1 rounded-md bg-white/90 backdrop-blur border border-slate-200 text-[11px] font-mono shadow-sm">
                <span className="text-slate-500">Pressure: </span>
                <span className="font-bold text-blue-700">{calculatedPressureAtm} atm ({calculatedPressureKpa} kPa)</span>
              </div>
              <div className="px-2.5 py-1 rounded-md bg-white/90 backdrop-blur border border-slate-200 text-[11px] font-mono shadow-sm">
                <span className="text-slate-500">Temperature: </span>
                <span className="font-bold text-slate-800">{temperatureK} K ({temperatureK - 273}°C)</span>
              </div>
              <div className="px-2.5 py-1 rounded-md bg-white/90 backdrop-blur border border-slate-200 text-[11px] font-mono shadow-sm">
                <span className="text-slate-500">Volume: </span>
                <span className="font-bold text-slate-800">{volumeL.toFixed(1)} L</span>
              </div>
            </div>
          </div>

          {/* Interactive Gas Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Control 1: Temperature */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" /> Temperature (T):
                </span>
                <span className="font-bold text-amber-700">{temperatureK} K</span>
              </div>
              <input
                type="range"
                min={150}
                max={600}
                step={10}
                value={temperatureK}
                onChange={(e) => setTemperatureK(Number(e.target.value))}
                className="w-full accent-amber-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>150 K (Cryo)</span>
                <span>300 K (Room)</span>
                <span>600 K (Hot)</span>
              </div>
            </div>

            {/* Control 2: Volume */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <Maximize2 className="w-3.5 h-3.5 text-blue-500" /> Piston Volume (V):
                </span>
                <span className="font-bold text-blue-700">{volumeL.toFixed(1)} L</span>
              </div>
              <input
                type="range"
                min={2.0}
                max={10.0}
                step={0.5}
                value={volumeL}
                onChange={(e) => setVolumeL(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>2.0 L (Compressed)</span>
                <span>5.0 L</span>
                <span>10.0 L (Expanded)</span>
              </div>
            </div>

            {/* Control 3: Moles / Particles */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-slate-700 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-500" /> Gas Quantity (n):
                </span>
                <span className="font-bold text-emerald-700">{nMoles.toFixed(2)} mol ({particleCount} part.)</span>
              </div>
              <input
                type="range"
                min={15}
                max={80}
                step={5}
                value={particleCount}
                onChange={(e) => setParticleCount(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>0.75 mol</span>
                <span>2.0 mol</span>
                <span>4.0 mol</span>
              </div>
            </div>
          </div>

          {/* Live Equation Verification Deck */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-xs font-mono font-bold text-slate-700 uppercase">
              Ideal Gas Law Solution (PV = nRT):
            </div>
            <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-800 space-y-1">
              <div>
                {"P = (n · R · T) / V = ("}
                <span className="text-emerald-700 font-bold">{nMoles.toFixed(2)} mol</span>
                {" · 0.0821 L·atm/(mol·K) · "}
                <span className="text-amber-700 font-bold">{temperatureK} K</span>
                {") / "}
                <span className="text-blue-700 font-bold">{volumeL.toFixed(1)} L</span>
              </div>
              <div className="text-sm font-bold text-blue-700 pt-1">
                {"P = "}{calculatedPressureAtm}{" atm = "}{calculatedPressureKpa}{" kPa"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                APPLIED THERMODYNAMICS & INDUSTRIAL CHEMISTRY
              </div>
              <h3 className="text-xl font-bold font-sans text-slate-900">
                Engineering Implementations of Gas Laws
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-mono font-bold text-amber-800 uppercase">
                  1. Pressure Cookers & Boiling Elevation
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  By sealing steam inside a rigid pot, Gay-Lussac's law drives internal pressure up to 2 atm (200 kPa). Under this elevated pressure, the boiling point of water rises from 100°C to 121°C, cooking meats and legumes up to 70% faster.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-mono font-bold text-blue-800 uppercase">
                  2. SCUBA Diving & Boyle's Law
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  For every 10 meters of ocean depth, hydrostatic pressure increases by 1 atm. A diver at 20 meters breathes air at 3 atm. If they ascend rapidly while holding their breath, the volume of gas in their lungs would triple (P1V1 = P2V2), causing severe pulmonary barotrauma.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-mono font-bold text-rose-800 uppercase">
                  3. Diesel Engine Auto-Ignition
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Unlike gasoline cars that require spark plugs, diesel engines compress intake air rapidly from 20:1. This adiabatic compression instantly spikes air temperature past 550°C, causing injected diesel droplets to spontaneously detonate on contact.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-mono font-bold text-purple-800 uppercase">
                  4. Hot Air Balloons & Charles's Law
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Propane burners heat air inside the nylon envelope. According to Charles's Law, heating gas causes it to expand, reducing its density (ρ = m/V). The surrounding cooler, denser atmosphere exerts an Archimedean buoyant force greater than the balloon's weight, allowing it to lift passengers aloft.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CHALLENGE QUIZ */}
      {activeTab === 'challenges' && (
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                GAS LAWS INQUIRY CHALLENGE
              </div>
              <h3 className="text-xl font-bold font-sans text-slate-900">
                Thermodynamic Reasoning Assessment
              </h3>
            </div>

            <div className="space-y-4">
              {/* Question 1 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-mono font-bold text-slate-800">
                  Q1: If a sealed 4.0 L gas cylinder at 2.0 atm is compressed at constant temperature until its volume is 1.0 L, what is the new pressure?
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {[
                    { text: 'A) 0.5 atm', correct: false },
                    { text: 'B) 4.0 atm', correct: false },
                    { text: 'C) 8.0 atm', correct: true },
                    { text: 'D) 16.0 atm', correct: false }
                  ].map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSubmit('q1', idx, opt.correct)}
                      className={`p-2.5 rounded-lg border text-left transition-colors ${
                        selectedAnswers['q1'] === idx
                          ? opt.correct
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                            : 'bg-rose-100 border-rose-300 text-rose-900'
                          : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
                {challengeFeedback['q1'] && (
                  <p className={`text-xs font-mono ${challengeFeedback['q1'] === 'correct' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {challengeFeedback['q1'] === 'correct' 
                      ? '✓ Correct! By Boyle\'s Law (P1V1 = P2V2), P2 = (2.0 atm · 4.0 L) / 1.0 L = 8.0 atm.' 
                      : '✗ Incorrect. Apply Boyle\'s Law: P1 · V1 = P2 · V2.'}
                  </p>
                )}
              </div>

              {/* Question 2 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-mono font-bold text-slate-800">
                  Q2: Microscopic kinetic theory dictates that absolute temperature (Kelvin) is directly proportional to what property of gas molecules?
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {[
                    { text: 'A) Average translational kinetic energy (½mv²)', correct: true },
                    { text: 'B) Total molecular volume', correct: false },
                    { text: 'C) Attractive van der Waals forces', correct: false },
                    { text: 'D) Average molar mass', correct: false }
                  ].map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSubmit('q2', idx, opt.correct)}
                      className={`p-2.5 rounded-lg border text-left transition-colors ${
                        selectedAnswers['q2'] === idx
                          ? opt.correct
                            ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                            : 'bg-rose-100 border-rose-300 text-rose-900'
                          : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
                {challengeFeedback['q2'] && (
                  <p className={`text-xs font-mono ${challengeFeedback['q2'] === 'correct' ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {challengeFeedback['q2'] === 'correct' 
                      ? '✓ Correct! Absolute temperature is directly proportional to the average translational kinetic energy of the molecules: KE_avg = (3/2)·k_B·T.' 
                      : '✗ Incorrect. Temperature is the direct macroscopic measure of average particle kinetic energy.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
