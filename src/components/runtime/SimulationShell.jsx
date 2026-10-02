import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  FlaskConical, 
  GraduationCap, 
  Award, 
  Clock, 
  Volume2, 
  VolumeX, 
  Zap,
  Atom,
  Lightbulb,
  Play,
  Rocket,
  Star
} from 'lucide-react';
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
    { id: 'curiosity', label: '1. Curiosity', icon: Lightbulb },
    { id: 'sandbox', label: '2. Sandbox', icon: Play, highlight: true },
    { id: 'challenge', label: '3. Challenge', icon: Rocket, aliases: ['challenges'] },
    { id: 'applications', label: '4. Apply', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col bg-cosmos">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0f0f23]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-lg select-none">
        {/* Gradient accent bar */}
        <div className="h-0.5" style={{
          background: isPhysics 
            ? 'linear-gradient(90deg, #4f8cff, #7c5cfc, #a78bfa)' 
            : 'linear-gradient(90deg, #34d399, #22d3ee, #38bdf8)'
        }} />

        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Back + Title */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              id="hub-back-btn"
              onClick={() => {
                sounds.playClick();
                onBackToHub();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-[var(--text-secondary)] hover:text-white text-xs font-display font-bold transition-all"
              title="Return to Simulations Hub"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Hub</span>
            </button>

            <div className="flex items-center gap-2.5">
              <span className={`p-1.5 rounded-xl text-white shadow-lg ${
                isPhysics 
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20' 
                  : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20'
              }`}>
                {isPhysics ? <Zap className="w-4 h-4" /> : <Atom className="w-4 h-4" />}
              </span>

              <div>
                <h1 className="text-sm md:text-base font-display font-extrabold tracking-tight text-white line-clamp-1">
                  {simulation.name}
                </h1>
                <p className="text-[11px] font-data text-[var(--text-muted)] line-clamp-1">
                  {simulation.standards.join(' · ')} · {simulation.difficulty}
                </p>
              </div>
            </div>
          </div>

          {/* 4-Stage Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.06] text-xs font-display">
            {tabItems.map(tab => {
              const isActive = activeTab === tab.id || (tab.aliases && tab.aliases.includes(activeTab));
              return (
                <button
                  key={tab.id}
                  onClick={() => { sounds.playTick(); setActiveTab(tab.id); }}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-bold ${
                    tab.highlight && isActive
                      ? `${isPhysics 
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_2px_10px_rgba(79,140,255,0.3)]'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_2px_10px_rgba(52,211,153,0.3)]'
                        } text-white`
                      : isActive
                        ? 'bg-white/[0.1] text-white border border-white/[0.1]'
                        : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Telemetry */}
          <div className="flex items-center gap-2 font-data text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-emerald-300">{formatTime(elapsedSeconds)}</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold text-amber-300">{score}</span>
              <span className="text-[10px] text-[var(--text-muted)]">/{maxScore}</span>
            </div>

            <button
              onClick={toggleAudio}
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[var(--text-secondary)] hover:text-white transition-colors"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Simulation Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-4">
        {children}
      </main>
    </div>
  );
};
