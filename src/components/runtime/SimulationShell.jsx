import React, { useState, useEffect } from 'react';
import { sounds } from '../../engine/audioEffects';

export const SimulationShell = ({
  simulation,
  onBackToHub,
  activeTab,
  setActiveTab,
  score = 0,
  maxScore = 100,
  children
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(!sounds.enabled);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  const toggleAudio = () => {
    sounds.enabled = !sounds.enabled;
    setIsMuted(!sounds.enabled);
    if (sounds.enabled) sounds.playSnap();
  };

  const isPhysics = simulation.branch === 'physics';

  const tabItems = [
    { id: 'curiosity', label: '1. Curiosity', icon: 'lightbulb' },
    { id: 'sandbox', label: '2. Experiment Bench', icon: 'play_arrow', highlight: true },
    { id: 'challenge', label: '3. Challenge', icon: 'flag' },
    { id: 'applications', label: '4. Real World', icon: 'public' },
  ];

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface flex flex-col font-sans">
      {/* ─── AICOS Simulation Top Bar ─── */}
      <header className="sticky top-0 z-40 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/30 px-4 sm:px-6 py-3 shadow-sm select-none">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Left: Back to Catalog Button + Experiment Info */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
            <button
              id="hub-back-btn"
              onClick={() => {
                sounds.playClick();
                onBackToHub();
              }}
              className="group flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-teal-50 text-on-surface-variant hover:text-teal-700 text-xs sm:text-sm font-bold transition-all duration-200 border border-transparent hover:border-teal-200"
              title="Return to Catalog"
            >
              <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
                arrow_back
              </span>
              <span>Back to Catalog</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-on-surface tracking-tight font-display">
                {simulation.name}
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant border border-outline-variant/20 uppercase tracking-wider hidden sm:inline-block">
                {simulation.gradeLevel || 'Class 10'}
              </span>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border uppercase tracking-wider ${
                isPhysics 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                  : 'bg-teal-50 text-teal-700 border-teal-200/60'
              }`}>
                {simulation.branch}
              </span>
            </div>
          </div>

          {/* Center: Stage Navigation Chips */}
          <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-xl border border-outline-variant/30 overflow-x-auto w-full lg:w-auto justify-center">
            {tabItems.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-teal-700 shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right: Live Telemetry, Timer & Audio */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant/20 text-xs font-mono text-on-surface-variant">
              <span className="material-symbols-outlined text-sm text-teal-600">timer</span>
              <span>{formatTime(elapsedSeconds)}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800">
              <span className="material-symbols-outlined text-sm text-teal-600">military_tech</span>
              <span>{score}/{maxScore} pts</span>
            </div>

            <button
              onClick={toggleAudio}
              className={`p-1.5 rounded-lg border transition-colors ${
                isMuted 
                  ? 'bg-surface-container text-on-surface-variant/50 border-outline-variant/30' 
                  : 'bg-teal-50 text-teal-700 border-teal-200'
              }`}
              title={isMuted ? "Unmute audio" : "Mute audio"}
            >
              <span className="material-symbols-outlined text-base">
                {isMuted ? 'volume_off' : 'volume_up'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Simulation Active Stage Viewport ─── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col">
        <div className="w-full flex-grow relative rounded-2xl border border-outline-variant/30 overflow-hidden shadow-sm bg-surface-container-lowest p-1 sm:p-2">
          {children}
        </div>
      </main>
    </div>
  );
};
