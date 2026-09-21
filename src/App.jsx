import React, { useState, useEffect } from 'react';
import { simulateCircuit } from './engine/circuitSimulator';
import { labStorage } from './engine/storage';
import { sounds } from './engine/audioEffects';

import { Header } from './components/Header';
import { IntroductionScreen } from './components/intro/IntroductionScreen';
import { TheoryScreen } from './components/intro/TheoryScreen';
import { ApparatusScreen } from './components/intro/ApparatusScreen';
import { LabWorkspace } from './components/laboratory/LabWorkspace';
import { ConceptualQuiz } from './components/quiz/ConceptualQuiz';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { TeacherSettingsModal } from './components/common/TeacherSettingsModal';
import { HelpGuideModal } from './components/common/HelpGuideModal';

// Standard layout of the 5 apparatus components on the canvas
const INITIAL_COMPONENTS = [
  { id: 'battery', type: 'battery', x: 120, y: 190, label: 'DC Power Supply' },
  { id: 'switch', type: 'switch', x: 310, y: 100, label: 'Key Switch' },
  { id: 'ammeter', type: 'ammeter', x: 520, y: 100, label: 'Ammeter' },
  { id: 'resistor', type: 'resistor', x: 340, y: 290, label: 'Resistor (R)' },
  { id: 'voltmeter', type: 'voltmeter', x: 540, y: 290, label: 'Voltmeter' },
];

