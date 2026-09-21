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
  const meanR = n > 0 
    ? trials.reduce((acc, t) => acc + t.calculatedResistance, 0) / n 
    : 0;
  
  const stdDevR = n > 1 
    ? Math.sqrt(trials.reduce((acc, t) => acc + Math.pow(t.calculatedResistance - meanR, 2), 0) / (n - 1))
    : 0;

  return (
    <div className="w-full rounded-xl bg-white border border-slate-200 p-4 space-y-3.5 shadow-sm select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase font-mono tracking-wider flex items-center gap-2">
              Laboratory Notebook Ledger
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${
                isComplete 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                  : 'bg-amber-50 text-amber-700 border-amber-300'
              }`}>
                {trials.length} / {minRequired} READINGS RECORDED
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 font-sans">
              Acquire at least {minRequired} distinct operational voltage points to characterize experimental line.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRecord}
            disabled={!isCircuitActive || currentV <= 0}
            className="px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm border border-amber-400 transition-all transform active:scale-95"
            title={!isCircuitActive ? 'Activate circuit first by closing knife switch' : 'Log current telemetry readings'}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>LOG READING ({currentV.toFixed(1)}V, {currentI.toFixed(3)}A)</span>
          </button>

          {trials.length > 0 && (
            <button
              onClick={() => { sounds.playSnap(); onClearTrials(); }}
              className="p-1.5 rounded bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-300 transition-colors"
              title="Reset ledger and purge records"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Observation Table Grid */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-[11px]">
              <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider">Index</th>
              <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider text-emerald-700">Potential V (V)</th>
              <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider text-amber-700">Current I (A)</th>
              <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider text-sky-700">Ratio R = V/I (Ω)</th>
              <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider text-right">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {trials.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-500 font-sans text-xs">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <AlertCircle className="w-5 h-5 text-slate-400" />
                    <span className="font-mono text-slate-600 font-bold">NO TELEMETRY TRIALS LOGGED</span>
                    <span className="text-[11px] text-slate-500">
                      Close the switch, dial voltage, and click <strong>"LOG READING"</strong> to acquire observations.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              trials.map((t, idx) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2 px-3.5 font-bold text-slate-800">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-700">
                      T-{String(idx + 1).padStart(2, '0')}
                    </span>
                  </td>
                  <td className="py-2 px-3.5 text-emerald-700 font-bold">{t.voltage.toFixed(2)}</td>
                  <td className="py-2 px-3.5 text-amber-700 font-bold">{t.current.toFixed(3)}</td>
                  <td className="py-2 px-3.5 text-sky-700 font-bold font-digital text-sm">
                    {t.calculatedResistance.toFixed(2)} Ω
                  </td>
                  <td className="py-2 px-3.5 text-right">
                    <button
                      onClick={() => { sounds.playTick(); onDeleteTrial(t.id); }}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <span className="text-emerald-700 font-medium flex items-center gap-1 text-[11px]">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Minimum dataset acquired — curve tracer unlocked.
            </span>
          ) : (
            <span className="text-amber-800 font-medium text-[11px]">
              * Need {minRequired - trials.length} more reading(s) across varied voltages.
            </span>
          )}
        </div>

        {trials.length > 0 && (
          <div className="flex items-center gap-4 text-[11px] text-slate-700">
            <div className="flex items-center gap-1">
              <span className="text-slate-500 uppercase">Mean R (R̄):</span>
              <span className="text-emerald-700 font-bold font-digital text-xs">{meanR.toFixed(2)} Ω</span>
            </div>
            {trials.length > 1 && (
              <div className="flex items-center gap-1">
                <span className="text-slate-500 uppercase">Std Dev (σ):</span>
                <span className="text-amber-800 font-bold font-digital text-xs">±{stdDevR.toFixed(3)} Ω</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
