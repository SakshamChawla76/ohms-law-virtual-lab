import React, { useState, useEffect, useRef } from 'react';
import anime from '../../lib/anime';
import { Settings, Check, X, Sliders } from 'lucide-react';
import { sounds } from '../../engine/audioEffects';

const springSnappy = { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 };
const springFluid = { type: 'spring', stiffness: 260, damping: 25, mass: 0.9 };

export const TeacherSettingsModal = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState({ ...config });
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const fieldRefs = useRef([]);

  useEffect(() => {
    if (!isOpen) return;

    if (overlayRef.current) {
      anime({
        targets: overlayRef.current,
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutExpo',
      });
    }

    if (modalRef.current) {
      anime({
        targets: modalRef.current,
        opacity: [0, 1],
        translateY: [20, 0],
        scale: [0.95, 1],
        duration: 500,
        easing: 'easeOutExpo',
      });
    }

    fieldRefs.current = fieldRefs.current.filter(Boolean);
    if (fieldRefs.current.length > 0) {
      anime({
        targets: fieldRefs.current,
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 400,
        delay: anime.stagger(80),
        easing: 'easeOutExpo',
      });
    }
  }, [isOpen]);

  const handleSave = () => {
    sounds.playSuccess();
    onSaveConfig(formData);
    onClose();
  };

  const handleOverlayClick = () => {
    anime({
      targets: overlayRef.current,
      opacity: 0,
      duration: 200,
      easing: 'easeOutExpo',
      complete: () => onClose(),
    });
  };

  const handleCloseButtonHover = (e, animate) => {
    anime({
      targets: e.currentTarget,
      scale: animate ? 1.1 : 1,
      ...springSnappy,
    });
  };

  const handleSaveButtonHover = (e, animate) => {
    anime({
      targets: e.currentTarget,
      scale: animate ? 1.06 : 1,
      ...springSnappy,
    });
  };

  const handleCancelButtonHover = (e, animate) => {
    anime({
      targets: e.currentTarget,
      scale: animate ? 1.05 : 1,
      ...springSnappy,
    });
  };

  const handleSelectHover = (e, animate) => {
    anime({
      targets: e.currentTarget,
      scale: animate ? 1.02 : 1,
      ...springFluid,
    });
  };

  const handleInputHover = (e, animate) => {
    anime({
      targets: e.currentTarget,
      scale: animate ? 1.01 : 1,
      ...springFluid,
    });
  };

  const handleToggleHover = (e, animate) => {
    anime({
      targets: e.currentTarget,
      scale: animate ? 1.05 : 1,
      ...springSnappy,
    });
  };

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn text-slate-100"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg rounded-3xl bg-slate-900/90 border border-white/10 backdrop-blur-2xl shadow-2xl p-6 md:p-8 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Teacher & Instructor Mode</h2>
              <p className="text-xs text-slate-400">Configure experiment parameters, noise, and grading thresholds.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            onMouseEnter={(e) => handleCloseButtonHover(e, true)}
            onMouseLeave={(e) => handleCloseButtonHover(e, false)}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-4 text-xs font-mono">
          {/* Default Resistor */}
          <div
            ref={el => fieldRefs.current[0] = el}
            className="space-y-1.5"
          >
            <label className="text-slate-300 font-semibold uppercase tracking-wider text-[11px]">Default Nominal Resistor (Ω)</label>
            <select
              value={formData.nominalResistance}
              onChange={(e) => setFormData({ ...formData, nominalResistance: Number(e.target.value) })}
              onMouseEnter={(e) => handleSelectHover(e, true)}
              onMouseLeave={(e) => handleSelectHover(e, false)}
              className="w-full p-3 rounded-xl bg-slate-800/60 border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-none transition-colors"
            >
              {formData.resistorOptions.map(r => (
                <option key={r} value={r} className="bg-slate-900 text-white">{r} Ω</option>
              ))}
            </select>
          </div>

          {/* Voltage Max */}
          <div
            ref={el => fieldRefs.current[1] = el}
            className="space-y-1.5"
          >
            <label className="text-slate-300 font-semibold uppercase tracking-wider text-[11px]">Maximum Power Supply Voltage (V)</label>
            <input
              type="number"
              min="2"
              max="20"
              step="1"
              value={formData.voltageMax}
              onChange={(e) => setFormData({ ...formData, voltageMax: Number(e.target.value) })}
              onMouseEnter={(e) => handleInputHover(e, true)}
              onMouseLeave={(e) => handleInputHover(e, false)}
              className="w-full p-3 rounded-xl bg-slate-800/60 border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Required Readings */}
          <div
            ref={el => fieldRefs.current[2] = el}
            className="space-y-1.5"
          >
            <label className="text-slate-300 font-semibold uppercase tracking-wider text-[11px]">Minimum Required Readings for Graph Unlock</label>
            <input
              type="number"
              min="3"
              max="10"
              value={formData.minReadingsRequired}
              onChange={(e) => setFormData({ ...formData, minReadingsRequired: Number(e.target.value) })}
              onMouseEnter={(e) => handleInputHover(e, true)}
              onMouseLeave={(e) => handleInputHover(e, false)}
              className="w-full p-3 rounded-xl bg-slate-800/60 border border-white/10 text-white font-mono focus:border-cyan-400 focus:outline-none transition-colors"
            />
          </div>

          {/* Measurement Noise Toggle */}
          <div
            ref={el => fieldRefs.current[3] = el}
            className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 flex items-center justify-between"
            onMouseEnter={(e) => handleToggleHover(e, true)}
            onMouseLeave={(e) => handleToggleHover(e, false)}
          >
            <div>
              <div className="font-bold text-white text-xs">Simulate Realistic Meter Noise</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Adds subtle ±1.2% hardware calibration variance for authentic data.</div>
            </div>
            <input
              type="checkbox"
              checked={formData.measurementNoise}
              onChange={(e) => setFormData({ ...formData, measurementNoise: e.target.checked })}
              className="h-4 w-4 rounded accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Hints Enabled Toggle */}
          <div
            ref={el => fieldRefs.current[4] = el}
            className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 flex items-center justify-between"
            onMouseEnter={(e) => handleToggleHover(e, true)}
            onMouseLeave={(e) => handleToggleHover(e, false)}
          >
            <div>
              <div className="font-bold text-white text-xs">Enable Student Hints</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Allows progressive 3-level hints in guided mode.</div>
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
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
          <button
            onClick={onClose}
            onMouseEnter={(e) => handleCancelButtonHover(e, true)}
            onMouseLeave={(e) => handleCancelButtonHover(e, false)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            onMouseEnter={(e) => handleSaveButtonHover(e, true)}
            onMouseLeave={(e) => handleSaveButtonHover(e, false)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 border-none"
          >
            <Check className="w-4 h-4" />
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};