export const App = () => {
  // Screen & Mode navigation
  const [currentScreen, setCurrentScreen] = useState('intro');
  const [mode, setMode] = useState('guided');

  // Teacher config
  const [config, setConfig] = useState(labStorage.getConfig());

  // Circuit Physics State
  const [components, setComponents] = useState(INITIAL_COMPONENTS);
  const [wires, setWires] = useState([]);
  const [voltage, setVoltage] = useState(4.0);
  const [resistance, setResistance] = useState(config.nominalResistance);
  const [isSwitchClosed, setIsSwitchClosed] = useState(false);

  const handleUpdateComponentPosition = (id, x, y) => {
    setComponents(prev => prev.map(c => c.id === id ? { ...c, x, y } : c));
  };

  // Observation Trials
  const [trials, setTrials] = useState(labStorage.getTrials());

  // Challenge State
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [completedChallenges, setCompletedChallenges] = useState(labStorage.getCompletedChallenges());

  // Quiz Score
  const [quizScore, setQuizScore] = useState(0);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Scoring & Telemetry State (100-point rubric from PRD Section 25)
  const [scoreState, setScoreState] = useState(() => {
    const saved = labStorage.getScore();
    return saved || {
      circuitAssembly: 0,
      meterConnection: 0,
      measurements: 0,
      calculations: 0,
      graphAnalysis: 0,
      penalties: 0,
      hintsUsedCount: 0,
      incorrectConnectionCount: 0,
      startTime: Date.now(),
    };
  });

  // Run Real-time Circuit Graph Simulator
  const analysis = simulateCircuit(
    components,
    wires,
    voltage,
    resistance,
    isSwitchClosed,
    config.measurementNoise,
    config.noiseMagnitude
  );

  // Check and update scores dynamically based on student milestones
  useEffect(() => {
    setScoreState(prev => {
      let assemblyScore = prev.circuitAssembly;
      let meterScore = prev.meterConnection;
      let measureScore = prev.measurements;
      let calcScore = prev.calculations;

      // 1. Circuit Assembly: 20 pts if closed series loop with battery, switch, resistor
      if (analysis.isClosedLoop && !analysis.isShortCircuit) {
        assemblyScore = 20;
      }

      // 2. Meter Placement: 20 pts if ammeter in series and voltmeter in parallel across resistor
      if (analysis.measuredVoltage > 0 && !analysis.isShortCircuit && analysis.state === 'ACTIVE') {
        meterScore = 20;
      }

      // 3. Measurements: 4 pts per recorded trial (max 20 for 5 trials)
      measureScore = Math.min(20, trials.length * 4);

      // 4. Calculations: 4 pts per trial with valid R = V/I calculated
      if (trials.length > 0) {
        const accurateCalculations = trials.filter(t => Math.abs(t.calculatedResistance - resistance) < 5.0).length;
        calcScore = Math.min(20, accurateCalculations * 4);
      }

      // Check for penalties on short-circuit fault
      let penalties = prev.penalties;
      if (analysis.isShortCircuit && prev.incorrectConnectionCount === 0) {
        sounds.playShortCircuit();
      }

      const updated = {
        ...prev,
        circuitAssembly: assemblyScore,
        meterConnection: meterScore,
        measurements: measureScore,
        calculations: calcScore,
        penalties,
      };

      labStorage.saveScore(updated);
      return updated;
    });
  }, [analysis.isClosedLoop, analysis.isShortCircuit, analysis.measuredVoltage, analysis.state, trials, resistance]);

  // Wire Management Handlers
  const handleAddWire = (fromTermId, toTermId) => {
    const newWire = {
      id: `wire-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      fromTerminalId: fromTermId,
      toTerminalId: toTermId,
      color: '',
    };
    const updated = [...wires, newWire];
    setWires(updated);
  };

  const handleRemoveWire = (wireId) => {
    const updated = wires.filter(w => w.id !== wireId);
    setWires(updated);
  };

  const handleClearWires = () => {
    setWires([]);
    setIsSwitchClosed(false);
  };

  const handleAutoWireDemo = () => {
    // Standard correct connections
    const demoWires = [
      { id: 'w1', fromTerminalId: 'battery-pos', toTerminalId: 'switch-in', color: '#ef4444' },
      { id: 'w2', fromTerminalId: 'switch-out', toTerminalId: 'ammeter-pos', color: '#ef4444' },
      { id: 'w3', fromTerminalId: 'ammeter-neg', toTerminalId: 'resistor-a', color: '#00f2fe' },
      { id: 'w4', fromTerminalId: 'resistor-b', toTerminalId: 'battery-neg', color: '#0f172a' },
      { id: 'w5', fromTerminalId: 'voltmeter-pos', toTerminalId: 'resistor-a', color: '#ef4444' },
      { id: 'w6', fromTerminalId: 'voltmeter-neg', toTerminalId: 'resistor-b', color: '#0f172a' },
    ];
    setWires(demoWires);
  };

  // Observation Recording Handlers
  const handleRecordReading = () => {
    if (!analysis.isValid || !isSwitchClosed || analysis.measuredVoltage <= 0) return;

    const newTrial = {
      id: `trial-${Date.now()}`,
      trialNumber: trials.length + 1,
      voltage: analysis.measuredVoltage,
      current: analysis.measuredCurrent,
      calculatedResistance: Number((analysis.measuredVoltage / (analysis.measuredCurrent || 0.001)).toFixed(2)),
      timestamp: Date.now(),
    };

    const updated = [...trials, newTrial];
    setTrials(updated);
    labStorage.saveTrials(updated);
  };

  const handleDeleteTrial = (id) => {
    const updated = trials.filter(t => t.id !== id);
    setTrials(updated);
    labStorage.saveTrials(updated);
  };

  const handleClearTrials = () => {
    setTrials([]);
    labStorage.clearTrials();
  };

  // Penalty / Hint Handlers
  const handleUseHint = () => {
    setScoreState(prev => ({
      ...prev,
      penalties: prev.penalties + 1,
      hintsUsedCount: prev.hintsUsedCount + 1,
    }));
  };

  // Conclusion Verification Handler (+20 points for graph & conclusion)
  const handleVerifiedCorrectly = () => {
    setScoreState(prev => ({
      ...prev,
      graphAnalysis: 20,
    }));
  };

  // Challenge Completion Handler
  const handleSolveChallenge = (challengeId) => {
    if (!completedChallenges.includes(challengeId)) {
      labStorage.markChallengeCompleted(challengeId);
      setCompletedChallenges(labStorage.getCompletedChallenges());
    }
  };

  // Teacher Config Save
  const handleSaveConfig = (newConfig) => {
    setConfig(newConfig);
    setResistance(newConfig.nominalResistance);
    labStorage.saveConfig(newConfig);
  };

  // Reset Lab Workspace
  const handleResetLab = () => {
    setWires([]);
    setIsSwitchClosed(false);
    setVoltage(4.0);
    setTrials([]);
    labStorage.clearTrials();
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 flex flex-col">
      {/* Universal Laboratory Header */}
      <Header
        currentScreen={currentScreen}
        setScreen={setCurrentScreen}
        mode={mode}
        setMode={setMode}
        scoreState={scoreState}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onResetLab={handleResetLab}
      />

      {/* Screen Views */}
      <main className="flex-1 w-full pb-16">
        {currentScreen === 'intro' && (
          <IntroductionScreen
            onNavigate={(screen) => setCurrentScreen(screen)}
            setMode={setMode}
          />
        )}

        {currentScreen === 'theory' && (
          <TheoryScreen
            onNavigate={(screen) => setCurrentScreen(screen)}
          />
        )}

        {currentScreen === 'apparatus' && (
          <ApparatusScreen
            onNavigate={(screen) => setCurrentScreen(screen)}
          />
        )}

        {currentScreen === 'lab' && (
          <LabWorkspace
            components={components}
            wires={wires}
            onAddWire={handleAddWire}
            onRemoveWire={handleRemoveWire}
            onClearWires={handleClearWires}
            onAutoWire={handleAutoWireDemo}
            analysis={analysis}
            isSwitchClosed={isSwitchClosed}
            setIsSwitchClosed={setIsSwitchClosed}
            voltage={voltage}
            setVoltage={setVoltage}
            resistance={resistance}
            setResistance={setResistance}
            trials={trials}
            onRecordReading={handleRecordReading}
            onDeleteTrial={handleDeleteTrial}
            onClearTrials={handleClearTrials}
            mode={mode}
            activeChallenge={activeChallenge}
            onSelectChallenge={setActiveChallenge}
            onSolveChallenge={handleSolveChallenge}
            completedChallenges={completedChallenges}
            config={config}
            scoreState={scoreState}
            onUseHint={handleUseHint}
            onVerifiedCorrectly={handleVerifiedCorrectly}
            onProceedToQuiz={() => setCurrentScreen('quiz')}
            onUpdateComponentPosition={handleUpdateComponentPosition}
          />
        )}

        {currentScreen === 'quiz' && (
          <ConceptualQuiz
            onNavigate={(screen) => setCurrentScreen(screen)}
            onUpdateQuizScore={setQuizScore}
          />
        )}

        {currentScreen === 'dashboard' && (
          <StudentDashboard
            scoreState={scoreState}
            trials={trials}
            quizScore={quizScore}
            nominalResistance={resistance}
            onRestart={() => {
              handleResetLab();
              setCurrentScreen('intro');
            }}
            onNavigateToLab={() => setCurrentScreen('lab')}
          />
        )}
      </main>

      {/* Modals */}
      <TeacherSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />

      <HelpGuideModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
};
