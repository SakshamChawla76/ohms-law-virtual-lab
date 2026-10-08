import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  ShieldCheck,
  Compass,
  Sliders,
  Flame,
  Wind
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
  const [showSparks, setShowSparks] = useState(true);

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
  const sparksRef = useRef([]);
  const draggingHandleRef = useRef(null); // 'drop' | 'loop' | null

  // Gravity constant
  const g = 9.81;

  // Minimum initial height for circular loop: h >= 2.5 * r
  const criticalHeight = 2.5 * loopRadius;

  // Reset coaster simulation
  const handleReset = () => {
    sounds.playSnap();
    progressRef.current = 0;
    sparksRef.current = [];
    setIsPlaying(true);
  };

  // Convert track progress (0 to 1) to (x, y, angle) coordinates
  const getTrackPosition = useCallback((prog, width, height, currentH, currentR) => {
    const startX = 60;
    const groundY = height - 70;
    const trackScale = (groundY - 60) / 50;

    const startY = groundY - currentH * trackScale;
    const loopCenterX = width * 0.52;
    const loopR = currentR * trackScale;
    const loopCenterY = groundY - loopR;
    const endX = width - 60;

    let x = startX;
    let y = startY;
    let angle = 0;

    if (prog < 0.35) {
      const t = Math.max(0, Math.min(1, prog / 0.35));
      const p0x = startX, p0y = startY;
      const p1x = startX + 80, p1y = groundY;
      const p2x = loopCenterX, p2y = groundY;

      x = Math.pow(1 - t, 2) * p0x + 2 * (1 - t) * t * p1x + Math.pow(t, 2) * p2x;
      y = Math.pow(1 - t, 2) * p0y + 2 * (1 - t) * t * p1y + Math.pow(t, 2) * p2y;

      const dx = 2 * (1 - t) * (p1x - p0x) + 2 * t * (p2x - p1x);
      const dy = 2 * (1 - t) * (p1y - p0y) + 2 * t * (p2y - p1y);
      angle = Math.atan2(dy, dx);
    } else if (prog <= 0.75) {
      const t = (prog - 0.35) / 0.4;
      const theta = Math.PI / 2 - t * 2 * Math.PI;

      x = loopCenterX + loopR * Math.cos(theta);
      y = loopCenterY + loopR * Math.sin(theta);
      angle = Math.atan2(-Math.cos(theta), Math.sin(theta));
    } else {
      const t = Math.max(0, Math.min(1, (prog - 0.75) / 0.25));
      x = loopCenterX + t * (endX - loopCenterX);
      y = groundY;
      angle = 0;
    }

    return { x, y, angle, startX, startY, groundY, loopCenterX, loopCenterY, loopR, endX, trackScale };
  }, []);

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

      const {
        startX, startY, groundY, loopCenterX, loopCenterY, loopR, endX, trackScale
      } = getTrackPosition(0, width, height, initialHeight, loopRadius);

      let currentProg = progressRef.current;

      // Physics: Speed from conservation of mechanical energy
      const frictionLoss = hasFriction ? currentProg * 0.15 * (mass * g * initialHeight) : 0;
      
      let simHeight = initialHeight;
      if (currentProg < 0.35) {
        const t = currentProg / 0.35;
        simHeight = initialHeight * (1 - Math.pow(t, 1.6));
      } else if (currentProg <= 0.75) {
        const t = (currentProg - 0.35) / 0.4;
        simHeight = loopRadius * (1 - Math.cos(t * 2 * Math.PI));
      } else {
        simHeight = 0;
      }

      const potEnergy = mass * g * Math.max(0, simHeight);
      const totEnergy = mass * g * initialHeight - frictionLoss;
      const kinEnergy = Math.max(0, totEnergy - potEnergy);
      const curVelocity = Math.sqrt((2 * kinEnergy) / mass);

      // Check apex detachment condition
      const fell = initialHeight < criticalHeight && currentProg > 0.48 && currentProg < 0.62;

      // Normal force (G-force)
      let normalG = 1;
      if (currentProg >= 0.35 && currentProg <= 0.75) {
        const t = (currentProg - 0.35) / 0.4;
        const an = (curVelocity * curVelocity) / Math.max(1, loopRadius);
        normalG = Math.max(0, (an + g * Math.cos(t * 2 * Math.PI)) / g);
      } else if (currentProg < 0.35) {
        normalG = 1 + (curVelocity / 22);
      } else {
        normalG = 1;
      }

      if (isPlaying) {
        const speedFactor = Math.max(0.1, (curVelocity / 35) * 0.28);
        currentProg += speedFactor * dt;
        if (currentProg > 1) {
          currentProg = 0;
        }
        progressRef.current = currentProg;

        // Emit sparks on high normal force or high speed rail contact
        if (showSparks && (normalG > 2.8 || curVelocity > 22)) {
          const mainCar = getTrackPosition(currentProg, width, height, initialHeight, loopRadius);
          for (let i = 0; i < 2; i++) {
            sparksRef.current.push({
              x: mainCar.x + (Math.random() - 0.5) * 16,
              y: mainCar.y + 6 + (Math.random() - 0.5) * 4,
              vx: (Math.random() - 0.5) * 70 - Math.cos(mainCar.angle) * (curVelocity * 1.5),
              vy: (Math.random() - 0.7) * 80,
              life: 1.0,
              color: Math.random() > 0.4 ? '#f59e0b' : '#ef4444'
            });
          }
        }
      }

      // Update active sparks
      sparksRef.current = sparksRef.current
        .map(s => ({
          ...s,
          x: s.x + s.vx * dt,
          y: s.y + s.vy * dt + 150 * dt, // gravity pull
          life: s.life - dt * 2.8
        }))
        .filter(s => s.life > 0);

      // Throttle telemetry update to DOM
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

      // 1. Subtle Engineering Grid
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Concrete Ground Base & Plinth
      const gradGround = ctx.createLinearGradient(0, groundY, 0, height);
      gradGround.addColorStop(0, '#e2e8f0');
      gradGround.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = gradGround;
      ctx.fillRect(0, groundY, width, height - groundY);

      // Safety curb
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      // Concrete measurement markers on floor
      ctx.fillStyle = '#64748b';
      ctx.font = '9px monospace';
      for (let x = 60; x < width - 60; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x, groundY + 6);
        ctx.stroke();
        ctx.fillText(`${Math.round((x - 60) / trackScale)}m`, x - 8, groundY + 18);
      }

      // 3. Structural Steel Truss Towers (Latticework with cross braces)
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.2;
      for (let x = startX + 35; x < loopCenterX - 20; x += 55) {
        const tDrop = (x - startX) / (loopCenterX - startX);
        const trestleTop = startY + Math.pow(tDrop, 1.8) * (groundY - startY);
        // Vertical legs
        ctx.beginPath();
        ctx.moveTo(x - 6, trestleTop);
        ctx.lineTo(x - 9, groundY);
        ctx.moveTo(x + 6, trestleTop);
        ctx.lineTo(x + 9, groundY);
        ctx.stroke();

        // Cross bracing
        const segments = Math.max(2, Math.floor((groundY - trestleTop) / 28));
        const segH = (groundY - trestleTop) / segments;
        for (let s = 0; s < segments; s++) {
          const y1 = trestleTop + s * segH;
          const y2 = y1 + segH;
          ctx.beginPath();
          ctx.moveTo(x - 7, y1);
          ctx.lineTo(x + 7, y2);
          ctx.moveTo(x + 7, y1);
          ctx.lineTo(x - 7, y2);
          ctx.stroke();
        }

        // Concrete footings
        ctx.fillStyle = '#64748b';
        ctx.fillRect(x - 12, groundY - 4, 24, 4);
      }

      // Drop Tower Main Pylon
      ctx.fillStyle = '#64748b';
      ctx.fillRect(startX - 14, startY, 14, groundY - startY);
      ctx.fillStyle = '#475569';
      ctx.fillRect(startX - 18, groundY - 6, 22, 6);

      // Loop center pillar support
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(loopCenterX, loopCenterY + loopR);
      ctx.lineTo(loopCenterX, groundY);
      ctx.stroke();

      // 4. Critical Height and Apex Analytical Guidelines
      const critY = groundY - criticalHeight * trackScale;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(startX - 30, critY);
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

      // 5. Track Path Drawing (Twin Tubular Steel Rails + Cross Ties)
      // Base sleeper crossties along the track
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 2;
      const numTies = 90;
      for (let i = 0; i <= numTies; i++) {
        const pTie = i / numTies;
        const posTie = getTrackPosition(pTie, width, height, initialHeight, loopRadius);
        const tieLen = 10;
        const nx = -Math.sin(posTie.angle) * tieLen;
        const ny = Math.cos(posTie.angle) * tieLen;
        ctx.beginPath();
        ctx.moveTo(posTie.x - nx * 0.5, posTie.y - ny * 0.5);
        ctx.lineTo(posTie.x + nx * 0.5, posTie.y + ny * 0.5);
        ctx.stroke();
      }

      // Main Steel Backbone Tube (Deep Slate)
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(startX + 80, groundY, loopCenterX, groundY);
      ctx.arc(loopCenterX, loopCenterY, loopR, Math.PI / 2, -1.5 * Math.PI, true);
      ctx.lineTo(endX, groundY);
      ctx.stroke();

      // Top Specular Steel Rail (Metallic Teal Luster)
      ctx.strokeStyle = '#0d9488';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, startY - 3);
      ctx.quadraticCurveTo(startX + 80, groundY - 3, loopCenterX, groundY - 3);
      ctx.arc(loopCenterX, loopCenterY, loopR - 3, Math.PI / 2, -1.5 * Math.PI, true);
      ctx.lineTo(endX, groundY - 3);
      ctx.stroke();

      // Lower guide rail
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(startX, startY + 3);
      ctx.quadraticCurveTo(startX + 80, groundY + 3, loopCenterX, groundY + 3);
      ctx.arc(loopCenterX, loopCenterY, loopR + 3, Math.PI / 2, -1.5 * Math.PI, true);
      ctx.lineTo(endX, groundY + 3);
      ctx.stroke();

      // 6. Interactive Drop Tower Grabber Handle (Draggable directly on canvas)
      ctx.save();
      ctx.fillStyle = '#0f766e';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(startX, startY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Drop height tooltip tag
      ctx.fillStyle = '#0f766e';
      ctx.roundRect(startX - 52, startY - 26, 46, 18, 4);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`${initialHeight}m`, startX - 44, startY - 14);
      ctx.restore();

      // 7. Interactive Loop Radius Grabber Handle
      ctx.save();
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(loopCenterX, apexY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 8. Render Spark Particles
      for (const sp of sparksRef.current) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, sp.life);
        ctx.fillStyle = sp.color;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 2.5 * sp.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 9. Articulated 3-Car Coaster Train
      const trainOffsets = [0, -0.024, -0.048]; // Front, Middle, Rear car offsets
      const carCount = trainOffsets.length;

      for (let cIdx = carCount - 1; cIdx >= 0; cIdx--) {
        const cProg = currentProg + trainOffsets[cIdx];
        if (cProg < 0) continue;

        const carPos = getTrackPosition(cProg, width, height, initialHeight, loopRadius);

        ctx.save();
        ctx.translate(carPos.x, carPos.y);
        ctx.rotate(carPos.angle);

        // Wind speed streaks behind train
        if (curVelocity > 16 && isPlaying) {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1;
          for (let w = 0; w < 3; w++) {
            ctx.beginPath();
            ctx.moveTo(-18 - w * 6, -6 + w * 5);
            ctx.lineTo(-32 - w * 12, -6 + w * 5);
            ctx.stroke();
          }
        }

        // Car chassis body
        const isLeadCar = (cIdx === 0);
        const carColor = fell ? '#ef4444' : isLeadCar ? '#0f766e' : '#0d9488';
        const carStroke = fell ? '#991b1b' : '#042f2c';

        // Soft ground shadow under car
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.beginPath();
        ctx.ellipse(0, 6, 14, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body shape (Aerodynamic nose cone for lead car)
        ctx.fillStyle = carColor;
        ctx.strokeStyle = carStroke;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        if (isLeadCar) {
          ctx.moveTo(-12, -8);
          ctx.lineTo(10, -8);
          ctx.quadraticCurveTo(15, -4, 15, 0);
          ctx.quadraticCurveTo(15, 4, 10, 4);
          ctx.lineTo(-12, 4);
          ctx.closePath();
        } else {
          ctx.roundRect(-12, -8, 24, 12, 3);
        }
        ctx.fill();
        ctx.stroke();

        // Chrome bumper / lap bar
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(-6, -11, 10, 3);

        // Passenger Silhouette with Hands in the Air!
        ctx.fillStyle = isLeadCar ? '#f59e0b' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(-2, -12, 3.5, 0, Math.PI * 2); // Head
        ctx.fill();
        // Arms up in excitement when dropping fast!
        if (curVelocity > 10 && !fell) {
          ctx.strokeStyle = ctx.fillStyle;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-2, -10);
          ctx.lineTo(3, -17);
          ctx.moveTo(-2, -10);
          ctx.lineTo(-7, -17);
          ctx.stroke();
        }

        // Lead Car Headlights with Volumetric Beam
        if (isLeadCar) {
          // Glow cone forward
          const gradBeam = ctx.createLinearGradient(12, -2, 55, -2);
          gradBeam.addColorStop(0, 'rgba(254, 240, 138, 0.6)');
          gradBeam.addColorStop(1, 'rgba(254, 240, 138, 0)');
          ctx.fillStyle = gradBeam;
          ctx.beginPath();
          ctx.moveTo(14, -4);
          ctx.lineTo(55, -12);
          ctx.lineTo(55, 4);
          ctx.lineTo(14, 0);
          ctx.closePath();
          ctx.fill();

          // Small headlight bulb
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(13, -2, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Metal Wheels & Bogie Assembly
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(-7, 4, 3, 0, Math.PI * 2);
        ctx.arc(7, 4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      }

      // 10. Free Body Diagram Vectors (On lead car)
      const leadCar = getTrackPosition(currentProg, width, height, initialHeight, loopRadius);
      if (showFBD) {
        ctx.save();
        ctx.translate(leadCar.x, leadCar.y);

        // F_gravity (always downward red vector)
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, 34);
        ctx.stroke();
        // Arrowhead
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(0, 36);
        ctx.lineTo(-4, 28);
        ctx.lineTo(4, 28);
        ctx.fill();
        ctx.font = 'bold 10px monospace';
        ctx.fillText('Fg (mg)', 6, 28);

        // Normal Force Vector N (green vector perpendicular to track)
        if (currentProg >= 0.35 && currentProg <= 0.75) {
          const normLength = Math.max(0, normalG * 18);
          const nx = ((loopCenterX - leadCar.x) / loopR) * normLength;
          const ny = ((loopCenterY - leadCar.y) / loopR) * normLength;
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(nx, ny);
          ctx.stroke();
          // Arrowhead
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(nx, ny, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillText(`N (${normalG.toFixed(1)}G)`, nx + 6, ny);
        }
        ctx.restore();
      }

      // 11. Embedded Cockpit G-Meter Arc Gauge (Canvas Top-Right)
      ctx.save();
      const gaugeX = width - 85;
      const gaugeY = 65;
      const gaugeR = 38;

      // Gauge background pod
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(gaugeX, gaugeY, gaugeR + 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Gauge arc track
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(gaugeX, gaugeY, gaugeR, Math.PI * 0.8, Math.PI * 2.2);
      ctx.stroke();

      // Active G-force arc
      const maxG = 6.0;
      const gRatio = Math.min(1.0, Math.max(0, normalG / maxG));
      const gAngle = Math.PI * 0.8 + gRatio * (Math.PI * 1.4);
      const gColor = normalG > 4.5 ? '#ef4444' : normalG > 2.8 ? '#f59e0b' : normalG < 0.2 ? '#06b6d4' : '#10b981';

      ctx.strokeStyle = gColor;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(gaugeX, gaugeY, gaugeR, Math.PI * 0.8, gAngle);
      ctx.stroke();

      // Needle pin
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(gaugeX, gaugeY, 4, 0, Math.PI * 2);
      ctx.fill();

      // G-force text readout
      ctx.fillStyle = gColor;
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${normalG.toFixed(1)} G`, gaugeX, gaugeY + 16);
      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText('ACCELEROMETER', gaugeX, gaugeY + 26);
      ctx.restore();

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [activeTab, initialHeight, loopRadius, mass, hasFriction, isPlaying, showFBD, showSparks, getTrackPosition]);

  // Handle direct Canvas dragging of Drop Height or Loop Radius
  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const { startX, startY, trackScale, loopCenterX, groundY } = getTrackPosition(0, canvas.width, canvas.height, initialHeight, loopRadius);
    const apexY = groundY - 2 * loopRadius * trackScale;

    // Check click near Drop Tower handle
    const distDrop = Math.hypot(clickX - startX, clickY - startY);
    if (distDrop < 25) {
      draggingHandleRef.current = 'drop';
      sounds.playTick();
      return;
    }

    // Check click near Loop Apex handle
    const distLoop = Math.hypot(clickX - loopCenterX, clickY - apexY);
    if (distLoop < 25) {
      draggingHandleRef.current = 'loop';
      sounds.playTick();
      return;
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!draggingHandleRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleY = canvas.height / rect.height;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const groundY = canvas.height - 70;
    const trackScale = (groundY - 60) / 50;

    if (draggingHandleRef.current === 'drop') {
      const newH = Math.max(10, Math.min(50, Math.round((groundY - mouseY) / trackScale)));
      if (newH !== initialHeight) {
        setInitialHeight(newH);
        sounds.playTick();
      }
    } else if (draggingHandleRef.current === 'loop') {
      const newApexH = (groundY - mouseY) / trackScale;
      const newR = Math.max(5, Math.min(18, Math.round(newApexH / 2)));
      if (newR !== loopRadius) {
        setLoopRadius(newR);
        sounds.playTick();
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (draggingHandleRef.current) {
      sounds.playSnap();
      draggingHandleRef.current = null;
    }
  };

  // Quiz submission handler
  const handleAnswerSubmit = (questionId, optionIndex, isCorrect) => {
    sounds.playClick();
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
    setChallengeFeedback(prev => ({
      ...prev,
      [questionId]: isCorrect ? 'correct' : 'incorrect'
    }));

    if (isCorrect && onUpdateScore) {
      sounds.playSuccess();
      onUpdateScore(20);
    }
  };

  return (
    <div className="space-y-6">
      {/* TAB 1: THEORY / HISTORICAL FLIP-FLAP COASATER CASE STUDY */}
      {activeTab === 'theory' && (
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
                <Gauge className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-sans text-on-surface">
                  Why Circular Loops Nearly Snapped Passengers' Necks
                </h2>
                <p className="text-xs font-mono text-on-surface-variant">
                  CASE STUDY: THE 1895 FLIP FLAP RAILWAY & CENTRIPETAL ACCELERATION
                </p>
              </div>
            </div>

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
                    onClick={() => { sounds.playTick(); setShowFBD(!showFBD); }}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all border ${
                      showFBD 
                        ? 'bg-teal-50 text-teal-700 border-teal-300 font-bold' 
                        : 'bg-white text-on-surface-variant border-outline-variant/30'
                    }`}
                  >
                    Force Vectors (FBD)
                  </button>

                  <button
                    onClick={() => { sounds.playTick(); setShowSparks(!showSparks); }}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition-all border ${
                      showSparks 
                        ? 'bg-amber-50 text-amber-700 border-amber-300 font-bold' 
                        : 'bg-white text-on-surface-variant border-outline-variant/30'
                    }`}
                  >
                    Wheel Sparks
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

              {/* HTML5 Canvas with On-Canvas Interactive Dragging */}
              <div className="relative w-full bg-surface-container-low select-none">
                <canvas 
                  ref={canvasRef}
                  width={760}
                  height={420}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  className="w-full h-auto block cursor-crosshair"
                />

                {/* Over-the-canvas Status Banner if Car Falls */}
                {telemetry.fellOff && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-mono font-bold flex items-center gap-2 shadow-md">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>INSUFFICIENT VELOCITY! COASTER DETACHED AT APEX (h &lt; 2.5r)</span>
                  </div>
                )}

                {/* Interactive Drag Hint Badge */}
                <div className="absolute bottom-2 left-3 px-2 py-1 rounded-md bg-white/80 backdrop-blur-sm border border-outline-variant/20 text-[10px] font-mono text-on-surface-variant flex items-center gap-1.5 pointer-events-none">
                  <Sliders className="w-3 h-3 text-teal-600" />
                  <span>Click & Drag drop tower handle or apex directly on canvas</span>
                </div>
              </div>

              {/* Real-Time Telemetry Readout Deck */}
              <div className="p-4 bg-surface-container-lowest border-t border-outline-variant/20 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20">
                  <div className="text-[10px] text-on-surface-variant uppercase">VELOCITY</div>
                  <div className="text-base font-bold text-on-surface">
                    {telemetry.velocity.toFixed(1)} <span className="text-xs font-normal">m/s</span>
                  </div>
                  <div className="text-[10px] text-on-surface-variant">
                    {(telemetry.velocity * 3.6).toFixed(0)} km/h
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20">
                  <div className="text-[10px] text-on-surface-variant uppercase">ELEVATION (h)</div>
                  <div className="text-base font-bold text-on-surface">
                    {telemetry.height.toFixed(1)} <span className="text-xs font-normal">m</span>
                  </div>
                  <div className="text-[10px] text-on-surface-variant">
                    Apex: {(2 * loopRadius).toFixed(1)} m
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20">
                  <div className="text-[10px] text-on-surface-variant uppercase">G-LOAD (NORMAL)</div>
                  <div className={`text-base font-bold ${
                    telemetry.gForce > 4.5 ? 'text-rose-600' : telemetry.gForce > 2.8 ? 'text-amber-600' : 'text-teal-700'
                  }`}>
                    {telemetry.gForce.toFixed(2)} G
                  </div>
                  <div className="text-[10px] text-on-surface-variant">
                    {telemetry.gForce < 0.2 ? 'Airtime Floating' : telemetry.gForce > 4 ? 'High G Compression' : 'Safe Passenger Range'}
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20">
                  <div className="text-[10px] text-on-surface-variant uppercase">KINETIC ENERGY</div>
                  <div className="text-base font-bold text-on-surface">
                    {(telemetry.ke / 1000).toFixed(0)} <span className="text-xs font-normal">kJ</span>
                  </div>
                  <div className="text-[10px] text-on-surface-variant">
                    PE: {(telemetry.pe / 1000).toFixed(0)} kJ
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right / Parameter Tuning Controls & Presets (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
                <Sliders className="w-4 h-4 text-teal-700" />
                <h3 className="text-sm font-bold font-sans text-on-surface">
                  Track Engineering Controls
                </h3>
              </div>

              {/* Slider 1: Initial Drop Height */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-on-surface-variant">Initial Drop Height (h)</span>
                  <span className="font-bold text-on-surface">{initialHeight} meters</span>
                </div>
                <input 
                  type="range"
                  min="10"
                  max="50"
                  step="1"
                  value={initialHeight}
                  onChange={(e) => {
                    sounds.playTick();
                    setInitialHeight(Number(e.target.value));
                  }}
                  className="w-full accent-teal-600"
                />
                <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
                  <span>10m</span>
                  <span className="text-amber-700 font-bold">Req: ≥ {criticalHeight.toFixed(1)}m</span>
                  <span>50m</span>
                </div>
              </div>

              {/* Slider 2: Loop Radius */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-on-surface-variant">Loop Radius (r)</span>
                  <span className="font-bold text-on-surface">{loopRadius} meters</span>
                </div>
                <input 
                  type="range"
                  min="5"
                  max="18"
                  step="1"
                  value={loopRadius}
                  onChange={(e) => {
                    sounds.playTick();
                    setLoopRadius(Number(e.target.value));
                  }}
                  className="w-full accent-teal-600"
                />
                <div className="flex justify-between text-[10px] text-on-surface-variant font-mono">
                  <span>5m (Tight)</span>
                  <span>Apex: {(2 * loopRadius).toFixed(0)}m</span>
                  <span>18m (Broad)</span>
                </div>
              </div>

              {/* Slider 3: Coaster Train Mass */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-on-surface-variant">Train Mass (m)</span>
                  <span className="font-bold text-on-surface">{mass} kg</span>
                </div>
                <input 
                  type="range"
                  min="400"
                  max="2500"
                  step="100"
                  value={mass}
                  onChange={(e) => {
                    sounds.playTick();
                    setMass(Number(e.target.value));
                  }}
                  className="w-full accent-teal-600"
                />
              </div>

              {/* Friction Toggle */}
              <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-on-surface">Mechanical Friction</div>
                  <div className="text-[10px] text-on-surface-variant font-mono">Track bearing rolling resistance</div>
                </div>
                <button
                  onClick={() => {
                    sounds.playTick();
                    setHasFriction(!hasFriction);
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    hasFriction ? 'bg-teal-600' : 'bg-slate-300'
                  }`}
                >
                  <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    hasFriction ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              {/* One-Click Presets */}
              <div className="pt-3 border-t border-outline-variant/20 space-y-2">
                <div className="text-xs font-mono text-on-surface-variant font-bold uppercase">
                  Analytical Scenario Presets
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setInitialHeight(20);
                      setLoopRadius(12);
                      handleReset();
                    }}
                    className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-mono text-left active:scale-[0.98] transition-transform"
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
                    className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-mono text-left active:scale-[0.98] transition-transform"
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
                { text: "h = 2.5 r (derivation from v_top = √(gr) and conservation of energy)", correct: true },
                { text: "h = 4.0 r", correct: false }
              ].map((opt, idx) => {
                const isSelected = selectedAnswers['q1'] === idx;
                const feedback = challengeFeedback['q1'];
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSubmit('q1', idx, opt.correct)}
                    className={`w-full p-3 rounded-xl border text-left text-xs font-sans transition-all flex items-center justify-between ${
                      isSelected 
                        ? opt.correct 
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                          : 'bg-rose-50 border-rose-400 text-rose-900'
                        : 'bg-surface-container-low border-outline-variant/20 hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    <span>{opt.text}</span>
                    {isSelected && (
                      opt.correct 
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        : <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 2 */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm space-y-3">
            <div className="text-xs font-mono text-on-surface-variant font-bold uppercase">
              Challenge 2 of 3 // G-Force Analysis
            </div>
            <h3 className="text-sm font-bold font-sans text-on-surface">
              If the starting drop height h is exactly the minimum critical value (2.5r), what will be the apparent G-force (normal force / mg) experienced by riders at the apex of the loop?
            </h3>

            <div className="space-y-2">
              {[
                { text: "0 G (Weightlessness / zero normal force against the track)", correct: true },
                { text: "1.0 G (Normal Earth gravity)", correct: false },
                { text: "2.5 G", correct: false },
                { text: "-1.0 G (Falling inward)", correct: false }
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
                        : 'bg-surface-container-low border-outline-variant/20 hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    <span>{opt.text}</span>
                    {isSelected && (
                      opt.correct 
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        : <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 3 */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm space-y-3">
            <div className="text-xs font-mono text-on-surface-variant font-bold uppercase">
              Challenge 3 of 3 // Clothoid Loop Engineering
            </div>
            <h3 className="text-sm font-bold font-sans text-on-surface">
              Why do modern roller coaster loops use a teardrop shape (Clothoid / Euler spiral) instead of a pure circle?
            </h3>

            <div className="space-y-2">
              {[
                { text: "Circles are too expensive to fabricate out of tubular steel", correct: false },
                { text: "Clothoids gradually decrease the radius of curvature, preventing lethal instant G-force spikes upon entry", correct: true },
                { text: "Circles cause the coaster train wheels to slip off horizontally", correct: false },
                { text: "Clothoids make the coaster car run at constant linear velocity", correct: false }
              ].map((opt, idx) => {
                const isSelected = selectedAnswers['q3'] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerSubmit('q3', idx, opt.correct)}
                    className={`w-full p-3 rounded-xl border text-left text-xs font-sans transition-all flex items-center justify-between ${
                      isSelected 
                        ? opt.correct 
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                          : 'bg-rose-50 border-rose-400 text-rose-900'
                        : 'bg-surface-container-low border-outline-variant/20 hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    <span>{opt.text}</span>
                    {isSelected && (
                      opt.correct 
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        : <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
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
