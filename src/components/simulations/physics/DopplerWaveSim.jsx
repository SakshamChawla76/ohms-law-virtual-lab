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
  Radio
} from 'lucide-react';
import { sounds } from '../../../engine/audioEffects';

export const DopplerWaveSim = ({ simulation, activeTab, onUpdateScore }) => {
  // Physical parameters
  const [sourceSpeed, setSourceSpeed] = useState(120); // m/s or px/s
  const [waveSpeed, setWaveSpeed] = useState(240); // speed of sound / wave
  const [sourceFrequency, setSourceFrequency] = useState(2.0); // Hz
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [preset, setPreset] = useState('subsonic'); // 'subsonic', 'sonic', 'supersonic', 'duck'
  const [isPlaying, setIsPlaying] = useState(true);

  // Source position & emitted wavefront rings
  const [sourceX, setSourceX] = useState(200);
  const [sourceY, setSourceY] = useState(180);
  const [rings, setRings] = useState([]); // array of { x, y, r, alpha }
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
        } catch (e) {}
        oscRef.current = null;
      }
      return;
    }

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscRef.current = osc;
      gainRef.current = gain;
    } catch (e) {
      console.warn('AudioContext error:', e);
    }

    return () => {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
        } catch (e) {}
        oscRef.current = null;
      }
    };
  }, [soundEnabled]);

  // Main 60 FPS animation loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      if (isPlaying) {
        // Move source
        setSourceX(prevX => {
          let nextX = prevX + sourceSpeed * dt;
          if (nextX > 740) {
            nextX = 80;
            setRings([]); // clear rings on wrap
          }
          return nextX;
        });

        // Emit rings according to frequency f0
        const emitPeriod = 1.0 / sourceFrequency;
        if (currentTime - lastEmitTimeRef.current >= emitPeriod * 1000) {
          lastEmitTimeRef.current = currentTime;
          setRings(prev => [
            ...prev,
            { x: sourceX, y: sourceY, r: 0, initialTime: currentTime }
          ]);
        }

        // Expand existing rings
        setRings(prev => 
          prev
            .map(ring => ({
              ...ring,
              r: ring.r + waveSpeed * dt
            }))
            .filter(ring => ring.r < 650)
        );

        // Update real-time tone based on source relative to observer at x=450
        if (soundEnabled && oscRef.current && audioCtxRef.current) {
          const obsX = 450;
          const isApproaching = sourceX < obsX;
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

      // Draw to Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Background - subtle laboratory water pond mat
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

        // Draw wavefront rings
        rings.forEach((ring, idx) => {
          const alpha = Math.max(0.1, 1 - (ring.r / 550));
          ctx.strokeStyle = sourceSpeed >= waveSpeed 
            ? `rgba(220, 38, 38, ${alpha})` 
            : `rgba(14, 116, 144, ${alpha})`;
          ctx.lineWidth = sourceSpeed >= waveSpeed ? 2 : 1.5;
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
          ctx.stroke();
        });

        // If supersonic, draw Mach Cone envelope lines
        if (sourceSpeed > waveSpeed && machAngle !== null) {
          const angleRad = (machAngle * Math.PI) / 180;
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 4]);

          // Top Mach line
          ctx.beginPath();
          ctx.moveTo(sourceX, sourceY);
          ctx.lineTo(sourceX - 350 * Math.cos(angleRad), sourceY - 350 * Math.sin(angleRad));
          ctx.stroke();

          // Bottom Mach line
          ctx.beginPath();
          ctx.moveTo(sourceX, sourceY);
          ctx.lineTo(sourceX - 350 * Math.cos(angleRad), sourceY + 350 * Math.sin(angleRad));
          ctx.stroke();

          ctx.setLineDash([]);

          // Mach Cone label
          ctx.fillStyle = '#dc2626';
          ctx.font = 'bold 11px monospace';
          ctx.fillText(`Shock Cone: θ = ${machAngle}° (M = ${machNumber})`, sourceX - 160, sourceY - 30);
        }

        // Draw Moving Emitter Source
        ctx.save();
        ctx.translate(sourceX, sourceY);

        if (preset === 'duck') {
          // Yellow Duck icon
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
          // Eye
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(12, -8, 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Sleek scientific wave generator / vehicle
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Pulse center
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(0, 0, 4, 0, Math.PI * 2);
          ctx.fill();

          // Velocity vector arrow
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
        ctx.fillText(`Source: ${sourceSpeed} m/s`, sourceX - 35, sourceY - 20);
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [isPlaying, sourceSpeed, waveSpeed, sourceFrequency, sourceX, sourceY, rings, soundEnabled, preset, machAngle, machNumber]);

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
              {simulation.name}
            </h2>

            <p className="text-sm font-semibold text-sky-800 italic">
              "{simulation.curiosityQuestion}"
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
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>

          {/* HTML5 Canvas Display */}
          <div className="relative rounded-2xl border border-slate-300 bg-white shadow-sm overflow-hidden">
            <canvas
              ref={canvasRef}
              width={760}
              height={360}
              className="w-full h-auto block"
            />

            {/* Overlaid Telemetry Badges */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2 pointer-events-none">
              <div className="px-2.5 py-1 rounded-md bg-white/90 backdrop-blur border border-slate-200 text-[11px] font-mono shadow-sm">
                <span className="text-slate-500">Source Speed: </span>
                <span className="font-bold text-slate-800">{sourceSpeed} m/s</span>
              </div>
              <div className="px-2.5 py-1 rounded-md bg-white/90 backdrop-blur border border-slate-200 text-[11px] font-mono shadow-sm">
                <span className="text-slate-500">Wave Speed (v): </span>
                <span className="font-bold text-slate-800">{waveSpeed} m/s</span>
              </div>
              <div className="px-2.5 py-1 rounded-md bg-white/90 backdrop-blur border border-slate-200 text-[11px] font-mono shadow-sm">
                <span className="text-slate-500">Mach Number: </span>
                <span className={`font-bold ${machNumber >= 1.0 ? 'text-rose-600' : 'text-blue-600'}`}>
                  M = {machNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Controls & Live Physics Readouts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Control 1: Source Speed */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-slate-700">Source Speed (v_s):</span>
                <span className="font-bold text-sky-700">{sourceSpeed} m/s</span>
              </div>
              <input
                type="range"
                min={0}
                max={400}
                step={10}
                value={sourceSpeed}
                onChange={(e) => {
                  setSourceSpeed(Number(e.target.value));
                  setPreset('custom');
                }}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>0 (Stationary)</span>
                <span>240 (Sonic)</span>
                <span>400 (Mach 1.67)</span>
              </div>
            </div>

            {/* Control 2: Wave Medium Speed */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-slate-700">Medium Wave Speed (v):</span>
                <span className="font-bold text-indigo-700">{waveSpeed} m/s</span>
              </div>
              <input
                type="range"
                min={100}
                max={350}
                step={10}
                value={waveSpeed}
                onChange={(e) => {
                  setWaveSpeed(Number(e.target.value));
                  setPreset('custom');
                }}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>100 m/s (Ripples)</span>
                <span>240 m/s</span>
                <span>350 m/s (Air)</span>
              </div>
            </div>

            {/* Control 3: Emitted Frequency */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-slate-700">Source Frequency (f_0):</span>
                <span className="font-bold text-emerald-700">{sourceFrequency} Hz</span>
              </div>
              <input
                type="range"
                min={1.0}
                max={4.0}
                step={0.5}
                value={sourceFrequency}
                onChange={(e) => setSourceFrequency(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>1.0 Hz (Slow)</span>
                <span>2.5 Hz</span>
                <span>4.0 Hz (Rapid)</span>
              </div>
            </div>
          </div>

          {/* Telemetry Equation Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-xs font-mono font-bold text-slate-700 uppercase">
              Doppler Effect Mathematical Relations:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded bg-white border border-slate-200 text-slate-700">
                <span className="font-bold text-blue-700">Approaching Observer: </span>
                <span>{"f' = f_0 · [v / (v - v_s)]"}</span>
                <div className="text-[11px] text-slate-500 mt-1">
                  {"f' = "}{f0}{" · ["}{waveSpeed}{" / ("}{waveSpeed}{" - "}{sourceSpeed}{")] = "}{fAhead}{" Hz"}
                </div>
              </div>
              <div className="p-2.5 rounded bg-white border border-slate-200 text-slate-700">
                <span className="font-bold text-orange-700">Receding Observer: </span>
                <span>{"f'' = f_0 · [v / (v + v_s)]"}</span>
                <div className="text-[11px] text-slate-500 mt-1">
                  {"f'' = "}{f0}{" · ["}{waveSpeed}{" / ("}{waveSpeed}{" + "}{sourceSpeed}{")] = "}{fBehind}{" Hz"}
                </div>
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
                REAL-WORLD TECHNOLOGIES & NATURE
              </div>
              <h3 className="text-xl font-bold font-sans text-slate-900">
                Everyday Applications of the Doppler Effect
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-mono font-bold text-sky-800 uppercase">
                  1. Police Radar & Speed Guns
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Police speed guns emit a known microwave frequency at an oncoming vehicle. The reflected signal returns frequency-shifted proportional to vehicle speed: Δf = 2·f0·(v/c). The onboard DSP computes instantaneous speed in milliseconds.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-mono font-bold text-emerald-800 uppercase">
                  2. Doppler Echocardiogram
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Cardiologists bounce high-frequency ultrasound off circulating red blood cells. By tracking Doppler frequency shifts across heart valves, ultrasound scanners render color-coded blood velocity maps to diagnose aortic stenosis and regurgitation.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-mono font-bold text-indigo-800 uppercase">
                  3. Cosmological Redshift & Expanding Universe
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Astronomers measuring light spectra from distant galaxies observed hydrogen absorption lines shifted toward lower red frequencies. Edwin Hubble proved this cosmological Doppler shift confirms the universe is continuously expanding.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-mono font-bold text-amber-800 uppercase">
                  4. NEXRAD Doppler Weather Radar
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Meteorologists use pulse-Doppler radar to track raindrops and hail. Measuring whether precipitation is moving toward or away from the station allows meteorologists to detect rotation inside supercells 30 minutes before a tornado touches down.
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
                CONCEPTUAL MASTERY CHALLENGE
              </div>
              <h3 className="text-xl font-bold font-sans text-slate-900">
                Wave Mechanics Inquiry Assessment
              </h3>
            </div>

            <div className="space-y-4">
              {/* Question 1 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-mono font-bold text-slate-800">
                  Q1: An ambulance siren emits sound at 500 Hz. If it speeds toward a stationary listener at 34 m/s (speed of sound = 340 m/s), what frequency does the listener hear?
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {[
                    { text: 'A) 450 Hz', correct: false },
                    { text: 'B) 500 Hz', correct: false },
                    { text: 'C) 555.6 Hz', correct: true },
                    { text: 'D) 680 Hz', correct: false }
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
                      ? '✓ Correct! f\' = 500 · (340 / (340 - 34)) = 500 · (340 / 306) ≈ 555.6 Hz.' 
                      : '✗ Incorrect. Use the Doppler formula for an approaching source: f\' = f0 · [v / (v - vs)].'}
                  </p>
                )}
              </div>

              {/* Question 2 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-mono font-bold text-slate-800">
                  Q2: What occurs when a supersonic fighter jet accelerates past the speed of sound (v_s &gt; v)?
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {[
                    { text: 'A) Sound waves stop propagating completely', correct: false },
                    { text: 'B) A conical shock envelope (Mach cone) forms behind the craft', correct: true },
                    { text: 'C) The emitted frequency becomes negative', correct: false },
                    { text: 'D) The wave speed increases to catch up with the jet', correct: false }
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
                      ? '✓ Correct! Constructive interference of spherical wavefronts produces a high-pressure conical shock envelope with half-angle sin(θ) = v/vs.' 
                      : '✗ Incorrect. As the source outruns its own wavefronts, the spheres overlap tangentially to form the Mach cone.'}
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
