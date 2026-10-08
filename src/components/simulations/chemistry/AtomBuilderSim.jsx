import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  RotateCcw, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Layers, 
  Activity, 
  Zap,
  Sliders,
  Atom
} from 'lucide-react';
import { sounds } from '../../../engine/audioEffects';

// Element metadata for Z = 1 to 10
const ELEMENTS_DB = [
  null,
  { z: 1, sym: 'H', name: 'Hydrogen', standardNeutrons: 0, group: 'Nonmetal', config: '1s¹' },
  { z: 2, sym: 'He', name: 'Helium', standardNeutrons: 2, group: 'Noble Gas', config: '1s²' },
  { z: 3, sym: 'Li', name: 'Lithium', standardNeutrons: 4, group: 'Alkali Metal', config: '[He] 2s¹' },
  { z: 4, sym: 'Be', name: 'Beryllium', standardNeutrons: 5, group: 'Alkaline Earth', config: '[He] 2s²' },
  { z: 5, sym: 'B', name: 'Boron', standardNeutrons: 6, group: 'Metalloid', config: '[He] 2s² 2p¹' },
  { z: 6, sym: 'C', name: 'Carbon', standardNeutrons: 6, group: 'Nonmetal', config: '[He] 2s² 2p²' },
  { z: 7, sym: 'N', name: 'Nitrogen', standardNeutrons: 7, group: 'Nonmetal', config: '[He] 2s² 2p³' },
  { z: 8, sym: 'O', name: 'Oxygen', standardNeutrons: 8, group: 'Nonmetal', config: '[He] 2s² 2p⁴' },
  { z: 9, sym: 'F', name: 'Fluorine', standardNeutrons: 10, group: 'Halogen', config: '[He] 2s² 2p⁵' },
  { z: 10, sym: 'Ne', name: 'Neon', standardNeutrons: 10, group: 'Noble Gas', config: '[He] 2s² 2p⁶' }
];

