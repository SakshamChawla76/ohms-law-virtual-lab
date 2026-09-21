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
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-amber-50 border border-amber-200 text-amber-700">
            <Zap className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              DC BENCH POWER SUPPLY
            </div>
            <div className="text-[10px] font-mono text-slate-500">REGULATED LINEAR 0–10V</div>
          </div>
        </div>
        {isTripped ? (
          <span className="px-2 py-0.5 rounded bg-rose-50 border border-rose-300 text-rose-700 text-[10px] font-mono font-bold animate-pulse">
            FAULT TRIP
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-700 text-[10px] font-mono font-bold">
            OUTPUT ACTIVE
          </span>
        )}
      </div>

      {/* Main Dual LED Readout Bezel */}
      <div className="p-3 rounded-xl lab-inset border border-slate-200 grid grid-cols-2 gap-3 mb-3">
        {/* Voltage Display */}
        <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
            POTENTIAL (V)
          </div>
          <div className="flex items-baseline justify-between mt-1 font-digital">
            <span className="text-2xl font-bold tracking-widest text-slate-900">
              {voltage.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-amber-700">VOLTS</span>
          </div>
        </div>

        {/* Status Indicator Panel */}
        <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
            OPERATION MODE
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-led-emerald inline-block" />
            <span className="text-xs font-mono font-bold text-emerald-700">CV (STABLE)</span>
          </div>
        </div>
      </div>

      {/* Center Tactile Controls: Steppers & Knurled Potentiometer */}
      <div className="flex items-center justify-between gap-4 px-2 py-1">
        {/* Rotary Knurled Dial Visualizer */}
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 rounded-full knurled-grip border-2 border-slate-300 flex items-center justify-center cursor-pointer shadow-sm group">
            {/* Rotation Indicator Dot */}
            <div
              className="absolute w-2 h-2 rounded-full bg-amber-500 border border-slate-700 transition-transform duration-100 ease-out"
              style={{
                transform: `rotate(${knobRotation}deg) translateY(-20px)`,
              }}
            />
            {/* Center Cap */}
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-[8px] font-mono text-slate-600">
              POT
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            <div>FINE / COARSE</div>
            <div className="text-amber-700 font-bold">{voltage.toFixed(1)} V DIAL</div>
          </div>
        </div>

        {/* Step Precision Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => updateVoltage(voltage - step)}
            disabled={voltage <= min}
            className="w-9 h-9 rounded-lg bg-white hover:bg-slate-100 active:translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 border border-slate-300 flex items-center justify-center transition-all shadow-sm"
            title={`Decrease voltage by ${step}V`}
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={() => updateVoltage(voltage + step)}
            disabled={voltage >= max}
            className="w-9 h-9 rounded-lg bg-white hover:bg-slate-100 active:translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 border border-slate-300 flex items-center justify-center transition-all shadow-sm"
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
      <div className="flex items-center justify-between gap-1 mt-3 pt-2 border-t border-slate-200">
        <span className="text-[10px] font-mono text-slate-500 uppercase">VOLTAGE PRESETS:</span>
        <div className="flex gap-1">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => updateVoltage(p)}
              className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition-all active:translate-y-0.5 ${
                Math.abs(voltage - p) < 0.01
                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
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
