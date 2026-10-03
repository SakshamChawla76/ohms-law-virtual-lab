import React, { useState, useEffect } from 'react';
import { sounds } from '../engine/audioEffects';

export const Header = ({
  currentScreen,
  setScreen,
  mode,
  setMode,
  scoreState,
  onOpenSettings,
  onOpenHelp,
  onResetLab,
  onBackToHub,
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
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const toggleSound = () => {
    sounds.enabled = !sounds.enabled;
    setIsMuted(!sounds.enabled);
    if (sounds.enabled) sounds.playSnap();
  };

  const totalScore = Math.max(0, 
    scoreState.circuitAssembly + 
    scoreState.meterConnection + 
    scoreState.measurements + 
    scoreState.calculations + 
    scoreState.graphAnalysis - 
    scoreState.penalties
  );

  const navItems = [
    { id: 'intro', label: 'Intro', icon: 'menu_book' },
    { id: 'theory', label: 'Theory', icon: 'auto_stories' },
    { id: 'apparatus', label: 'Apparatus', icon: 'precision_manufacturing' },
    { id: 'lab', label: 'Workbench', icon: 'science', highlight: true },
    { id: 'quiz', label: 'Quiz', icon: 'quiz' },
    { id: 'dashboard', label: 'Report', icon: 'analytics' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-outline-variant/30 bg-surface-container-lowest/90 backdrop-blur-md shadow-sm select-none">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Brand & Instrument Name */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          {onBackToHub && (
            <button
              id="header-hub-btn"
              onClick={() => {
                sounds.playClick();
                onBackToHub();
              }}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-teal-50 text-on-surface-variant hover:text-teal-700 text-xs font-bold transition-all border border-transparent hover:border-teal-200"
              title="Return to Catalog"
            >
              <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
                arrow_back
              </span>
              <span>Back to Catalog</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-lg">electric_bolt</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-on-surface tracking-tight font-display">
                  Ohm's Law Precision Lab
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant border border-outline-variant/20 uppercase tracking-wider">
                  Class 10
                </span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60 uppercase tracking-wider">
                  Physics
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Stage Navigation Chips */}
        <div className="flex items-center gap-1 p-1 bg-surface-container rounded-xl border border-outline-variant/30 overflow-x-auto w-full lg:w-auto justify-center">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sounds.playClick();
                  setScreen(item.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Controls & Telemetry */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
          {/* Mode Selector */}
          <div className="flex items-center bg-surface-container p-0.5 rounded-lg border border-outline-variant/30">
            <button
              onClick={() => {
                sounds.playSnap();
                setMode('guided');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                mode === 'guided' 
                  ? 'bg-white text-teal-700 shadow-sm' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Guided
            </button>
            <button
              onClick={() => {
                sounds.playSnap();
                setMode('exploration');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                mode === 'exploration' 
                  ? 'bg-white text-teal-700 shadow-sm' 
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Explore
            </button>
          </div>

          {/* Timer */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container border border-outline-variant/20 text-xs font-mono text-on-surface-variant">
            <span className="material-symbols-outlined text-sm text-teal-600">timer</span>
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          {/* Score Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-xs font-bold text-teal-800">
            <span className="material-symbols-outlined text-sm text-teal-600">military_tech</span>
            <span>{totalScore} pts</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
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

          {/* Reset Button */}
          {onResetLab && (
            <button
              onClick={onResetLab}
              className="p-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-teal-700 hover:bg-teal-50 border border-outline-variant/30 transition-colors"
              title="Reset Circuit"
            >
              <span className="material-symbols-outlined text-base">restart_alt</span>
            </button>
          )}

          {/* Help Button */}
          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              className="p-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-teal-700 hover:bg-teal-50 border border-outline-variant/30 transition-colors"
              title="Help & Guidance"
            >
              <span className="material-symbols-outlined text-base">help_outline</span>
            </button>
          )}

          {/* Settings Button */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-teal-700 hover:bg-teal-50 border border-outline-variant/30 transition-colors"
              title="Experiment Settings"
            >
              <span className="material-symbols-outlined text-base">tune</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
