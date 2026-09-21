import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  Gauge, 
  CheckCircle2, 
  Award, 
  ChevronRight,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { sounds } from '../../../engine/audioEffects';

export const DiamondCutSim = ({ activeTab, onUpdateScore }) => {
  // Material preset
  const [material, setMaterial] = useState('diamond'); // 'diamond' | 'zirconia' | 'glass'
  const [cutQuality, setCutQuality] = useState('ideal'); // 'ideal' | 'shallow' | 'deep'
  const [incidentAngleDeg, setIncidentAngleDeg] = useState(15);
  const [showRays, setShowRays] = useState(true);

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [challengeFeedback, setChallengeFeedback] = useState({});

  const canvasRef = useRef(null);

  // Material Refractive Indices
  const MATERIALS = {
    diamond: { name: 'Diamond', n: 2.42, criticalAngle: 24.4, color: '#38bdf8' },
    zirconia: { name: 'Cubic Zirconia', n: 2.15, criticalAngle: 27.7, color: '#a78bfa' },
    glass: { name: 'Crown Glass', n: 1.52, criticalAngle: 41.1, color: '#94a3b8' }
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
    // Glass
    sparklePercent = cutQuality === 'ideal' ? 44 : 15;
  }

  // Draw Ray Optics on Canvas
  useEffect(() => {
    if (activeTab !== 'sandbox') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Pale grid
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

    const cx = width / 2;
    const cy = height / 2 + 10;

    // Gemstone Facet Geometry
    // Table width, Crown height, Pavilion depth
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

    // Gemstone outline
    ctx.fillStyle = 'rgba(240, 249, 255, 0.7)';
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
    ctx.stroke();

    // Light Ray Tracing
    if (showRays) {
      // Incoming ray from top
      const incRad = (incidentAngleDeg * Math.PI) / 180;
      const rayEntryX = cx - 35;
      const rayEntryY = crownTopY;
      const rayStartX = rayEntryX - Math.sin(incRad) * 120;
      const rayStartY = rayEntryY - Math.cos(incRad) * 120;

      // Draw Incoming White Ray
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(rayStartX, rayStartY);
      ctx.lineTo(rayEntryX, rayEntryY);
      ctx.stroke();

      // Refracted ray inside diamond (Snell's Law: sin(theta2) = sin(theta1) / n)
      const theta2 = Math.asin(Math.sin(incRad) / currentMat.n);

      // Ray hits right pavilion facet
      const pavRightX = cx + (girdleHalfW * (1 - (cutQuality === 'deep' ? 0.35 : 0.5)));
      const pavRightY = girdleY + (culetY - girdleY) * 0.45;

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(rayEntryX, rayEntryY);
      ctx.lineTo(pavRightX, pavRightY);
      ctx.stroke();

      // At Pavilion: Does it total internally reflect?
      // Critical angle check
      if (cutQuality === 'ideal' && currentMat.criticalAngle < 30) {
        // Ideal Cut: Double internal reflection then exits top table facet!
        const pavLeftX = cx - 70;
        const pavLeftY = girdleY + (culetY - girdleY) * 0.35;

        // Reflection 1 to left facet
        ctx.strokeStyle = '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(pavRightX, pavRightY);
        ctx.lineTo(pavLeftX, pavLeftY);
        ctx.stroke();

        // Reflection 2 to top crown exit
        const exitX = cx + 25;
        const exitY = crownTopY;
        ctx.beginPath();
        ctx.moveTo(pavLeftX, pavLeftY);
        ctx.lineTo(exitX, exitY);
        ctx.stroke();

        // Rainbow dispersion spectrum shooting out top!
        const colors = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6'];
        colors.forEach((col, idx) => {
          ctx.strokeStyle = col;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(exitX, exitY);
          ctx.lineTo(exitX + (idx - 2) * 18 + 20, exitY - 110);
          ctx.stroke();
        });
      } else {
        // Leaks out bottom or side (Glass or shallow/deep cut)
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(pavRightX, pavRightY);
        ctx.lineTo(pavRightX + 60, pavRightY + 70);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#ef4444';
        ctx.font = '11px monospace';
        ctx.fillText('LIGHT LEAKS (REFRACTED OUT)', pavRightX - 20, pavRightY + 85);
      }
    }

    // Callout badge
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`${currentMat.name.toUpperCase()} // n = ${currentMat.n}`, 30, 40);
    ctx.font = '11px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`Critical Angle θc = ${currentMat.criticalAngle}°`, 30, 58);
  }, [activeTab, material, cutQuality, incidentAngleDeg, showRays]);

  const handleAnswerSubmit = (qId, idx, isCorrect) => {
    sounds.playClick();
    setSelectedAnswers(prev => ({ ...prev, [qId]: idx }));
    setChallengeFeedback(prev => ({ ...prev, [qId]: isCorrect ? 'correct' : 'incorrect' }));
    if (isCorrect && onUpdateScore) onUpdateScore(20);
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
                $n_1 \sin\theta_1 = n_2 \sin\theta_2$.
                When the angle of incidence exceeds the <strong>critical angle</strong> ($\sin\theta_c = 1/n$), light cannot escape into the air at all! Instead, 100% of the light is reflected internally like a flawless mirror.
              </p>
              <p>
                Because diamond has an extremely high $n = 2.42$, its critical angle is an exceptionally tiny <strong>24.4°</strong> (compared to 41.1° for glass). When cut with mathematical precision, almost all light entering the top is trapped, bounces twice, and exits back up into the viewer's eye as brilliant sparkling white light and rainbow fire!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SANDBOX */}
      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-left">
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-700">
                  SNELL'S LAW & TOTAL INTERNAL REFLECTION RAY TRACER
                </span>

                <button
                  onClick={() => setShowRays(!showRays)}
                  className="px-2.5 py-1 rounded text-[11px] font-mono bg-white border border-slate-200 text-slate-600"
                >
                  {showRays ? 'Hide Rays' : 'Show Rays'}
                </button>
              </div>

              <div className="relative w-full bg-slate-50">
                <canvas
                  ref={canvasRef}
                  width={760}
                  height={400}
                  className="w-full h-auto block"
                />
              </div>

              <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-3 gap-3 text-center font-mono">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Refractive Index (n)</div>
                  <div className="text-base font-bold text-slate-800">{currentMat.n}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Critical Angle (θc)</div>
                  <div className="text-base font-bold text-sky-700">{currentMat.criticalAngle}°</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Sparkle Efficiency</div>
                  <div className={`text-base font-bold ${
                    sparklePercent > 75 ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    {sparklePercent}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-900 uppercase">
                  Optics Deck Controls
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Select crystal material and facet cut geometry.
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
                      className={`p-2 rounded-lg text-xs font-mono transition-all border text-center ${
                        material === key
                          ? 'bg-sky-50 border-sky-400 text-sky-800 font-bold shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      <div>{mat.name.split(' ')[0]}</div>
                      <div className="text-[10px] text-slate-400">n={mat.n}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cut Quality Selector */}
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold text-slate-700">FACET CUT GEOMETRY:</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'shallow', name: 'Shallow' },
                    { id: 'ideal', name: 'Ideal Cut' },
                    { id: 'deep', name: 'Too Deep' }
                  ].map((c) => (
                    <button
                      key={c.id}
                      onClick={() => { sounds.playTick(); setCutQuality(c.id); }}
                      className={`p-2 rounded-lg text-xs font-mono transition-all border text-center ${
                        cutQuality === c.id
                          ? 'bg-amber-50 border-amber-400 text-amber-800 font-bold shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Incident Angle Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-600 font-bold">INCIDENT ANGLE:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                    {incidentAngleDeg}°
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={40}
                  step={1}
                  value={incidentAngleDeg}
                  onChange={(e) => setIncidentAngleDeg(Number(e.target.value))}
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CHALLENGE ME */}
      {activeTab === 'challenge' && (
        <div className="max-w-3xl mx-auto space-y-5 text-left">
          <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 text-xs font-sans">
            <strong>Optics Inquiries:</strong> Test your understanding of Total Internal Reflection and Snell's Law.
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase">
              Challenge 1 of 1 // Critical Angle
            </div>
            <h3 className="text-sm font-bold font-sans text-slate-800">
              Why does diamond's high refractive index (n = 2.42) make total internal reflection much easier to achieve than in crown glass (n = 1.52)?
            </h3>

            <div className="space-y-2">
              {[
                { text: "Because a higher n makes the critical angle smaller, so more incident light angles exceed it and reflect.", correct: true },
                { text: "Because high n slows down light so much that light cannot move.", correct: false },
                { text: "Because diamond absorbs all the blue light.", correct: false }
              ].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswerSubmit('dc1', i, opt.correct)}
                  className={`w-full p-3 rounded-xl text-xs font-mono text-left transition-all border ${
                    selectedAnswers['dc1'] === i
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

            {challengeFeedback['dc1'] === 'correct' && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-sans">
                ✓ <strong>Correct! (+20 pts)</strong> Since $\sin\theta_c = 1/n$, a higher index of refraction produces a smaller critical angle ($\theta_c = 24.4^\circ$). Any ray hitting the facet beyond $24.4^\circ$ is 100% reflected!
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold font-sans text-slate-900">
              Fiber Optic Internet Cables: Total Internal Reflection at Global Scale
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              The exact same physics that causes diamonds to sparkle carries over 99% of global internet data! Fiber optic cables consist of an ultra-pure glass core surrounded by an optical cladding of lower refractive index.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 font-sans">
              <strong>Zero Loss Light Bouncing:</strong> Laser pulses injected into the fiber hit the core-cladding boundary at angles greater than $\theta_c$. The pulses bounce hundreds of kilometers undersea with zero light escaping the boundary!
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
