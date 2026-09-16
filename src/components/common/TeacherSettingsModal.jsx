import React, { useState } from 'react';
import { Settings, Check, X } from 'lucide-react';
import { sounds } from '../../engine/audioEffects';

export const TeacherSettingsModal = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState({ ...config });

  if (!isOpen) return null;

  const handleSave = () => {
    sounds.playSuccess();
    onSaveConfig(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-2xl p-6 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Teacher & Instructor Mode</h2>
              <p className="text-xs text-slate-400">Configure experiment parameters, noise, and grading thresholds.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 text-xs font-mono">
          {/* Default Resistor */}
          <div className="space-y-1">
            <label className="text-slate-300">Default Nominal Resistor (Ω)</label>
            <select
              value={formData.nominalResistance}
              onChange={(e) => setFormData({ ...formData, nominalResistance: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono"
            >
              {formData.resistorOptions.map(r => (
                <option key={r} value={r}>{r} Ω</option>
              ))}
            </select>
          </div>

          {/* Voltage Max */}
          <div className="space-y-1">
            <label className="text-slate-300">Maximum Power Supply Voltage (V)</label>
            <input
              type="number"
              min="2"
              max="20"
              step="1"
              value={formData.voltageMax}
              onChange={(e) => setFormData({ ...formData, voltageMax: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono"
            />
          </div>

          {/* Required Readings */}
          <div className="space-y-1">
            <label className="text-slate-300">Minimum Required Readings for Graph Unlock</label>
            <input
              type="number"
              min="3"
              max="10"
              value={formData.minReadingsRequired}
              onChange={(e) => setFormData({ ...formData, minReadingsRequired: Number(e.target.value) })}
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono"
            />
          </div>

          {/* Measurement Noise Toggle */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-xs">Simulate Realistic Meter Noise</div>
              <div className="text-[10px] text-slate-400">Adds subtle ±1.2% hardware calibration variance for authentic data.</div>
            </div>
            <input
              type="checkbox"
              checked={formData.measurementNoise}
              onChange={(e) => setFormData({ ...formData, measurementNoise: e.target.checked })}
              className="h-4 w-4 rounded accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Hints Enabled Toggle */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/10 flex items-center justify-between">
            <div>
              <div className="font-bold text-white text-xs">Enable Student Hints</div>
              <div className="text-[10px] text-slate-400">Allows progressive 3-level hints in guided mode.</div>
            </div>
            <input
              type="checkbox"
              checked={formData.hintsEnabled}
              onChange={(e) => setFormData({ ...formData, hintsEnabled: e.target.checked })}
              className="h-4 w-4 rounded accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-glow-cyan"
          >
            <Check className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
