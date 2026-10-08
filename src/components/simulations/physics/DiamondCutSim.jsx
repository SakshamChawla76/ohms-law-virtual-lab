import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  Gauge, 
  CheckCircle2, 
  Award, 
  ChevronRight,
  ShieldCheck,
  Eye,
  Sliders
} from 'lucide-react';
import { sounds } from '../../../engine/audioEffects';

export const DiamondCutSim = ({ activeTab, onUpdateScore }) => {
  // Material preset
  const [material, setMaterial] = useState('diamond'); // 'diamond' | 'zirconia' | 'glass'
  const [cutQuality, setCutQuality] = useState('ideal'); // 'ideal' | 'shallow' | 'deep'
  const [incidentAngleDeg, setIncidentAngleDeg] = useState(15);
  const [showRays, setShowRays] = useState(true);
  const [showCaustics, setShowCaustics] = useState(true);

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [challengeFeedback, setChallengeFeedback] = useState({});

  const canvasRef = useRef(null);
  const isDraggingLaserRef = useRef(false);
  const glintAngleRef = useRef(0);

  // Material Refractive Indices
  const MATERIALS = {
    diamond: { name: 'Diamond', n: 2.42, criticalAngle: 24.4, color: '#38bdf8', dispersion: 0.044 },
    zirconia: { name: 'Cubic Zirconia', n: 2.15, criticalAngle: 27.7, color: '#a78bfa', dispersion: 0.060 },
    glass: { name: 'Crown Glass', n: 1.52, criticalAngle: 41.1, color: '#94a3b8', dispersion: 0.015 }
  };

  const currentMat = MATERIALS[material];

  // Calculate Sparkle Efficiency based on cut and n
  let sparklePercent = 94;
  if (material === 'diamond') {
    if (cutQuality === 'ideal') sparklePercent = 96;
    else if (cutQuality === 'shallow') sparklePercent = 38;
    else sparklePercent = 42;
  } else if (material === 'zirconia') {
    if (cutQuality === 'ideal') sparklePercent = 78;
    else sparklePercent = 25;
  } else {
    sparklePercent = cutQuality === 'ideal' ? 44 : 15;
  }

  // Draw Ray Optics on Canvas
  useEffect(() => {
    if (activeTab !== 'sandbox') return;
    let animId;

    const render = () => {
      glintAngleRef.current += 0.04;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Pale grid
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

      const cx = width / 2;
      const cy = height / 2 + 10;

      // Gemstone Facet Geometry
      let tableHalfW = 90;
      let girdleHalfW = 160;
      let crownTopY = cy - 70;
      let girdleY = cy - 10;
      let culetY = cy + 120;

      if (cutQuality === 'shallow') {
        culetY = cy + 60;
      } else if (cutQuality === 'deep') {
        culetY = cy + 180;
      }

      // Soft caustic glow behind pavilion
      if (showCaustics) {
        const radGlow = ctx.createRadialGradient(cx, cy + 20, 10, cx, cy + 20, 140);
        radGlow.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
        radGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = radGlow;
        ctx.fillRect(cx - 160, cy - 80, 320, 260);
      }

      // Gemstone outline & crystal body
      const gradBody = ctx.createLinearGradient(cx, crownTopY, cx, culetY);
      gradBody.addColorStop(0, 'rgba(240, 249, 255, 0.85)');
      gradBody.addColorStop(0.6, 'rgba(224, 242, 254, 0.65)');
      gradBody.addColorStop(1, 'rgba(186, 230, 253, 0.45)');
      ctx.fillStyle = gradBody;
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      // Top table facet
      ctx.moveTo(cx - tableHalfW, crownTopY);
      ctx.lineTo(cx + tableHalfW, crownTopY);
      // Upper crown facets
      ctx.lineTo(cx + girdleHalfW, girdleY);
      // Bottom culet (pavilion)
      ctx.lineTo(cx, culetY);
      ctx.lineTo(cx - girdleHalfW, girdleY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Internal facet lines
      ctx.strokeStyle = '#93c5fd';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - tableHalfW, crownTopY);
      ctx.lineTo(cx, culetY);
      ctx.moveTo(cx + tableHalfW, crownTopY);
      ctx.lineTo(cx, culetY);
      ctx.moveTo(cx - girdleHalfW, girdleY);
      ctx.lineTo(cx + girdleHalfW, girdleY);
      ctx.stroke();

      // Light Ray Tracing
      if (showRays) {
        const incRad = (incidentAngleDeg * Math.PI) / 180;
        const rayEntryX = cx - 35;
        const rayEntryY = crownTopY;
        const rayStartX = rayEntryX - Math.sin(incRad) * 130;
        const rayStartY = rayEntryY - Math.cos(incRad) * 130;

        // Incident White Laser Light (Gradient glow)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(rayStartX, rayStartY);
        ctx.lineTo(rayEntryX, rayEntryY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draggable Laser Emitter Handle on canvas
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(rayStartX, rayStartY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Spectral Rainbow Colors for Cauchy Dispersion
        const spectralRays = [
          { color: '#ef4444', nOffset: -0.015, label: 'Red (700nm)' },
          { color: '#10b981', nOffset: 0.0, label: 'Green (546nm)' },
          { color: '#8b5cf6', nOffset: 0.025, label: 'Violet (405nm)' }
        ];

        const isTIRSuccess = (cutQuality === 'ideal' && currentMat.criticalAngle < 30);

        spectralRays.forEach((spec, sIdx) => {
          const effN = currentMat.n + spec.nOffset;
          const theta2 = Math.asin(Math.sin(incRad) / effN);

          const pavRightX = cx + (girdleHalfW * (1 - (cutQuality === 'deep' ? 0.35 : 0.5))) + (sIdx - 1) * 3;
          const pavRightY = girdleY + (culetY - girdleY) * 0.45;

          // Ray 1: Entry to Right Pavilion Facet
          ctx.strokeStyle = spec.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(rayEntryX, rayEntryY);
          ctx.lineTo(pavRightX, pavRightY);
          ctx.stroke();

          if (isTIRSuccess) {
            // Total Internal Reflection 1: Bounce from Right Pavilion to Left Pavilion
            const pavLeftX = cx - 70 + (sIdx - 1) * 4;
            const pavLeftY = girdleY + (culetY - girdleY) * 0.35;

            ctx.beginPath();
            ctx.moveTo(pavRightX, pavRightY);
            ctx.lineTo(pavLeftX, pavLeftY);
            ctx.stroke();

            // Total Internal Reflection 2: Bounce from Left Pavilion to Top Crown Exit
            const exitX = cx + 25 + (sIdx - 1) * 6;
            const exitY = crownTopY;

            ctx.beginPath();
            ctx.moveTo(pavLeftX, pavLeftY);
            ctx.lineTo(exitX, exitY);
            ctx.stroke();

            // Emergent Rainbow Beams shooting out top crown into viewer's eye
            ctx.beginPath();
            ctx.moveTo(exitX, exitY);
            ctx.lineTo(exitX + (sIdx - 1) * 26 + 15, exitY - 120);
            ctx.stroke();
          } else {
            // Light Leaks out of pavilion bottom (Shallow / Deep cut or Glass)
            ctx.strokeStyle = spec.color;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(pavRightX, pavRightY);
            ctx.lineTo(pavRightX + 50 + (sIdx - 1) * 10, pavRightY + 70);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        });

        if (!isTIRSuccess) {
          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 11px monospace';
          ctx.fillText('LIGHT LEAKS (LOST BRILLIANCE)', cx + 20, culetY + 25);
        } else {
          // Sparkle Glints on the crown
          const glintX = cx + 25;
          const glintY = crownTopY;
          const glintSize = 6 + Math.sin(glintAngleRef.current) * 3;

          ctx.save();
          ctx.translate(glintX, glintY);
          ctx.rotate(glintAngleRef.current * 0.5);
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(0, -glintSize * 2);
          ctx.lineTo(glintSize * 0.4, -glintSize * 0.4);
          ctx.lineTo(glintSize * 2, 0);
          ctx.lineTo(glintSize * 0.4, glintSize * 0.4);
          ctx.lineTo(0, glintSize * 2);
          ctx.lineTo(-glintSize * 0.4, glintSize * 0.4);
          ctx.lineTo(-glintSize * 2, 0);
          ctx.lineTo(-glintSize * 0.4, -glintSize * 0.4);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }

      // Metadata Callout badge
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`${currentMat.name.toUpperCase()} // n = ${currentMat.n}`, 30, 40);
      ctx.font = '11px monospace';
      ctx.fillStyle = '#64748b';
      ctx.fillText(`Critical Angle θc = ${currentMat.criticalAngle}°`, 30, 58);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeTab, material, cutQuality, incidentAngleDeg, showRays, showCaustics, currentMat]);

  // Handle direct Canvas dragging of incident laser angle
  const handleCanvasMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const cx = canvas.width / 2;
    const crownTopY = canvas.height / 2 + 10 - 70;
    const rayEntryX = cx - 35;
    const incRad = (incidentAngleDeg * Math.PI) / 180;
    const rayStartX = rayEntryX - Math.sin(incRad) * 130;
    const rayStartY = crownTopY - Math.cos(incRad) * 130;

    if (Math.hypot(clickX - rayStartX, clickY - rayStartY) < 35) {
      isDraggingLaserRef.current = true;
      sounds.playTick();
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDraggingLaserRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const cx = canvas.width / 2;
    const crownTopY = canvas.height / 2 + 10 - 70;
    const rayEntryX = cx - 35;

    const dx = rayEntryX - mouseX;
    const dy = crownTopY - mouseY;
    if (dy > 0) {
      const rad = Math.atan2(dx, dy);
      const deg = Math.max(-45, Math.min(45, Math.round((rad * 180) / Math.PI)));
      if (deg !== incidentAngleDeg) {
        setIncidentAngleDeg(deg);
        sounds.playTick();
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (isDraggingLaserRef.current) {
      sounds.playSnap();
      isDraggingLaserRef.current = false;
    }
  };

  const handleAnswerSubmit = (qId, idx, isCorrect) => {
    sounds.playClick();
    setSelectedAnswers(prev => ({ ...prev, [qId]: idx }));
    setChallengeFeedback(prev => ({ ...prev, [qId]: isCorrect ? 'correct' : 'incorrect' }));
    if (isCorrect && onUpdateScore) {
      sounds.playSuccess();
      onUpdateScore(20);
    }
  };

  return (
    <div className="space-y-6">
      {/* TAB 1: CURIOSITY */}
      {activeTab === 'curiosity' && (
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          <div className="p-6 md:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              THE SECRET BEHIND DIAMOND BRILLIANCE
            </div>

            <h2 className="text-2xl md:text-3xl font-bold font-sans text-slate-900 tracking-tight">
              Why do diamonds sparkle so much more brilliantly than ordinary glass?
            </h2>

            <p className="text-sm font-semibold text-sky-800 italic">
              "Glass has a refractive index of 1.52. Diamond has a massive refractive index of 2.42. That difference causes a miraculous optical phenomenon called Total Internal Reflection."
            </p>

            <div className="text-xs text-slate-600 space-y-3 font-sans leading-relaxed">
              <p>
                When light passes from a dense optical medium into air, Snell's Law states:
                n₁ sin(θ₁) = n₂ sin(θ₂).
                When the angle of incidence exceeds the <strong>critical angle</strong> (sin(θc) = 1/n), light cannot escape into the air at all! Instead, 100% of the light is reflected internally like a flawless mirror.
              </p>
              <p>
                Because diamond has an extremely high n = 2.42, its critical angle is an exceptionally tiny <strong>24.4°</strong> (compared to 41.1° for glass). When cut with mathematical precision, almost all light entering the top is trapped, bounces twice, and exits back up into the viewer's eye as brilliant sparkling white light and rainbow fire!
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
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-700">
                    PRECISION RAY OPTICS // TOTAL INTERNAL REFLECTION
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { sounds.playTick(); setShowCaustics(!showCaustics); }}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-all ${
                      showCaustics ? 'bg-sky-50 text-sky-800 border-sky-300 font-bold' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Internal Caustics
                  </button>

                  <button
                    onClick={() => {
                      sounds.playSnap();
                      setMaterial('diamond');
                      setCutQuality('ideal');
                      setIncidentAngleDeg(15);
                    }}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
                    title="Reset Angle & Cut"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Canvas with Direct Laser Dragging */}
              <div className="relative w-full bg-slate-50 select-none">
                <canvas
                  ref={canvasRef}
                  width={760}
                  height={380}
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  className="w-full h-auto block cursor-crosshair"
                />

                <div className="absolute bottom-2 left-3 px-2 py-1 rounded-md bg-white/80 backdrop-blur-sm border border-slate-200 text-[10px] font-mono text-slate-500 pointer-events-none">
                  Drag the incident white laser tip to rotate beam angle
                </div>
              </div>

              {/* Telemetry Dashboard */}
              <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Refractive Index (n)</div>
                  <div className="text-base font-bold text-sky-700">{currentMat.n.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-400">{currentMat.name}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Critical Angle (θc)</div>
                  <div className="text-base font-bold text-slate-800">{currentMat.criticalAngle}°</div>
                  <div className="text-[10px] text-slate-400">sin⁻¹(1/n)</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Sparkle Efficiency</div>
                  <div className={`text-base font-bold ${
                    sparklePercent > 70 ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    {sparklePercent}%
                  </div>
                  <div className="text-[10px] text-slate-400">TIR Light Return</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Optical Fire</div>
                  <div className="text-base font-bold text-purple-700">
                    {material === 'diamond' ? 'Vibrant Fire' : material === 'zirconia' ? 'Excess Fire' : 'Dull'}
                  </div>
                  <div className="text-[10px] text-slate-400">Cauchy Dispersion</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Controls (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-900 uppercase">
                  Gemstone & Optics Controls
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Select crystal material and lapidary cut geometry.
                </p>
              </div>

              {/* Material Selector */}
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-slate-700">CRYSTAL MATERIAL:</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {Object.entries(MATERIALS).map(([key, mat]) => (
                    <button
                      key={key}
                      onClick={() => { sounds.playTick(); setMaterial(key); }}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        material === key 
                          ? 'bg-sky-500 border-sky-600 text-white font-bold shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs">{mat.name}</div>
                      <div className="text-[10px] opacity-80 font-mono">n={mat.n}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cut Quality Selector */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="text-xs font-mono font-bold text-slate-700">LAPIDARY CUT PROPORTIONS:</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'shallow', label: 'Shallow Cut', desc: 'Leaks out bottom' },
                    { id: 'ideal', label: 'Tolkowsky Ideal', desc: '100% TIR Return' },
                    { id: 'deep', label: 'Deep / Steep', desc: 'Leaks out side' }
                  ].map(c => (
                    <button
                      key={c.id}
                      onClick={() => { sounds.playTick(); setCutQuality(c.id); }}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        cutQuality === c.id 
                          ? 'bg-slate-900 border-slate-950 text-white font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="text-xs">{c.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider: Incident Angle */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-700 font-bold">INCIDENT BEAM ANGLE:</span>
                  <span className="font-bold text-sky-700">{incidentAngleDeg}°</span>
                </div>
                <input
                  type="range"
                  min={-35}
                  max={35}
                  step={1}
                  value={incidentAngleDeg}
                  onChange={(e) => {
                    sounds.playTick();
                    setIncidentAngleDeg(Number(e.target.value));
                  }}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CHALLENGES */}
      {activeTab === 'challenges' && (
        <div className="max-w-3xl mx-auto space-y-5 text-left">
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs font-sans">
            <strong>Optics Inquiry Laboratory:</strong> Test your understanding of refractive indices, Snell's law, and total internal reflection. Earn up to 60 laboratory score points!
          </div>

          {/* Question 1 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase">
              Challenge 1 of 2 // Critical Angle Physics
            </div>
            <h3 className="text-sm font-bold font-sans text-slate-900">
              Why does a higher refractive index n make it EASIER for a gemstone to achieve Total Internal Reflection?
            </h3>

            <div className="space-y-2">
              {[
                { text: "Because higher n lowers the critical angle θc = sin⁻¹(1/n), meaning rays hitting the boundary over a wider range of angles will bounce internally rather than leak", correct: true },
                { text: "Because diamond absorbs all light and glows in the dark", correct: false },
                { text: "Because higher n increases the speed of light inside the gem", correct: false },
                { text: "Because it makes the crystal softer and more flexible", correct: false }
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
                        : <Sparkles className="w-4 h-4 text-rose-600 flex-shrink-0" />
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
