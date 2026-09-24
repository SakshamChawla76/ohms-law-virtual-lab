import React, { useState, useMemo } from 'react';
import { 
  Zap, 
  Atom, 
  Search, 
  Filter, 
  Sparkles, 
  Compass, 
  BookOpen, 
  FlaskConical, 
  Layers, 
  ChevronRight,
  HelpCircle,
  Award
} from 'lucide-react';
import { SIMULATIONS_DATA, SIMULATION_CATEGORIES } from '../../data/simulationsRegistry';
import { SimulationCard } from './SimulationCard';
import { sounds } from '../../engine/audioEffects';

export const SimulationHub = ({ onSelectSimulation }) => {
  const [activeBranch, setActiveBranch] = useState('physics'); // 'physics' | 'chemistry'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Handle branch switch
  const handleBranchSwitch = (branch) => {
    sounds.playSnap();
    setActiveBranch(branch);
    setSelectedCategory('all');
  };

  // Categories for current branch
  const categories = SIMULATION_CATEGORIES[activeBranch] || [];

  // Filtered simulations
  const filteredSimulations = useMemo(() => {
    return SIMULATIONS_DATA.filter(sim => {
      // Branch filter
      if (sim.branch !== activeBranch) return false;

      // Category filter
      if (selectedCategory !== 'all' && sim.category !== selectedCategory) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = sim.name.toLowerCase().includes(query);
        const matchCuriosity = sim.curiosityQuestion.toLowerCase().includes(query);
        const matchDesc = sim.description.toLowerCase().includes(query);
        const matchConcepts = sim.concepts.some(c => c.toLowerCase().includes(query));
        const matchStandards = sim.standards.some(s => s.toLowerCase().includes(query));
        return matchName || matchCuriosity || matchDesc || matchConcepts || matchStandards;
      }

      return true;
    });
  }, [activeBranch, selectedCategory, searchQuery]);

  // Featured Simulation for the current branch
  const featuredSim = useMemo(() => {
    return SIMULATIONS_DATA.find(s => s.branch === activeBranch && s.isFeatured) || SIMULATIONS_DATA[0];
  }, [activeBranch]);

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 flex flex-col">
      {/* Top Academic Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Logo & Platform Nomenclature */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-sm">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-bold font-sans tracking-tight text-slate-900">
                  PRECISION STEM VIRTUAL LABS
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300/60">
                  PHYSICS & CHEMISTRY
                </span>
              </div>
              <p className="text-xs text-slate-500 font-sans">
                Real-World Inquiry-Based STEM Laboratories • 60 FPS Interactive Visual Engines
              </p>
            </div>
          </div>

          {/* Branch Switcher (Physics ⇄ Chemistry) */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner text-xs font-mono">
            <button
              onClick={() => handleBranchSwitch('physics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold ${
                activeBranch === 'physics'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Physics Simulations</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeBranch === 'physics' ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600'
              }`}>
                {SIMULATIONS_DATA.filter(s => s.branch === 'physics').length}
              </span>
            </button>

            <button
              onClick={() => handleBranchSwitch('chemistry')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-bold ${
                activeBranch === 'chemistry'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Atom className="w-4 h-4" />
              <span>Chemistry Simulations</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeBranch === 'chemistry' ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-600'
              }`}>
                {SIMULATIONS_DATA.filter(s => s.branch === 'chemistry').length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hub Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-6">
        {/* Featured Showcase Hero Banner */}
        {featuredSim && (
          <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl text-left">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  Featured Interactive Laboratory
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {featuredSim.standards.join(' • ')}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold font-sans text-slate-900 tracking-tight">
                {featuredSim.name}
              </h2>

              <p className="text-sm font-semibold text-amber-800 italic">
                "{featuredSim.curiosityQuestion}"
              </p>

              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                {featuredSim.description}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {featuredSim.concepts.map((c, i) => (
                  <span key={i} className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                    {c}
                  </span>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    sounds.playClick();
                    onSelectSimulation(featuredSim.id);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-mono font-bold text-sm shadow-sm transition-all"
                >
                  <span>Launch Featured Laboratory</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Thumbnail Preview on Right */}
            <div className="relative w-full md:w-80 h-48 rounded-xl overflow-hidden shadow-sm border border-slate-200 shrink-0 bg-slate-800">
              <img 
                src={featuredSim.thumbnailUrl} 
                alt={featuredSim.name}
                onError={(e) => { e.target.style.display = 'none'; }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-4">
                <span className="text-white text-xs font-mono font-bold">
                  {featuredSim.difficulty} // 60 FPS Engine
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Search & Topic Filters Toolbar */}
        <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          {/* Top Search Input */}
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${activeBranch} labs by concept, curiosity question, formula, or NGSS standard...`}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-sans text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Showing: <strong>{filteredSimulations.length}</strong> simulations</span>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  sounds.playTick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-slate-800 text-white font-bold shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Simulations Card Grid */}
        {filteredSimulations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredSimulations.map((sim) => (
              <SimulationCard
                key={sim.id}
                sim={sim}
                onSelect={onSelectSimulation}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold font-mono text-slate-800">
              No matching simulations found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-sans">
              No simulations match your current search query "{searchQuery}". Try clearing filters or searching for terms like "voltage", "momentum", "reaction", or "density".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-mono font-bold hover:bg-amber-600"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* Academic Hub Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6 text-xs text-slate-500 font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <span>NGSS-Aligned Academic Simulations Architecture • 4-Stage Pedagogical Framework</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>1. Curiosity Framing</span>
            <span>•</span>
            <span>2. 60 FPS Sandbox</span>
            <span>•</span>
            <span>3. Challenge Me</span>
            <span>•</span>
            <span>4. Real-World Applications</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
