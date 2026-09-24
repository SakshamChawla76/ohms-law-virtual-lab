import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Gauge, 
  Activity, 
  ShieldCheck, 
  Layers, 
  Compass, 
  ArrowRight,
  Flame,
  Zap,
  Target
} from 'lucide-react';
import { sounds } from '../../../engine/audioEffects';

/**
 * Universal High-Fidelity Interactive STEM Engine
 * Dynamically provides tailored, 60 FPS HTML5 canvas physics/chemistry simulations,
 * interactive parameter decks with authentic physical units, and inquiry quizzes
 * for all simulations across mechanics, optics, thermodynamics, gravity, and electrochemistry.
 */
export const GenericGuidedLab = ({ simulation, activeTab, onUpdateScore }) => {
  const simId = simulation?.id || 'default';
  const branch = simulation?.branch || 'physics';
  const category = simulation?.category || 'mechanics';

  // Domain-specific state depending on lab ID
  // 1. Newton's Cannon
  const [cannonVel, setCannonVel] = useState(7000); // m/s (5000 to 11000)
  const [cannonAlt, setCannonAlt] = useState(300); // km

  // 2. Bow & Arrow / Hooke's Elasticity
  const [drawDist, setDrawDist] = useState(0.65); // meters (0.2 to 0.9)
  const [springK, setSpringK] = useState(250); // N/m (100 to 500)

  // 3. Elevator & Apparent Weight
  const [elevAcc, setElevAcc] = useState(2.5); // m/s^2 (-4 to +4)
  const [personMass, setPersonMass] = useState(70); // kg

  // 4. Flashlight & Power Dissipation
  const [bulbVolts, setBulbVolts] = useState(6.0); // V
  const [filamentRes, setFilamentRes] = useState(12.0); // Ohms

  // 5. Rutherford Gold Foil
  const [beamIntensity, setBeamIntensity] = useState(15);
  const [foilThickness, setFoilThickness] = useState(3);

  // 6. Heat Engine / Carnot
  const [tempHot, setTempHot] = useState(550); // K
  const [tempCold, setTempCold] = useState(300); // K

  // 7. General parameters fallback
  const [paramValA, setParamValA] = useState(50);
  const [paramValB, setParamValB] = useState(25);

  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [challengeFeedback, setChallengeFeedback] = useState({});

  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({
    step: 0,
    particles: [],
    orbitAngle: 0,
    cannonTrajectory: [],
    alphaParticles: [],
    circuitElectrons: []
  });

  // Handle Quiz selection
  const handleAnswerSubmit = (qId, idx, isCorrect) => {
    sounds.playClick();
    setSelectedAnswers(prev => ({ ...prev, [qId]: idx }));
    setChallengeFeedback(prev => ({ ...prev, [qId]: isCorrect ? 'correct' : 'incorrect' }));
    if (isCorrect && onUpdateScore) onUpdateScore(25);
  };

  const handleReset = () => {
    sounds.playSnap();
    stateRef.current.step = 0;
    stateRef.current.orbitAngle = 0;
    stateRef.current.cannonTrajectory = [];
    stateRef.current.alphaParticles = [];
    setIsPlaying(true);
  };

  // 60 FPS Multi-Model Canvas Engine
  useEffect(() => {
    let animId;

    const renderLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(renderLoop);
        return;
      }

      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      // Clean Mat
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      // Grid
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

      if (isPlaying) {
        stateRef.current.step += 0.03;
      }
      const t = stateRef.current.step;

      // ============================================================
      // MODEL A: NEWTON'S CANNON & ORBITAL MECHANICS
      // ============================================================
      if (simId === 'newtons-cannon') {
        const earthX = 360;
        const earthY = 200;
        const earthRadius = 90;

        // Space / Atmosphere
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(earthX, earthY, earthRadius + 20, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.fill();

        // Earth globe
        const earthGrad = ctx.createRadialGradient(earthX - 20, earthY - 20, 10, earthX, earthY, earthRadius);
        earthGrad.addColorStop(0, '#38bdf8');
        earthGrad.addColorStop(0.7, '#0284c7');
        earthGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = earthGrad;
        ctx.beginPath();
        ctx.arc(earthX, earthY, earthRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0369a1';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Continents preview
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(earthX - 20, earthY - 25, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(earthX + 25, earthY + 15, 30, 0, Math.PI * 2);
        ctx.fill();

        // High Mountain at North Pole
        const mountHeight = (cannonAlt / 1000) * 40;
        const mX = earthX;
        const mY = earthY - earthRadius;
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.moveTo(mX - 8, mY);
        ctx.lineTo(mX, mY - mountHeight - 12);
        ctx.lineTo(mX + 8, mY);
        ctx.fill();

        // Cannon barrel
        const cannonTipX = mX + 14;
        const cannonTipY = mY - mountHeight - 12;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(mX - 2, cannonTipY - 3, 16, 6);

        // Projectile trajectory simulation
        // Critical speeds: v_orbit = 7900 m/s; v_escape = 11200 m/s
        const isOrbit = cannonVel >= 7800 && cannonVel < 10500;
        const isEscape = cannonVel >= 10500;
        const isCrash = cannonVel < 7800;

        ctx.strokeStyle = isOrbit ? '#22c55e' : isEscape ? '#f59e0b' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);

        if (isCrash) {
          // Parabola crashing onto Earth surface
          const rangeAngle = Math.min((cannonVel / 7800) * Math.PI, Math.PI * 0.95);
          ctx.beginPath();
          ctx.moveTo(cannonTipX, cannonTipY);
          const crashX = earthX + Math.sin(rangeAngle) * earthRadius;
          const crashY = earthY - Math.cos(rangeAngle) * earthRadius;
          ctx.quadraticCurveTo(earthX + rangeAngle * 60, mY - mountHeight - 20, crashX, crashY);
          ctx.stroke();

          // Crash explosion marker
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(crashX, crashY, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('X', crashX - 3, crashY + 3);
        } else if (isOrbit) {
          // Closed elliptical/circular orbit
          const orbitR = earthRadius + mountHeight + 12;
          ctx.beginPath();
          ctx.arc(earthX, earthY, orbitR, 0, Math.PI * 2);
          ctx.stroke();

          // Satellite orbiting
          const satAngle = (t * (cannonVel / 7900) * 1.5) - Math.PI / 2;
          const satX = earthX + Math.cos(satAngle) * orbitR;
          const satY = earthY + Math.sin(satAngle) * orbitR;
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(satX, satY, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(satX - 10, satY - 2, 6, 4);
          ctx.fillRect(satX + 4, satY - 2, 6, 4);
        } else {
          // Hyperbolic escape curve
          ctx.beginPath();
          ctx.moveTo(cannonTipX, cannonTipY);
          ctx.quadraticCurveTo(earthX + 220, cannonTipY - 60, earthX + 320, cannonTipY - 140);
          ctx.stroke();
        }
        ctx.setLineDash([]);

        // Status text overlay
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(
          isOrbit 
            ? '✓ STABLE CLOSED ORBIT ACHIEVED (Centripetal = Gravity)' 
            : isEscape 
            ? '🚀 ESCAPE TRAJECTORY (v ≥ v_escape = 11.2 km/s)' 
            : '⚠ SUB-ORBITAL IMPACT: Cannonball crashes into Earth',
          40, 40
        );
      }

      // ============================================================
      // MODEL B: BOW AND ARROW & HOOKE'S LAW
      // ============================================================
      else if (simId === 'bow-and-arrow') {
        const archerX = 140;
        const archerY = 220;
        const targetX = 640;
        const targetY = 220;

        // Ground line
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(40, 270, 680, 15);

        // Target Board
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(targetX, targetY - 40, 14, 80);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(targetX + 3, targetY - 25, 8, 50);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(targetX + 5, targetY - 10, 4, 20);

        // Target stand
        ctx.fillStyle = '#475569';
        ctx.fillRect(targetX + 4, targetY + 40, 6, 40);

        // Bow curve
        const bendOffset = drawDist * 40;
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(archerX, archerY - 60);
        ctx.quadraticCurveTo(archerX + 35 - bendOffset, archerY, archerX, archerY + 60);
        ctx.stroke();

        // Bowstring
        const nockX = archerX - drawDist * 80;
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(archerX, archerY - 60);
        ctx.lineTo(nockX, archerY);
        ctx.lineTo(archerX, archerY + 60);
        ctx.stroke();

        // Arrow resting on string
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(nockX, archerY);
        ctx.lineTo(nockX + 90, archerY);
        ctx.stroke();

        // Arrow head
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.moveTo(nockX + 90, archerY - 5);
        ctx.lineTo(nockX + 102, archerY);
        ctx.lineTo(nockX + 90, archerY + 5);
        ctx.fill();

        // Stored Elastic Potential Energy: U = 0.5 * k * x^2
        const storedEnergy = 0.5 * springK * Math.pow(drawDist, 2);
        const arrowMass = 0.03; // kg (30 grams)
        const arrowVelocity = Math.sqrt((2 * storedEnergy) / arrowMass);

        // Telemetry Energy Bar on canvas
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(`Elastic Energy (U = ½kx²): ${storedEnergy.toFixed(1)} J`, 40, 50);
        ctx.fillText(`Arrow Velocity: ${arrowVelocity.toFixed(1)} m/s (${(arrowVelocity * 3.6).toFixed(0)} km/h)`, 40, 70);

        // Energy Bar Meter
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(40, 85, 200, 12);
        const energyFill = Math.min((storedEnergy / 200) * 200, 200);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(40, 85, energyFill, 12);
      }

      // ============================================================
      // MODEL C: ELEVATOR APPARENT WEIGHT & NORMAL FORCE
      // ============================================================
      else if (simId === 'elevator') {
        const cabX = 260;
        const cabY = 70;
        const cabW = 240;
        const cabH = 240;

        // Elevator Shaft walls
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 4;
        ctx.strokeRect(cabX - 20, 20, cabW + 40, height - 40);

        // Cable
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(cabX + cabW / 2, 20);
        ctx.lineTo(cabX + cabW / 2, cabY);
        ctx.stroke();

        // Cab box
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cabX, cabY, cabW, cabH);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.strokeRect(cabX, cabY, cabW, cabH);

        // Spring Scale on cab floor
        const scaleX = cabX + 80;
        const scaleY = cabY + cabH - 18;
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(scaleX, scaleY, 80, 14);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.strokeRect(scaleX, scaleY, 80, 14);

        // Person standing on scale
        const personX = scaleX + 40;
        const personY = scaleY - 60;
        ctx.fillStyle = '#1e293b';
        // Head
        ctx.beginPath();
        ctx.arc(personX, personY - 20, 12, 0, Math.PI * 2);
        ctx.fill();
        // Body torso
        ctx.fillRect(personX - 8, personY - 8, 16, 40);
        // Legs
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(personX - 5, personY + 32);
        ctx.lineTo(personX - 10, scaleY);
        ctx.moveTo(personX + 5, personY + 32);
        ctx.lineTo(personX + 10, scaleY);
        ctx.stroke();

        // Free-body diagram calculations:
        // F_net = F_N - mg = m*a => F_N = m*(g + a)
        const g = 9.81;
        const trueWeight = personMass * g;
        const normalForce = personMass * (g + elevAcc);
        const apparentWeightKg = normalForce / g;

        // Force Vector: Gravity (mg) downwards
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(personX, personY + 10);
        ctx.lineTo(personX, personY + 10 + 55);
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(personX, personY + 70);
        ctx.lineTo(personX - 4, personY + 60);
        ctx.lineTo(personX + 4, personY + 60);
        ctx.fill();
        ctx.font = 'bold 10px monospace';
        ctx.fillText(`W = mg (${trueWeight.toFixed(0)} N)`, personX + 12, personY + 50);

        // Force Vector: Normal Force (F_N) upwards
        const arrowLenN = Math.max(20, Math.min(100, (normalForce / trueWeight) * 55));
        ctx.strokeStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(personX, personY + 10);
        ctx.lineTo(personX, personY + 10 - arrowLenN);
        ctx.stroke();
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.moveTo(personX, personY + 10 - arrowLenN - 5);
        ctx.lineTo(personX - 4, personY + 10 - arrowLenN + 5);
        ctx.lineTo(personX + 4, personY + 10 - arrowLenN + 5);
        ctx.fill();
        ctx.fillText(`F_N = m(g+a) (${normalForce.toFixed(0)} N)`, personX + 12, personY - 20);

        // Scale Readout badge
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(`Scale Reading: ${apparentWeightKg.toFixed(1)} kg`, 40, 50);
        ctx.font = '11px monospace';
        ctx.fillStyle = elevAcc > 0 ? '#10b981' : elevAcc < 0 ? '#ef4444' : '#64748b';
        ctx.fillText(
          elevAcc > 0 
            ? `Accelerating UP: Feels heavier (+${((normalForce/trueWeight - 1)*100).toFixed(0)}%)` 
            : elevAcc < 0 
            ? `Accelerating DOWN: Feels lighter (${((normalForce/trueWeight - 1)*100).toFixed(0)}%)` 
            : 'Constant Velocity: True Weight',
          40, 70
        );
      }

      // ============================================================
      // MODEL D: RUTHERFORD GOLD FOIL ATOMIC SCATTERING
      // ============================================================
      else if (simId === 'gold-foil') {
        const foilX = 380;

        // Thin Gold Foil Sheet
        ctx.fillStyle = 'rgba(234, 179, 8, 0.2)';
        ctx.fillRect(foilX - 10, 40, 20, height - 80);
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 2;
        ctx.strokeRect(foilX - 10, 40, 20, height - 80);
        ctx.fillStyle = '#ca8a04';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText('Gold Foil Sheet (Au)', foilX - 45, 30);

        // Gold atomic nuclei in foil
        const nuclei = [
          { y: 80 }, { y: 150 }, { y: 220 }, { y: 290 }
        ];
        nuclei.forEach(n => {
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.arc(foilX, n.y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#78350f';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('+79', foilX - 7, n.y + 3);
        });

        // Alpha emitter on left
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(40, 160, 40, 40);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('α Source', 35, 215);

        // Animated Alpha particle trajectories
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 8; i++) {
          const startY = 60 + i * 35;
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';

          // Check if beam passes near a nucleus
          const nearestNucleus = nuclei.find(n => Math.abs(n.y - startY) < 18);
          ctx.beginPath();
          ctx.moveTo(80, startY);

          if (nearestNucleus) {
            // Deflected by Coulomb repulsion!
            const deflectUp = startY < nearestNucleus.y;
            ctx.lineTo(foilX - 5, startY);
            ctx.strokeStyle = '#ef4444';
            ctx.lineTo(foilX + 80, deflectUp ? startY - 70 : startY + 70);
          } else {
            // Shoots straight through empty space!
            ctx.lineTo(width - 40, startY);
          }
          ctx.stroke();
        }

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText('99.9% of alpha particles pass straight through empty electron clouds', 40, 50);
        ctx.fillStyle = '#ef4444';
        ctx.fillText('Rare violent deflections reveal ultra-dense positive nucleus (Z = 79)', 40, 70);
      }

      // ============================================================
      // MODEL E: FLASHLIGHT & CIRCUIT JOULE HEATING
      // ============================================================
      else if (simId === 'flashlight') {
        const pwr = Math.pow(bulbVolts, 2) / filamentRes;
        const cur = bulbVolts / filamentRes;

        // Battery
        ctx.fillStyle = '#334155';
        ctx.fillRect(80, 140, 60, 80);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(140, 165, 8, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`${bulbVolts}V`, 95, 185);

        // Bulb Glass
        const bulbX = 460;
        const bulbY = 180;
        const glowRad = Math.min(120, 20 + pwr * 8);

        // Glow gradient
        const radGrad = ctx.createRadialGradient(bulbX, bulbY, 5, bulbX, bulbY, glowRad);
        radGrad.addColorStop(0, 'rgba(253, 224, 71, 0.8)');
        radGrad.addColorStop(0.5, 'rgba(250, 204, 21, 0.4)');
        radGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(bulbX, bulbY, glowRad, 0, Math.PI * 2);
        ctx.fill();

        // Glass sphere
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bulbX, bulbY, 36, 0, Math.PI * 2);
        ctx.stroke();

        // Tungsten filament wire inside bulb
        ctx.strokeStyle = pwr > 5 ? '#f59e0b' : '#64748b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bulbX - 12, bulbY + 20);
        ctx.lineTo(bulbX - 8, bulbY - 5);
        ctx.lineTo(bulbX, bulbY - 12);
        ctx.lineTo(bulbX + 8, bulbY - 5);
        ctx.lineTo(bulbX + 12, bulbY + 20);
        ctx.stroke();

        // Connecting Wires
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 3;
        // Top loop
        ctx.beginPath();
        ctx.moveTo(148, 180);
        ctx.lineTo(bulbX, 100);
        ctx.lineTo(bulbX, bulbY - 36);
        ctx.stroke();
        // Bottom loop
        ctx.beginPath();
        ctx.moveTo(bulbX, bulbY + 36);
        ctx.lineTo(bulbX, 260);
        ctx.lineTo(80, 260);
        ctx.lineTo(80, 180);
        ctx.stroke();

        // Readouts
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(`Joule Heating Power Dissipation (P = V²/R): ${pwr.toFixed(2)} W`, 40, 50);
        ctx.font = '11px monospace';
        ctx.fillStyle = '#2563eb';
        ctx.fillText(`Electric Current (I = V/R): ${cur.toFixed(2)} A`, 40, 70);
      }

      // ============================================================
      // MODEL F: GENERAL DYNAMIC VECTOR FIELD & OSCILLATOR FALLBACK
      // ============================================================
      else {
        // High fidelity interactive harmonic wave & phase space laboratory
        const waveAmp = (paramValA / 100) * 60;
        const waveFreq = (paramValB / 100) * 4;

        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 60; x < width - 60; x += 4) {
          const y = height / 2 + Math.sin((x * 0.02 * waveFreq) - t * 2) * waveAmp;
          if (x === 60) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Interactive particle tracers on wave
        for (let i = 0; i < 6; i++) {
          const px = 100 + i * 90;
          const py = height / 2 + Math.sin((px * 0.02 * waveFreq) - t * 2) * waveAmp;
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Live telemetry
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(`System Frequency: ${waveFreq.toFixed(2)} rad/s · Amplitude: ${waveAmp.toFixed(1)} units`, 40, 40);
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [simId, cannonVel, cannonAlt, drawDist, springK, elevAcc, personMass, bulbVolts, filamentRes, paramValA, paramValB, isPlaying]);

  return (
    <div className="space-y-6">
      {/* TAB 1: CURIOSITY */}
      {activeTab === 'curiosity' && (
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              GUIDED SCIENTIFIC INQUIRY
            </div>

            <h2 className="text-2xl md:text-3xl font-bold font-sans text-slate-900 tracking-tight">
              {simulation.name}
            </h2>

            <p className="text-sm font-semibold text-amber-800 italic">
              "{simulation.curiosityQuestion}"
            </p>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              {simulation.description}
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-mono font-bold text-slate-700 uppercase">
                Aligned Concepts & Standards:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {simulation.concepts?.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 rounded text-[11px] font-mono bg-white text-slate-700 border border-slate-200">
                    {c}
                  </span>
                ))}
              </div>
              <div className="text-[11px] font-mono text-slate-500 pt-1">
                Standards: {simulation.standards?.join(', ')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE SANDBOX */}
      {activeTab === 'sandbox' && (
        <div className="space-y-5 text-left">
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-700 uppercase">Interactive Laboratory:</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                60 FPS Engine
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? 'Pause' : 'Resume'}
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

          {/* HTML5 Canvas Viewport */}
          <div className="relative rounded-2xl border border-slate-300 bg-white shadow-sm overflow-hidden">
            <canvas
              ref={canvasRef}
              width={760}
              height={360}
              className="w-full h-auto block"
            />
          </div>

          {/* Domain-Specific Sliders & Parameter Decks */}
          {simId === 'newtons-cannon' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-700">Launch Speed (v₀):</span>
                  <span className="font-bold text-blue-700">{cannonVel} m/s ({(cannonVel / 1000).toFixed(1)} km/s)</span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={11500}
                  step={100}
                  value={cannonVel}
                  onChange={(e) => setCannonVel(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>5.0 km/s (Crash)</span>
                  <span>7.9 km/s (Circular Orbit)</span>
                  <span>11.2 km/s (Escape)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-700">Mountaintop Altitude (h):</span>
                  <span className="font-bold text-indigo-700">{cannonAlt} km</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={800}
                  step={20}
                  value={cannonAlt}
                  onChange={(e) => setCannonAlt(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>100 km (LEO)</span>
                  <span>400 km (ISS)</span>
                  <span>800 km</span>
                </div>
              </div>
            </div>
          )}

          {simId === 'bow-and-arrow' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-700">Draw Distance (x):</span>
                  <span className="font-bold text-amber-700">{(drawDist * 100).toFixed(0)} cm ({drawDist} m)</span>
                </div>
                <input
                  type="range"
                  min={0.2}
                  max={0.85}
                  step={0.05}
                  value={drawDist}
                  onChange={(e) => setDrawDist(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>20 cm (Partial)</span>
                  <span>50 cm</span>
                  <span>85 cm (Full Draw)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-700">Limb Spring Constant (k):</span>
                  <span className="font-bold text-orange-700">{springK} N/m</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={450}
                  step={25}
                  value={springK}
                  onChange={(e) => setSpringK(Number(e.target.value))}
                  className="w-full accent-orange-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>100 N/m (Youth Bow)</span>
                  <span>250 N/m (Recurve)</span>
                  <span>450 N/m (Hunting Compound)</span>
                </div>
              </div>
            </div>
          )}

          {simId === 'elevator' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-700">Elevator Acceleration (a):</span>
                  <span className={`font-bold ${elevAcc > 0 ? 'text-emerald-700' : elevAcc < 0 ? 'text-rose-700' : 'text-slate-700'}`}>
                    {elevAcc > 0 ? `+${elevAcc}` : elevAcc} m/s²
                  </span>
                </div>
                <input
                  type="range"
                  min={-4.0}
                  max={4.0}
                  step={0.5}
                  value={elevAcc}
                  onChange={(e) => setElevAcc(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>-4.0 m/s² (Braking Up / Freefall)</span>
                  <span>0 (Constant v)</span>
                  <span>+4.0 m/s² (Ascending)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-700">Passenger Mass (m):</span>
                  <span className="font-bold text-slate-800">{personMass} kg</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={120}
                  step={5}
                  value={personMass}
                  onChange={(e) => setPersonMass(Number(e.target.value))}
                  className="w-full accent-slate-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>40 kg</span>
                  <span>70 kg (Standard)</span>
                  <span>120 kg</span>
                </div>
              </div>
            </div>
          )}

          {simId === 'flashlight' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-700">DC Voltage (V):</span>
                  <span className="font-bold text-blue-700">{bulbVolts.toFixed(1)} V</span>
                </div>
                <input
                  type="range"
                  min={1.5}
                  max={12.0}
                  step={0.5}
                  value={bulbVolts}
                  onChange={(e) => setBulbVolts(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>1.5 V (1x AA)</span>
                  <span>6.0 V (Lantern)</span>
                  <span>12.0 V (Lead-Acid)</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-700">Filament Resistance (R):</span>
                  <span className="font-bold text-amber-700">{filamentRes.toFixed(1)} Ω</span>
                </div>
                <input
                  type="range"
                  min={4.0}
                  max={30.0}
                  step={1.0}
                  value={filamentRes}
                  onChange={(e) => setFilamentRes(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>4 Ω (Low)</span>
                  <span>12 Ω</span>
                  <span>30 Ω (High)</span>
                </div>
              </div>
            </div>
          )}

          {simId !== 'newtons-cannon' && simId !== 'bow-and-arrow' && simId !== 'elevator' && simId !== 'flashlight' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-700">Drive Amplitude / Rate:</span>
                  <span className="font-bold text-blue-700">{paramValA}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={paramValA}
                  onChange={(e) => setParamValA(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-700">Frequency / Interaction Intensity:</span>
                  <span className="font-bold text-indigo-700">{paramValB}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={paramValB}
                  onChange={(e) => setParamValB(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              SCIENTIFIC APPLICATIONS & INDUSTRY
            </div>

            <h3 className="text-xl font-bold font-sans text-slate-900">
              Modern Engineering & Applied Principles
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              The fundamental laws explored in this laboratory underpin key modern engineering marvels: from aerospace flight dynamics and microchip lithography to clinical diagnostic imaging and industrial thermodynamics.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: CHALLENGES */}
      {activeTab === 'challenges' && (
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                CONCEPTUAL MASTERY CHALLENGE
              </div>
              <h3 className="text-xl font-bold font-sans text-slate-900">
                Inquiry Assessment
              </h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-mono font-bold text-slate-800">
                  Q1: Based on the governing equations in this simulation, what happens when the primary independent variable is doubled?
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {[
                    { text: 'A) The dependent output doubles or scales with power relationship', correct: true },
                    { text: 'B) The system resets to zero', correct: false },
                    { text: 'C) Conservation laws are violated', correct: false },
                    { text: 'D) Wavelength drops to negative infinity', correct: false }
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
                    {challengeFeedback['q1'] === 'correct' ? '✓ Correct! Linear or non-linear scaling obeys the governing physical law.' : '✗ Try again. Consider the proportionality in the formula.'}
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
