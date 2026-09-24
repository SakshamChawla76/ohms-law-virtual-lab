import React, { useState, useEffect } from 'react';
import { simulateCircuit } from './engine/circuitSimulator';
import { labStorage } from './engine/storage';
import { sounds } from './engine/audioEffects';

import { SimulationHub } from './components/hub/SimulationHub';
import { SimulationShell } from './components/runtime/SimulationShell';
import { SIMULATIONS_DATA } from './data/simulationsRegistry';

// Flagship simulation engines
import { RollerCoasterSim } from './components/simulations/physics/RollerCoasterSim';
import { AirbagSim } from './components/simulations/chemistry/AirbagSim';
import { DiamondCutSim } from './components/simulations/physics/DiamondCutSim';
import { DensitySim } from './components/simulations/chemistry/DensitySim';
import { CollisionSim } from './components/simulations/physics/CollisionSim';
import { ProjectileSim } from './components/simulations/physics/ProjectileSim';
import { DopplerWaveSim } from './components/simulations/physics/DopplerWaveSim';
import { GasLawsSim } from './components/simulations/chemistry/GasLawsSim';
import { AtomBuilderSim } from './components/simulations/chemistry/AtomBuilderSim';
import { GenericGuidedLab } from './components/simulations/common/GenericGuidedLab';

