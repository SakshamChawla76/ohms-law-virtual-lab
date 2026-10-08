import React, { useEffect, useRef } from 'react';
import anime from '../../lib/anime';
import { HelpCircle, X, Zap, Sparkles } from 'lucide-react';

const springSnappy = { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 };
const springFluid = { type: 'spring', stiffness: 260, damping: 25, mass: 0.9 };

export const HelpGuideModal = ({ isOpen, onClose }) => {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const headerRef = useRef(null);
  const contentRef = useRef(null);
  const closeButtonRef = useRef(null);
  const actionButtonRef = useRef(null);

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

    if (headerRef.current) {
      anime({
        targets: headerRef.current,
        opacity: [0, 1],
        translateX: [-8, 0],
        duration: 400,
        delay: 100,
        easing: 'easeOutExpo',
      });
    }

    if (contentRef.current) {
      anime({
        targets: contentRef.current,
        opacity: [0, 1],
        translateY: [8, 0],
        duration: 400,
        delay: 200,
        easing: 'easeOutExpo',
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
      backgroundColor: animate ? 'rgba(239, 68, 68, 0.2)' : 'rgba(51, 65, 85, 0.5)',
      ...springSnappy,
    });
  };

  const handleActionButtonHover = (e, animate) => {
    anime({
      targets: e.currentTarget,
      scale: animate ? 1.05 : 1,
      ...springSnappy,
    });
  };

  const handleInfoCardHover = (e, animate) => {
    anime({
      targets: e.currentTarget,
      scale: animate ? 1.02 : 1,
      borderColor: animate ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
      ...springFluid,
    });
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn text-slate-100"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl rounded-3xl bg-slate-900/90 border border-white/10 backdrop-blur-2xl shadow-2xl p-6 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div ref={headerRef} className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Laboratory Guide & Wiring Instructions</h2>
              <p className="text-xs text-slate-400">Step-by-step connection blueprint for Ohm's Law experiment.</p>
            </div>
          </div>
          <button
            ref={el => (closeButtonRef.current = el)}
            onClick={onClose}
            onMouseEnter={(e) => handleCloseButtonHover(e, true)}
            onMouseLeave={(e) => handleCloseButtonHover(e, false)}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div ref={contentRef} className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div
            className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-3"
            onMouseEnter={(e) => handleInfoCardHover(e, true)}
            onMouseLeave={(e) => handleInfoCardHover(e, false)}
          >
            <h3 className="font-bold text-cyan-300 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Standard Series Circuit Connection Order
            </h3>
            <ol className="list-decimal list-inside space-y-2 font-mono text-[11px] text-slate-200">
              <li>
                <strong className="text-cyan-400">Battery (+) to Switch:</strong> Click the red (+) pin on the DC Supply, then click the 'In' pin on the Key Switch.
              </li>
              <li>
                <strong className="text-cyan-400">Switch to Ammeter:</strong> Click the 'Out' pin on the Switch, then click the red (+) pin on the Ammeter.
              </li>
              <li>
                <strong className="text-cyan-400">Ammeter to Resistor:</strong> Click the black (-) pin on the Ammeter, then click Terminal A on the Resistor.
              </li>
              <li>
                <strong className="text-cyan-400">Resistor to Battery (-):</strong> Click Terminal B on the Resistor, then click the black (-) pin on the DC Supply.
              </li>
              <li>
                <strong className="text-cyan-400">Voltmeter Across Resistor:</strong> Click the red (+) pin on the Voltmeter and connect to Resistor Terminal A; connect the black (-) pin on the Voltmeter to Resistor Terminal B.
              </li>
            </ol>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div
              className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 space-y-1.5"
              onMouseEnter={(e) => handleInfoCardHover(e, true)}
              onMouseLeave={(e) => handleInfoCardHover(e, false)}
            >
              <h4 className="font-bold text-amber-400 text-xs">Wire Management</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                To remove a wire, click directly on the wire on the canvas. A "Remove Wire" action button will appear. Or click "Clear Wires" to restart wiring.
              </p>
            </div>

            <div
              className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 space-y-1.5"
              onMouseEnter={(e) => handleInfoCardHover(e, true)}
              onMouseLeave={(e) => handleInfoCardHover(e, false)}
            >
              <h4 className="font-bold text-emerald-400 text-xs">Taking Observations</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                After closing the switch, adjust voltage to 2V, 4V, 6V, 8V, 10V. At each point, click <strong className="text-emerald-300">"Record Reading"</strong> to populate your table.
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 border-t border-white/10 flex justify-end">
          <button
            ref={el => (actionButtonRef.current = el)}
            onClick={onClose}
            onMouseEnter={(e) => handleActionButtonHover(e, true)}
            onMouseLeave={(e) => handleActionButtonHover(e, false)}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Got It, Back to Lab
          </button>
        </div>
      </div>
    </div>
  );
};