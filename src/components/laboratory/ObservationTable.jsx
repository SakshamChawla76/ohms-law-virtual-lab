import React from 'react';
import { 
  ClipboardList, 
  PlusCircle, 
  Trash2, 
  RotateCcw, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { sounds } from '../../engine/audioEffects';

export const ObservationTable = ({
  trials,
  onRecordReading,
  onDeleteTrial,
  onClearTrials,
  currentV,
  currentI,
  isCircuitActive,
  minRequired = 5,
}) => {
  const isComplete = trials.length >= minRequired;

  const handleRecord = () => {
    onRecordReading();
    sounds.playRecordReading();
  };

  return (
    <div className="w-full rounded-3xl glass-panel border border-white/10 p-5 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Observation Table
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-medium border ${
                isComplete 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {trials.length} / {minRequired} Trials Recorded
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Observe ammeter & voltmeter readings, then click 'Record Reading'.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRecord}
            disabled={!isCircuitActive || currentV <= 0}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-glow-cyan transition-all transform active:scale-95"
            title={!isCircuitActive ? 'Activate circuit first by closing switch' : 'Record current meter readings into table'}
          >
            <PlusCircle className="w-4 h-4" />
            Record Reading ({currentV.toFixed(1)}V, {currentI.toFixed(3)}A)
          </button>

          {trials.length > 0 && (
            <button
              onClick={() => { sounds.playSnap(); onClearTrials(); }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 border border-white/10 transition-colors"
              title="Clear all recorded trials"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Observation Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/60">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-white/10 bg-slate-900/80 text-slate-400">
              <th className="py-2.5 px-4 font-semibold">Trial #</th>
              <th className="py-2.5 px-4 font-semibold text-emerald-400">Voltmeter V (V)</th>
              <th className="py-2.5 px-4 font-semibold text-amber-400">Ammeter I (A)</th>
              <th className="py-2.5 px-4 font-semibold text-cyan-400">Calculated R = V/I (Ω)</th>
              <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {trials.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500 font-sans text-xs">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-6 h-6 text-slate-600" />
                    <span>No readings recorded yet.</span>
                    <span className="text-[11px] text-slate-500">
                      Close the switch, set voltage, and click <strong>"Record Reading"</strong> to collect data.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              trials.map((t, idx) => (
                <tr key={t.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-white">Trial {idx + 1}</td>
                  <td className="py-2.5 px-4 text-emerald-300 font-bold">{t.voltage.toFixed(2)}</td>
                  <td className="py-2.5 px-4 text-amber-300 font-bold">{t.current.toFixed(3)}</td>
                  <td className="py-2.5 px-4 text-cyan-300 font-bold">
                    {t.calculatedResistance.toFixed(2)} Ω
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={() => { sounds.playTick(); onDeleteTrial(t.id); }}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                      title="Delete trial reading"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Progress Helper Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-1.5">
          {isComplete ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Ready for V-I Graph analysis!
            </span>
          ) : (
            <span className="text-amber-400">
              * Record at least {minRequired - trials.length} more reading(s) across different voltages to unlock graphing.
            </span>
          )}
        </div>
        {trials.length > 0 && (
          <div>
            Average R = {(trials.reduce((acc, t) => acc + t.calculatedResistance, 0) / trials.length).toFixed(2)} Ω
          </div>
        )}
      </div>
    </div>
  );
};
