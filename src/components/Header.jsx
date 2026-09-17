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
    <header className="sticky top-0 z-40 w-full border-b border-[#2a364f] bg-[#0c1018] shadow-chassis-raised select-none">
      {/* Top Rack Rail Screw & Status Bar */}
      <div className="h-1 bg-gradient-to-r from-[#1c2436] via-[#334155] to-[#1c2436] border-b border-black/40" />

      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Instrument Nomenclature */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-10 h-10 rounded-lg bg-gradient-to-b from-[#1e273a] to-[#0f1420] border border-[#3b4863] flex items-center justify-center shadow-inner group">
            <Zap className="h-5 w-5 text-amber-400 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
            <div className="absolute -top-1 -left-1 w-1.5 h-1.5 rounded-full bg-[#3a4760] border border-black" />
            <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 rounded-full bg-[#3a4760] border border-black" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-bold tracking-wider text-slate-100 uppercase font-mono flex items-center gap-2">
                Ohm's Law Precision Lab
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono font-bold border border-amber-500/30">
                  V = I·R
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shadow-led-emerald animate-pulse" />
              <span>STATION: AP-04 // DC CALIBRATION WORKBENCH</span>
            </div>
          </div>
        </div>

        {/* Screen Navigation Selector (Tactile Instrument Bar) */}
        <nav className="flex items-center gap-1 bg-[#131926] p-1 rounded-lg border border-[#26334d] text-xs font-mono">
          <button
            onClick={() => { sounds.playTick(); setScreen('intro'); }}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              currentScreen === 'intro' 
                ? 'bg-[#1e2b45] text-amber-400 font-bold border border-amber-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#182133]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Intro</span>
          </button>
          <button
            onClick={() => { sounds.playTick(); setScreen('theory'); }}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              currentScreen === 'theory' 
                ? 'bg-[#1e2b45] text-amber-400 font-bold border border-amber-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#182133]'
            }`}
          >
            <span>Theory</span>
          </button>
          <button
            onClick={() => { sounds.playTick(); setScreen('apparatus'); }}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              currentScreen === 'apparatus' 
                ? 'bg-[#1e2b45] text-amber-400 font-bold border border-amber-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#182133]'
            }`}
          >
            <span>Apparatus</span>
          </button>
          <button
            onClick={() => { sounds.playTick(); setScreen('lab'); }}
            className={`px-3.5 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              currentScreen === 'lab' 
                ? 'bg-amber-500 text-slate-950 font-bold shadow-led-amber' 
                : 'text-amber-300/80 hover:text-amber-300 hover:bg-[#182133]'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span className="font-bold tracking-wide">Workbench</span>
          </button>
          <button
            onClick={() => { sounds.playTick(); setScreen('quiz'); }}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              currentScreen === 'quiz' 
                ? 'bg-[#1e2b45] text-amber-400 font-bold border border-amber-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#182133]'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quiz</span>
          </button>
          <button
            onClick={() => { sounds.playTick(); setScreen('dashboard'); }}
            className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
              currentScreen === 'dashboard' 
                ? 'bg-[#1e2b45] text-amber-400 font-bold border border-amber-500/40 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#182133]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Report</span>
          </button>
        </nav>

        {/* Telemetry & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Mode Selector (When on Lab Screen) */}
          {currentScreen === 'lab' && (
            <div className="hidden lg:flex items-center gap-1 bg-[#131926] p-0.5 rounded border border-[#26334d] text-xs font-mono">
              <button
                onClick={() => { sounds.playTick(); setMode('guided'); }}
                className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 text-[11px] ${
                  mode === 'guided' ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Guided Step-by-Step Assistance"
              >
                <Compass className="w-3 h-3" />
                GUIDED
              </button>
              <button
                onClick={() => { sounds.playTick(); setMode('challenge'); }}
                className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 text-[11px] ${
                  mode === 'challenge' ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Diagnostic Fault Troubleshooting Challenges"
              >
                <Target className="w-3 h-3" />
                CHALLENGE
              </button>
              <button
                onClick={() => { sounds.playTick(); setMode('sandbox'); }}
                className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 text-[11px] ${
                  mode === 'sandbox' ? 'bg-sky-500/20 text-sky-400 font-bold border border-sky-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Free Circuit Sandbox"
              >
                SANDBOX
              </button>
            </div>
          )}

          {/* Precision Stopwatch */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#090d14] border border-[#242f44] text-xs font-mono text-emerald-400 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-digital tracking-wider text-sm">{formatTime(elapsedSeconds)}</span>
          </div>

          {/* Mastery Score Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#090d14] border border-[#242f44] text-xs font-mono text-amber-400 shadow-inner">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-digital tracking-wider text-sm">{totalScore}</span>
            <span className="text-[10px] text-slate-500">/100</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleSound}
              className="p-1.5 rounded bg-[#161e2e] hover:bg-[#1e2a40] text-slate-300 hover:text-white transition-colors border border-[#2b3850]"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={() => { sounds.playTick(); onOpenHelp(); }}
              className="p-1.5 rounded bg-[#161e2e] hover:bg-[#1e2a40] text-slate-300 hover:text-white transition-colors border border-[#2b3850]"
              title="Help & Wiring Instructions"
            >
              <HelpCircle className="w-4 h-4 text-amber-400" />
            </button>

            <button
              onClick={() => { sounds.playTick(); onOpenSettings(); }}
              className="p-1.5 rounded bg-[#161e2e] hover:bg-[#1e2a40] text-slate-300 hover:text-white transition-colors border border-[#2b3850]"
              title="Calibration & Setup Options"
            >
              <Settings className="w-4 h-4 text-slate-400" />
            </button>

            {currentScreen === 'lab' && (
              <button
                onClick={() => { sounds.playSnap(); onResetLab(); }}
                className="p-1.5 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-100 transition-colors border border-rose-600/40"
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
