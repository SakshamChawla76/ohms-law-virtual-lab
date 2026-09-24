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
  Zap
} from 'lucide-react';
import { sounds } from '../../../engine/audioEffects';

// Element metadata for Z = 1 to 10
const ELEMENTS_DB = [
  null,
  { z: 1, sym: 'H', name: 'Hydrogen', standardNeutrons: 0, group: 'Nonmetal' },
  { z: 2, sym: 'He', name: 'Helium', standardNeutrons: 2, group: 'Noble Gas' },
  { z: 3, sym: 'Li', name: 'Lithium', standardNeutrons: 4, group: 'Alkali Metal' },
  { z: 4, sym: 'Be', name: 'Beryllium', standardNeutrons: 5, group: 'Alkaline Earth' },
  { z: 5, sym: 'B', name: 'Boron', standardNeutrons: 6, group: 'Metalloid' },
  { z: 6, sym: 'C', name: 'Carbon', standardNeutrons: 6, group: 'Nonmetal' },
  { z: 7, sym: 'N', name: 'Nitrogen', standardNeutrons: 7, group: 'Nonmetal' },
  { z: 8, sym: 'O', name: 'Oxygen', standardNeutrons: 8, group: 'Nonmetal' },
  { z: 9, sym: 'F', name: 'Fluorine', standardNeutrons: 10, group: 'Halogen' },
  { z: 10, sym: 'Ne', name: 'Neon', standardNeutrons: 10, group: 'Noble Gas' }
];

