import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Clock, 
  Award, 
  Volume2, 
  VolumeX, 
  Settings, 
  HelpCircle, 
  Compass, 
  Target, 
  RotateCcw,
  BookOpen,
  FlaskConical,
  GraduationCap
} from 'lucide-react';
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0c1322]/90 backdrop-blur-md px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-glow-cyan text-white">
            <Zap className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Ohm's Law Virtual Lab
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                  V = IR
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">Interactive Verification & Precision Circuit Simulation</p>
          </div>
        </div>

        {/* Screen Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/10 text-xs font-medium">
          <button
            onClick={() => { sounds.playTick(); setScreen('intro'); }}
            className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentScreen === 'intro' ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Intro</span>
          </button>
          <button
            onClick={() => { sounds.playTick(); setScreen('theory'); }}
            className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentScreen === 'theory' ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>Theory</span>
          </button>
          <button
            onClick={() => { sounds.playTick(); setScreen('apparatus'); }}
            className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentScreen === 'apparatus' ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>Apparatus</span>
          </button>
          <button
            onClick={() => { sounds.playTick(); setScreen('lab'); }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentScreen === 'lab' ? 'bg-cyan-500 text-slate-950 font-semibold shadow-glow-cyan' : 'text-cyan-300 hover:text-cyan-200 hover:bg-white/5'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span className="font-semibold">Lab</span>
          </button>
          <button
            onClick={() => { sounds.playTick(); setScreen('quiz'); }}
            className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentScreen === 'quiz' ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quiz</span>
          </button>
          <button
            onClick={() => { sounds.playTick(); setScreen('dashboard'); }}
            className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentScreen === 'dashboard' ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm' : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Report</span>
          </button>
        </nav>

        {/* Telemetry & Controls */}
        <div className="flex items-center gap-3">
          {/* Mode Selector (When on Lab Screen) */}
          {currentScreen === 'lab' && (
            <div className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-white/10 text-xs">
              <button
                onClick={() => { sounds.playTick(); setMode('guided'); }}
                className={`px-2 py-1 rounded transition-all flex items-center gap-1 ${
                  mode === 'guided' ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40' : 'text-slate-400 hover:text-white'
                }`}
                title="Guided Step-by-Step Assistance"
              >
                <Compass className="w-3 h-3" />
                Guided
              </button>
              <button
                onClick={() => { sounds.playTick(); setMode('challenge'); }}
                className={`px-2 py-1 rounded transition-all flex items-center gap-1 ${
                  mode === 'challenge' ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40' : 'text-slate-400 hover:text-white'
                }`}
                title="Diagnostic Fault Troubleshooting Challenges"
              >
                <Target className="w-3 h-3" />
                Challenge
              </button>
              <button
                onClick={() => { sounds.playTick(); setMode('sandbox'); }}
                className={`px-2 py-1 rounded transition-all flex items-center gap-1 ${
                  mode === 'sandbox' ? 'bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/40' : 'text-slate-400 hover:text-white'
                }`}
                title="Free Circuit Sandbox"
              >
                Sandbox
              </button>
            </div>
          )}

          {/* Timer */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-white/10 text-xs font-mono text-cyan-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{formatTime(elapsedSeconds)}</span>
          </div>

          {/* Score Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-amber-500/20 text-xs font-mono text-amber-300">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{totalScore}/100</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-white/10"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={() => { sounds.playTick(); onOpenHelp(); }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-white/10"
              title="Help & Wiring Instructions"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400" />
            </button>

            <button
              onClick={() => { sounds.playTick(); onOpenSettings(); }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-white/10"
              title="Teacher Mode Configuration"
            >
              <Settings className="w-4 h-4 text-slate-300" />
            </button>

            {currentScreen === 'lab' && (
              <button
                onClick={() => { sounds.playSnap(); onResetLab(); }}
                className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 transition-colors border border-rose-500/30"
                title="Reset Workspace & Clear Wires"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
