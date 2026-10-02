import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  GraduationCap,
  ArrowLeft
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
    { id: 'intro', label: 'Intro', icon: BookOpen, showLabel: 'hidden sm:inline' },
    { id: 'theory', label: 'Theory', icon: null },
    { id: 'apparatus', label: 'Apparatus', icon: null },
    { id: 'lab', label: 'Workbench', icon: FlaskConical, highlight: true },
    { id: 'quiz', label: 'Quiz', icon: GraduationCap, showLabel: 'hidden sm:inline' },
    { id: 'dashboard', label: 'Report', icon: Award, showLabel: 'hidden sm:inline' },
  ];

  return (
    <motion.header
      className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#0f0f23]/90 backdrop-blur-xl shadow-lg select-none"
      layout="position"
      transition={{ type: "spring", stiffness: 260, damping: 25 }}
    >
      {/* Top gradient accent bar */}
      <div className="h-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Instrument Name */}
        <div className="flex items-center gap-3.5">
          {onBackToHub && (
            <button
              id="header-hub-btn"
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
          )}

          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(79,140,255,0.3)]">
            <Zap className="h-5 w-5 text-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-display font-extrabold tracking-tight text-white uppercase flex items-center gap-2">
                Ohm's Law Lab
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-data font-bold border border-blue-500/30">
                  V = I·R
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-data text-[var(--text-muted)]">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              <span>DC Calibration Workbench</span>
            </div>
          </div>
        </div>

        {/* Screen Navigation */}
        <nav className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.06] text-xs font-display">
          {navItems.map(item => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { sounds.playTick(); setScreen(item.id); }}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-bold ${
                  item.highlight && isActive
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_2px_10px_rgba(79,140,255,0.3)]'
                    : isActive
                      ? 'bg-white/[0.1] text-white border border-white/[0.1]'
                      : 'text-[var(--text-secondary)] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {item.icon && <item.icon className="w-3.5 h-3.5" />}
                <span className={item.showLabel || ''}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Telemetry & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Mode Selector (When on Lab Screen) */}
          {currentScreen === 'lab' && (
            <div className="hidden lg:flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.06] text-xs font-data">
              {[
                { id: 'guided', label: 'GUIDED', icon: Compass, color: 'emerald' },
                { id: 'challenge', label: 'CHALLENGE', icon: Target, color: 'amber' },
                { id: 'sandbox', label: 'SANDBOX', icon: null, color: 'sky' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => { sounds.playTick(); setMode(m.id); }}
                  className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 text-[11px] font-bold ${
                    mode === m.id 
                      ? `bg-${m.color}-500/20 text-${m.color}-300 border border-${m.color}-500/30` 
                      : 'text-[var(--text-muted)] hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {m.icon && <m.icon className="w-3 h-3" />}
                  {m.label}
                </button>
              ))}
            </div>
          )}

          {/* Timer */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs font-data">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-digital tracking-wider text-sm font-bold text-emerald-300">{formatTime(elapsedSeconds)}</span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs font-data">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-digital tracking-wider text-sm font-bold text-amber-300">{totalScore}</span>
            <span className="text-[10px] text-[var(--text-muted)]">/100</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={toggleSound}
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[var(--text-secondary)] hover:text-white transition-colors border border-white/[0.06]"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={() => { sounds.playTick(); onOpenHelp(); }}
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[var(--text-secondary)] hover:text-white transition-colors border border-white/[0.06]"
              title="Help & Wiring Instructions"
            >
              <HelpCircle className="w-4 h-4 text-blue-400" />
            </button>

            <button
              onClick={() => { sounds.playTick(); onOpenSettings(); }}
              className="p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-[var(--text-secondary)] hover:text-white transition-colors border border-white/[0.06]"
              title="Calibration & Setup Options"
            >
              <Settings className="w-4 h-4" />
            </button>

            {currentScreen === 'lab' && (
              <button
                onClick={() => { sounds.playSnap(); onResetLab(); }}
                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors border border-rose-500/20"
                title="Emergency Reset / Disconnect Leads"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};
