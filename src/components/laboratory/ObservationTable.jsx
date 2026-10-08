import React from 'react';
import { 
  ClipboardList, 
  PlusCircle, 
  Trash2, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  Calculator, 
  Sigma 
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

  // Calculate statistics: Mean, Standard Deviation
  const n = trials.length;
  const getCalcR = (t) => t.calculatedResistance ?? (t.current > 0 ? t.voltage / t.current : 0);
  const meanR = n > 0 
    ? trials.reduce((acc, t) => acc + getCalcR(t), 0) / n 
    : 0;
  
  const stdDevR = n > 1 
    ? Math.sqrt(trials.reduce((acc, t) => acc + Math.pow(getCalcR(t) - meanR, 2), 0) / (n - 1))
    : 0;

  return (
    <div className="w-full rounded-2xl p-4 space-y-3.5 select-none border border-outline-variant/30 shadow-sm bg-surface-container-lowest">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-50 border border-teal-200 text-teal-700">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface uppercase font-mono tracking-wider flex items-center gap-2">
              Laboratory Notebook Ledger
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold border transition-all ${
                isComplete 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                  : 'bg-amber-50 text-amber-800 border-amber-300'
              }`}>
                {trials.length} / {minRequired} READINGS RECORDED
              </span>
            </h3>
            <p className="text-[11px] text-on-surface-variant font-sans">
              Acquire at least {minRequired} distinct operational voltage points to characterize experimental line.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRecord}
            disabled={!isCircuitActive || currentV <= 0}
            className="px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all transform active:scale-95 border-none"
            title={!isCircuitActive ? 'Activate circuit first by closing knife switch' : 'Log current telemetry readings'}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>LOG READING ({currentV.toFixed(1)}V, {currentI.toFixed(3)}A)</span>
          </button>

          {trials.length > 0 && (
            <button
              onClick={() => { sounds.playSnap(); onClearTrials(); }}
              className="p-1.5 rounded-xl bg-surface-container hover:bg-rose-50 text-on-surface-variant hover:text-rose-700 border border-outline-variant/30 hover:border-rose-300 transition-colors"
              title="Reset ledger and purge records"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Observation Table Grid */}
      <div className="overflow-x-auto rounded-xl border border-outline-variant/30 bg-surface-container-lowest">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-outline-variant/20 bg-surface-container text-on-surface-variant text-[11px]">
              <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider">Index</th>
              <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider text-emerald-700">Potential V (V)</th>
              <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider text-amber-700">Current I (A)</th>
              <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider text-teal-700">Ratio R = V/I (Ω)</th>
              <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider text-right">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/20 text-on-surface">
            {trials.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-on-surface-variant font-sans text-xs">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <AlertCircle className="w-5 h-5 text-on-surface-variant/60" />
                    <span className="font-mono text-on-surface font-bold">NO TELEMETRY TRIALS LOGGED</span>
                    <span className="text-[11px] text-on-surface-variant">
                      Close the switch, dial voltage, and click <strong className="text-teal-700">"LOG READING"</strong> to acquire observations.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              trials.map((t, idx) => (
                <tr key={t.id || t.trialNumber || idx} className="hover:bg-surface-container/60 transition-colors">
                  <td className="py-2 px-3.5 font-bold text-on-surface">
                    <span className="px-2 py-0.5 rounded-md bg-surface-container border border-outline-variant/20 text-[10px] text-on-surface-variant font-mono">
                      T-{String(idx + 1).padStart(2, '0')}
                    </span>
                  </td>
                  <td className="py-2 px-3.5 text-emerald-800 font-bold">{t.voltage.toFixed(2)}</td>
                  <td className="py-2 px-3.5 text-amber-800 font-bold">{t.current.toFixed(3)}</td>
                  <td className="py-2 px-3.5 text-teal-800 font-bold font-mono text-sm">
                    {getCalcR(t).toFixed(2)} Ω
                  </td>
                  <td className="py-2 px-3.5 text-right">
                    <button
                      onClick={() => { sounds.playTick(); onDeleteTrial(t.id); }}
                      className="p-1 rounded-lg text-on-surface-variant hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete trial record"
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

      {/* Statistical Summary Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono bg-surface-container px-3.5 py-2.5 rounded-xl border border-outline-variant/20">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <span className="text-emerald-800 font-medium flex items-center gap-1.5 text-[11px]">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Minimum dataset acquired — curve tracer unlocked.
            </span>
          ) : (
            <span className="text-amber-800 font-medium text-[11px]">
              * Need {minRequired - trials.length} more reading(s) across varied voltages.
            </span>
          )}
        </div>

        {trials.length > 0 && (
          <div className="flex items-center gap-4 text-[11px] text-on-surface">
            <div className="flex items-center gap-1.5">
              <span className="text-on-surface-variant uppercase">Mean R (R̄):</span>
              <span className="text-teal-800 font-bold font-mono text-xs px-2 py-0.5 rounded bg-teal-50 border border-teal-200">
                {meanR.toFixed(2)} Ω
              </span>
            </div>
            {trials.length > 1 && (
              <div className="flex items-center gap-1.5">
                <span className="text-on-surface-variant uppercase">Std Dev (σ):</span>
                <span className="text-amber-800 font-bold font-mono text-xs px-2 py-0.5 rounded bg-amber-50 border border-amber-200">
                  ±{stdDevR.toFixed(3)} Ω
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