export const AtomBuilderSim = ({ simulation, activeTab, onUpdateScore }) => {
  // Particle counts
  const [protons, setProtons] = useState(6); // Carbon by default
  const [neutrons, setNeutrons] = useState(6);
  const [electrons, setElectrons] = useState(6);

  // Challenges
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [challengeFeedback, setChallengeFeedback] = useState({});

  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const electronAngleRef = useRef(0);

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
    const loop = () => {
      electronAngleRef.current += 0.025;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        const centerX = 360;
        const centerY = 180;

        // Clean slate laboratory background
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

        // Draw Electron Shell Orbit Rings
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
        ctx.font = '10px monospace';
        ctx.fillText('n = 1 (K-Shell: 2e⁻ max)', centerX - 60, centerY - 95);
        ctx.fillText('n = 2 (L-Shell: 8e⁻ max)', centerX - 60, centerY - 155);

        // Draw Orbiting Electrons
        // Shell 1
        for (let i = 0; i < shell1Count; i++) {
          const angle = electronAngleRef.current + (i / 2) * Math.PI * 2;
          const ex = centerX + Math.cos(angle) * 90;
          const ey = centerY + Math.sin(angle) * 90;

          // Glow
          ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
          ctx.beginPath();
          ctx.arc(ex, ey, 8, 0, Math.PI * 2);
          ctx.fill();

          // Electron particle
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(ex, ey, 5, 0, Math.PI * 2);
          ctx.fill();

          // Minus sign
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('-', ex - 2, ey + 3);
        }

        // Shell 2
        for (let i = 0; i < shell2Count; i++) {
          const angle = -electronAngleRef.current * 0.7 + (i / shell2Count) * Math.PI * 2;
          const ex = centerX + Math.cos(angle) * 150;
          const ey = centerY + Math.sin(angle) * 150;

          // Glow
          ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
          ctx.beginPath();
          ctx.arc(ex, ey, 8, 0, Math.PI * 2);
          ctx.fill();

          // Electron particle
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(ex, ey, 5, 0, Math.PI * 2);
          ctx.fill();

          // Minus sign
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.fillText('-', ex - 2, ey + 3);
        }

        // Draw Nucleus (Protons & Neutrons clustered in center)
        // Pseudo-random deterministic placement around center
        const totalNucleons = protons + neutrons;
        const nucleonRadius = 7;
        const clusterRadius = Math.min(36, 14 + totalNucleons * 1.5);

        // Draw subtle nuclear cloud boundary
        ctx.fillStyle = isStable ? 'rgba(241, 245, 249, 0.8)' : 'rgba(254, 226, 226, 0.8)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, clusterRadius + 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = isStable ? '#cbd5e1' : '#f87171';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Nucleons placement
        let pDrawn = 0;
        let nDrawn = 0;
        for (let i = 0; i < totalNucleons; i++) {
          const phi = i * 137.5 * (Math.PI / 180); // golden angle distribution
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
  }, [protons, neutrons, electrons, shell1Count, shell2Count, isStable]);

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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              ATOMIC ARCHITECTURE & QUANTUM STRUCTURE
            </div>

            <h2 className="text-2xl md:text-3xl font-bold font-sans text-slate-900 tracking-tight">
              {simulation.name}
            </h2>

            <p className="text-sm font-semibold text-purple-800 italic">
              "{simulation.curiosityQuestion}"
            </p>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              All physical matter in the universe is constructed from three subatomic particles. Protons define the absolute chemical identity of the atom (Atomic Number Z). Neutrons act as nuclear glue, providing strong nuclear force to overcome electromagnetic proton repulsion. Electrons orbit in discrete quantized energy levels, governing all chemical bonding, valence reactivity, and electrical conduction.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-mono text-slate-500 uppercase">Protons (p⁺, Z)</div>
                <div className="text-sm font-bold text-slate-800 mt-1">Chemical Identity</div>
                <p className="text-[11px] text-slate-600 mt-1">Changing proton count transmutes the atom into an entirely different element.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-mono text-slate-500 uppercase">Neutrons (n⁰)</div>
                <div className="text-sm font-bold text-slate-800 mt-1">Nuclear Stability</div>
                <p className="text-[11px] text-slate-600 mt-1">Varying neutron count forms isotopes. Too few or too many triggers radioactive decay.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-mono text-slate-500 uppercase">Electrons (e⁻)</div>
                <div className="text-sm font-bold text-slate-800 mt-1">Ionic Charge & Bonds</div>
                <p className="text-[11px] text-slate-600 mt-1">Gaining or losing valence electrons creates charged ions (cations and anions).</p>
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
              <span className="text-xs font-mono font-bold text-slate-600 uppercase">Element Target:</span>
              <span className="text-sm font-bold font-sans text-slate-900">
                {element ? `${element.name} (${element.sym})` : 'Transuranic Element'}
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                isStable ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {isStable ? '✓ Stable Isotope' : '⚠ Radioactive Isotope'}
              </span>
            </div>

            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset (Carbon-12)
            </button>
          </div>

          {/* Canvas Display with Live Bohr Model */}
          <div className="relative rounded-2xl border border-slate-300 bg-white shadow-sm overflow-hidden">
            <canvas
              ref={canvasRef}
              width={720}
              height={360}
              className="w-full h-auto block"
            />

            {/* Periodic Tile Card Overlay */}
            <div className="absolute top-3 right-3 p-3 rounded-xl bg-white/95 backdrop-blur border border-slate-300 shadow-sm text-center w-28">
              <div className="text-[10px] font-mono text-slate-400">Z = {protons}</div>
              <div className="text-3xl font-extrabold text-slate-900 font-sans my-0.5">
                {element ? element.sym : '?'}
              </div>
              <div className="text-xs font-bold text-slate-700 font-sans truncate">
                {element ? element.name : 'Unknown'}
              </div>
              <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-200 mt-1">
                Mass: {massNumber}
              </div>
              <div className={`text-[10px] font-mono font-bold mt-0.5 ${
                netCharge === 0 ? 'text-emerald-700' : netCharge > 0 ? 'text-rose-700' : 'text-blue-700'
              }`}>
                {netCharge === 0 ? 'Neutral (0)' : netCharge > 0 ? `Cation (+${netCharge})` : `Anion (${netCharge})`}
              </div>
            </div>
          </div>

          {/* Interactive Particle Injectors */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Protons Deck */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-rose-700 flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-bold">+</div>
                  Protons (p⁺):
                </span>
                <span className="font-extrabold text-base text-rose-700">{protons}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustParticle('p', -1)}
                  disabled={protons <= 1}
                  className="flex-1 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 flex justify-center items-center"
                >
                  <Minus className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={() => adjustParticle('p', 1)}
                  disabled={protons >= 10}
                  className="flex-1 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 flex justify-center items-center"
                >
                  <Plus className="w-4 h-4 text-slate-600" />
                </button>
              </div>
              <div className="text-[10px] font-mono text-slate-400 text-center">
                Determines element (Z = 1 to 10)
              </div>
            </div>

            {/* Neutrons Deck */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-slate-400 text-white flex items-center justify-center text-[9px] font-bold">0</div>
                  Neutrons (n⁰):
                </span>
                <span className="font-extrabold text-base text-slate-700">{neutrons}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustParticle('n', -1)}
                  disabled={neutrons <= 0}
                  className="flex-1 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 flex justify-center items-center"
                >
                  <Minus className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={() => adjustParticle('n', 1)}
                  disabled={neutrons >= 12}
                  className="flex-1 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 flex justify-center items-center"
                >
                  <Plus className="w-4 h-4 text-slate-600" />
                </button>
              </div>
              <div className="text-[10px] font-mono text-slate-400 text-center">
                Controls nuclear isotope stability
              </div>
            </div>

            {/* Electrons Deck */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="font-bold text-blue-700 flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold">-</div>
                  Electrons (e⁻):
                </span>
                <span className="font-extrabold text-base text-blue-700">{electrons}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustParticle('e', -1)}
                  disabled={electrons <= 0}
                  className="flex-1 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 flex justify-center items-center"
                >
                  <Minus className="w-4 h-4 text-slate-600" />
                </button>
                <button
                  onClick={() => adjustParticle('e', 1)}
                  disabled={electrons >= 10}
                  className="flex-1 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 flex justify-center items-center"
                >
                  <Plus className="w-4 h-4 text-slate-600" />
                </button>
              </div>
              <div className="text-[10px] font-mono text-slate-400 text-center">
                K: {shell1Count}/2 · L: {shell2Count}/8
              </div>
            </div>
          </div>

          {/* Subatomic Accounting Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-xs font-mono font-bold text-slate-700 uppercase">
              Subatomic Particle Balance Sheet:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded bg-white border border-slate-200 text-slate-700">
                <span className="font-bold text-slate-500">Atomic Number (Z): </span>
                <span className="font-bold text-rose-700">{protons}</span>
              </div>
              <div className="p-2.5 rounded bg-white border border-slate-200 text-slate-700">
                <span className="font-bold text-slate-500">Mass Number (A): </span>
                <span className="font-bold text-slate-800">{massNumber}</span>
              </div>
              <div className="p-2.5 rounded bg-white border border-slate-200 text-slate-700">
                <span className="font-bold text-slate-500">Net Ionic Charge: </span>
                <span className={`font-bold ${netCharge === 0 ? 'text-emerald-700' : 'text-blue-700'}`}>
                  {netCharge > 0 ? `+${netCharge}` : netCharge}
                </span>
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
                QUANTUM & NUCLEAR APPLICATIONS
              </div>
              <h3 className="text-xl font-bold font-sans text-slate-900">
                Subatomic Structure in Modern Science
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-mono font-bold text-rose-800 uppercase">
                  1. Carbon-14 Radiometric Dating
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  While Carbon-12 (6p, 6n) is indefinitely stable, cosmic rays generate unstable Carbon-14 (6p, 8n). After an organism dies, Carbon-14 beta-decays into Nitrogen-14 with a half-life of 5,730 years, allowing archaeologists to date ancient organic artifacts with pinpoint precision.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-mono font-bold text-blue-800 uppercase">
                  2. Semiconductor Silicon Doping
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Pure silicon has 4 valence electrons. Doping it with boron (3 valence electrons) creates an electron deficiency (holes for p-type silicon), while phosphorus (5 valence electrons) provides free conducting electrons (n-type). Joining p and n creates the transistor PN junction powering modern microprocessors.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-mono font-bold text-purple-800 uppercase">
                  3. Positron Emission Tomography (PET)
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Cancer clinics inject patients with Fluorine-18 labeled fluorodeoxyglucose. The proton-rich nucleus (9p, 9n) decays by emitting a positron (antimatter electron). When the positron annihilates with an electron in surrounding tissue, it yields two gamma rays detected to map metastatic tumors.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-mono font-bold text-emerald-800 uppercase">
                  4. MRI Hydrogen Spin Resonance
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  The human body is 60% water, rich in hydrogen nuclei (single protons). A superconducting MRI magnet aligns these proton spins. Radiofrequency pulses tip them out of alignment, and as they relax, they emit signals transformed into crisp soft-tissue anatomical cross-sections.
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
                ATOMIC STRUCTURE INQUIRY CHALLENGE
              </div>
              <h3 className="text-xl font-bold font-sans text-slate-900">
                Nuclear & Ionic Reasoning Assessment
              </h3>
            </div>

            <div className="space-y-4">
              {/* Question 1 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-mono font-bold text-slate-800">
                  Q1: An atom possesses 8 protons, 10 neutrons, and 10 electrons. What is its chemical identity and ionic charge?
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {[
                    { text: 'A) Neon (Ne), neutral atom', correct: false },
                    { text: 'B) Oxygen-18 anion (O²⁻)', correct: true },
                    { text: 'C) Oxygen-16 cation (O²⁺)', correct: false },
                    { text: 'D) Fluorine-18 anion (F⁻)', correct: false }
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
                      ? '✓ Correct! 8 protons dictates Oxygen (Z = 8). Mass A = 8 + 10 = 18. Charge = 8 - 10 = -2 (oxide anion O²⁻).' 
                      : '✗ Incorrect. The atomic number Z is determined strictly by the number of protons (Z = 8 is Oxygen).'}
                  </p>
                )}
              </div>

              {/* Question 2 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-mono font-bold text-slate-800">
                  Q2: In the Bohr model of the atom, how many electrons can maximally occupy the second principal energy shell (n = 2)?
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {[
                    { text: 'A) 2 electrons', correct: false },
                    { text: 'B) 6 electrons', correct: false },
                    { text: 'C) 8 electrons (octet)', correct: true },
                    { text: 'D) 18 electrons', correct: false }
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
                      ? '✓ Correct! Following 2n², for n = 2: 2(2)² = 8 electrons, completing the stable octet.' 
                      : '✗ Incorrect. The formula 2n² gives 2(2)² = 8 electrons for the L-shell.'}
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
