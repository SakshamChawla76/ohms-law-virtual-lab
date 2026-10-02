import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Atom, 
  Search, 
  Sparkles, 
  ChevronRight,
  Beaker,
  Lightbulb,
  Rocket,
  Flame,
  Star,
  Play,
  ArrowRight,
  X
} from 'lucide-react';
import { SIMULATIONS_DATA, SIMULATION_CATEGORIES } from '../../data/simulationsRegistry';
import { SimulationCard } from './SimulationCard';
import { sounds } from '../../engine/audioEffects';

/* ─── Animated molecule/atom SVG illustration ─── */
const HeroIllustration = () => (
  <div className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0">
    {/* Central atom */}
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 shadow-[0_0_40px_rgba(79,140,255,0.4)] flex items-center justify-center">
        <Atom className="w-8 h-8 text-white" />
      </div>
    </div>
    {/* Orbiting electrons */}
    {[0, 120, 240].map((deg, i) => (
      <div key={i} className="absolute inset-0" style={{ transform: `rotate(${deg}deg)` }}>
        <div 
          className="absolute w-4 h-4 rounded-full shadow-lg"
          style={{
            background: i === 0 ? '#4f8cff' : i === 1 ? '#34d399' : '#fbbf24',
            boxShadow: `0 0 12px ${i === 0 ? 'rgba(79,140,255,0.6)' : i === 1 ? 'rgba(52,211,153,0.6)' : 'rgba(251,191,36,0.6)'}`,
            animation: `orbit ${3 + i * 0.5}s linear infinite`,
            top: '50%',
            left: '50%',
            marginTop: '-8px',
            marginLeft: '-8px'
          }}
        />
      </div>
    ))}
    {/* Orbital rings */}
    {[80, 100, 120].map((size, i) => (
      <div 
        key={i}
        className="absolute border rounded-full opacity-20"
        style={{
          width: size * 2,
          height: size,
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) rotate(${i * 60}deg)`,
          borderColor: i === 0 ? '#4f8cff' : i === 1 ? '#34d399' : '#fbbf24'
        }}
      />
    ))}
  </div>
);

/* ─── Stats counter card ─── */
const StatCard = ({ icon: Icon, value, label, color }) => (
  <div className="glass-card-static p-4 flex items-center gap-3 group hover:border-white/15 transition-all">
    <div 
      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-display font-bold text-sm"
      style={{ background: `linear-gradient(135deg, ${color}33, ${color}11)`, border: `1px solid ${color}33` }}
    >
      <Icon className="w-5 h-5" style={{ color }} />
    </div>
    <div>
      <div className="font-display font-extrabold text-lg text-white leading-none">{value}</div>
      <div className="text-xs text-[var(--text-muted)] font-body mt-0.5">{label}</div>
    </div>
  </div>
);

export const SimulationHub = ({ onSelectSimulation }) => {
  const [activeBranch, setActiveBranch] = useState('physics');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleBranchSwitch = (branch) => {
    sounds.playSnap();
    setActiveBranch(branch);
    setSelectedCategory('all');
    setSelectedDifficulty('all');
  };

  const categories = SIMULATION_CATEGORIES[activeBranch] || [];

  const filteredSimulations = useMemo(() => {
    return SIMULATIONS_DATA.filter(sim => {
      if (sim.branch !== activeBranch) return false;
      if (selectedCategory !== 'all' && sim.category !== selectedCategory) return false;
      if (selectedDifficulty !== 'all' && sim.difficulty !== selectedDifficulty) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        return (
          sim.name.toLowerCase().includes(query) ||
          sim.curiosityQuestion.toLowerCase().includes(query) ||
          sim.description.toLowerCase().includes(query) ||
          sim.concepts.some(c => c.toLowerCase().includes(query)) ||
          sim.standards.some(s => s.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [activeBranch, selectedCategory, selectedDifficulty, searchQuery]);

  const featuredSim = useMemo(() => {
    return SIMULATIONS_DATA.find(s => s.branch === activeBranch && s.isFeatured) || SIMULATIONS_DATA[0];
  }, [activeBranch]);

  const physicsCount = SIMULATIONS_DATA.filter(s => s.branch === 'physics').length;
  const chemistryCount = SIMULATIONS_DATA.filter(s => s.branch === 'chemistry').length;

  const difficultyOptions = ['all', 'Foundational', 'Core Lab', 'Intermediate', 'Advanced'];
  const difficultyColors = {
    'Foundational': '#34d399',
    'Core Lab': '#4f8cff',
    'Intermediate': '#fbbf24',
    'Advanced': '#f472b6'
  };

  return (
    <div className="min-h-screen bg-cosmos bg-particles">
      {/* ═══ Top Navigation Bar ═══ */}
      <header className="sticky top-0 z-30 bg-[#0f0f23]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,140,255,0.3)]">
              <Beaker className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-base md:text-lg text-white tracking-tight">
                STEM Labs
              </h1>
              <p className="text-[11px] text-[var(--text-muted)] font-body">
                Interactive Science Simulations
              </p>
            </div>
          </div>

          {/* Branch Switcher */}
          <div className="flex items-center bg-white/[0.04] p-1 rounded-full border border-white/[0.08]">
            <button
              onClick={() => handleBranchSwitch('physics')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-display font-bold transition-all ${
                activeBranch === 'physics'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_4px_15px_rgba(79,140,255,0.3)]'
                  : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Physics</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-data ${
                activeBranch === 'physics' ? 'bg-white/20' : 'bg-white/[0.06]'
              }`}>
                {physicsCount}
              </span>
            </button>

            <button
              onClick={() => handleBranchSwitch('chemistry')}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-display font-bold transition-all ${
                activeBranch === 'chemistry'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_4px_15px_rgba(52,211,153,0.3)]'
                  : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.06]'
              }`}
            >
              <Atom className="w-4 h-4" />
              <span>Chemistry</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-data ${
                activeBranch === 'chemistry' ? 'bg-white/20' : 'bg-white/[0.06]'
              }`}>
                {chemistryCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ═══ Main Content ═══ */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* ─── Hero Section ─── */}
        <div className="animate-fade-in-up relative overflow-hidden rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center gap-8"
          style={{
            background: activeBranch === 'physics' 
              ? 'linear-gradient(135deg, rgba(79,140,255,0.12) 0%, rgba(124,92,252,0.08) 50%, rgba(30,30,58,0.6) 100%)'
              : 'linear-gradient(135deg, rgba(52,211,153,0.12) 0%, rgba(34,211,238,0.08) 50%, rgba(30,30,58,0.6) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(16px)'
          }}
        >
          {/* Text side */}
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="badge-pill badge-interactive">
                <Sparkles className="w-3 h-3" />
                Featured Lab
              </span>
              <span className="badge-pill bg-white/[0.06] text-[var(--text-muted)] border border-white/[0.08]">
                {featuredSim.standards.join(' · ')}
              </span>
            </div>

            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white tracking-tight leading-tight">
              {featuredSim.name}
            </h2>

            <p className="text-base font-display font-semibold italic" style={{ color: activeBranch === 'physics' ? '#7cb3ff' : '#6ee7b7' }}>
              "{featuredSim.curiosityQuestion}"
            </p>

            <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-lg">
              {featuredSim.description}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              {featuredSim.concepts.map((c, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-data bg-white/[0.06] text-[var(--text-secondary)] border border-white/[0.06]">
                  {c}
                </span>
              ))}
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => {
                  sounds.playClick();
                  onSelectSimulation(featuredSim.id);
                }}
                className="btn-primary text-base px-7 py-3"
              >
                <Play className="w-5 h-5" />
                Launch Lab
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Illustration side */}
          <HeroIllustration />
        </div>

        {/* ─── Stats Bar ─── */}
        <div className="animate-fade-in-up animate-delay-100 grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={Beaker} value="22" label="Interactive Labs" color="#4f8cff" />
          <StatCard icon={Rocket} value="60fps" label="Visual Engines" color="#a78bfa" />
          <StatCard icon={Lightbulb} value="4" label="Learning Stages" color="#fbbf24" />
          <StatCard icon={Star} value="NGSS" label="Standards Aligned" color="#34d399" />
        </div>

        {/* ─── Search & Filters ─── */}
        <div className="animate-fade-in-up animate-delay-200 glass-card-static p-5 space-y-4">
          {/* Search Input */}
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeBranch} labs — try "voltage", "momentum", "reaction"...`}
                className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-body text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-physics)] focus:ring-1 focus:ring-[var(--accent-physics)]/30 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/[0.08] text-[var(--text-muted)] hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="text-xs font-data text-[var(--text-muted)] shrink-0">
              {filteredSimulations.length} {filteredSimulations.length === 1 ? 'lab' : 'labs'} found
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-data text-[var(--text-muted)] uppercase tracking-wider mr-1">Topic</span>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sounds.playTick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-display font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-white border border-blue-500/30 shadow-[0_0_10px_rgba(79,140,255,0.15)]'
                    : 'bg-white/[0.04] text-[var(--text-secondary)] border border-white/[0.06] hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Difficulty Filter */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06]">
            <span className="text-[11px] font-data text-[var(--text-muted)] uppercase tracking-wider mr-1">Level</span>
            {difficultyOptions.map((diff) => {
              const isActive = selectedDifficulty === diff;
              const color = difficultyColors[diff] || '#7c8aff';
              return (
                <button
                  key={diff}
                  onClick={() => {
                    sounds.playTick();
                    setSelectedDifficulty(diff);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-display font-bold transition-all ${
                    isActive
                      ? 'text-white border shadow-sm'
                      : 'bg-white/[0.03] text-[var(--text-secondary)] border border-white/[0.06] hover:bg-white/[0.06] hover:text-white'
                  }`}
                  style={isActive ? {
                    background: `${color}22`,
                    borderColor: `${color}44`,
                    boxShadow: `0 0 12px ${color}20`
                  } : {}}
                >
                  {diff === 'all' ? 'All Levels' : diff}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Simulation Cards Grid ─── */}
        {filteredSimulations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredSimulations.map((sim, index) => (
              <div 
                key={sim.id} 
                className="animate-fade-in-up"
                style={{ animationDelay: `${Math.min(index * 60, 400)}ms` }}
              >
                <SimulationCard sim={sim} onSelect={onSelectSimulation} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-card-static space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto">
              <Search className="w-7 h-7 text-[var(--text-muted)]" />
            </div>
            <h3 className="font-display font-bold text-xl text-white">
              No labs found
            </h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm mx-auto">
              No simulations match "{searchQuery}". Try searching for "voltage", "momentum", "reaction", or "density".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
              }}
              className="btn-primary"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* ═══ Footer ═══ */}
      <footer className="mt-16 border-t border-white/[0.06] py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <Beaker className="w-4 h-4 text-[var(--accent-physics)]" />
            <span className="font-body">NGSS-Aligned Interactive STEM Simulations</span>
          </div>
          <div className="flex items-center gap-3 font-data text-[11px]">
            <span className="flex items-center gap-1.5">
              <Lightbulb className="w-3 h-3" /> Curiosity
            </span>
            <span className="text-white/20">→</span>
            <span className="flex items-center gap-1.5">
              <Play className="w-3 h-3" /> Sandbox
            </span>
            <span className="text-white/20">→</span>
            <span className="flex items-center gap-1.5">
              <Rocket className="w-3 h-3" /> Applications
            </span>
            <span className="text-white/20">→</span>
            <span className="flex items-center gap-1.5">
              <Star className="w-3 h-3" /> Challenges
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
