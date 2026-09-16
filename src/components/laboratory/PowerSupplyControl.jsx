import React from 'react';
import { BatteryCharging, Plus, Minus } from 'lucide-react';
import { sounds } from '../../engine/audioEffects';

export const PowerSupplyControl = ({
  voltage,
  setVoltage,
  min = 0,
  max = 10,
  step = 0.5,
  isTripped = false,
}) => {
  const updateVoltage = (newVal) => {
    const clamped = Math.min(Math.max(Number(newVal.toFixed(1)), min), max);
    setVoltage(clamped);
    sounds.playTick();
  };

  const presets = [2.0, 4.0, 6.0, 8.0, 10.0];

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-slate-900 to-[#0c1424] border border-cyan-500/30 p-4 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
            <BatteryCharging className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-white tracking-wide uppercase font-mono">
            DC Regulated Power Supply
          </span>
        </div>
        {isTripped ? (
          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-mono animate-pulse">
            OVERCURRENT TRIP
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono">
            REGULATED 0–10V
          </span>
        )}
      </div>

      {/* Main Voltage Display Screen */}
      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase">OUTPUT POTENTIAL</span>
          <div className="text-2xl font-black font-mono text-emerald-400 tracking-wider">
            {voltage.toFixed(1)} <span className="text-sm font-semibold text-emerald-500">V</span>
          </div>
        </div>

        {/* Step Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => updateVoltage(voltage - step)}
            disabled={voltage <= min}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white border border-white/10 transition-colors"
            title={`Decrease voltage by ${step}V`}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => updateVoltage(voltage + step)}
            disabled={voltage >= max}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-white border border-white/10 transition-colors"
            title={`Increase voltage by ${step}V`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Continuous Range Slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>{min.toFixed(1)} V</span>
          <span className="text-cyan-400 font-semibold">{voltage.toFixed(1)} V</span>
          <span>{max.toFixed(1)} V</span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={voltage}
          onChange={(e) => updateVoltage(parseFloat(e.target.value))}
          className="w-full h-2 cursor-pointer"
        />
      </div>

      {/* Voltage Preset Chips */}
      <div className="flex items-center justify-between gap-1.5 pt-1">
        <span className="text-[10px] font-mono text-slate-400">Presets:</span>
        <div className="flex gap-1">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => updateVoltage(p)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
                Math.abs(voltage - p) < 0.01
                  ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400 shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 border-white/5 hover:bg-slate-700'
              }`}
            >
              {p.toFixed(0)}V
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
