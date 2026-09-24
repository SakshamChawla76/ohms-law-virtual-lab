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
  Target,
  Thermometer,
  Eye,
  Beaker,
  Scale,
  BatteryCharging
} from 'lucide-react';
import { sounds } from '../../../engine/audioEffects';

/**
 * Universal High-Fidelity Interactive STEM Engine
 * Tailored, 60 FPS HTML5 canvas physics & chemistry simulations with real physical units,
 * domain-specific interactive sliders, and inquiry quizzes for every lab in the curriculum.
 */
export const GenericGuidedLab = ({ simulation, activeTab, onUpdateScore }) => {
  const simId = simulation?.id || 'default';
  const branch = simulation?.branch || 'physics';
  const category = simulation?.category || 'mechanics';

  // --- Specific Simulation States ---
  // 1. Newton's Cannon
  const [cannonVel, setCannonVel] = useState(7000); // m/s
  const [cannonAlt, setCannonAlt] = useState(300); // km

  // 2. Bow & Arrow / Hooke's Law
  const [drawDist, setDrawDist] = useState(0.65); // m
  const [springK, setSpringK] = useState(250); // N/m

  // 3. Elevator & Apparent Weight
  const [elevAcc, setElevAcc] = useState(2.5); // m/s^2
  const [personMass, setPersonMass] = useState(70); // kg

  // 4. Flashlight & Power Dissipation
  const [bulbVolts, setBulbVolts] = useState(6.0); // V
  const [filamentRes, setFilamentRes] = useState(12.0); // Ohms

  // 5. Rutherford Gold Foil
  const [beamIntensity, setBeamIntensity] = useState(15);
  const [foilThickness, setFoilThickness] = useState(3);

  // 6. Prom Night: Flat Mirror Reflections
  const [personHeightCm, setPersonHeightCm] = useState(170); // cm
  const [mirrorHeightCm, setMirrorHeightCm] = useState(85); // cm
  const [mirrorOffsetY, setMirrorOffsetY] = useState(80); // cm from floor
  const [personDistM, setPersonDistM] = useState(2.0); // m

  // 7. Walk The Tightrope: Rotational Inertia
  const [poleLengthM, setPoleLengthM] = useState(5.0); // m
  const [poleEndMassKg, setPoleEndMassKg] = useState(6.0); // kg
  const [walkerTiltDeg, setWalkerTiltDeg] = useState(0); // degrees

  // 8. Heat Engine & Carnot Cycle
  const [tempHot, setTempHot] = useState(600); // K
  const [tempCold, setTempCold] = useState(300); // K
  const [engineRpm, setEngineRpm] = useState(60); // RPM

  // 9. Hot Pack Cold Pack: Enthalpy of Solution
  const [saltType, setSaltType] = useState('cacl2'); // 'cacl2' (hot) or 'nh4no3' (cold)
  const [dissolvedSaltGrams, setDissolvedSaltGrams] = useState(30); // g

  // 10. Galvanic Battery: Redox Electrochemistry
  const [batteryLoad, setBatteryLoad] = useState('bulb'); // 'bulb' or 'voltmeter'
  const [electrolyteConc, setElectrolyteConc] = useState(1.0); // Molar

  // 11. Balancing Chemical Equations
  const [equationPreset, setEquationPreset] = useState('water'); // 'water', 'combustion', 'ammonia'
  const [c1, setC1] = useState(1);
  const [c2, setC2] = useState(1);
  const [c3, setC3] = useState(1);
  const [c4, setC4] = useState(1);

  // 12. Rock Candy: Temperature & Solubility
  const [solutionTempC, setSolutionTempC] = useState(80); // °C
  const [sugarAddedGrams, setSugarAddedGrams] = useState(350); // g / 100 mL

  // 13. Flat vs. Fizzy Soda: Le Chatelier's Principle
  const [isBottleSealed, setIsBottleSealed] = useState(true);
  const [sodaPressureAtm, setSodaPressureAtm] = useState(3.0); // atm
  const [sodaTempC, setSodaTempC] = useState(6); // °C

  // General fallback
  const [paramValA, setParamValA] = useState(50);
  const [paramValB, setParamValB] = useState(25);

  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [challengeFeedback, setChallengeFeedback] = useState({});

  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({
    step: 0,
    flywheelAngle: 0,
    tightropeAngle: 0,
    bubbles: [],
    crystals: [],
    redoxElectrons: []
  });

  const handleAnswerSubmit = (qId, idx, isCorrect) => {
    sounds.playClick();
    setSelectedAnswers(prev => ({ ...prev, [qId]: idx }));
    setChallengeFeedback(prev => ({ ...prev, [qId]: isCorrect ? 'correct' : 'incorrect' }));
    if (isCorrect && onUpdateScore) onUpdateScore(25);
  };

  const handleReset = () => {
    sounds.playSnap();
    stateRef.current.step = 0;
    stateRef.current.flywheelAngle = 0;
    stateRef.current.tightropeAngle = 0;
    stateRef.current.bubbles = [];
    stateRef.current.crystals = [];
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

      // Clean Slate Laboratory Mat
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, width, height);

      // Subtle Grid
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
      // 1. NEWTON'S CANNON & ORBITAL MECHANICS
      // ============================================================
      if (simId === 'newtons-cannon') {
        const earthX = 360;
        const earthY = 200;
        const earthRadius = 90;

        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.beginPath();
        ctx.arc(earthX, earthY, earthRadius + 22, 0, Math.PI * 2);
        ctx.fill();

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

        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(earthX - 20, earthY - 25, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(earthX + 25, earthY + 15, 30, 0, Math.PI * 2);
        ctx.fill();

        const mountHeight = (cannonAlt / 1000) * 40;
        const mX = earthX;
        const mY = earthY - earthRadius;
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.moveTo(mX - 8, mY);
        ctx.lineTo(mX, mY - mountHeight - 12);
        ctx.lineTo(mX + 8, mY);
        ctx.fill();

        const cannonTipX = mX + 14;
        const cannonTipY = mY - mountHeight - 12;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(mX - 2, cannonTipY - 3, 16, 6);

        const isOrbit = cannonVel >= 7800 && cannonVel < 10500;
        const isEscape = cannonVel >= 10500;
        const isCrash = cannonVel < 7800;

        ctx.strokeStyle = isOrbit ? '#22c55e' : isEscape ? '#f59e0b' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);

        if (isCrash) {
          const rangeAngle = Math.min((cannonVel / 7800) * Math.PI, Math.PI * 0.95);
          ctx.beginPath();
          ctx.moveTo(cannonTipX, cannonTipY);
          const crashX = earthX + Math.sin(rangeAngle) * earthRadius;
          const crashY = earthY - Math.cos(rangeAngle) * earthRadius;
          ctx.quadraticCurveTo(earthX + rangeAngle * 60, mY - mountHeight - 20, crashX, crashY);
          ctx.stroke();

          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(crashX, crashY, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('X', crashX - 3, crashY + 3);
        } else if (isOrbit) {
          const orbitR = earthRadius + mountHeight + 12;
          ctx.beginPath();
          ctx.arc(earthX, earthY, orbitR, 0, Math.PI * 2);
          ctx.stroke();

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
          ctx.beginPath();
          ctx.moveTo(cannonTipX, cannonTipY);
          ctx.quadraticCurveTo(earthX + 220, cannonTipY - 60, earthX + 320, cannonTipY - 140);
          ctx.stroke();
        }
        ctx.setLineDash([]);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(
          isOrbit 
            ? '✓ STABLE CLOSED ORBIT ACHIEVED (Centripetal Acceleration = Gravity)' 
            : isEscape 
            ? '🚀 ESCAPE TRAJECTORY (v ≥ v_escape = 11.2 km/s)' 
            : '⚠ SUB-ORBITAL IMPACT: Cannonball crashes into Earth',
          40, 40
        );
      }

      // ============================================================
      // 2. PROM NIGHT: FLAT MIRROR REFLECTIONS (RAY OPTICS)
      // ============================================================
      else if (simId === 'prom-night') {
        const floorY = 300;
        const wallX = 540;
        const scale = 1.1; // px per cm
        const personX = wallX - (personDistM * 90);
        const personH = personHeightCm * scale;
        const personTopY = floorY - personH;
        const eyeY = personTopY + 12 * scale; // Eye ~12cm below head top

        // Floor and Wall
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(40, floorY, 680, 10);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(wallX + 15, 30, 15, floorY - 30);

        // Person Standing
        ctx.fillStyle = '#1e293b';
        // Head
        ctx.beginPath();
        ctx.arc(personX, personTopY + 14, 14, 0, Math.PI * 2);
        ctx.fill();
        // Eye marker
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(personX + 10, eyeY, 3, 0, Math.PI * 2);
        ctx.fill();
        // Torso
        ctx.fillStyle = '#334155';
        ctx.fillRect(personX - 10, personTopY + 28, 20, personH * 0.45);
        // Legs
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(personX - 5, personTopY + 28 + personH * 0.45);
        ctx.lineTo(personX - 6, floorY);
        ctx.moveTo(personX + 5, personTopY + 28 + personH * 0.45);
        ctx.lineTo(personX + 6, floorY);
        ctx.stroke();

        // Flat Mirror on Wall
        const mirrorH = mirrorHeightCm * scale;
        const mirrorTopY = floorY - (mirrorOffsetY * scale) - mirrorH;
        const mirrorBottomY = mirrorTopY + mirrorH;

        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(wallX, mirrorTopY, 6, mirrorH);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.strokeRect(wallX, mirrorTopY, 6, mirrorH);

        // Virtual Image behind mirror (symmetric across wallX)
        const imgX = wallX + (wallX - personX);
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(imgX, personTopY + 14, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(imgX - 10, personTopY + 28, 20, personH * 0.45);
        ctx.strokeStyle = '#64748b';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(imgX - 5, personTopY + 28 + personH * 0.45);
        ctx.lineTo(imgX - 6, floorY);
        ctx.moveTo(imgX + 5, personTopY + 28 + personH * 0.45);
        ctx.lineTo(imgX + 6, floorY);
        ctx.stroke();
        ctx.restore();

        // Ray Tracing: Eye to top of head reflected
        const headReflectY = (personTopY + eyeY) / 2;
        const feetReflectY = (floorY + eyeY) / 2;
        const headRayHitsMirror = headReflectY >= mirrorTopY && headReflectY <= mirrorBottomY;
        const feetRayHitsMirror = feetReflectY >= mirrorTopY && feetReflectY <= mirrorBottomY;
        const isFullBodySeen = headRayHitsMirror && feetRayHitsMirror;

        // Draw Ray 1: Top of Head to Mirror to Eye
        ctx.strokeStyle = headRayHitsMirror ? '#10b981' : '#f87171';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(personX, personTopY);
        ctx.lineTo(wallX, headReflectY);
        ctx.lineTo(personX + 10, eyeY);
        ctx.stroke();

        // Draw Ray 2: Feet to Mirror to Eye
        ctx.strokeStyle = feetRayHitsMirror ? '#10b981' : '#f87171';
        ctx.beginPath();
        ctx.moveTo(personX, floorY);
        ctx.lineTo(wallX, feetReflectY);
        ctx.lineTo(personX + 10, eyeY);
        ctx.stroke();

        // Minimum required mirror length is h / 2
        const minRequiredH = personHeightCm / 2;

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(
          isFullBodySeen 
            ? '✓ FULL BODY VISIBLE (Law of Reflection: θ_incidence = θ_reflection)' 
            : '⚠ PARTIAL VIEW: Mirror must be at least half person height (h/2) & placed at eye level',
          40, 45
        );
        ctx.font = '11px monospace';
        ctx.fillStyle = '#2563eb';
        ctx.fillText(`Min Mirror Height Required: ${minRequiredH.toFixed(0)} cm · Current Mirror: ${mirrorHeightCm} cm`, 40, 65);
      }

      // ============================================================
      // 3. WALK THE TIGHTROPE: ROTATIONAL INERTIA & TORQUE
      // ============================================================
      else if (simId === 'walk-the-tightrope') {
        const pivotX = 360;
        const pivotY = 240;

        // Tightrope wire
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(60, pivotY);
        ctx.lineTo(660, pivotY);
        ctx.stroke();

        // Support posts
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(50, pivotY, 14, 80);
        ctx.fillRect(656, pivotY, 14, 80);

        // Physics: Moment of Inertia I = m_walker*h^2 + m_pole*(L^2)/12 + 2*M*(L/2)^2
        const L = poleLengthM;
        const M = poleEndMassKg;
        const I_rot = 70 * 1.5 + (4 * Math.pow(L, 2)) / 12 + 2 * M * Math.pow(L / 2, 2);

        // Dynamic oscillation: large I means slow, stable sway; small I means violent wobble
        const tiltAmp = Math.max(2, 35 - Math.min(30, (I_rot / 25)));
        const swayAngleRad = Math.sin(t * (18 / Math.sqrt(I_rot))) * ((tiltAmp * Math.PI) / 180);

        ctx.save();
        ctx.translate(pivotX, pivotY);
        ctx.rotate(swayAngleRad);

        // Acrobat body
        ctx.fillStyle = '#1e293b';
        // Legs on rope
        ctx.fillRect(-6, -30, 12, 30);
        // Torso
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-10, -75, 20, 45);
        // Head
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(0, -90, 12, 0, Math.PI * 2);
        ctx.fill();

        // Balancing Pole held horizontally across hands
        const polePxHalf = (L / 8.0) * 160;
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-polePxHalf, -50);
        ctx.lineTo(polePxHalf, -50);
        ctx.stroke();

        // End masses on pole tips
        const massRad = Math.min(14, 6 + M * 0.7);
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(-polePxHalf, -50, massRad, 0, Math.PI * 2);
        ctx.arc(polePxHalf, -50, massRad, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();

        // Readouts
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(`Rotational Inertia (I = Σmr²): ${I_rot.toFixed(1)} kg·m²`, 40, 45);
        ctx.font = '11px monospace';
        ctx.fillStyle = I_rot > 60 ? '#10b981' : '#ea580c';
        ctx.fillText(
          I_rot > 60 
            ? '✓ HIGH INERTIA: Greatly reduces angular acceleration α = τ / I (Super Stable)' 
            : '⚠ LOW INERTIA: High wobble rate! Increase pole length or tip weights',
          40, 65
        );
      }

      // ============================================================
      // 4. HEAT ENGINE & CARNOT CYCLE
      // ============================================================
      else if (simId === 'heat-engine') {
        const carnotEfficiency = Number(((1 - tempCold / tempHot) * 100).toFixed(1));
        const cx = 360;
        const cy = 180;

        // Hot Reservoir (Top)
        ctx.fillStyle = '#fef2f2';
        ctx.fillRect(cx - 150, 30, 300, 40);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 150, 30, 300, 40);
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(`HOT RESERVOIR (T_H = ${tempHot} K / ${tempHot - 273}°C)`, cx - 120, 55);

        // Cold Reservoir (Bottom)
        ctx.fillStyle = '#eff6ff';
        ctx.fillRect(cx - 150, 270, 300, 40);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.strokeRect(cx - 150, 270, 300, 40);
        ctx.fillStyle = '#1d4ed8';
        ctx.fillText(`COLD RESERVOIR (T_C = ${tempCold} K / ${tempCold - 273}°C)`, cx - 125, 295);

        // Reciprocating Cylinder in center
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 60, 95, 120, 150);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 3;
        ctx.strokeRect(cx - 60, 95, 120, 150);

        // Moving Piston
        const pistonY = 135 + Math.sin(t * (engineRpm / 20)) * 25;
        ctx.fillStyle = '#334155';
        ctx.fillRect(cx - 56, pistonY, 112, 18);

        // Spinning Flywheel on right
        stateRef.current.flywheelAngle += (engineRpm / 60) * 0.08;
        const fAngle = stateRef.current.flywheelAngle;
        const wheelX = 570;
        const wheelY = 170;

        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(wheelX, wheelY, 40, 0, Math.PI * 2);
        ctx.stroke();
        // Spokes
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
          const a = fAngle + (i * Math.PI) / 2;
          ctx.beginPath();
          ctx.moveTo(wheelX, wheelY);
          ctx.lineTo(wheelX + Math.cos(a) * 40, wheelY + Math.sin(a) * 40);
          ctx.stroke();
        }

        // Connecting Rod from Piston to Flywheel
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(cx, pistonY + 9);
        ctx.lineTo(wheelX + Math.cos(fAngle) * 20, wheelY + Math.sin(fAngle) * 20);
        ctx.stroke();

        // Heat flow arrows
        ctx.fillStyle = '#dc2626';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('Q_H (Heat In) ↓', cx - 140, 95);
        ctx.fillStyle = '#1d4ed8';
        ctx.fillText('Q_C (Waste Heat) ↓', cx - 145, 255);
        ctx.fillStyle = '#10b981';
        ctx.fillText('W_net →', cx + 70, 175);

        // Efficiency Gauge Card on Left
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(`Carnot Efficiency (η = 1 - T_C/T_H):`, 40, 120);
        ctx.font = 'bold 22px monospace';
        ctx.fillStyle = '#10b981';
        ctx.fillText(`${carnotEfficiency}%`, 40, 150);
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('Upper thermodynamic limit', 40, 170);
      }

      // ============================================================
      // 5. HOT PACK COLD PACK: ENTHALPY OF SOLUTION (ΔH)
      // ============================================================
      else if (simId === 'hot-pack-cold-pack') {
        const isExo = saltType === 'cacl2';
        const deltaT = isExo 
          ? (dissolvedSaltGrams * 0.75) 
          : -(dissolvedSaltGrams * 0.4);
        const currentTemp = 20.0 + deltaT;

        // Beaker on Bench
        const bX = 320;
        const bY = 90;
        const bW = 160;
        const bH = 190;

        ctx.fillStyle = isExo ? 'rgba(254, 242, 242, 0.7)' : 'rgba(239, 246, 255, 0.7)';
        ctx.fillRect(bX, bY + 30, bW, bH - 30);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 4;
        ctx.strokeRect(bX, bY, bW, bH);

        // Solution Water Level
        const waterY = bY + 60;
        ctx.fillStyle = isExo ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.25)';
        ctx.fillRect(bX + 3, waterY, bW - 6, (bY + bH) - waterY - 3);

        // Dissolving particles / ions
        for (let i = 0; i < 18; i++) {
          const px = bX + 20 + ((i * 37) % (bW - 40));
          const py = waterY + 20 + ((i * 23 + Math.sin(t * 3 + i) * 10) % 90);
          ctx.fillStyle = isExo ? '#ef4444' : '#0284c7';
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Thermometer Probe immersed in liquid
        const thermX = bX + 110;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(thermX, 40, 16, 220);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(thermX, 40, 16, 220);

        // Mercury column height
        const mercH = Math.max(10, Math.min(180, (currentTemp / 70) * 160));
        ctx.fillStyle = isExo ? '#dc2626' : '#0284c7';
        ctx.fillRect(thermX + 3, 245 - mercH, 10, mercH);

        // Readouts
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(
          isExo 
            ? 'EXOTHERMIC REACTION: CaCl₂(s) → Ca²⁺ + 2Cl⁻ (ΔH = -82.8 kJ/mol)' 
            : 'ENDOTHERMIC REACTION: NH₄NO₃(s) → NH₄⁺ + NO₃⁻ (ΔH = +25.7 kJ/mol)',
          40, 45
        );
        ctx.font = 'bold 20px monospace';
        ctx.fillStyle = isExo ? '#dc2626' : '#0284c7';
        ctx.fillText(`${currentTemp.toFixed(1)} °C`, 40, 80);
        ctx.font = '11px sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText(`ΔT = ${deltaT > 0 ? '+' : ''}${deltaT.toFixed(1)} °C from ambient`, 40, 100);
      }

      // ============================================================
      // 6. GALVANIC BATTERY: REDOX ELECTROCHEMISTRY
      // ============================================================
      else if (simId === 'battery-redox') {
        const leftBeakerX = 160;
        const rightBeakerX = 420;
        const bW = 160;
        const bH = 160;
        const bY = 140;

        // Left Beaker: Zinc Anode in ZnSO4
        ctx.fillStyle = 'rgba(241, 245, 249, 0.8)';
        ctx.fillRect(leftBeakerX, bY + 30, bW, bH - 30);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        ctx.strokeRect(leftBeakerX, bY, bW, bH);
        // Zinc Metal Strip (Anode)
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(leftBeakerX + 50, bY + 10, 20, bH - 20);

        // Right Beaker: Copper Cathode in CuSO4 (Blue)
        ctx.fillStyle = 'rgba(186, 230, 253, 0.5)';
        ctx.fillRect(rightBeakerX, bY + 30, bW, bH - 30);
        ctx.strokeStyle = '#64748b';
        ctx.strokeRect(rightBeakerX, bY, bW, bH);
        // Copper Metal Strip (Cathode)
        ctx.fillStyle = '#d97706';
        ctx.fillRect(rightBeakerX + 90, bY + 10, 20, bH - 20);

        // Salt Bridge (Inverted U-Tube)
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.8)';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(leftBeakerX + 110, bY + 70);
        ctx.lineTo(leftBeakerX + 110, bY + 15);
        ctx.lineTo(rightBeakerX + 40, bY + 15);
        ctx.lineTo(rightBeakerX + 40, bY + 70);
        ctx.stroke();

        // Connecting Circuit Wire with Voltmeter
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(leftBeakerX + 60, bY + 10);
        ctx.lineTo(leftBeakerX + 60, 60);
        ctx.lineTo(rightBeakerX + 100, 60);
        ctx.lineTo(rightBeakerX + 100, bY + 10);
        ctx.stroke();

        // Voltmeter Gauge in middle
        const vmX = 370;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(vmX, 60, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('+1.10V', vmX - 18, 64);

        // Electron animation along wire (Left to Right)
        const eStep = (t * 80) % (rightBeakerX + 100 - (leftBeakerX + 60));
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(leftBeakerX + 60 + eStep, 60, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText('DANIELL CELL: Zn(s) + Cu²⁺(aq) → Zn²⁺(aq) + Cu(s)  [E° = +1.10 V]', 40, 30);
      }

      // ============================================================
      // 7. BALANCING EQUATIONS: CONSERVATION OF MASS
      // ============================================================
      else if (simId === 'balancing-equations') {
        // Balance Beam Scale
        const scalePivotX = 360;
        const scalePivotY = 220;

        // Atom counts based on equation preset
        let rAtoms = 0;
        let pAtoms = 0;
        let isBalanced = false;

        if (equationPreset === 'water') {
          // c1 H2 + c2 O2 -> c3 H2O
          const rH = c1 * 2;
          const rO = c2 * 2;
          const pH = c3 * 2;
          const pO = c3 * 1;
          rAtoms = rH + rO;
          pAtoms = pH + pO;
          isBalanced = rH === pH && rO === pO && c1 > 0 && c2 > 0 && c3 > 0;
        } else if (equationPreset === 'ammonia') {
          // c1 N2 + c2 H2 -> c3 NH3
          const rN = c1 * 2;
          const rH = c2 * 2;
          const pN = c3 * 1;
          const pH = c3 * 3;
          rAtoms = rN + rH;
          pAtoms = pN + pH;
          isBalanced = rN === pN && rH === pH;
        } else {
          // c1 CH4 + c2 O2 -> c3 CO2 + c4 H2O
          const rC = c1 * 1;
          const rH = c1 * 4;
          const rO = c2 * 2;
          const pC = c3 * 1;
          const pO = c3 * 2 + c4 * 1;
          const pH = c4 * 2;
          rAtoms = rC + rH + rO;
          pAtoms = pC + pO + pH;
          isBalanced = rC === pC && rH === pH && rO === pO;
        }

        const beamTiltRad = Math.max(-0.25, Math.min(0.25, (pAtoms - rAtoms) * 0.04));

        ctx.save();
        ctx.translate(scalePivotX, scalePivotY);
        ctx.rotate(beamTiltRad);

        // Cross beam
        ctx.strokeStyle = isBalanced ? '#10b981' : '#64748b';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(-180, 0);
        ctx.lineTo(180, 0);
        ctx.stroke();

        // Left Pan (Reactants)
        ctx.fillStyle = '#334155';
        ctx.fillRect(-220, 20, 80, 10);
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-180, 0);
        ctx.lineTo(-220, 20);
        ctx.moveTo(-180, 0);
        ctx.lineTo(-140, 20);
        ctx.stroke();

        // Right Pan (Products)
        ctx.fillStyle = '#334155';
        ctx.fillRect(140, 20, 80, 10);
        ctx.beginPath();
        ctx.moveTo(180, 0);
        ctx.lineTo(140, 20);
        ctx.moveTo(180, 0);
        ctx.lineTo(220, 20);
        ctx.stroke();

        ctx.restore();

        // Fulcrum Stand
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(scalePivotX - 15, scalePivotY + 70);
        ctx.lineTo(scalePivotX, scalePivotY);
        ctx.lineTo(scalePivotX + 15, scalePivotY + 70);
        ctx.fill();

        // Readout
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(
          isBalanced 
            ? '✓ EQUATION BALANCED! Number of reactant atoms equals product atoms.' 
            : '⚠ UNBALANCED: Adjust stoichiometric coefficients to satisfy Conservation of Mass.',
          40, 45
        );
      }

      // ============================================================
      // 8. ROCK CANDY: TEMPERATURE & SOLUBILITY
      // ============================================================
      else if (simId === 'rock-candy-solubility') {
        const maxSolubleGrams = 200 + ((solutionTempC - 20) / 80) * 280;
        const isSupersaturated = sugarAddedGrams > maxSolubleGrams;

        // Beaker
        const bX = 300;
        const bY = 100;
        const bW = 160;
        const bH = 180;

        ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
        ctx.fillRect(bX, bY + 30, bW, bH - 30);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 3;
        ctx.strokeRect(bX, bY, bW, bH);

        // Suspended string / seed stick
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(bX + bW / 2, 70);
        ctx.lineTo(bX + bW / 2, bY + bH - 25);
        ctx.stroke();

        // Growing sugar crystals on stick if supersaturated
        if (isSupersaturated) {
          const numCrystals = Math.min(30, Math.floor((sugarAddedGrams - maxSolubleGrams) / 8));
          for (let i = 0; i < numCrystals; i++) {
            const cy = bY + 50 + (i * 4) % 90;
            const cx = bX + bW / 2 + (i % 2 === 0 ? 8 : -8);
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(cx - 5, cy - 5, 10, 10);
            ctx.strokeStyle = '#ca8a04';
            ctx.lineWidth = 1;
            ctx.strokeRect(cx - 5, cy - 5, 10, 10);
          }
        }

        // Flame underneath beaker
        if (solutionTempC > 40) {
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.arc(bX + bW / 2, bY + bH + 18, 16, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(`Solubility Limit at ${solutionTempC}°C: ${maxSolubleGrams.toFixed(0)} g / 100 mL`, 40, 45);
        ctx.font = '11px monospace';
        ctx.fillStyle = isSupersaturated ? '#10b981' : '#64748b';
        ctx.fillText(
          isSupersaturated 
            ? '✓ SUPERSATURATED: Sugar crystals spontaneously precipitate along the seed stick' 
            : 'UNSATURATED: Sugar completely dissolves; increase sugar or cool solution to grow crystals',
          40, 65
        );
      }

      // ============================================================
      // 9. FLAT VS. FIZZY SODA: LE CHATELIER & HENRY'S LAW
      // ============================================================
      else if (simId === 'flat-vs-fizzy-soda') {
        const bottleX = 330;
        const bottleY = 70;
        const bottleW = 100;
        const bottleH = 220;

        // Bottle Outline
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 3;
        ctx.strokeRect(bottleX, bottleY + 40, bottleW, bottleH - 40);

        // Bottle Cap
        ctx.fillStyle = isBottleSealed ? '#dc2626' : '#94a3b8';
        ctx.fillRect(bottleX + 35, bottleY + 25, 30, 15);

        // Soda Amber Liquid
        ctx.fillStyle = 'rgba(217, 119, 6, 0.4)';
        ctx.fillRect(bottleX + 2, bottleY + 90, bottleW - 4, bottleH - 92);

        // Headspace Gas
        ctx.fillStyle = isBottleSealed ? 'rgba(56, 189, 248, 0.25)' : 'rgba(241, 245, 249, 0.2)';
        ctx.fillRect(bottleX + 2, bottleY + 40, bottleW - 4, 50);

        // Fizz bubbles escaping: rapid if open or hot!
        const bubbleSpeed = isBottleSealed ? 0.3 : 1.5 + (sodaTempC / 10);
        for (let i = 0; i < 20; i++) {
          const bx = bottleX + 15 + ((i * 19) % (bottleW - 30));
          const by = bottleY + 95 + ((i * 31 - t * bubbleSpeed * 40) % 110 + 110) % 110;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(bx, by, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(
          isBottleSealed 
            ? 'SEALED (Henry\'s Law Equilibrium): P_CO₂ = 3 atm keeps gas dissolved' 
            : 'OPEN CAP: Headspace pressure drops to 1 atm, forcing CO₂(aq) out as rapid fizz!',
          40, 45
        );
      }

      // ============================================================
      // 10. FLASHLIGHT & CIRCUIT JOULE HEATING
      // ============================================================
      else if (simId === 'flashlight') {
        const pwr = Math.pow(bulbVolts, 2) / filamentRes;
        const cur = bulbVolts / filamentRes;

        ctx.fillStyle = '#334155';
        ctx.fillRect(80, 140, 60, 80);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(140, 165, 8, 30);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px monospace';
        ctx.fillText(`${bulbVolts}V`, 95, 185);

        const bulbX = 460;
        const bulbY = 180;
        const glowRad = Math.min(120, 20 + pwr * 8);

        const radGrad = ctx.createRadialGradient(bulbX, bulbY, 5, bulbX, bulbY, glowRad);
        radGrad.addColorStop(0, 'rgba(253, 224, 71, 0.8)');
        radGrad.addColorStop(0.5, 'rgba(250, 204, 21, 0.4)');
        radGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(bulbX, bulbY, glowRad, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(bulbX, bulbY, 36, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = pwr > 5 ? '#f59e0b' : '#64748b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bulbX - 12, bulbY + 20);
        ctx.lineTo(bulbX - 8, bulbY - 5);
        ctx.lineTo(bulbX, bulbY - 12);
        ctx.lineTo(bulbX + 8, bulbY - 5);
        ctx.lineTo(bulbX + 12, bulbY + 20);
        ctx.stroke();

        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(148, 180);
        ctx.lineTo(bulbX, 100);
        ctx.lineTo(bulbX, bulbY - 36);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(bulbX, bulbY + 36);
        ctx.lineTo(bulbX, 260);
        ctx.lineTo(80, 260);
        ctx.lineTo(80, 180);
        ctx.stroke();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(`Joule Heating Power Dissipation (P = V²/R): ${pwr.toFixed(2)} W`, 40, 50);
        ctx.font = '11px monospace';
        ctx.fillStyle = '#2563eb';
        ctx.fillText(`Electric Current (I = V/R): ${cur.toFixed(2)} A`, 40, 70);
      }

      // ============================================================
      // 11. RUTHERFORD GOLD FOIL ATOMIC SCATTERING
      // ============================================================
      else if (simId === 'gold-foil') {
        const foilX = 380;
        const foilWidth = foilThickness * 6 + 10;

        // Gold Foil Sheet (Au)
        ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
        ctx.fillRect(foilX - foilWidth / 2, 40, foilWidth, height - 80);
        ctx.strokeStyle = '#ca8a04';
        ctx.lineWidth = 2;
        ctx.strokeRect(foilX - foilWidth / 2, 40, foilWidth, height - 80);
        ctx.fillStyle = '#ca8a04';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(`Gold Foil Sheet (Au) · Thickness: ${foilThickness} μm`, foilX - 70, 30);

        // Gold Nuclei (+79 positive charge)
        const nucleiCount = Math.min(8, 2 + foilThickness);
        const nuclei = [];
        for (let k = 0; k < nucleiCount; k++) {
          const ny = 65 + (k * (height - 130)) / (nucleiCount - 1);
          const nx = foilX + (k % 2 === 0 ? -4 : 4);
          nuclei.push({ x: nx, y: ny });
        }

        nuclei.forEach(n => {
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.arc(n.x, n.y, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#a16207';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = '#78350f';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('+79', n.x - 8, n.y + 3);
        });

        // Alpha Particle Gun / Collimator
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(40, 150, 45, 60);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(85, 172, 15, 16);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('α Source', 35, 230);
        ctx.fillText('(²¹⁰Po)', 42, 244);

        // Animated Alpha Particle Streams
        const particleCount = Math.min(25, beamIntensity);
        ctx.lineWidth = 1.5;

        for (let i = 0; i < particleCount; i++) {
          const streamY = 55 + (i * (height - 110)) / particleCount;
          const nearestNucleus = nuclei.find(n => Math.abs(n.y - streamY) < 16);

          // Phase offset for animated particle bullet
          const particlePhase = ((t * 80 + i * 45) % (width - 60)) + 80;

          ctx.beginPath();
          ctx.moveTo(100, streamY);

          if (nearestNucleus) {
            const deflectUp = streamY < nearestNucleus.y;
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
            ctx.lineTo(foilX - 4, streamY);
            ctx.lineTo(foilX + 90, deflectUp ? streamY - 80 : streamY + 80);
            ctx.stroke();

            // Animated dot
            if (particlePhase < foilX) {
              ctx.fillStyle = '#38bdf8';
              ctx.beginPath();
              ctx.arc(particlePhase, streamY, 3, 0, Math.PI * 2);
              ctx.fill();
            } else {
              const deflProgress = (particlePhase - foilX) / 100;
              const px = foilX + deflProgress * 90;
              const py = streamY + (deflectUp ? -80 : 80) * deflProgress;
              ctx.fillStyle = '#ef4444';
              ctx.beginPath();
              ctx.arc(px, py, 3.5, 0, Math.PI * 2);
              ctx.fill();
            }
          } else {
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
            ctx.lineTo(width - 40, streamY);
            ctx.stroke();

            // Animated straight particle
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(particlePhase, streamY, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Circular Zinc Sulfide (ZnS) Scintillation Detector Screen
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(foilX, height / 2, 230, -Math.PI * 0.42, Math.PI * 0.42);
        ctx.stroke();
        ctx.fillStyle = '#059669';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('ZnS Scintillation Detector Screen', width - 210, 45);

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText('✓ 99.9% of α-particles pass undeflected through empty electron orbitals', 40, 50);
        ctx.fillStyle = '#ef4444';
        ctx.fillText('⚠ Rare violent large-angle deflections reveal tiny, ultra-dense positive nucleus (Z = 79)', 40, 70);
      }

      // ============================================================
      // 12. ELEVATOR APPARENT WEIGHT & NORMAL FORCE
      // ============================================================
      else if (simId === 'elevator') {
        const cabX = 260;
        const cabY = 70;
        const cabW = 240;
        const cabH = 240;

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 4;
        ctx.strokeRect(cabX - 20, 20, cabW + 40, height - 40);

        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(cabX + cabW / 2, 20);
        ctx.lineTo(cabX + cabW / 2, cabY);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cabX, cabY, cabW, cabH);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.strokeRect(cabX, cabY, cabW, cabH);

        const scaleX = cabX + 80;
        const scaleY = cabY + cabH - 18;
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(scaleX, scaleY, 80, 14);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.strokeRect(scaleX, scaleY, 80, 14);

        const personX = scaleX + 40;
        const personY = scaleY - 60;
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(personX, personY - 20, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(personX - 8, personY - 8, 16, 40);
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(personX - 5, personY + 32);
        ctx.lineTo(personX - 10, scaleY);
        ctx.moveTo(personX + 5, personY + 32);
        ctx.lineTo(personX + 10, scaleY);
        ctx.stroke();

        const g = 9.81;
        const trueWeight = personMass * g;
        const normalForce = personMass * (g + elevAcc);
        const apparentWeightKg = normalForce / g;

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

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillText(`Scale Reading: ${apparentWeightKg.toFixed(1)} kg`, 40, 50);
      }

      // ============================================================
      // FALLBACK: OSCILLATION
      // ============================================================
      else {
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
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [
    simId, 
    cannonVel, cannonAlt, 
    drawDist, springK, 
    elevAcc, personMass, 
    bulbVolts, filamentRes, 
    personHeightCm, mirrorHeightCm, mirrorOffsetY, personDistM,
    poleLengthM, poleEndMassKg,
    tempHot, tempCold, engineRpm,
    saltType, dissolvedSaltGrams,
    batteryLoad, electrolyteConc,
    equationPreset, c1, c2, c3, c4,
    solutionTempC, sugarAddedGrams,
    isBottleSealed, sodaPressureAtm, sodaTempC,
    beamIntensity, foilThickness,
    paramValA, paramValB, 
    isPlaying
  ]);

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
                60 FPS Precision Engine
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

          {/* Domain-Specific Sliders for Each Simulation */}
          {simId === 'prom-night' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-700">Person Height (h):</span>
                  <span className="font-bold text-blue-700">{personHeightCm} cm</span>
                </div>
                <input
                  type="range"
                  min={140}
                  max={200}
                  step={5}
                  value={personHeightCm}
                  onChange={(e) => setPersonHeightCm(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-700">Mirror Height (L):</span>
                  <span className="font-bold text-indigo-700">{mirrorHeightCm} cm</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={130}
                  step={5}
                  value={mirrorHeightCm}
                  onChange={(e) => setMirrorHeightCm(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-700">Mirror Elevation:</span>
                  <span className="font-bold text-amber-700">{mirrorOffsetY} cm</span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={120}
                  step={5}
                  value={mirrorOffsetY}
                  onChange={(e) => setMirrorOffsetY(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {simId === 'walk-the-tightrope' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-700">Pole Length (L):</span>
                  <span className="font-bold text-amber-700">{poleLengthM.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min={2.0}
                  max={8.0}
                  step={0.5}
                  value={poleLengthM}
                  onChange={(e) => setPoleLengthM(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-700">Pole Tip Masses (2× M):</span>
                  <span className="font-bold text-rose-700">{poleEndMassKg.toFixed(1)} kg each</span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={12.0}
                  step={1.0}
                  value={poleEndMassKg}
                  onChange={(e) => setPoleEndMassKg(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {simId === 'heat-engine' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-rose-700">Hot Reservoir (T_H):</span>
                  <span className="font-bold text-rose-700">{tempHot} K</span>
                </div>
                <input
                  type="range"
                  min={400}
                  max={900}
                  step={20}
                  value={tempHot}
                  onChange={(e) => setTempHot(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-blue-700">Cold Reservoir (T_C):</span>
                  <span className="font-bold text-blue-700">{tempCold} K</span>
                </div>
                <input
                  type="range"
                  min={250}
                  max={380}
                  step={10}
                  value={tempCold}
                  onChange={(e) => setTempCold(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-700">Engine Speed (RPM):</span>
                  <span className="font-bold text-slate-700">{engineRpm} RPM</span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={120}
                  step={10}
                  value={engineRpm}
                  onChange={(e) => setEngineRpm(Number(e.target.value))}
                  className="w-full accent-slate-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {simId === 'hot-pack-cold-pack' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
                <span className="text-xs font-mono font-bold text-slate-700">Therapeutic Salt Type:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSaltType('cacl2')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                      saltType === 'cacl2' ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    🔥 CaCl₂ (Hot Pack, Exothermic)
                  </button>
                  <button
                    onClick={() => setSaltType('nh4no3')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                      saltType === 'nh4no3' ? 'bg-sky-100 text-sky-900 border-sky-300' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    ❄ NH₄NO₃ (Cold Pack, Endothermic)
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-700">Salt Mass Dissolved:</span>
                  <span className="font-bold text-indigo-700">{dissolvedSaltGrams} g</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={60}
                  step={5}
                  value={dissolvedSaltGrams}
                  onChange={(e) => setDissolvedSaltGrams(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {simId === 'battery-redox' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs font-mono font-bold text-slate-700">Cell Circuit Load:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBatteryLoad('voltmeter')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border ${
                      batteryLoad === 'voltmeter' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    Digital Voltmeter (Open Circuit E°)
                  </button>
                  <button
                    onClick={() => setBatteryLoad('bulb')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border ${
                      batteryLoad === 'bulb' ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    Incandescent Light Bulb Load
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-700">Electrolyte Concentration:</span>
                  <span className="font-bold text-blue-700">{electrolyteConc.toFixed(1)} M</span>
                </div>
                <input
                  type="range"
                  min={0.1}
                  max={2.0}
                  step={0.1}
                  value={electrolyteConc}
                  onChange={(e) => setElectrolyteConc(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {simId === 'balancing-equations' && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-slate-700 uppercase">Reaction Choice:</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEquationPreset('water'); setC1(1); setC2(1); setC3(1); }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${
                      equationPreset === 'water' ? 'bg-blue-100 text-blue-900 border-blue-300' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    Water Synthesis (H₂ + O₂ → H₂O)
                  </button>
                  <button
                    onClick={() => { setEquationPreset('ammonia'); setC1(1); setC2(1); setC3(1); }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border ${
                      equationPreset === 'ammonia' ? 'bg-indigo-100 text-indigo-900 border-indigo-300' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    Haber Ammonia (N₂ + H₂ → NH₃)
                  </button>
                </div>
              </div>

              {/* Coefficient controls */}
              <div className="flex flex-wrap items-center justify-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm font-mono font-bold">
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={c1}
                    onChange={(e) => setC1(Math.max(1, Number(e.target.value)))}
                    className="w-12 px-2 py-1 text-center border rounded bg-white"
                  />
                  <span>{equationPreset === 'water' ? 'H₂' : 'N₂'}</span>
                </div>
                <span>+</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={c2}
                    onChange={(e) => setC2(Math.max(1, Number(e.target.value)))}
                    className="w-12 px-2 py-1 text-center border rounded bg-white"
                  />
                  <span>{equationPreset === 'water' ? 'O₂' : 'H₂'}</span>
                </div>
                <span>→</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={c3}
                    onChange={(e) => setC3(Math.max(1, Number(e.target.value)))}
                    className="w-12 px-2 py-1 text-center border rounded bg-white"
                  />
                  <span>{equationPreset === 'water' ? 'H₂O' : 'NH₃'}</span>
                </div>
              </div>
            </div>
          )}

          {simId === 'rock-candy-solubility' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-amber-700">Solution Temperature:</span>
                  <span className="font-bold text-amber-700">{solutionTempC} °C</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={100}
                  step={5}
                  value={solutionTempC}
                  onChange={(e) => setSolutionTempC(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-indigo-700">Sugar Added (g / 100 mL):</span>
                  <span className="font-bold text-indigo-700">{sugarAddedGrams} g</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={550}
                  step={25}
                  value={sugarAddedGrams}
                  onChange={(e) => setSugarAddedGrams(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {simId === 'flat-vs-fizzy-soda' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <span className="text-xs font-mono font-bold text-slate-700">Bottle Seal:</span>
                <button
                  onClick={() => setIsBottleSealed(!isBottleSealed)}
                  className={`w-full py-2 rounded-lg text-xs font-mono font-bold border transition-colors ${
                    isBottleSealed ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'bg-rose-100 text-rose-900 border-rose-300'
                  }`}
                >
                  {isBottleSealed ? '🔒 Cap Sealed (Pressurized)' : '🔓 Cap Removed (Atmospheric)'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-blue-700">Headspace Pressure:</span>
                  <span className="font-bold text-blue-700">{sodaPressureAtm.toFixed(1)} atm</span>
                </div>
                <input
                  type="range"
                  min={1.0}
                  max={4.5}
                  step={0.5}
                  value={sodaPressureAtm}
                  onChange={(e) => setSodaPressureAtm(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-amber-700">Liquid Temperature:</span>
                  <span className="font-bold text-amber-700">{sodaTempC} °C</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={38}
                  step={2}
                  value={sodaTempC}
                  onChange={(e) => setSodaTempC(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
              </div>
            </div>
          )}

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
              </div>
            </div>
          )}

          {simId === 'elevator' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-700">Elevator Acceleration (a):</span>
                  <span className="font-bold text-blue-700">{elevAcc} m/s²</span>
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
              </div>
            </div>
          )}

          {simId === 'gold-foil' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-700">Alpha Particle Beam Rate:</span>
                  <span className="font-bold text-sky-700">{beamIntensity} streams/s</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={25}
                  step={1}
                  value={beamIntensity}
                  onChange={(e) => setBeamIntensity(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-700">Foil Sheet Thickness:</span>
                  <span className="font-bold text-amber-700">{foilThickness} μm ({(foilThickness * 8.6).toFixed(0)}k atomic layers)</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={6}
                  step={1}
                  value={foilThickness}
                  onChange={(e) => setFoilThickness(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
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
                    { text: 'A) The dependent output scales according to the governing physical law', correct: true },
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
                    {challengeFeedback['q1'] === 'correct' ? '✓ Correct! Scaling obeys the governing physical law.' : '✗ Try again. Consider the proportionality in the formula.'}
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
