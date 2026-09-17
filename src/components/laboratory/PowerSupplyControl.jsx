import React, { useState } from 'react';
import { BatteryCharging, Plus, Minus, Power, Zap } from 'lucide-react';
import { sounds } from '../../engine/audioEffects';

export const PowerSupplyControl = ({
  voltage,
  setVoltage,
  min = 0,
  max = 10,
  step = 0.5,
  isTripped = false,
}) => {
  const [knobRotation, setKnobRotation] = useState((voltage / max) * 270 - 135);

  const updateVoltage = (newVal) => {
    const clamped = Math.min(Math.max(Number(newVal.toFixed(1)), min), max);
    setVoltage(clamped);
    setKnobRotation((clamped / max) * 270 - 135);
    sounds.playTick();
  };

  const presets = [2.0, 4.0, 6.0, 8.0, 10.0];

  return (
    <div className="w-full rounded-2xl lab-chassis p-4 select-none relative overflow-hidden flex flex-col justify-between">
      {/* Fastener Screws */}
      <div className="absolute top-2 left-2 screw-head" />
      <div className="absolute top-2 right-2 screw-head" />
      <div className="absolute bottom-2 left-2 screw-head" />
      <div className="absolute bottom-2 right-2 screw-head" />

      {/* Header & Anodized Nameplate */}
      <div className="flex items-center justify-between border-b border-chassis-border/80 pb-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-chassis-raised border border-chassis-border text-amber-400">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              DC BENCH POWER SUPPLY
            </div>
            <div className="text-[10px] font-mono text-slate-400">REGULATED LINEAR 0–10V</div>
          </div>
        </div>
        {isTripped ? (
          <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500 text-rose-400 text-[10px] font-mono font-bold animate-pulse">
            FAULT TRIP
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold">
            OUTPUT ACTIVE
          </span>
        )}
      </div>

      {/* Main Dual LED Readout Bezel */}
      <div className="p-3 rounded-xl lab-inset border border-slate-800 grid grid-cols-2 gap-3 mb-3">
        {/* Voltage Display */}
        <div className="bg-[#080a0f] p-2.5 rounded-lg border border-slate-900 flex flex-col justify-between">
          <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
            POTENTIAL (V)
          </div>
          <div className="flex items-baseline justify-between mt-1 font-digital">
            <span className="text-2xl font-bold tracking-widest glow-amber-text">
              {voltage.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-amber-500/80">VOLTS</span>
          </div>
        </div>

        {/* Status Indicator Panel */}
        <div className="bg-[#080a0f] p-2.5 rounded-lg border border-slate-900 flex flex-col justify-between">
          <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
            OPERATION MODE
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-led-emerald inline-block" />
            <span className="text-xs font-mono font-bold text-emerald-400">CV (STABLE)</span>
          </div>
        </div>
      </div>

      {/* Center Tactile Controls: Steppers & Knurled Potentiometer */}
      <div className="flex items-center justify-between gap-4 px-2 py-1">
        {/* Rotary Knurled Dial Visualizer */}
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-full knurled-grip border-2 border-slate-700 flex items-center justify-center cursor-pointer shadow-knurl-depth group">
            {/* Rotation Indicator Dot */}
            <div
              className="absolute w-2 h-2 rounded-full bg-amber-400 border border-slate-900 transition-transform duration-100 ease-out"
              style={{
                transform: `rotate(${knobRotation}deg) translateY(-20px)`,
              }}
            />
            {/* Center Cap */}
            <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-600 flex items-center justify-center text-[8px] font-mono text-slate-400">
              POT
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            <div>FINE / COARSE</div>
            <div className="text-amber-400 font-bold">{voltage.toFixed(1)} V DIAL</div>
          </div>
        </div>

        {/* Step Precision Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => updateVoltage(voltage - step)}
            disabled={voltage <= min}
            className="w-9 h-9 rounded-lg bg-chassis-raised hover:bg-slate-700 active:translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 border border-chassis-border flex items-center justify-center transition-all shadow-sm"
            title={`Decrease voltage by ${step}V`}
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => updateVoltage(voltage + step)}
            disabled={voltage >= max}
            className="w-9 h-9 rounded-lg bg-chassis-raised hover:bg-slate-700 active:translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 border border-chassis-border flex items-center justify-center transition-all shadow-sm"
            title={`Increase voltage by ${step}V`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slider Sweep */}
      <div className="space-y-1 mt-2 px-1">
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

      {/* Voltage Preset Push-Buttons */}
      <div className="flex items-center justify-between gap-1 mt-3 pt-2 border-t border-chassis-border/60">
        <span className="text-[10px] font-mono text-slate-400 uppercase">VOLTAGE PRESETS:</span>
        <div className="flex gap-1">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => updateVoltage(p)}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition-all active:translate-y-0.5 ${
                Math.abs(voltage - p) < 0.01
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                  : 'bg-chassis-raised text-slate-300 border-chassis-border hover:bg-slate-700 hover:text-white'
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
