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
  RotateCcw,
  Zap,
  Atom,
  HelpCircle
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

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 flex flex-col">
      {/* Precision Academic Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm select-none">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Back Button & Title */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              id="hub-back-btn"
              onClick={() => {
                sounds.playClick();
                onBackToHub();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-mono font-bold text-slate-700 transition-all"
              title="Return to Simulations Hub"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Hub</span>
            </button>

            <div className="flex items-center gap-2">
              <span className={`p-1.5 rounded-lg border text-white ${
                isPhysics 
                  ? 'bg-blue-600 border-blue-700' 
                  : 'bg-emerald-600 border-emerald-700'
              }`}>
                {isPhysics ? <Zap className="w-4 h-4" /> : <Atom className="w-4 h-4" />}
              </span>

              <div>
                <h1 className="text-sm md:text-base font-bold font-mono tracking-tight text-slate-900 line-clamp-1">
                  {simulation.name}
                </h1>
                <p className="text-[11px] font-mono text-slate-500 line-clamp-1">
                  {simulation.standards.join(' • ')} // {simulation.difficulty.toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* 4-Stage Pedagogical Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-mono">
            <button
              onClick={() => { sounds.playTick(); setActiveTab('curiosity'); }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'curiosity'
                  ? 'bg-white text-slate-900 font-bold border border-slate-300 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">1. Curiosity</span>
            </button>

            <button
              onClick={() => { sounds.playTick(); setActiveTab('sandbox'); }}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'sandbox'
                  ? 'bg-amber-500 text-white font-bold shadow-sm'
                  : 'text-amber-800 hover:bg-amber-100/60'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span className="font-bold">2. Sandbox</span>
            </button>

            <button
              onClick={() => { sounds.playTick(); setActiveTab('challenge'); }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'challenge'
                  ? 'bg-white text-slate-900 font-bold border border-slate-300 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">3. Challenge Me</span>
            </button>

            <button
              onClick={() => { sounds.playTick(); setActiveTab('applications'); }}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'applications'
                  ? 'bg-white text-slate-900 font-bold border border-slate-300 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">4. Applications</span>
            </button>
          </nav>

          {/* Telemetry & Utility Controls */}
          <div className="flex items-center gap-2 font-mono text-xs">
            {/* Timer */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>

            {/* Score */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-bold">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>{score}/{maxScore}</span>
            </div>

            {/* Mute toggle */}
            <button
              onClick={toggleAudio}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
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
