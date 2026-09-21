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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm select-none">
      {/* Top Academic Lab Status Rail */}
      <div className="h-1 bg-gradient-to-r from-slate-200 via-amber-400/40 to-slate-200 border-b border-slate-200" />

      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Instrument Nomenclature */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shadow-sm group">
            <Zap className="h-5 w-5 text-amber-600" />
            <div className="absolute -top-1 -left-1 w-1.5 h-1.5 rounded-full bg-slate-300 border border-slate-400" />
            <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 rounded-full bg-slate-300 border border-slate-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold tracking-tight text-slate-800 uppercase font-mono flex items-center gap-2">
                Ohm's Law Precision Lab
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono font-bold border border-amber-200">
                  V = I·R
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>STATION: AP-04 // DC CALIBRATION WORKBENCH</span>
            </div>
          </div>
        </div>

        {/* Screen Navigation Selector (Tactile Instrument Bar) */}
        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-mono">
          <button
            onClick={() => { sounds.playTick(); setScreen('intro'); }}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              currentScreen === 'intro' 
                ? 'bg-white text-slate-900 font-bold border border-slate-300 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Intro</span>
          </button>
          <button
            onClick={() => { sounds.playTick(); setScreen('theory'); }}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              currentScreen === 'theory' 
                ? 'bg-white text-slate-900 font-bold border border-slate-300 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>Theory</span>
          </button>
          <button
            onClick={() => { sounds.playTick(); setScreen('apparatus'); }}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              currentScreen === 'apparatus' 
                ? 'bg-white text-slate-900 font-bold border border-slate-300 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <span>Apparatus</span>
          </button>
          <button
            onClick={() => { sounds.playTick(); setScreen('lab'); }}
            className={`px-3.5 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              currentScreen === 'lab' 
                ? 'bg-amber-600 text-white font-bold shadow-sm' 
                : 'text-amber-800 hover:bg-amber-100/60'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span className="font-bold tracking-wide">Workbench</span>
          </button>
          <button
            onClick={() => { sounds.playTick(); setScreen('quiz'); }}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              currentScreen === 'quiz' 
                ? 'bg-white text-slate-900 font-bold border border-slate-300 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Quiz</span>
          </button>
          <button
            onClick={() => { sounds.playTick(); setScreen('dashboard'); }}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              currentScreen === 'dashboard' 
                ? 'bg-white text-slate-900 font-bold border border-slate-300 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Report</span>
          </button>
        </nav>

        {/* Telemetry & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Mode Selector (When on Lab Screen) */}
          {currentScreen === 'lab' && (
            <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200 text-xs font-mono">
              <button
                onClick={() => { sounds.playTick(); setMode('guided'); }}
                className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 text-[11px] ${
                  mode === 'guided' ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-200' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Guided Step-by-Step Assistance"
              >
                <Compass className="w-3 h-3" />
                GUIDED
              </button>
              <button
                onClick={() => { sounds.playTick(); setMode('challenge'); }}
                className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 text-[11px] ${
                  mode === 'challenge' ? 'bg-amber-100 text-amber-800 font-bold border border-amber-200' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Diagnostic Fault Troubleshooting Challenges"
              >
                <Target className="w-3 h-3" />
                CHALLENGE
              </button>
              <button
                onClick={() => { sounds.playTick(); setMode('sandbox'); }}
                className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 text-[11px] ${
                  mode === 'sandbox' ? 'bg-sky-100 text-sky-800 font-bold border border-sky-200' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Free Circuit Sandbox"
              >
                SANDBOX
              </button>
            </div>
          )}

          {/* Precision Stopwatch */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-mono text-emerald-700 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-digital tracking-wider text-sm font-bold">{formatTime(elapsedSeconds)}</span>
          </div>

          {/* Mastery Score Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-mono text-amber-700 shadow-inner">
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-digital tracking-wider text-sm font-bold">{totalScore}</span>
            <span className="text-[10px] text-slate-500">/100</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleSound}
              className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors border border-slate-200 shadow-sm"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
            </button>

            <button
              onClick={() => { sounds.playTick(); onOpenHelp(); }}
              className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors border border-slate-200 shadow-sm"
              title="Help & Wiring Instructions"
            >
              <HelpCircle className="w-4 h-4 text-amber-600" />
            </button>

            <button
              onClick={() => { sounds.playTick(); onOpenSettings(); }}
              className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors border border-slate-200 shadow-sm"
              title="Calibration & Setup Options"
            >
              <Settings className="w-4 h-4 text-slate-600" />
            </button>

            {currentScreen === 'lab' && (
              <button
                onClick={() => { sounds.playSnap(); onResetLab(); }}
                className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 transition-colors border border-rose-200 shadow-sm"
                title="Emergency Reset / Disconnect Leads"
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
