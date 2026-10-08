import React, { useState, useMemo, useRef, useEffect } from 'react';
import { SIMULATIONS_DATA } from '../../data/simulationsRegistry';
import { SimulationCard } from './SimulationCard';
import anime from '../../lib/anime';
import { sounds } from '../../engine/audioEffects';

const springSnappy = { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 };
const springFluid = { type: 'spring', stiffness: 260, damping: 25, mass: 0.9 };

export const SimulationHub = ({
  onSelectSimulation,
  searchQuery,
  setSearchQuery,
  onOpenSettings,
  onOpenHelp
}) => {
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'classes' or 'cards'
  const [localSearch, setLocalSearch] = useState('');
  const heroRef = useRef(null);
  const cardsRef = useRef(null);

  const activeSearch = searchQuery !== undefined ? searchQuery : localSearch;
  const updateSearch = setSearchQuery || setLocalSearch;

  // Class definitions matching AICOS curriculum groups
  const classGroups = [
    { id: 'class-9', name: 'Class 9', labCount: 2, icon: 'school' },
    { id: 'class-10', name: 'Class 10', labCount: 4, icon: 'school' },
    { id: 'class-11', name: 'Class 11', labCount: 2, icon: 'school' },
    { id: 'class-12', name: 'Class 12', labCount: 2, icon: 'school' },
  ];

  useEffect(() => {
    if (!heroRef.current) return;
    anime({
      targets: heroRef.current,
      opacity: [0, 1],
      translateY: [20, 0],
      easing: 'easeOutExpo',
      duration: 600,
    });
  }, []);

  useEffect(() => {
    if (!cardsRef.current) return;
    anime({
      targets: cardsRef.current,
      opacity: [0, 1],
      translateY: [16, 0],
      easing: 'easeOutExpo',
      duration: 500,
      delay: anime.stagger(80),
    });
  }, []);

  const handleSelectClass = (clsId) => {
    sounds.playSnap();
    setSelectedClass(clsId);
    setViewMode('cards');
  };

  const handleBackToClasses = () => {
    sounds.playClick();
    setSelectedClass('all');
    setViewMode('classes');
  };

  const handleActionButtonHover = (e, animate) => {
    anime({
      targets: e.currentTarget,
      scale: animate ? 1.05 : 1,
      ...springSnappy,
    });
  };

  const handleClassCardHover = (e, animate) => {
    anime({
      targets: e.currentTarget,
      scale: animate ? 1.03 : 1,
      translateY: animate ? -4 : 0,
      ...springFluid,
    });
  };

  const filteredSimulations = useMemo(() => {
    return SIMULATIONS_DATA.filter(sim => {
      // Filter by subject
      if (selectedSubject !== 'all' && sim.branch !== selectedSubject.toLowerCase()) {
        return false;
      }
      // Filter by class if selected
      if (selectedClass !== 'all') {
        const classNum = selectedClass.replace('class-', '');
        if (sim.gradeLevel && !sim.gradeLevel.includes(classNum)) {
          // If no explicit match, allow relevant ones
          if (classNum === '10' && !sim.id.includes('ohm') && !sim.id.includes('lens') && !sim.id.includes('prism') && !sim.id.includes('roller')) {
            return false;
          }
        }
      }
      // Filter by search query
      if (activeSearch.trim()) {
        const query = activeSearch.toLowerCase().trim();
        return (
          sim.name.toLowerCase().includes(query) ||
          (sim.curiosityQuestion && sim.curiosityQuestion.toLowerCase().includes(query)) ||
          (sim.description && sim.description.toLowerCase().includes(query)) ||
          (sim.concepts && sim.concepts.some(c => c.toLowerCase().includes(query)))
        );
      }
      return true;
    });
  }, [selectedSubject, selectedClass, activeSearch]);

  const totalLabs = SIMULATIONS_DATA.length;
  const subjectsCount = 2; // Physics & Chemistry

  return (
    <div className="space-y-6">
      {/* ─── Top Brand & Action Bar ─── */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black shadow-sm">
            <span className="material-symbols-outlined text-xl">science</span>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-on-surface tracking-tight font-display">
              Carawin AICOS
            </h1>
            <span className="text-[10px] font-bold text-teal-700 uppercase tracking-widest block -mt-0.5">
              Virtual Science &amp; STEM Laboratory
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              onMouseEnter={(e) => handleActionButtonHover(e, true)}
              onMouseLeave={(e) => handleActionButtonHover(e, false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-teal-50 text-on-surface-variant hover:text-teal-700 text-xs font-bold border border-outline-variant/30 transition-colors"
              title="Help & Safety Guide"
            >
              <span className="material-symbols-outlined text-base">help_outline</span>
              <span className="hidden sm:inline">Guide</span>
            </button>
          )}

          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              onMouseEnter={(e) => handleActionButtonHover(e, true)}
              onMouseLeave={(e) => handleActionButtonHover(e, false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-teal-50 text-on-surface-variant hover:text-teal-700 text-xs font-bold border border-outline-variant/30 transition-colors"
              title="Simulation & Teacher Settings"
            >
              <span className="material-symbols-outlined text-base">tune</span>
              <span className="hidden sm:inline">Settings</span>
            </button>
          )}
        </div>
      </div>
      {/* ─── Hero Banner (Exact AICOS /student/simulation-lab banner) ─── */}
      <section ref={heroRef} className="relative overflow-hidden rounded-2xl p-6 sm:px-8 sm:py-7 text-white shadow-xl shadow-teal-900/20 border border-white/10 group bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800">
        {/* Subtle decorative background symbols */}
        <div className="absolute right-4 top-2 text-white/5 pointer-events-none select-none">
          <span className="material-symbols-outlined text-[140px] leading-none">science</span>
        </div>
        <div className="absolute left-1/3 bottom-0 text-white/5 pointer-events-none select-none">
          <span className="material-symbols-outlined text-[100px] leading-none">rocket_launch</span>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-teal-100 text-[10px] font-extrabold mb-3 border border-white/20 shadow-sm cursor-default">
              <span className="material-symbols-outlined text-sm text-teal-200">auto_awesome</span>
              INTERACTIVE LEARNING
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2 font-display">
              Interactive Labs
            </h1>
            <p className="text-teal-100/90 text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
              Bring your learning to life! Explore our collection of interactive, physics-based simulations and conduct experiments in a safe, virtual environment.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative overflow-hidden flex-1 md:flex-none bg-white/10 backdrop-blur-xl rounded-xl p-3.5 px-5 text-center border border-white/20 shadow-lg hover:bg-white/15 transition-all">
              <span className="material-symbols-outlined text-teal-200 text-xl mb-1 block">view_in_ar</span>
              <div className="text-[10px] font-bold text-teal-200 uppercase tracking-widest">TOTAL LABS</div>
              <div className="text-xl font-black text-white">{totalLabs}</div>
            </div>
            <div className="relative overflow-hidden flex-1 md:flex-none bg-white/10 backdrop-blur-xl rounded-xl p-3.5 px-5 text-center border border-white/20 shadow-lg hover:bg-white/15 transition-all">
              <span className="material-symbols-outlined text-emerald-200 text-xl mb-1 block">category</span>
              <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-widest">SUBJECTS</div>
              <div className="text-xl font-black text-white">{subjectsCount}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Search & Subject Filter Bar ─── */}
      <div className="bg-surface-container-lowest/90 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between sticky top-20 z-20">
        {/* Left: Search input */}
        <div className="relative w-full md:w-80 group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
            search
          </span>
          <input
            type="text"
            value={activeSearch}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Search all simulation labs..."
            className="w-full bg-surface-container pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm text-on-surface border border-outline-variant/30 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
          />
        </div>

        {/* Center: Subject Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-xl border border-outline-variant/30 overflow-x-auto w-full md:w-auto">
          {['all', 'physics', 'chemistry'].map((sub) => {
            const isActive = selectedSubject === sub;
            return (
              <button
                key={sub}
                onClick={() => {
                  sounds.playClick();
                  setSelectedSubject(sub);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all capitalize whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {sub === 'all' ? 'All Subjects' : sub}
              </button>
            );
          })}
        </div>

        {/* Right: View mode toggle / Class breadcrumb button */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {selectedClass !== 'all' ? (
            <button
              onClick={handleBackToClasses}
              onMouseEnter={(e) => handleActionButtonHover(e, true)}
              onMouseLeave={(e) => handleActionButtonHover(e, false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container text-xs font-bold text-teal-700 hover:bg-teal-50 border border-teal-200 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Classes
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-outline-variant/30 text-xs">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-teal-700 shadow-sm' : 'text-on-surface-variant'
                }`}
              >
                All Labs
              </button>
              <button
                onClick={() => setViewMode('classes')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                  viewMode === 'classes' ? 'bg-white text-teal-700 shadow-sm' : 'text-on-surface-variant'
                }`}
              >
                By Class
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Class Level Selection Grid (when in 'classes' mode) ─── */}
      {viewMode === 'classes' && selectedClass === 'all' && (
        <div>
          <div className="mb-4">
            <h2 className="text-base font-extrabold text-on-surface tracking-tight font-display">
              Browse by Curriculum Standard
            </h2>
            <p className="text-xs text-on-surface-variant">
              Select your academic class level to access graded laboratory modules.
            </p>
          </div>

          <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {classGroups.map((cls) => (
              <div
                key={cls.id}
                onClick={() => handleSelectClass(cls.id)}
                onMouseEnter={(e) => handleClassCardHover(e, true)}
                onMouseLeave={(e) => handleClassCardHover(e, false)}
                className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 hover:border-teal-500/50 hover:shadow-2xl hover:shadow-teal-900/10 hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 cursor-pointer group flex flex-col overflow-hidden relative p-8 text-center items-center"
              >
                <div className="w-20 h-20 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-teal-500 group-hover:to-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm mb-6 border border-teal-100 group-hover:border-transparent">
                  <span className="material-symbols-outlined text-4xl">
                    {cls.icon}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-on-surface group-hover:text-teal-700 transition-colors font-display">
                  {cls.name}
                </h3>
                <span className="mt-2 text-xs font-extrabold px-3 py-1 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant/20 tracking-wider">
                  {cls.labCount} LABS
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Simulation Labs Grid (All Labs or Class Filtered) ─── */}
      {(viewMode === 'cards' || selectedClass !== 'all') && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-on-surface tracking-tight font-display flex items-center gap-2">
                <span>{selectedClass !== 'all' ? `${selectedClass.replace('class-', 'Class ')} Experiments` : 'All Laboratory Modules'}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  {filteredSimulations.length} Available
                </span>
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Hands-on interactive virtual laboratory modules with real-time physics and telemetry.
              </p>
            </div>
          </div>

          {filteredSimulations.length === 0 ? (
            <div className="p-12 text-center bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-2 block">
                search_off
              </span>
              <h3 className="text-sm font-bold text-on-surface">No experiments match your search</h3>
              <p className="text-xs text-on-surface-variant mt-1">Try clearing your search terms or selecting another subject.</p>
              <button
                onClick={() => {
                  updateSearch('');
                  setSelectedSubject('all');
                  setSelectedClass('all');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold hover:bg-teal-700 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSimulations.map((sim) => (
                <SimulationCard
                  key={sim.id}
                  sim={sim}
                  onSelect={onSelectSimulation}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};