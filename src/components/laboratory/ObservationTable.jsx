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
    <div className="w-full rounded-2xl glass-card p-4 space-y-3.5 select-none border border-white/10 shadow-xl bg-slate-900/60 backdrop-blur-xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase font-mono tracking-wider flex items-center gap-2">
              Laboratory Notebook Ledger
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold border transition-all ${
                isComplete 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
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
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all transform active:scale-95 border-none"
            title={!isCircuitActive ? 'Activate circuit first by closing knife switch' : 'Log current telemetry readings'}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>LOG READING ({currentV.toFixed(1)}V, {currentI.toFixed(3)}A)</span>
          </button>

          {trials.length > 0 && (
            <button
              onClick={() => { sounds.playSnap(); onClearTrials(); }}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/30 transition-colors"
              title="Reset ledger and purge records"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Observation Table Grid */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-slate-300 text-[11px]">
              <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider">Index</th>
              <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider text-emerald-400">Potential V (V)</th>
              <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider text-amber-400">Current I (A)</th>
              <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider text-cyan-400">Ratio R = V/I (Ω)</th>
              <th className="py-2.5 px-3.5 font-bold uppercase tracking-wider text-right">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-200">
            {trials.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-400 font-sans text-xs">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <AlertCircle className="w-5 h-5 text-slate-500" />
                    <span className="font-mono text-slate-300 font-bold">NO TELEMETRY TRIALS LOGGED</span>
                    <span className="text-[11px] text-slate-500">
                      Close the switch, dial voltage, and click <strong className="text-amber-400">"LOG READING"</strong> to acquire observations.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              trials.map((t, idx) => (
                <tr key={t.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-2 px-3.5 font-bold text-slate-200">
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] text-slate-300 font-mono">
                      T-{String(idx + 1).padStart(2, '0')}
                    </span>
                  </td>
                  <td className="py-2 px-3.5 text-emerald-300 font-bold">{t.voltage.toFixed(2)}</td>
                  <td className="py-2 px-3.5 text-amber-300 font-bold">{t.current.toFixed(3)}</td>
                  <td className="py-2 px-3.5 text-cyan-300 font-bold font-mono text-sm">
                    {t.calculatedResistance.toFixed(2)} Ω
                  </td>
                  <td className="py-2 px-3.5 text-right">
                    <button
                      onClick={() => { sounds.playTick(); onDeleteTrial(t.id); }}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono bg-black/40 px-3.5 py-2.5 rounded-xl border border-white/5">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <span className="text-emerald-400 font-medium flex items-center gap-1.5 text-[11px]">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Minimum dataset acquired — curve tracer unlocked.
            </span>
          ) : (
            <span className="text-amber-400/90 font-medium text-[11px]">
              * Need {minRequired - trials.length} more reading(s) across varied voltages.
            </span>
          )}
        </div>

        {trials.length > 0 && (
          <div className="flex items-center gap-4 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 uppercase">Mean R (R̄):</span>
              <span className="text-cyan-300 font-bold font-mono text-xs px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30">
                {meanR.toFixed(2)} Ω
              </span>
            </div>
            {trials.length > 1 && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 uppercase">Std Dev (σ):</span>
                <span className="text-amber-300 font-bold font-mono text-xs px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30">
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