// Ohm's Law Precision Lab Components
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
  // Global Simulation Hub Routing
  // null = Simulation Hub (Discovery Launcher); or simulation ID ('ohms-law', 'roller-coaster', 'airbag', etc.)
  const [activeSimulationId, setActiveSimulationId] = useState(null);
  const [simTab, setSimTab] = useState('sandbox');
  const [simScores, setSimScores] = useState({});

  // Ohm's Law Screen & Mode navigation
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

  // Scoring & Telemetry State
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

      if (analysis.isClosedLoop && !analysis.isShortCircuit) {
        assemblyScore = 20;
      }

      if (analysis.measuredVoltage > 0 && !analysis.isShortCircuit && analysis.state === 'ACTIVE') {
        meterScore = 20;
      }

      if (trials.length >= 3) {
        measureScore = Math.min(20, Math.floor(trials.length * 4));
      }

      if (analysis.measuredVoltage > 0 && analysis.measuredCurrent > 0) {
        calcScore = 20;
      }

      const updated = {
        ...prev,
        circuitAssembly: assemblyScore,
        meterConnection: meterScore,
        measurements: measureScore,
        calculations: calcScore,
      };

      labStorage.saveScore(updated);
      return updated;
    });
  }, [analysis.isClosedLoop, analysis.isShortCircuit, analysis.measuredVoltage, analysis.measuredCurrent, analysis.state, trials.length]);

  // Wire operations
  const handleAddWire = (fromCompId, fromTermId, toCompId, toTermId, color) => {
    const exists = wires.some(w => 
      (w.fromCompId === fromCompId && w.fromTermId === fromTermId && w.toCompId === toCompId && w.toTermId === toTermId) ||
      (w.fromCompId === toCompId && w.fromTermId === toTermId && w.toCompId === fromCompId && w.toTermId === fromTermId)
    );
    if (exists) return;

    sounds.playSnap();
    const newWire = {
      id: `w-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      fromCompId,
      fromTermId,
      toCompId,
      toTermId,
      color: color || (fromTermId === 'pos' || toTermId === 'pos' ? '#ef4444' : '#1e293b')
    };

    const updatedWires = [...wires, newWire];
    setWires(updatedWires);

    const testSim = simulateCircuit(
      components,
      updatedWires,
      voltage,
      resistance,
      isSwitchClosed,
      config.measurementNoise,
      config.noiseMagnitude
    );

    if (testSim.isShortCircuit) {
      sounds.playSpark();
      setScoreState(prev => ({
        ...prev,
        penalties: prev.penalties + 5,
        incorrectConnectionCount: prev.incorrectConnectionCount + 1,
      }));
    }
  };

  const handleRemoveWire = (wireId) => {
    sounds.playClick();
    setWires(prev => prev.filter(w => w.id !== wireId));
  };

  const handleClearWires = () => {
    sounds.playClick();
    setWires([]);
  };

  const handleAutoWireDemo = () => {
    sounds.playClick();
    setComponents(INITIAL_COMPONENTS);
    const demoWires = [
      { id: 'w-auto-1', fromCompId: 'battery', fromTermId: 'pos', toCompId: 'switch', toTermId: 'in', color: '#dc2626' },
      { id: 'w-auto-2', fromCompId: 'switch', fromTermId: 'out', toCompId: 'ammeter', toTermId: 'pos', color: '#ea580c' },
      { id: 'w-auto-3', fromCompId: 'ammeter', fromTermId: 'neg', toCompId: 'resistor', toTermId: 'pos', color: '#d97706' },
      { id: 'w-auto-4', fromCompId: 'resistor', fromTermId: 'pos', toCompId: 'voltmeter', toTermId: 'pos', color: '#16a34a' },
      { id: 'w-auto-5', fromCompId: 'resistor', fromTermId: 'neg', toCompId: 'voltmeter', toTermId: 'neg', color: '#2563eb' },
      { id: 'w-auto-6', fromCompId: 'resistor', fromTermId: 'neg', toCompId: 'battery', toTermId: 'neg', color: '#1e293b' },
    ];
    setWires(demoWires);
  };

  const handleRecordReading = () => {
    if (analysis.state !== 'ACTIVE' || !isSwitchClosed) return;
    sounds.playSnap();

    const newTrial = {
      trialNumber: trials.length + 1,
      voltage: Number(analysis.measuredVoltage.toFixed(2)),
      current: Number(analysis.measuredCurrent.toFixed(3)),
      timestamp: Date.now(),
    };

    const updated = [...trials, newTrial];
    setTrials(updated);
    labStorage.saveTrials(updated);
  };

  const handleDeleteTrial = (trialNumber) => {
    sounds.playClick();
    const updated = trials
      .filter(t => t.trialNumber !== trialNumber)
      .map((t, idx) => ({ ...t, trialNumber: idx + 1 }));
    setTrials(updated);
    labStorage.saveTrials(updated);
  };

  const handleClearTrials = () => {
    sounds.playClick();
    setTrials([]);
    labStorage.clearTrials();
  };

  const handleUseHint = () => {
    sounds.playClick();
    setScoreState(prev => ({
      ...prev,
      hintsUsedCount: prev.hintsUsedCount + 1,
      penalties: prev.penalties + 2,
    }));
  };

  const handleSolveChallenge = (challengeId) => {
    sounds.playSuccess();
    if (!completedChallenges.includes(challengeId)) {
      const updated = [...completedChallenges, challengeId];
      setCompletedChallenges(updated);
      labStorage.saveCompletedChallenges(updated);
    }
    setActiveChallenge(null);
  };

  const handleVerifiedCorrectly = () => {
    sounds.playSuccess();
    setScoreState(prev => ({
      ...prev,
      graphAnalysis: 20
    }));
  };

  const handleSaveConfig = (newConfig) => {
    setConfig(newConfig);
    setResistance(newConfig.nominalResistance);
    labStorage.saveConfig(newConfig);
  };

  const handleResetLab = () => {
    sounds.playClick();
    setWires([]);
    setIsSwitchClosed(false);
    setVoltage(4.0);
    setResistance(config.nominalResistance);
    handleClearTrials();
    setQuizScore(0);
    const newScore = {
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
    setScoreState(newScore);
    labStorage.saveScore(newScore);
  };

  // ----------------------------------------------------
  // ROUTE 1: CENTRAL SIMULATION HUB
  // ----------------------------------------------------
  if (!activeSimulationId) {
    return (
      <SimulationHub
        onSelectSimulation={(id) => {
          setActiveSimulationId(id);
          setSimTab('sandbox');
        }}
      />
    );
  }

  // Find active simulation metadata
  const currentSim = SIMULATIONS_DATA.find(s => s.id === activeSimulationId) || SIMULATIONS_DATA[0];

  // ----------------------------------------------------
  // ROUTE 2: OHM'S LAW PRECISION LAB
  // ----------------------------------------------------
  if (activeSimulationId === 'ohms-law') {
    return (
      <div className="min-h-screen bg-[#f1f5f9] text-slate-800 flex flex-col font-sans">
        <Header
          currentScreen={currentScreen}
          setScreen={setCurrentScreen}
          mode={mode}
          setMode={setMode}
          scoreState={scoreState}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHelp={() => setIsHelpOpen(true)}
          onResetLab={handleResetLab}
          onBackToHub={() => setActiveSimulationId(null)}
        />

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
  }

  // ----------------------------------------------------
  // ROUTE 3: MODULAR SIMULATION CONTAINER
  // ----------------------------------------------------
  const handleUpdateSimScore = (pts) => {
    setSimScores(prev => ({
      ...prev,
      [activeSimulationId]: (prev[activeSimulationId] || 0) + pts
    }));
  };

  return (
    <SimulationShell
      simulation={currentSim}
      onBackToHub={() => setActiveSimulationId(null)}
      activeTab={simTab}
      setActiveTab={setSimTab}
      score={simScores[activeSimulationId] || 0}
      maxScore={100}
    >
      {activeSimulationId === 'roller-coaster' && (
        <RollerCoasterSim
          activeTab={simTab}
          onUpdateScore={handleUpdateSimScore}
        />
      )}

      {activeSimulationId === 'airbag' && (
        <AirbagSim
          activeTab={simTab}
          onUpdateScore={handleUpdateSimScore}
        />
      )}

      {activeSimulationId === 'diamond-cut' && (
        <DiamondCutSim
          activeTab={simTab}
          onUpdateScore={handleUpdateSimScore}
        />
      )}

      {activeSimulationId === 'density' && (
        <DensitySim
          activeTab={simTab}
          onUpdateScore={handleUpdateSimScore}
        />
      )}

      {activeSimulationId === 'bumper-cars' && (
        <CollisionSim
          simulation={currentSim}
          activeTab={simTab}
          onUpdateScore={handleUpdateSimScore}
        />
      )}

      {activeSimulationId === 'bow-and-arrow' && (
        <ProjectileSim
          simulation={currentSim}
          activeTab={simTab}
          onUpdateScore={handleUpdateSimScore}
        />
      )}

      {activeSimulationId === 'doppler-ducks' && (
        <DopplerWaveSim
          simulation={currentSim}
          activeTab={simTab}
          onUpdateScore={handleUpdateSimScore}
        />
      )}

      {activeSimulationId === 'phases-of-matter' && (
        <GasLawsSim
          simulation={currentSim}
          activeTab={simTab}
          onUpdateScore={handleUpdateSimScore}
        />
      )}

      {activeSimulationId === 'atom-builder' && (
        <AtomBuilderSim
          simulation={currentSim}
          activeTab={simTab}
          onUpdateScore={handleUpdateSimScore}
        />
      )}

      {activeSimulationId !== 'roller-coaster' && 
       activeSimulationId !== 'airbag' && 
       activeSimulationId !== 'diamond-cut' && 
       activeSimulationId !== 'density' &&
       activeSimulationId !== 'bumper-cars' &&
       activeSimulationId !== 'bow-and-arrow' &&
       activeSimulationId !== 'doppler-ducks' &&
       activeSimulationId !== 'phases-of-matter' &&
       activeSimulationId !== 'atom-builder' && (
        <GenericGuidedLab
          simulation={currentSim}
          activeTab={simTab}
          onUpdateScore={handleUpdateSimScore}
        />
      )}
    </SimulationShell>
  );
};
