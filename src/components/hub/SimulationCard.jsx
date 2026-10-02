import React from 'react';
import { ArrowRight, Sparkles, Zap, Atom, Play } from 'lucide-react';
import { sounds } from '../../engine/audioEffects';

/* ─── Category → Color mapping ─── */
const CATEGORY_COLORS = {
  electricity: { bg: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/20', accent: '#4f8cff', glow: 'rgba(79,140,255,0.15)' },
  mechanics: { bg: 'from-pink-500/20 to-rose-600/10', border: 'border-pink-500/20', accent: '#f472b6', glow: 'rgba(244,114,182,0.15)' },
  energy: { bg: 'from-amber-500/20 to-yellow-600/10', border: 'border-amber-500/20', accent: '#fbbf24', glow: 'rgba(251,191,36,0.15)' },
  gravity: { bg: 'from-violet-500/20 to-purple-600/10', border: 'border-violet-500/20', accent: '#a78bfa', glow: 'rgba(167,139,250,0.15)' },
  rotational: { bg: 'from-orange-500/20 to-amber-600/10', border: 'border-orange-500/20', accent: '#fb923c', glow: 'rgba(251,146,60,0.15)' },
  waves: { bg: 'from-cyan-500/20 to-teal-600/10', border: 'border-cyan-500/20', accent: '#22d3ee', glow: 'rgba(34,211,238,0.15)' },
  optics: { bg: 'from-violet-500/20 to-indigo-600/10', border: 'border-violet-500/20', accent: '#a78bfa', glow: 'rgba(167,139,250,0.15)' },
  thermo: { bg: 'from-red-500/20 to-rose-600/10', border: 'border-red-500/20', accent: '#ef4444', glow: 'rgba(239,68,68,0.15)' },
  matter: { bg: 'from-emerald-500/20 to-green-600/10', border: 'border-emerald-500/20', accent: '#34d399', glow: 'rgba(52,211,153,0.15)' },
  reactions: { bg: 'from-orange-500/20 to-red-600/10', border: 'border-orange-500/20', accent: '#fb923c', glow: 'rgba(251,146,60,0.15)' },
  solutions: { bg: 'from-sky-500/20 to-blue-600/10', border: 'border-sky-500/20', accent: '#38bdf8', glow: 'rgba(56,189,248,0.15)' },
  atomic: { bg: 'from-cyan-500/20 to-teal-600/10', border: 'border-cyan-500/20', accent: '#22d3ee', glow: 'rgba(34,211,238,0.15)' },
};

const DEFAULT_COLOR = { bg: 'from-indigo-500/20 to-blue-600/10', border: 'border-indigo-500/20', accent: '#7c8aff', glow: 'rgba(124,138,255,0.15)' };

/* ─── Difficulty badge style ─── */
const DIFFICULTY_STYLES = {
  'Foundational': { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.2)' },
  'Core Lab': { color: '#4f8cff', bg: 'rgba(79,140,255,0.12)', border: 'rgba(79,140,255,0.2)' },
  'Intermediate': { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.2)' },
  'Advanced': { color: '#f472b6', bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.2)' },
};

export const SimulationCard = ({ sim, onSelect }) => {
  const isPhysics = sim.branch === 'physics';
  const colors = CATEGORY_COLORS[sim.category] || DEFAULT_COLOR;
  const diffStyle = DIFFICULTY_STYLES[sim.difficulty] || DIFFICULTY_STYLES['Core Lab'];

  const handleLaunch = () => {
    sounds.playClick();
    onSelect(sim.id);
  };

  return (
    <div 
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer hover:-translate-y-1.5 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]"
      style={{
        background: 'rgba(30, 30, 58, 0.5)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
      onClick={handleLaunch}
    >
      {/* ─── Thumbnail ─── */}
      <div className="relative h-44 w-full overflow-hidden bg-[#12122a]">
        <img 
          src={sim.thumbnailUrl} 
          alt={sim.name}
          onError={(e) => { e.target.style.display = 'none'; }}
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f23] via-[#0f0f23]/40 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`badge-pill ${isPhysics ? 'badge-physics' : 'badge-chemistry'}`}>
            {isPhysics ? <Zap className="w-3 h-3" /> : <Atom className="w-3 h-3" />}
            {sim.branch}
          </span>
          {sim.hasEngine && (
            <span className="badge-pill badge-interactive">
              <Sparkles className="w-2.5 h-2.5" />
              60fps
            </span>
          )}
        </div>

        {/* Difficulty badge */}
        <div className="absolute top-3 right-3">
          <span 
            className="badge-pill"
            style={{ 
              color: diffStyle.color, 
              background: diffStyle.bg, 
              border: `1px solid ${diffStyle.border}` 
            }}
          >
            {sim.difficulty}
          </span>
        </div>

        {/* Play button overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div 
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110"
            style={{ 
              background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}cc)`,
              boxShadow: `0 8px 30px ${colors.glow}`
            }}
          >
            <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
          </div>
        </div>

        {/* Title on bottom of image */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-display font-extrabold text-white text-base drop-shadow-lg line-clamp-1 group-hover:text-[var(--text-primary)] transition-colors">
            {sim.name}
          </h3>
        </div>
      </div>

      {/* ─── Card Body ─── */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        {/* Curiosity question */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-data uppercase tracking-wider" style={{ color: colors.accent }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: colors.accent }} />
            Curiosity Question
          </div>
          <p className="text-xs font-display font-bold text-white/90 leading-snug line-clamp-2 italic">
            "{sim.curiosityQuestion}"
          </p>
        </div>

        {/* Concepts */}
        <div className="space-y-2 pt-2 border-t border-white/[0.06]">
          <div className="flex flex-wrap gap-1.5">
            {sim.concepts.slice(0, 3).map((concept, i) => (
              <span 
                key={i} 
                className="px-2 py-0.5 rounded-md text-[10px] font-data bg-white/[0.05] text-[var(--text-secondary)] border border-white/[0.06]"
              >
                {concept}
              </span>
            ))}
            {sim.concepts.length > 3 && (
              <span className="px-1 py-0.5 text-[10px] font-data text-[var(--text-muted)]">
                +{sim.concepts.length - 3}
              </span>
            )}
          </div>

          {/* Launch button */}
          <div className="flex items-center justify-between pt-1">
            <div className="text-[10px] font-data text-[var(--text-muted)]">
              {sim.standards.join(' · ')}
            </div>
            <button
              id={`btn-launch-${sim.id}`}
              onClick={(e) => {
                e.stopPropagation();
                handleLaunch();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-display font-bold text-white transition-all group-hover:shadow-lg"
              style={{ 
                background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent}cc)`,
                boxShadow: `0 2px 10px ${colors.glow}`
              }}
            >
              <span>Launch</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Hover glow effect */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 0 1px ${colors.accent}33, 0 0 30px -10px ${colors.glow}`
        }}
      />
    </div>
  );
};
