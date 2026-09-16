import React, { useState } from 'react';
import { CircuitCanvas } from './CircuitCanvas';
import { PowerSupplyControl } from './PowerSupplyControl';
import { ResistorSelector } from './ResistorSelector';
import { SwitchControl } from './SwitchControl';
import { AmmeterWidget } from './AmmeterWidget';
import { VoltmeterWidget } from './VoltmeterWidget';
import { CircuitAlerts } from './CircuitAlerts';
import { ObservationTable } from './ObservationTable';
import { ViGraph } from './ViGraph';
import { VerificationModal } from './VerificationModal';
import { GuidedModeAssistant } from '../modes/GuidedModeAssistant';
import { ChallengeModeView } from '../modes/ChallengeModeView';

export const LabWorkspace = ({
  components,
  wires,
  onAddWire,
  onRemoveWire,
  onClearWires,
  onAutoWire,
  analysis,
  isSwitchClosed,
  setIsSwitchClosed,
  voltage,
  setVoltage,
  resistance,
  setResistance,
  trials,
  onRecordReading,
  onDeleteTrial,
  onClearTrials,
  mode,
  activeChallenge,
  onSelectChallenge,
  onSolveChallenge,
  completedChallenges,
  config,
  scoreState,
  onUseHint,
  onVerifiedCorrectly,
  onProceedToQuiz,
  onUpdateComponentPosition,
}) => {
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [activeSlope, setActiveSlope] = useState(resistance);
  const [activeErrorPercent, setActiveErrorPercent] = useState(0);

  const handleOpenVerification = (slope, errorPercent) => {
    setActiveSlope(slope);
    setActiveErrorPercent(errorPercent);
    setIsVerificationModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      {/* Real-time Pedagogical Circuit Alert Banner */}
      <CircuitAlerts analysis={analysis} />

      {/* Main Laboratory Layout: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Circuit Canvas & Bench Controls */}
        <div className="lg:col-span-8 space-y-6">
          {/* Interactive Wire Canvas */}
          <CircuitCanvas
            components={components}
            wires={wires}
            onAddWire={onAddWire}
            onRemoveWire={onRemoveWire}
            onClearWires={onClearWires}
            onAutoWire={onAutoWire}
            analysis={analysis}
            isSwitchClosed={isSwitchClosed}
            onToggleSwitch={() => setIsSwitchClosed(!isSwitchClosed)}
            voltage={voltage}
            resistance={resistance}
            onUpdateComponentPosition={onUpdateComponentPosition}
          />

          {/* Workbench Apparatus Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PowerSupplyControl
              voltage={voltage}
              setVoltage={setVoltage}
              min={config.voltageMin}
              max={config.voltageMax}
              step={config.voltageStep}
              isTripped={analysis.isShortCircuit}
            />

            <ResistorSelector
              resistance={resistance}
              setResistance={setResistance}
              options={config.resistorOptions}
            />

            <SwitchControl
              isClosed={isSwitchClosed}
              setIsClosed={setIsSwitchClosed}
            />
          </div>
        </div>

        {/* Right Column (4 cols): Realistic Physical Meters & Assistant */}
        <div className="lg:col-span-4 space-y-6 flex flex-col items-center">
          {/* Physical Dual Meters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 w-full justify-items-center">
            <AmmeterWidget
              current={analysis.measuredCurrent}
              isActive={analysis.isValid && isSwitchClosed}
              isShortCircuit={analysis.isShortCircuit}
            />

            <VoltmeterWidget
              voltage={analysis.measuredVoltage}
              isActive={analysis.isValid && isSwitchClosed}
            />
          </div>

          {/* Mode Assistant (Guided Checklist or Challenge Panel) */}
          <div className="w-full">
            {mode === 'guided' && (
              <GuidedModeAssistant
                analysis={analysis}
                isSwitchClosed={isSwitchClosed}
                trialsCount={trials.length}
                minRequired={config.minReadingsRequired}
                onUseHint={onUseHint}
                hintsUsedCount={scoreState.hintsUsedCount}
              />
            )}

            {mode === 'challenge' && (
              <ChallengeModeView
                activeChallenge={activeChallenge}
                onSelectChallenge={onSelectChallenge}
                analysis={analysis}
                onSolveChallenge={onSolveChallenge}
                completedChallenges={completedChallenges}
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Observation Table & Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* Observation Table */}
        <ObservationTable
          trials={trials}
          onRecordReading={onRecordReading}
          onDeleteTrial={onDeleteTrial}
          onClearTrials={onClearTrials}
          currentV={analysis.measuredVoltage}
          currentI={analysis.measuredCurrent}
          isCircuitActive={analysis.isValid && isSwitchClosed}
          minRequired={config.minReadingsRequired}
        />

        {/* V-I Graph */}
        <ViGraph
          trials={trials}
          nominalResistance={resistance}
          onOpenVerificationModal={handleOpenVerification}
          minRequired={config.minReadingsRequired}
          liveVoltage={analysis.measuredVoltage}
          liveCurrent={analysis.measuredCurrent}
        />
      </div>

      {/* Hypothesis Verification Modal */}
      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        slope={activeSlope}
        errorPercent={activeErrorPercent}
        onVerifiedCorrectly={onVerifiedCorrectly}
        onProceedToQuiz={onProceedToQuiz}
      />
    </div>
  );
};
