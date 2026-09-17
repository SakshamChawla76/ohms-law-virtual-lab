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
    <div className="w-full rounded-xl bg-[#0f1420] border border-[#26334d] p-4 space-y-3.5 shadow-chassis-raised select-none">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#202c42] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[#162033] border border-[#2d3d5e] text-amber-400">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase font-mono tracking-wider flex items-center gap-2">
              Laboratory Notebook Ledger
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${
                isComplete 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {trials.length} / {minRequired} READINGS RECORDED
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Acquire at least {minRequired} distinct operational voltage points to characterize experimental line.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRecord}
            disabled={!isCircuitActive || currentV <= 0}
            className="px-3.5 py-1.5 rounded bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-30 disabled:cursor-not-allowed text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-sm border border-amber-300/40 transition-all transform active:scale-95"
            title={!isCircuitActive ? 'Activate circuit first by closing knife switch' : 'Log current telemetry readings'}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>LOG READING ({currentV.toFixed(1)}V, {currentI.toFixed(3)}A)</span>
          </button>

          {trials.length > 0 && (
            <button
              onClick={() => { sounds.playSnap(); onClearTrials(); }}
              className="p-1.5 rounded bg-[#161f30] hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-[#273650] hover:border-rose-600/40 transition-colors"
              title="Reset ledger and purge records"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Observation Table Grid */}
      <div className="overflow-x-auto rounded-lg border border-[#202c42] bg-[#090d14]">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-[#202c42] bg-[#121927] text-slate-400 text-[11px]">
              <th className="py-2 px-3.5 font-bold uppercase tracking-wider">Index</th>
              <th className="py-2 px-3.5 font-bold uppercase tracking-wider text-emerald-400">Potential V (V)</th>
              <th className="py-2 px-3.5 font-bold uppercase tracking-wider text-amber-400">Current I (A)</th>
              <th className="py-2 px-3.5 font-bold uppercase tracking-wider text-sky-400">Ratio R = V/I (Ω)</th>
              <th className="py-2 px-3.5 font-bold uppercase tracking-wider text-right">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#182233] text-slate-300">
            {trials.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-500 font-sans text-xs">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <AlertCircle className="w-5 h-5 text-slate-600" />
                    <span className="font-mono text-slate-400">NO TELEMETRY TRIALS LOGGED</span>
                    <span className="text-[11px] text-slate-500">
                      Close the switch, dial voltage, and click <strong>"LOG READING"</strong> to acquire observations.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              trials.map((t, idx) => (
                <tr key={t.id} className="hover:bg-[#121a2a] transition-colors">
                  <td className="py-2 px-3.5 font-bold text-slate-300">
                    <span className="px-1.5 py-0.5 rounded bg-[#162033] border border-[#2b3a58] text-[10px]">
                      T-{String(idx + 1).padStart(2, '0')}
                    </span>
                  </td>
                  <td className="py-2 px-3.5 text-emerald-400 font-bold">{t.voltage.toFixed(2)}</td>
                  <td className="py-2 px-3.5 text-amber-400 font-bold">{t.current.toFixed(3)}</td>
                  <td className="py-2 px-3.5 text-sky-400 font-bold font-digital text-sm">
                    {t.calculatedResistance.toFixed(2)} Ω
                  </td>
                  <td className="py-2 px-3.5 text-right">
                    <button
                      onClick={() => { sounds.playTick(); onDeleteTrial(t.id); }}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono bg-[#090d14] px-3.5 py-2 rounded-lg border border-[#1e293d]">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
              <CheckCircle className="w-3.5 h-3.5" /> Minimum dataset acquired — curve tracer unlocked.
            </span>
          ) : (
            <span className="text-amber-400 text-[11px]">
              * Need {minRequired - trials.length} more reading(s) across varied voltages.
            </span>
          )}
        </div>

        {trials.length > 0 && (
          <div className="flex items-center gap-4 text-[11px] text-slate-300">
            <div className="flex items-center gap-1">
              <span className="text-slate-500 uppercase">Mean R (R̄):</span>
              <span className="text-emerald-400 font-bold font-digital text-xs">{meanR.toFixed(2)} Ω</span>
            </div>
            {trials.length > 1 && (
              <div className="flex items-center gap-1">
                <span className="text-slate-500 uppercase">Std Dev (σ):</span>
                <span className="text-amber-400 font-bold font-digital text-xs">±{stdDevR.toFixed(3)} Ω</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
