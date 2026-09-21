import React, { useState } from 'react';
import { 
  Layers, 
  ArrowRight, 
  BatteryCharging, 
  Cpu, 
  Gauge, 
  Activity, 
  ToggleRight, 
  Share2, 
  CheckCircle2, 
  Info,
  ShieldAlert
} from 'lucide-react';
import { APPARATUS_LIST } from '../../config/experimentConfig';
import { sounds } from '../../engine/audioEffects';

export const ApparatusScreen = ({ onNavigate }) => {
  const [selectedApparatus, setSelectedApparatus] = useState(APPARATUS_LIST[0]);

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'BatteryCharging': return <BatteryCharging className="w-6 h-6" />;
      case 'Cpu': return <Cpu className="w-6 h-6" />;
      case 'Gauge': return <Gauge className="w-6 h-6" />;
      case 'Activity': return <Activity className="w-6 h-6" />;
      case 'ToggleRight': return <ToggleRight className="w-6 h-6" />;
      case 'Share2': return <Share2 className="w-6 h-6" />;
      default: return <Layers className="w-6 h-6" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fadeIn text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            Equipment Orientation & Protocol
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Apparatus Identification</h1>
          <p className="text-slate-600 text-sm mt-1">
            Familiarize yourself with laboratory hardware, schematic symbols, and vital connection rules before wiring.
          </p>
        </div>

        <button
          onClick={() => { sounds.playSuccess(); onNavigate('lab'); }}
          className="self-start md:self-auto px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
        >
          Enter Laboratory Workspace
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Apparatus Selection List */}
        <div className="lg:col-span-1 space-y-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block px-1">
            Select Instrument to Inspect
          </span>
          <div className="space-y-2">
            {APPARATUS_LIST.map((item) => {
              const isSelected = selectedApparatus.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sounds.playTick();
                    setSelectedApparatus(item);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center gap-3.5 ${
                    isSelected
                      ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-blue-700'}`}>
                    {getIcon(item.iconName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{item.name}</div>
                    <div className="text-[11px] font-mono text-slate-500">{item.symbol}</div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Apparatus Detailed Dossier */}
        <div className="lg:col-span-2 p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700">
                {getIcon(selectedApparatus.iconName)}
              </div>
              <div>
                <span className="text-xs font-mono text-blue-700 block uppercase tracking-wider">
                  Schematic Symbol: <span className="text-slate-900 font-bold">{selectedApparatus.symbol}</span>
                </span>
                <h2 className="text-2xl font-black text-slate-900">{selectedApparatus.name}</h2>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-mono">
              Bench Apparatus
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                Physical Purpose & Function
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {selectedApparatus.purpose}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                Correct Wiring & Connection Method
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed bg-emerald-50/50 border border-emerald-200 p-3.5 rounded-xl">
                {selectedApparatus.connectionMethod}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                Crucial Laboratory Safety / Operation Rule
              </h3>
              <p className="text-sm text-amber-900 leading-relaxed bg-amber-50/60 border border-amber-200 p-3.5 rounded-xl">
                {selectedApparatus.keyRule}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Technical Specifications
              </h3>
              <p className="text-xs font-mono text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {selectedApparatus.specs}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
