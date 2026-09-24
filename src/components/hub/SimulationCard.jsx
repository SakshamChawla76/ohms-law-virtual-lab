import React from 'react';
import { ArrowRight, Sparkles, Award, Atom, Zap, Layers, PlayCircle } from 'lucide-react';
import { sounds } from '../../engine/audioEffects';

export const SimulationCard = ({ sim, onSelect }) => {
  const isPhysics = sim.branch === 'physics';

  const handleLaunch = () => {
    sounds.playClick();
    onSelect(sim.id);
  };

  return (
    <div className="group flex flex-col bg-white rounded-xl border border-slate-200/90 hover:border-amber-400/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden text-left">
      {/* Thumbnail Container with Real-World Scene */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-800 flex items-center justify-center">
        <img 
          src={sim.thumbnailUrl} 
          alt={sim.name}
          onError={(e) => { e.target.style.display = 'none'; }}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Soft gradient bottom scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

        {/* Branch Badge (Physics vs Chemistry) */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${
            isPhysics 
              ? 'bg-blue-600/90 text-white border border-blue-400/30' 
              : 'bg-emerald-600/90 text-white border border-emerald-400/30'
          }`}>
            {isPhysics ? <Zap className="w-3 h-3" /> : <Atom className="w-3 h-3" />}
            {sim.branch}
          </span>

          {sim.hasEngine && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-white shadow-sm">
              <Sparkles className="w-2.5 h-2.5" />
              Interactive 60fps
            </span>
          )}
        </div>

        {/* Difficulty Badge */}
        <div className="absolute top-2.5 right-2.5">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/90 text-slate-700 font-semibold border border-slate-200/60 shadow-sm">
            {sim.difficulty}
          </span>
        </div>

        {/* Simulation Title Overlay on bottom of image */}
        <div className="absolute bottom-2.5 left-3 right-3">
          <h3 className="text-white text-base font-bold font-sans drop-shadow-sm line-clamp-1">
            {sim.name}
          </h3>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        {/* Curiosity Question Framing */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono font-bold text-amber-700 uppercase tracking-wide flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Curiosity Question
          </div>
          <p className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2 italic">
            "{sim.curiosityQuestion}"
          </p>
          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
            {sim.description}
          </p>
        </div>

        {/* Concepts & NGSS Standards */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap gap-1">
            {sim.concepts.slice(0, 3).map((concept, i) => (
              <span 
                key={i} 
                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 border border-slate-200"
              >
                {concept}
              </span>
            ))}
            {sim.concepts.length > 3 && (
              <span className="px-1 py-0.5 text-[10px] font-mono text-slate-400">
                +{sim.concepts.length - 3}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
              <Award className="w-3 h-3 text-slate-400" />
              <span>{sim.standards.join(', ')}</span>
            </div>

            <button
              id={`btn-launch-${sim.id}`}
              onClick={handleLaunch}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-mono font-bold transition-all shadow-sm group-hover:bg-amber-600"
            >
              <span>Launch Lab</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
