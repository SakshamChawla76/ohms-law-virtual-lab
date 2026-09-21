import React from 'react';
import { HelpCircle, X, Zap } from 'lucide-react';

export const HelpGuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn text-slate-800">
      <div className="w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl p-6 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Laboratory Guide & Wiring Instructions</h2>
              <p className="text-xs text-slate-500">Step-by-step connection blueprint for Ohm's Law experiment.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
            <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              How to Connect the Circuit
            </h3>
            <ol className="list-decimal list-inside space-y-2 font-mono text-[11px] text-slate-800">
              <li>
                <strong>Battery (+) to Switch:</strong> Click the red (+) pin on the DC Supply, then click the 'In' pin on the Key Switch.
              </li>
              <li>
                <strong>Switch to Ammeter:</strong> Click the 'Out' pin on the Switch, then click the red (+) pin on the Ammeter.
              </li>
              <li>
                <strong>Ammeter to Resistor:</strong> Click the black (-) pin on the Ammeter, then click Terminal A on the Resistor.
              </li>
              <li>
                <strong>Resistor to Battery (-):</strong> Click Terminal B on the Resistor, then click the black (-) pin on the DC Supply.
              </li>
              <li>
                <strong>Voltmeter Across Resistor:</strong> Click the red (+) pin on the Voltmeter and connect to Resistor Terminal A; connect the black (-) pin on the Voltmeter to Resistor Terminal B.
              </li>
            </ol>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h4 className="font-bold text-amber-800 text-xs">Wire Management</h4>
              <p className="text-[11px] text-slate-600">
                To remove a wire, click directly on the wire on the canvas. A "Remove Wire" action button will appear. Or click "Clear Wires" to restart wiring.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <h4 className="font-bold text-emerald-800 text-xs">Taking Observations</h4>
              <p className="text-[11px] text-slate-600">
                After closing the switch, adjust voltage to 2V, 4V, 6V, 8V, 10V. At each point, click <strong>"Record Reading"</strong> to populate your table.
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm"
          >
            Got It, Back to Lab
          </button>
        </div>
      </div>
    </div>
  );
};
