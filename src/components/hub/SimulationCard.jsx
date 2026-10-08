import React, { useRef, useEffect } from 'react';
import anime from '../../lib/anime';
import { sounds } from '../../engine/audioEffects';

const springSnappy = { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 };
const springFluid = { type: 'spring', stiffness: 260, damping: 25, mass: 0.9 };

// Mapping simulation categories and types to AICOS Material Symbols
const SIM_ICONS = {
  'ohms-law': 'electric_bolt',
  'roller-coaster': 'skateboarding',
  'airbag': 'air',
  'diamond-cut': 'diamond',
  'density': 'science',
  'bumper-cars': 'directions_car',
  'bow-and-arrow': 'crisis_alert',
  'doppler-ducks': 'waves',
  'phases-of-matter': 'bubble_chart',
  'atom-builder': 'scatter_plot',
};

export const SimulationCard = ({ sim, onSelect }) => {
  const cardRef = useRef(null);
  const shimmerRef = useRef(null);
  const iconRef = useRef(null);
  const isPhysics = sim.branch === 'physics';
  const iconName = SIM_ICONS[sim.id] || (isPhysics ? 'lens' : 'biotech');

  useEffect(() => {
    if (!cardRef.current) return;
    anime({
      targets: cardRef.current,
      opacity: [0, 1],
      translateY: [16, 0],
      easing: 'easeOutExpo',
      duration: 500,
    });
  }, []);

  const handleLaunch = () => {
    sounds.playClick();
    onSelect(sim.id);
  };

  const handleCardHover = (e, animate) => {
    anime({
      targets: cardRef.current,
      scale: animate ? 1.02 : 1,
      translateY: animate ? -4 : 0,
      borderColor: animate ? 'rgba(20, 184, 166, 0.33)' : 'rgba(21, 128, 114, 0.2)',
      boxShadow: animate
        ? '0 24px 32px -8px rgba(20, 184, 166, 0.1)'
        : '0 1px 3px rgba(0,0,0,0.05)',
      ...springFluid,
    });
  };

  const handleIconHover = (e, animate) => {
    anime({
      targets: iconRef.current,
      scale: animate ? 1.1 : 1,
      rotate: animate ? -6 : 0,
      ...springSnappy,
    });
  };

  const handleShimmerHover = (e, animate) => {
    if (!shimmerRef.current) return;
    anime({
      targets: shimmerRef.current,
      translateX: animate ? ['-100%', '100%'] : '-100%',
      duration: animate ? 800 : 0,
      easing: 'easeInOutSine',
    });
  };

  return (
    <div
      ref={cardRef}
      onClick={handleLaunch}
      className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 hover:border-teal-500/50 hover:shadow-2xl hover:shadow-teal-900/10 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 cursor-pointer group flex flex-col overflow-hidden relative"
      onMouseEnter={(e) => { handleCardHover(e, true); handleShimmerHover(e, true); }}
      onMouseLeave={(e) => { handleCardHover(e, false); handleShimmerHover(e, false); }}
    >
      {/* Animated Light Shimmer Effect on Hover */}
      <div
        ref={shimmerRef}
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-teal-500/10 to-transparent z-10 pointer-events-none"
      />

      {/* Top Gradient Glow Strip */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-6 flex flex-col flex-1 relative z-0">
        {/* Header: Icon container + Subject & Class Badge */}
        <div className="flex items-start justify-between mb-5">
          <div
            ref={iconRef}
            className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center shadow-sm border border-teal-100"
          >
            <span className="material-symbols-outlined text-3xl">
              {iconName}
            </span>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md border uppercase tracking-wider ${
              isPhysics
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                : 'bg-teal-50 text-teal-700 border-teal-200/60'
            }`}>
              {sim.branch}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface-container text-on-surface-variant border border-outline-variant/20 uppercase tracking-widest">
              {sim.gradeLevel || 'Class 10'}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-on-surface mb-2 group-hover:text-teal-700 transition-colors font-display tracking-tight">
          {sim.name}
        </h3>

        {/* Curiosity Question or Description */}
        <p className="text-sm text-on-surface-variant flex-1 leading-relaxed line-clamp-3">
          {sim.description || sim.curiosityQuestion}
        </p>

        {/* Standards / Topics tags */}
        {sim.concepts && sim.concepts.length > 0 && (
          <div className="flex flex-wrap gap-1.5 my-4">
            {sim.concepts.slice(0, 3).map((concept, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant border border-outline-variant/20"
              >
                {concept}
              </span>
            ))}
          </div>
        )}

        {/* Footer: Launch Button */}
        <div className="mt-4 pt-4 border-t border-outline-variant/20 flex items-center justify-between">
          <span className="text-xs font-bold text-on-surface-variant group-hover:text-teal-700 transition-colors tracking-wide">
            Launch Module
          </span>
          <div className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center group-hover:bg-teal-100 group-hover:text-teal-700 transition-all duration-300 group-hover:translate-x-1 shadow-sm">
            <span className="material-symbols-outlined text-sm font-bold">
              rocket_launch
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};