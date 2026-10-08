import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Gauge, 
  Volume2, 
  VolumeX, 
  Layers, 
  ShieldCheck, 
  Waves, 
  Compass,
  Radio,
  Sliders,
  Activity
} from 'lucide-react';
import { sounds } from '../../../engine/audioEffects';

export const DopplerWaveSim = ({ simulation = {}, activeTab = 'sandbox', onUpdateScore }) => {
  // Physical parameters
  const [sourceSpeed, setSourceSpeed] = useState(120); // m/s or px/s
  const [waveSpeed, setWaveSpeed] = useState(240); // speed of sound / wave
  const [sourceFrequency, setSourceFrequency] = useState(2.0); // Hz
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [preset, setPreset] = useState('subsonic'); // 'subsonic', 'sonic', 'supersonic', 'duck'
  const [isPlaying, setIsPlaying] = useState(true);
  const [showOscilloscope, setShowOscilloscope] = useState(true);

  // Source position & emitted wavefront rings
  const [sourceX, setSourceX] = useState(200);
  const [sourceY, setSourceY] = useState(180);
  const [rings, setRings] = useState([]);
  const [timeStep, setTimeStep] = useState(0);

  // Audio tone generation using Web Audio API
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);
  const gainRef = useRef(null);

  // Challenges
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [challengeFeedback, setChallengeFeedback] = useState({});

  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const lastEmitTimeRef = useRef(0);
  const isDraggingSourceRef = useRef(false);

  // Physical calculations
  const machNumber = Number((sourceSpeed / waveSpeed).toFixed(2));
  const f0 = sourceFrequency;
  // Ahead frequency: f' = f0 * (v / (v - vs)) (if vs < v)
  const fAhead = sourceSpeed < waveSpeed 
    ? Number((f0 * (waveSpeed / (waveSpeed - sourceSpeed))).toFixed(1)) 
    : 'Infinity (Shockwave)';
  // Behind frequency: f'' = f0 * (v / (v + vs))
  const fBehind = Number((f0 * (waveSpeed / (waveSpeed + sourceSpeed))).toFixed(1));
  const machAngle = sourceSpeed > waveSpeed 
    ? Number(((Math.asin(waveSpeed / sourceSpeed) * 180) / Math.PI).toFixed(1)) 
    : null;

  // Handle Preset selection
  const applyPreset = (type) => {
    sounds.playSnap();
    setPreset(type);
    if (type === 'duck') {
      setSourceSpeed(40);
      setWaveSpeed(120);
      setSourceFrequency(1.5);
    } else if (type === 'subsonic') {
      setSourceSpeed(120);
      setWaveSpeed(240);
      setSourceFrequency(2.0);
    } else if (type === 'sonic') {
      setSourceSpeed(240);
      setWaveSpeed(240);
      setSourceFrequency(2.5);
    } else if (type === 'supersonic') {
      setSourceSpeed(360);
      setWaveSpeed(240);
      setSourceFrequency(3.0);
    }
    setRings([]);
    setSourceX(120);
  };

  // Reset simulation
  const handleReset = () => {
    sounds.playSnap();
    setSourceX(120);
    setRings([]);
    setTimeStep(0);
    setIsPlaying(true);
  };

  // Audio tone management
  useEffect(() => {
    if (!soundEnabled) {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
        } catch {}
        oscRef.current = null;
      }
      return;
    }

    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscRef.current = osc;
      gainRef.current = gain;
    } catch {}

    return () => {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
        } catch {}
      }
    };
  }, [soundEnabled]);

  // Main 60 FPS Doppler wavefront propagation
  useEffect(() => {
    if (activeTab !== 'sandbox') return;

    let lastTime = performance.now();
    let currentX = sourceX;
    let ringList = [...rings];
    let oscPhase = 0;

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;
      oscPhase += dt * 8;

      if (isPlaying && !isDraggingSourceRef.current) {
        // Move source forward
        currentX += sourceSpeed * dt;
        if (currentX > 730) {
          currentX = 80;
          ringList = [];
        }
        setSourceX(currentX);

        // Emit rings
        const emitPeriod = 1.0 / sourceFrequency;
        if (currentTime - lastEmitTimeRef.current >= emitPeriod * 1000) {
          lastEmitTimeRef.current = currentTime;
          ringList.push({
            x: currentX,
            y: sourceY,
            r: 0,
            initialTime: currentTime
          });
        }

        // Expand existing rings
        ringList = ringList
          .map(ring => ({
            ...ring,
            r: ring.r + waveSpeed * dt
          }))
          .filter(ring => ring.r < 650);

        setRings(ringList);

        // Update real-time tone
        if (soundEnabled && oscRef.current && audioCtxRef.current) {
          const obsX = 680;
          const isApproaching = currentX < obsX;
          const baseFreq = 440;
          let shiftFactor = 1.0;
          if (isApproaching) {
            shiftFactor = waveSpeed / Math.max(waveSpeed - sourceSpeed, 20);
          } else {
            shiftFactor = waveSpeed / (waveSpeed + sourceSpeed);
          }
          const targetFreq = Math.min(Math.max(baseFreq * shiftFactor, 100), 2000);
          oscRef.current.frequency.setTargetAtTime(targetFreq, audioCtxRef.current.currentTime, 0.05);
        }
      }

      // Draw onto Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height);

        // Background
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, width, height);

        // Grid lines
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

        // Center trajectory line
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(40, sourceY);
        ctx.lineTo(width - 40, sourceY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Stationary Observer Sensor A (Ahead)
        const obsAX = 680;
        const obsAY = 180;
        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.arc(obsAX, obsAY, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1d4ed8';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText('Observer A (Ahead)', obsAX - 48, obsAY + 26);
        ctx.font = '10px monospace';
        ctx.fillStyle = '#2563eb';
        ctx.fillText(`f' = ${fAhead} Hz`, obsAX - 35, obsAY + 38);

        // Stationary Observer Sensor B (Behind)
        const obsBX = 80;
        const obsBY = 180;
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(obsBX, obsBY, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#c2410c';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText('Observer B (Behind)', obsBX - 48, obsBY + 26);
        ctx.font = '10px monospace';
        ctx.fillStyle = '#ea580c';
        ctx.fillText(`f'' = ${fBehind} Hz`, obsBX - 35, obsBY + 38);

        // If supersonic, draw Mach Cone envelope lines with radiant pressure glow
        if (sourceSpeed > waveSpeed && machAngle !== null) {
          const angleRad = (machAngle * Math.PI) / 180;

          // Shock cone soft gradient
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(currentX, sourceY);
          ctx.lineTo(currentX - 400 * Math.cos(angleRad), sourceY - 400 * Math.sin(angleRad));
          ctx.lineTo(currentX - 400 * Math.cos(angleRad), sourceY + 400 * Math.sin(angleRad));
          ctx.closePath();
          ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
          ctx.fill();
          ctx.restore();

          // Top & bottom Mach shock lines
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 4]);
          ctx.beginPath();
          ctx.moveTo(currentX, sourceY);
          ctx.lineTo(currentX - 400 * Math.cos(angleRad), sourceY - 400 * Math.sin(angleRad));
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(currentX, sourceY);
          ctx.lineTo(currentX - 400 * Math.cos(angleRad), sourceY + 400 * Math.sin(angleRad));
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#dc2626';
          ctx.font = 'bold 11px monospace';
          ctx.fillText(`Shock Cone: θ = ${machAngle}° (M = ${machNumber})`, currentX - 160, sourceY - 32);
        }

        // Draw wavefront rings
        ringList.forEach((ring) => {
          const alpha = Math.max(0.12, 1 - (ring.r / 550));
          ctx.strokeStyle = sourceSpeed >= waveSpeed 
            ? `rgba(220, 38, 38, ${alpha})` 
            : `rgba(14, 116, 144, ${alpha})`;
          ctx.lineWidth = sourceSpeed >= waveSpeed ? 2.5 : 1.8;
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
          ctx.stroke();
        });

        // Draw Moving Emitter Source
        ctx.save();
        ctx.translate(currentX, sourceY);

        if (preset === 'duck') {
          // Cute swimming duck
          ctx.fillStyle = '#eab308';
          ctx.beginPath();
          ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(10, -6, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.moveTo(16, -6);
          ctx.lineTo(24, -4);
          ctx.lineTo(16, -2);
          ctx.fill();
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(12, -8, 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // High-tech sound emitter vehicle
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Pulsing core
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(0, 0, 4, 0, Math.PI * 2);
          ctx.fill();

          // Forward velocity arrow
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(36, 0);
          ctx.stroke();
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.moveTo(42, 0);
          ctx.lineTo(34, -4);
          ctx.lineTo(34, 4);
          ctx.fill();
        }

        ctx.restore();

        // Source label
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.fillText(`Source: ${sourceSpeed} m/s`, currentX - 35, sourceY - 20);

        // Embedded Oscilloscope Panels (Top-left & Top-right)
        if (showOscilloscope) {
          // Observer B Oscilloscope (Behind - Low Frequency Stretched)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.roundRect(30, 20, 140, 50, 8);
          ctx.fill();
          ctx.strokeStyle = '#cbd5e1';
          ctx.stroke();

          ctx.fillStyle = '#ea580c';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('OBSERVER B WAVEFORM', 36, 32);

          // Stretched sine wave
          ctx.strokeStyle = '#ea580c';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let px = 0; px < 120; px++) {
            const py = 48 + Math.sin(px * 0.08 - oscPhase * 0.6) * 10;
            if (px === 0) ctx.moveTo(38 + px, py);
            else ctx.lineTo(38 + px, py);
          }
          ctx.stroke();

          // Observer A Oscilloscope (Ahead - High Frequency Compressed)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.roundRect(width - 170, 20, 140, 50, 8);
          ctx.fill();
          ctx.strokeStyle = '#cbd5e1';
          ctx.stroke();

          ctx.fillStyle = '#2563eb';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('OBSERVER A WAVEFORM', width - 164, 32);

          // Compressed sine wave
          ctx.strokeStyle = '#2563eb';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let px = 0; px < 120; px++) {
            const py = 48 + Math.sin(px * 0.28 - oscPhase * 2.2) * 10;
            if (px === 0) ctx.moveTo(width - 162 + px, py);
            else ctx.lineTo(width - 162 + px, py);
          }
          ctx.stroke();
        }
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [activeTab, isPlaying, sourceSpeed, waveSpeed, sourceFrequency, sourceX, sourceY, rings, soundEnabled, preset, machAngle, machNumber, showOscilloscope]);

  // Handle direct Canvas dragging of Source
  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const clickX = (e.clientX - rect.left) * scaleX;

    if (Math.abs(clickX - sourceX) < 35) {
      isDraggingSourceRef.current = true;
      sounds.playTick();
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDraggingSourceRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;

    const newX = Math.max(80, Math.min(680, mouseX));
    setSourceX(newX);
  };

  const handleCanvasMouseUp = () => {
    if (isDraggingSourceRef.current) {
      sounds.playSnap();
      isDraggingSourceRef.current = false;
    }
  };

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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              PHYSICS OF WAVE MOTION & PERCEPTION
            </div>

            <h2 className="text-2xl md:text-3xl font-bold font-sans text-slate-900 tracking-tight">
              {simulation.name || "Doppler Effect & Mach Shockwaves"}
            </h2>

            <p className="text-sm font-semibold text-sky-800 italic">
              "{simulation.curiosityQuestion || "Why does a passing siren drop suddenly in pitch?"}"
            </p>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              When a wave source moves through a medium, each successive circular wave crest is emitted from a position closer to the crest preceding it in the direction of motion. Ahead of the moving source, crests bunch tightly together, compressing the apparent wavelength and elevating the perceived frequency. Behind the source, crests stretch apart, producing an elongated wavelength and lower pitch.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-mono text-slate-500 uppercase">Subsonic (v_s &lt; v)</div>
                <div className="text-sm font-bold text-slate-800 mt-1">Pitch Shift</div>
                <p className="text-[11px] text-slate-600 mt-1">Crests compress ahead, stretch behind. Audible high-to-low siren drop.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-mono text-slate-500 uppercase">Sonic Barrier (v_s = v)</div>
                <div className="text-sm font-bold text-slate-800 mt-1">Wavefront Pileup</div>
                <p className="text-[11px] text-slate-600 mt-1">Source moves at the wave speed. Crests pile up into an intense pressure barrier.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-mono text-slate-500 uppercase">Supersonic (v_s &gt; v)</div>
                <div className="text-sm font-bold text-slate-800 mt-1">Mach Cone Shockwave</div>
                <p className="text-[11px] text-slate-600 mt-1">Source outruns waves, producing a conical shock envelope and sonic boom.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE SANDBOX */}
      {activeTab === 'sandbox' && (
        <div className="space-y-5 text-left">
          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-600 uppercase">Lab Scenarios:</span>
              <button
                onClick={() => applyPreset('duck')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                  preset === 'duck' ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🦆 Swimming Duck
              </button>
              <button
                onClick={() => applyPreset('subsonic')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                  preset === 'subsonic' ? 'bg-sky-100 text-sky-900 border-sky-300' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🚑 Siren (Subsonic)
              </button>
              <button
                onClick={() => applyPreset('sonic')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                  preset === 'sonic' ? 'bg-indigo-100 text-indigo-900 border-indigo-300' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                ⚡ Mach 1.0 (Sonic Barrier)
              </button>
              <button
                onClick={() => applyPreset('supersonic')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${
                  preset === 'supersonic' ? 'bg-rose-100 text-rose-900 border-rose-300' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🚀 Mach 1.5 (Supersonic Jet)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowOscilloscope(!showOscilloscope)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                  showOscilloscope ? 'bg-sky-50 text-sky-800 border-sky-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Oscilloscope HUD
              </button>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                  soundEnabled ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                {soundEnabled ? 'Live Tone: ON' : 'Audio Tone: Muted'}
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200"
                title="Reset simulation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Canvas with Direct Source Dragging */}
          <div className="relative w-full rounded-2xl border border-slate-200 shadow-sm overflow-hidden bg-slate-50 select-none">
            <canvas
              ref={canvasRef}
              width={760}
              height={360}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              className="w-full h-auto block cursor-ew-resize"
            />

            <div className="absolute bottom-2 left-3 px-2 py-1 rounded-md bg-white/80 backdrop-blur-sm border border-slate-200 text-[10px] font-mono text-slate-500 pointer-events-none">
              Drag sound source vehicle on canvas to adjust position
            </div>
          </div>

          {/* Controls Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-600 font-bold">SOURCE SPEED (v_s):</span>
                <span className="font-bold text-slate-800">{sourceSpeed} m/s</span>
              </div>
              <input
                type="range"
                min={0}
                max={480}
                step={10}
                value={sourceSpeed}
                onChange={(e) => {
                  sounds.playTick();
                  setSourceSpeed(Number(e.target.value));
                }}
                className="w-full accent-slate-700 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>0 m/s</span>
                <span className="text-indigo-600 font-bold">Mach 1: {waveSpeed} m/s</span>
                <span>480 m/s</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-600 font-bold">WAVE PROPAGATION SPEED (v):</span>
                <span className="font-bold text-slate-800">{waveSpeed} m/s</span>
              </div>
              <input
                type="range"
                min={100}
                max={400}
                step={20}
                value={waveSpeed}
                onChange={(e) => {
                  sounds.playTick();
                  setWaveSpeed(Number(e.target.value));
                }}
                className="w-full accent-slate-700 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-600 font-bold">SOURCE FREQUENCY (f₀):</span>
                <span className="font-bold text-slate-800">{sourceFrequency.toFixed(1)} Hz</span>
              </div>
              <input
                type="range"
                min={1.0}
                max={5.0}
                step={0.5}
                value={sourceFrequency}
                onChange={(e) => {
                  sounds.playTick();
                  setSourceFrequency(Number(e.target.value));
                }}
                className="w-full accent-slate-700 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CHALLENGES */}
      {activeTab === 'challenges' && (
        <div className="max-w-3xl mx-auto space-y-5 text-left">
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs font-sans">
            <strong>Wave Kinematics Laboratory:</strong> Test your understanding of frequency compression and sonic barriers. Earn up to 75 laboratory score points!
          </div>

          {/* Question 1 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase">
              Challenge 1 of 2 // Doppler Frequency Shift
            </div>
            <h3 className="text-sm font-bold font-sans text-slate-900">
              When an ambulance approaches a stationary observer at half the speed of sound (v_s = 0.5 v), what happens to the perceived frequency f'?
            </h3>

            <div className="space-y-2">
              {[
                { text: "It doubles: f' = f₀ · [v / (v - 0.5v)] = 2 · f₀", correct: true },
                { text: "It drops by half", correct: false },
                { text: "It remains completely unchanged", correct: false },
                { text: "It becomes zero", correct: false }
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