export const AtomBuilderSim = ({ simulation = {}, activeTab = 'sandbox', onUpdateScore }) => {
  // Particle counts
  const [protons, setProtons] = useState(6); // Carbon by default
  const [neutrons, setNeutrons] = useState(6);
  const [electrons, setElectrons] = useState(6);
  const [showOrbitals, setShowOrbitals] = useState(true);

  // Challenges
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [challengeFeedback, setChallengeFeedback] = useState({});

  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const electronAngleRef = useRef(0);
  const decayParticlesRef = useRef([]);

  // Element calculations
  const element = (protons >= 1 && protons <= 10) ? ELEMENTS_DB[protons] : null;
  const massNumber = protons + neutrons;
  const netCharge = protons - electrons;
  const isStable = element ? Math.abs(neutrons - element.standardNeutrons) <= 1 : false;

  // Electron shell configuration (Bohr model): Shell 1 max 2, Shell 2 max 8
  const shell1Count = Math.min(electrons, 2);
  const shell2Count = Math.max(0, Math.min(electrons - 2, 8));

  // Reset atom
  const handleReset = () => {
    sounds.playSnap();
    setProtons(6);
    setNeutrons(6);
    setElectrons(6);
    decayParticlesRef.current = [];
  };

  const adjustParticle = (type, delta) => {
    sounds.playSnap();
    if (type === 'p') {
      const next = Math.max(1, Math.min(10, protons + delta));
      setProtons(next);
    } else if (type === 'n') {
      const next = Math.max(0, Math.min(12, neutrons + delta));
      setNeutrons(next);
    } else if (type === 'e') {
      const next = Math.max(0, Math.min(10, electrons + delta));
      setElectrons(next);
    }
  };

  // 60 FPS Canvas Animation Loop
  useEffect(() => {
    if (activeTab !== 'sandbox') return;

    let lastTime = performance.now();

    const loop = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.05);
      lastTime = time;
      electronAngleRef.current += 0.025;

      // Spawn radiation particles if unstable
      if (!isStable && Math.random() < 0.15) {
        decayParticlesRef.current.push({
          x: 360,
          y: 180,
          vx: (Math.random() - 0.5) * 120,
          vy: (Math.random() - 0.5) * 120,
          life: 1.0,
          color: '#ef4444'
        });
      }

      decayParticlesRef.current = decayParticlesRef.current.map(p => ({
        ...p,
        x: p.x + p.vx * dt,
        y: p.y + p.vy * dt,
        life: p.life - dt * 2.0
      })).filter(p => p.life > 0);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const centerX = 360;
        const centerY = 180;

        ctx.clearRect(0, 0, width, height);

        // Laboratory slate background
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

        // Electron Shell Orbit Rings
        if (showOrbitals) {
          // Quantum orbital cloud shading
          const radCloud1 = ctx.createRadialGradient(centerX, centerY, 80, centerX, centerY, 100);
          radCloud1.addColorStop(0, 'rgba(56, 189, 248, 0)');
          radCloud1.addColorStop(0.5, 'rgba(56, 189, 248, 0.05)');
          radCloud1.addColorStop(1, 'rgba(56, 189, 248, 0)');
          ctx.fillStyle = radCloud1;
          ctx.beginPath();
          ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
          ctx.fill();

          // Shell 1 (radius 90)
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(centerX, centerY, 90, 0, Math.PI * 2);
          ctx.stroke();

          // Shell 2 (radius 150)
          ctx.beginPath();
          ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Orbit labels
          ctx.fillStyle = '#94a3b8';
          ctx.font = '9px monospace';
          ctx.fillText('n = 1 (K-Shell: 2e⁻ max)', centerX - 60, centerY - 95);
          ctx.fillText('n = 2 (L-Shell: 8e⁻ max)', centerX - 60, centerY - 155);
        }

        // Draw Radioactive Decay Particles (if unstable)
        for (const p of decayParticlesRef.current) {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.life);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // Draw Orbiting Electrons
        // Shell 1
        for (let i = 0; i < shell1Count; i++) {
          const angle = electronAngleRef.current + (i / 2) * Math.PI * 2;
          const ex = centerX + Math.cos(angle) * 90;
          const ey = centerY + Math.sin(angle) * 90;

          // Glow halo
          ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
          ctx.beginPath();
          ctx.arc(ex, ey, 9, 0, Math.PI * 2);
          ctx.fill();

          // Electron
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(ex, ey, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('-', ex - 2, ey + 3);
        }

        // Shell 2
        for (let i = 0; i < shell2Count; i++) {
          const angle = -electronAngleRef.current * 0.7 + (i / shell2Count) * Math.PI * 2;
          const ex = centerX + Math.cos(angle) * 150;
          const ey = centerY + Math.sin(angle) * 150;

          ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
          ctx.beginPath();
          ctx.arc(ex, ey, 9, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(ex, ey, 5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('-', ex - 2, ey + 3);
        }

        // Nucleus Droplet Model (Protons & Neutrons clustered in center)
        const totalNucleons = protons + neutrons;
        const nucleonRadius = 7.5;
        const clusterRadius = Math.min(36, 14 + totalNucleons * 1.5);

        // Nuclear boundary cloud
        ctx.fillStyle = isStable ? 'rgba(241, 245, 249, 0.85)' : 'rgba(254, 226, 226, 0.85)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, clusterRadius + 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isStable ? '#cbd5e1' : '#f87171';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Strong force mesh lines between nucleons
        let pDrawn = 0;
        let nDrawn = 0;
        for (let i = 0; i < totalNucleons; i++) {
          const phi = i * 137.5 * (Math.PI / 180);
          const r = Math.sqrt(i / Math.max(1, totalNucleons)) * clusterRadius;
          const nx = centerX + Math.cos(phi) * r;
          const ny = centerY + Math.sin(phi) * r;

          const isProton = (i % 2 === 0 && pDrawn < protons) || (nDrawn >= neutrons);
          if (isProton && pDrawn < protons) {
            pDrawn++;
            // Proton: Red
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(nx, ny, nucleonRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#b91c1c';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px monospace';
            ctx.fillText('+', nx - 2.5, ny + 3);
          } else {
            nDrawn++;
            // Neutron: Slate/Grey
            ctx.fillStyle = '#94a3b8';
            ctx.beginPath();
            ctx.arc(nx, ny, nucleonRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 8px monospace';
            ctx.fillText('0', nx - 2, ny + 3);
          }
        }
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [activeTab, protons, neutrons, electrons, shell1Count, shell2Count, isStable, showOrbitals]);

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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              ATOMIC ARCHITECTURE & QUANTUM STRUCTURE
            </div>

            <h2 className="text-2xl md:text-3xl font-bold font-sans text-slate-900 tracking-tight">
              {simulation.name || "Build an Atom: Subatomic Particles & Isotopes"}
            </h2>

            <p className="text-sm font-semibold text-purple-800 italic">
              "{simulation.curiosityQuestion || "What determines the identity, stability, and chemical charge of an element?"}"
            </p>

            <div className="text-xs text-slate-600 space-y-3 font-sans leading-relaxed">
              <p>
                Every atom in the universe is constructed from three fundamental building blocks:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center">
                  <div className="text-rose-700 font-bold">Protons (Z)</div>
                  <div className="text-[10px] text-rose-600">Determines chemical identity (element name)</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-slate-700 font-bold">Neutrons (N)</div>
                  <div className="text-[10px] text-slate-600">Nuclear glue: prevents proton electrostatic repulsion</div>
                </div>
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-center">
                  <div className="text-sky-700 font-bold">Electrons (e⁻)</div>
                  <div className="text-[10px] text-sky-600">Determines net charge and chemical bonding</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SANDBOX */}
      {activeTab === 'sandbox' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-left">
          {/* Main Viewport (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-slate-700">
                    BOHR QUANTUM ATOM BUILDER // REAL-TIME MODEL
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { sounds.playTick(); setShowOrbitals(!showOrbitals); }}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-all ${
                      showOrbitals ? 'bg-purple-50 text-purple-800 border-purple-300 font-bold' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Bohr Shells
                  </button>

                  <button
                    onClick={handleReset}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700"
                    title="Reset to Carbon-12"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Canvas */}
              <div className="relative w-full bg-slate-50 select-none">
                <canvas
                  ref={canvasRef}
                  width={720}
                  height={360}
                  className="w-full h-auto block"
                />

                {/* Live Element Symbol HUD Badge in corner */}
                {element && (
                  <div className="absolute top-4 left-4 p-3 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200 shadow-sm font-mono text-center min-w-[76px]">
                    <div className="text-[10px] text-slate-400 font-bold">{massNumber}</div>
                    <div className="text-2xl font-black text-slate-900">{element.sym}</div>
                    <div className="text-[10px] text-slate-500 font-bold">{element.z}</div>
                    <div className="text-[9px] text-purple-700 font-bold pt-1">{element.name}</div>
                  </div>
                )}

                {/* Nuclear Stability Alert */}
                <div className="absolute top-4 right-4">
                  {isStable ? (
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      STABLE ISOTOPE
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-50 text-rose-800 border border-rose-300 flex items-center gap-1.5 animate-pulse">
                      <Zap className="w-3.5 h-3.5 text-rose-600" />
                      UNSTABLE / RADIOACTIVE
                    </span>
                  )}
                </div>
              </div>

              {/* Telemetry Dashboard */}
              <div className="p-4 bg-white border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Atomic Number (Z)</div>
                  <div className="text-base font-bold text-rose-600">{protons} Protons</div>
                  <div className="text-[10px] text-slate-400">{element ? element.group : 'Unknown'}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Mass Number (A)</div>
                  <div className="text-base font-bold text-slate-800">{massNumber} amu</div>
                  <div className="text-[10px] text-slate-400">{neutrons} Neutrons</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Net Ion Charge</div>
                  <div className={`text-base font-bold ${
                    netCharge === 0 ? 'text-emerald-700' : netCharge > 0 ? 'text-rose-600' : 'text-sky-600'
                  }`}>
                    {netCharge === 0 ? '0 (Neutral)' : netCharge > 0 ? `+${netCharge}` : netCharge}
                  </div>
                  <div className="text-[10px] text-slate-400">{electrons} Electrons</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase">Configuration</div>
                  <div className="text-base font-bold text-purple-700">
                    {element ? element.config : `${shell1Count}, ${shell2Count}`}
                  </div>
                  <div className="text-[10px] text-slate-400">Shells: K={shell1Count}, L={shell2Count}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Controls (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold font-mono text-slate-900 uppercase">
                  Subatomic Particle Counters
                </h3>
                <p className="text-xs text-slate-500 font-sans">
                  Increment or decrement protons, neutrons, and electrons.
                </p>
              </div>

              {/* Counter: Protons */}
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-rose-800">PROTONS (p⁺):</span>
                  <span className="font-bold text-rose-900 text-sm">{protons}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => adjustParticle('p', -1)}
                    disabled={protons <= 1}
                    className="flex-1 py-1 rounded-lg bg-white border border-rose-300 text-rose-700 font-bold hover:bg-rose-100 disabled:opacity-40"
                  >
                    -
                  </button>
                  <button
                    onClick={() => adjustParticle('p', 1)}
                    disabled={protons >= 10}
                    className="flex-1 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Counter: Neutrons */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-slate-700">NEUTRONS (n⁰):</span>
                  <span className="font-bold text-slate-900 text-sm">{neutrons}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => adjustParticle('n', -1)}
                    disabled={neutrons <= 0}
                    className="flex-1 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 disabled:opacity-40"
                  >
                    -
                  </button>
                  <button
                    onClick={() => adjustParticle('n', 1)}
                    disabled={neutrons >= 12}
                    className="flex-1 py-1 rounded-lg bg-slate-700 text-white font-bold hover:bg-slate-800 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Counter: Electrons */}
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-sky-800">ELECTRONS (e⁻):</span>
                  <span className="font-bold text-sky-900 text-sm">{electrons}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => adjustParticle('e', -1)}
                    disabled={electrons <= 0}
                    className="flex-1 py-1 rounded-lg bg-white border border-sky-300 text-sky-700 font-bold hover:bg-sky-100 disabled:opacity-40"
                  >
                    -
                  </button>
                  <button
                    onClick={() => adjustParticle('e', 1)}
                    disabled={electrons >= 10}
                    className="flex-1 py-1 rounded-lg bg-sky-600 text-white font-bold hover:bg-sky-700 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CHALLENGES */}
      {activeTab === 'challenges' && (
        <div className="max-w-3xl mx-auto space-y-5 text-left">
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-sans">
            <strong>Nuclear Structure Inquiry:</strong> Test your understanding of isotopes, ions, and valence electron configurations. Earn up to 75 laboratory score points!
          </div>

          {/* Question 1 */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
            <div className="text-xs font-mono text-slate-400 font-bold uppercase">
              Challenge 1 of 2 // Atomic Identity
            </div>
            <h3 className="text-sm font-bold font-sans text-slate-900">
              Which subatomic particle fundamentally defines the elemental identity (whether an atom is Carbon, Oxygen, or Gold)?
            </h3>

            <div className="space-y-2">
              {[
                { text: "The number of Protons (Atomic Number Z)", correct: true },
                { text: "The number of Neutrons", correct: false },
                { text: "The number of Electrons", correct: false },
                { text: "The total nuclear spin", correct: false }
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
