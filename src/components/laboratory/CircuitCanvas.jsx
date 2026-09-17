import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, 
  RotateCcw, 
  Wand2, 
  Eye, 
  EyeOff,
  BatteryCharging,
  Cpu,
  Gauge,
  Activity,
  ToggleRight,
  Move,
  Flame,
  LayoutGrid,
  FileCode2,
  Sliders
} from 'lucide-react';
import { getTerminalPositions } from '../../engine/circuitSimulator';
import { sounds } from '../../engine/audioEffects';

export const CircuitCanvas = ({
  components,
  wires,
  onAddWire,
  onRemoveWire,
  onClearWires,
  onAutoWire,
  analysis,
  isSwitchClosed,
  onToggleSwitch,
  voltage,
  resistance,
  onUpdateComponentPosition,
}) => {
  // Wire creation state
  const [activeFromTerm, setActiveFromTerm] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [snappedTermId, setSnappedTermId] = useState(null);
  const [hoveredWireId, setHoveredWireId] = useState(null);
  const [showCurrentFlow, setShowCurrentFlow] = useState(true);
  const [flowDirection, setFlowDirection] = useState('conventional');
  const [simSpeed, setSimSpeed] = useState(1.0);
  const [viewMode, setViewMode] = useState('realistic');

  // Dragging components state
  const [draggingCompId, setDraggingCompId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [particleOffset, setParticleOffset] = useState(0);

  // Compute all terminal coordinates
  const allTerminals = {};
  components.forEach(comp => {
    const terms = getTerminalPositions(comp);
    Object.entries(terms).forEach(([termId, pos]) => {
      allTerminals[termId] = { ...pos, componentId: comp.id };
    });
  });

  const getCanvasCoords = (e) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e && e.touches.length > 0 ? e.touches[0].clientY : e.clientY;
    return {
      x: Math.max(10, Math.min(rect.width - 10, clientX - rect.left)),
      y: Math.max(10, Math.min(rect.height - 10, clientY - rect.top)),
    };
  };

  const findNearestTerminal = (x, y, excludeTermId = null) => {
    let nearestId = null;
    let minDist = 34;

    Object.entries(allTerminals).forEach(([id, term]) => {
      if (excludeTermId && id === excludeTermId) return;
      const dx = term.x - x;
      const dy = term.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        nearestId = id;
      }
    });

    return nearestId;
  };

  const handlePointerMove = (e) => {
    const coords = getCanvasCoords(e);
    setMousePos(coords);

    if (draggingCompId && onUpdateComponentPosition) {
      const newX = Math.max(75, Math.min(645, coords.x - dragOffset.x));
      const newY = Math.max(65, Math.min(355, coords.y - dragOffset.y));
      onUpdateComponentPosition(draggingCompId, newX, newY);
      return;
    }

    if (activeFromTerm) {
      const snapped = findNearestTerminal(coords.x, coords.y, activeFromTerm);
      setSnappedTermId(snapped);
    }
  };

  const handleTerminalPointerDown = (termId, e) => {
    e.stopPropagation();
    setActiveFromTerm(termId);
    setSnappedTermId(null);
    sounds.playSnap();
  };

  const handleTerminalPointerUp = (termId, e) => {
    e.stopPropagation();
    if (activeFromTerm && activeFromTerm !== termId) {
      const exists = wires.some(
        w => (w.fromTerminalId === activeFromTerm && w.toTerminalId === termId) ||
             (w.fromTerminalId === termId && w.toTerminalId === activeFromTerm)
      );
      if (!exists) {
        onAddWire(activeFromTerm, termId);
        sounds.playSuccess();
      }
    }
    setActiveFromTerm(null);
    setSnappedTermId(null);
  };

  const handleCanvasPointerUp = () => {
    if (draggingCompId) {
      setDraggingCompId(null);
      sounds.playTick();
      return;
    }

    if (activeFromTerm && snappedTermId) {
      const exists = wires.some(
        w => (w.fromTerminalId === activeFromTerm && w.toTerminalId === snappedTermId) ||
             (w.fromTerminalId === snappedTermId && w.toTerminalId === activeFromTerm)
      );
      if (!exists) {
        onAddWire(activeFromTerm, snappedTermId);
        sounds.playSuccess();
      }
    }
    setActiveFromTerm(null);
    setSnappedTermId(null);
  };

  const handleStartDragComponent = (compId, compX, compY, e) => {
    e.stopPropagation();
    const coords = getCanvasCoords(e);
    setDraggingCompId(compId);
    setDragOffset({
      x: coords.x - compX,
      y: coords.y - compY,
    });
    sounds.playTick();
  };

  // Particle flow animation loop
  useEffect(() => {
    if (!analysis.isValid || !isSwitchClosed || analysis.actualCurrent <= 0 || !showCurrentFlow) {
      return;
    }

    let currentOffset = 0;
    const baseSpeed = Math.max(0.3, analysis.actualCurrent * 12) * simSpeed;

    const loop = () => {
      currentOffset = (currentOffset + (flowDirection === 'conventional' ? baseSpeed : -baseSpeed)) % 100;
      setParticleOffset(currentOffset);
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analysis.isValid, isSwitchClosed, analysis.actualCurrent, showCurrentFlow, flowDirection, simSpeed]);

  // Authentic Test Lead Cable Colors (Heavy-duty silicone insulation)
  const getWireColor = (fromId, toId) => {
    const isPos = fromId.includes('pos') || toId.includes('pos');
    const isNeg = fromId.includes('neg') || toId.includes('neg');
    if (isPos && !isNeg) return '#dc2626'; // High-visibility Laboratory Red
    if (isNeg && !isPos) return '#1e293b'; // Vulcanized Charcoal Black
    return '#0284c7'; // Deep Instrument Cobalt
  };

  return (
    <div className="w-full rounded-2xl lab-chassis p-4 space-y-3 relative select-none">
      {/* Workbench Control Console Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-chassis-border/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-amber-400 shadow-led-amber animate-pulse" />
          <div>
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-widest font-mono flex items-center gap-2">
              ESD WORKBENCH STATION
              {activeFromTerm && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono border border-amber-400/50">
                  CONNECTING: {allTerminals[activeFromTerm]?.name}
                </span>
              )}
            </h2>
            <p className="text-[10px] font-mono text-slate-400">
              Click or drag banana leads between posts. Click wire midpoint to disconnect.
            </p>
          </div>
        </div>

        {/* View Mode & Simulation Bar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Real vs Schematic */}
          <div className="flex items-center bg-chassis-dark p-0.5 rounded-lg border border-chassis-border text-xs font-mono">
            <button
              onClick={() => { sounds.playTick(); setViewMode('realistic'); }}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
                viewMode === 'realistic' ? 'bg-chassis-raised text-amber-300 font-bold border border-chassis-border shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Realistic</span>
            </button>
            <button
              onClick={() => { sounds.playTick(); setViewMode('schematic'); }}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
                viewMode === 'schematic' ? 'bg-chassis-raised text-amber-300 font-bold border border-chassis-border shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode2 className="w-3 h-3" />
              <span>IEEE Schematic</span>
            </button>
          </div>

          {/* Charge Carriers Toggle */}
          <button
            onClick={() => setShowCurrentFlow(!showCurrentFlow)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all flex items-center gap-1.5 ${
              showCurrentFlow 
                ? 'bg-chassis-raised text-cyan-300 border-cyan-500/40' 
                : 'bg-chassis-dark text-slate-400 border-chassis-border'
            }`}
            title="Toggle charge particle visualization"
          >
            {showCurrentFlow ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Charges</span>
          </button>

          {/* Speed */}
          <div className="hidden sm:flex items-center bg-chassis-dark p-0.5 rounded-lg border border-chassis-border text-xs font-mono">
            {[0.25, 1.0, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => { sounds.playTick(); setSimSpeed(s); }}
                className={`px-2 py-0.5 rounded transition-all ${
                  simSpeed === s ? 'bg-chassis-raised text-amber-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s === 0.25 ? '0.25x' : `${s}x`}
              </button>
            ))}
          </div>

          {/* Auto-Wire Button */}
          <button
            onClick={() => { sounds.playSuccess(); onAutoWire(); }}
            className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/50 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm active:translate-y-0.5"
            title="Automatically assemble standard Ohm's Law circuit"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Auto-Wire Demo</span>
          </button>

          {/* Clear Wires Button */}
          <button
            onClick={() => { sounds.playSnap(); onClearWires(); }}
            className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 text-xs font-mono flex items-center gap-1.5 transition-all active:translate-y-0.5"
            title="Remove all wires from the canvas"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Wires</span>
          </button>
        </div>
      </div>

      {/* Main Authentic ESD Workbench Surface */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handleCanvasPointerUp}
        className="relative w-full h-[430px] rounded-xl bg-esd-bench border-2 border-[#1f2638] shadow-inner overflow-hidden cursor-default"
      >
        {/* Top & Left Millimeter Rulers */}
        <div className="absolute top-0 left-0 right-0 h-3 ruler-border-h opacity-40 pointer-events-none" />
        <div className="absolute top-0 left-0 bottom-0 w-3 ruler-border-v opacity-40 pointer-events-none" />

        {/* Workbench Technical Badges */}
        <div className="absolute top-4 left-5 text-[9px] font-mono text-slate-500 pointer-events-none select-none flex items-center gap-4">
          <span>ZONE 1: ISOLATED DC APPARATUS DECK</span>
          {analysis.powerWatts > 0 && (
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Flame className="w-3 h-3" />
              HEAT DISSIPATION: {analysis.powerWatts.toFixed(3)} W (P = V·I)
            </span>
          )}
        </div>

        {/* Chassis Components */}
        {components.map(comp => (
          <div
            key={comp.id}
            style={{
              left: `${comp.x}px`,
              top: `${comp.y}px`,
              transform: 'translate(-50%, -50%)',
            }}
            className="absolute z-10 select-none group"
          >
            {/* Component Repositioning Handle */}
            <div 
              onPointerDown={(e) => handleStartDragComponent(comp.id, comp.x, comp.y, e)}
              className="absolute -top-5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-chassis-dark/90 border border-chassis-border text-[8px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 cursor-grab active:cursor-grabbing whitespace-nowrap shadow-md z-30"
            >
              <Move className="w-2.5 h-2.5" />
              <span>Drag Chassis</span>
            </div>

            {/* Realistic Laboratory Instrument Enclosure */}
            {viewMode === 'realistic' ? (
              <>
                {/* 1. Battery / DC Supply Module */}
                {comp.type === 'battery' && (
                  <div className="w-36 h-28 rounded-xl lab-chassis p-2.5 flex flex-col justify-between items-center text-center relative shadow-chassis-raised">
                    <div className="flex items-center justify-between w-full px-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 font-mono">
                        <BatteryCharging className="w-3 h-3" />
                        <span>DC SOURCE</span>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-led-emerald" />
                    </div>
                    <div className="font-digital text-2xl font-bold glow-amber-text tracking-widest bg-[#090b10] w-full py-1 rounded border border-slate-800">
                      {voltage.toFixed(1)} <span className="text-xs text-amber-500 font-sans">V</span>
                    </div>
                    <div className="w-full flex justify-between px-1 text-[9px] font-mono border-t border-chassis-border/80 pt-1">
                      <span className="text-rose-400 font-bold">+ POS</span>
                      <span className="text-slate-300 font-bold">- NEG</span>
                    </div>
                  </div>
                )}

                {/* 2. Switch Module */}
                {comp.type === 'switch' && (
                  <div 
                    onClick={(e) => { e.stopPropagation(); onToggleSwitch(); }}
                    className={`w-36 h-24 rounded-xl lab-chassis p-2 flex flex-col justify-between items-center text-center cursor-pointer transition-all shadow-chassis-raised ${
                      isSwitchClosed ? 'border-emerald-500/60' : 'hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full px-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 font-mono">
                        <ToggleRight className="w-3 h-3" />
                        <span>KNIFE SWITCH</span>
                      </div>
                      <span className={`w-1.5 h-1.5 rounded-full ${isSwitchClosed ? 'bg-emerald-400 shadow-led-emerald' : 'bg-slate-600'}`} />
                    </div>
                    <div className="relative w-24 h-7 flex items-center justify-between px-2 bg-slate-950/70 rounded border border-slate-800">
                      <div className="w-3 h-4 bg-amber-600 rounded-sm border border-amber-400" />
                      <div 
                        className="absolute left-4 w-18 h-1.5 bg-gradient-to-r from-amber-400 to-amber-300 origin-left transition-transform duration-200 rounded shadow-md z-10"
                        style={{ transform: isSwitchClosed ? 'rotate(0deg)' : 'rotate(-28deg)' }}
                      >
                        <div className="absolute right-0 -top-1 w-3.5 h-3.5 rounded-full bg-rose-700 border border-rose-400" />
                      </div>
                      <div className="w-3 h-4 bg-amber-600 rounded-sm border border-amber-400" />
                    </div>
                    <div className={`text-[9px] font-mono font-bold ${isSwitchClosed ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {isSwitchClosed ? 'CLOSED (ACTIVE)' : 'OPEN (OFF)'}
                    </div>
                  </div>
                )}

                {/* 3. Ammeter Module */}
                {comp.type === 'ammeter' && (
                  <div className="w-36 h-26 rounded-xl lab-chassis p-2.5 flex flex-col justify-between items-center text-center shadow-chassis-raised">
                    <div className="flex items-center justify-between w-full px-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-400 font-mono">
                        <Gauge className="w-3 h-3" />
                        <span>AMMETER (A)</span>
                      </div>
                      <span className="text-[8px] font-mono px-1 rounded bg-amber-500/20 text-amber-300">SERIES</span>
                    </div>
                    <div className="font-digital text-xl font-bold glow-amber-text tracking-wider bg-[#090b10] w-full py-1 rounded border border-slate-800">
                      {analysis.measuredCurrent.toFixed(3)} <span className="text-xs text-amber-500 font-sans">A</span>
                    </div>
                    <div className="w-full flex justify-between px-2 text-[9px] font-mono border-t border-chassis-border/80 pt-1">
                      <span className="text-rose-400 font-bold">+ (RED)</span>
                      <span className="text-slate-300 font-bold">- (BLK)</span>
                    </div>
                  </div>
                )}

                {/* 4. Resistor Module */}
                {comp.type === 'resistor' && (
                  <div className={`w-40 h-24 rounded-xl lab-chassis p-2 flex flex-col justify-between items-center text-center transition-all shadow-chassis-raised ${
                    analysis.powerWatts > 0.4 ? 'border-amber-500/60' : ''
                  }`}>
                    <div className="flex items-center justify-between w-full px-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 font-mono">
                        <Cpu className="w-3 h-3" />
                        <span>RESISTOR (R)</span>
                      </div>
                      {analysis.powerWatts > 0 && (
                        <span className="text-[8px] font-mono text-amber-300 flex items-center font-bold">
                          <Flame className="w-2.5 h-2.5 mr-0.5" />
                          {analysis.powerWatts.toFixed(2)}W
                        </span>
                      )}
                    </div>
                    <div className="w-30 h-6 bg-slate-200 rounded border border-slate-400 flex items-center justify-around px-2 shadow-inner relative overflow-hidden">
                      {analysis.powerWatts > 0.2 && (
                        <div 
                          className="absolute inset-0 bg-red-500/20 animate-pulse pointer-events-none"
                          style={{ opacity: Math.min(1, analysis.powerWatts / 1.5) }}
                        />
                      )}
                      <div className="w-2 h-full bg-amber-700" />
                      <div className="w-2 h-full bg-black" />
                      <div className="w-2 h-full bg-amber-700" />
                      <div className="w-2 h-full bg-yellow-500" />
                    </div>
                    <div className="font-mono text-[11px] font-bold text-cyan-300">
                      R = {resistance} Ω (±5%)
                    </div>
                  </div>
                )}

                {/* 5. Voltmeter Module */}
                {comp.type === 'voltmeter' && (
                  <div className="w-36 h-26 rounded-xl lab-chassis p-2.5 flex flex-col justify-between items-center text-center shadow-chassis-raised">
                    <div className="flex items-center justify-between w-full px-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 font-mono">
                        <Activity className="w-3 h-3" />
                        <span>VOLTMETER (V)</span>
                      </div>
                      <span className="text-[8px] font-mono px-1 rounded bg-cyan-500/20 text-cyan-300">PARALLEL</span>
                    </div>
                    <div className="font-digital text-xl font-bold glow-emerald-text tracking-wider bg-[#090b10] w-full py-1 rounded border border-slate-800">
                      {analysis.measuredVoltage.toFixed(2)} <span className="text-xs text-emerald-500 font-sans">V</span>
                    </div>
                    <div className="w-full flex justify-between px-2 text-[9px] font-mono border-t border-chassis-border/80 pt-1">
                      <span className="text-rose-400 font-bold">+ (RED)</span>
                      <span className="text-slate-300 font-bold">- (BLK)</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* IEEE Schematic Diagram View */
              <div className="w-36 h-24 rounded-xl lab-chassis p-2 flex flex-col items-center justify-between border-2 border-amber-500/30 shadow-md">
                <div className="text-[9px] font-mono text-amber-300 font-bold uppercase">
                  {comp.label}
                </div>

                {comp.type === 'battery' && (
                  <div className="flex items-center justify-center gap-1.5 py-1">
                    <div className="text-[9px] font-mono text-rose-400 font-bold">+</div>
                    <div className="w-1 h-7 bg-amber-400 rounded-sm" />
                    <div className="w-1.5 h-3.5 bg-slate-400 rounded-sm" />
                    <div className="w-1 h-7 bg-amber-400 rounded-sm" />
                    <div className="w-1.5 h-3.5 bg-slate-400 rounded-sm" />
                    <div className="text-[9px] font-mono text-slate-300 font-bold">-</div>
                  </div>
                )}

                {comp.type === 'switch' && (
                  <div 
                    onClick={(e) => { e.stopPropagation(); onToggleSwitch(); }}
                    className="flex items-center justify-center gap-1 py-2 cursor-pointer"
                  >
                    <div className="w-2 h-2 rounded-full border-2 border-white" />
                    <div 
                      className="w-10 h-0.5 bg-amber-400 origin-left transition-transform duration-200"
                      style={{ transform: isSwitchClosed ? 'rotate(0deg)' : 'rotate(-28deg)' }}
                    />
                    <div className="w-2 h-2 rounded-full border-2 border-white" />
                  </div>
                )}

                {comp.type === 'resistor' && (
                  <div className="py-2 flex items-center justify-center">
                    <svg width="70" height="20" viewBox="0 0 70 20">
                      <path
                        d="M 5 10 L 15 10 L 20 2 L 30 18 L 40 2 L 50 18 L 55 10 L 65 10"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}

                {comp.type === 'ammeter' && (
                  <div className="w-9 h-9 rounded-full border-2 border-amber-400 flex items-center justify-center font-mono font-black text-amber-300 text-xs">
                    A
                  </div>
                )}

                {comp.type === 'voltmeter' && (
                  <div className="w-9 h-9 rounded-full border-2 border-cyan-400 flex items-center justify-center font-mono font-black text-cyan-300 text-xs">
                    V
                  </div>
                )}

                <div className="text-[9px] font-mono text-slate-400">
                  {comp.type === 'battery' && `${voltage.toFixed(1)}V`}
                  {comp.type === 'switch' && (isSwitchClosed ? 'Closed' : 'Open')}
                  {comp.type === 'resistor' && `${resistance} Ω`}
                  {comp.type === 'ammeter' && `${analysis.measuredCurrent.toFixed(3)} A`}
                  {comp.type === 'voltmeter' && `${analysis.measuredVoltage.toFixed(2)} V`}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* SVG Heavy-Duty Silicone Banana Lead Cables */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
          {wires.map(w => {
            const p1 = allTerminals[w.fromTerminalId];
            const p2 = allTerminals[w.toTerminalId];
            if (!p1 || !p2) return null;

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const sag = Math.min(dist * 0.2, 42);
            const cx1 = p1.x + dx * 0.3;
            const cy1 = p1.y + dy * 0.3 + sag;
            const cx2 = p1.x + dx * 0.7;
            const cy2 = p1.y + dy * 0.7 + sag;
            const pathData = `M ${p1.x} ${p1.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p2.x} ${p2.y}`;

            const isHovered = hoveredWireId === w.id;
            const wireColor = w.color || getWireColor(w.fromTerminalId, w.toTerminalId);
            const isCurrentActive = analysis.isValid && isSwitchClosed && analysis.actualCurrent > 0;

            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2 + sag * 0.75;

            return (
              <g 
                key={w.id} 
                className="pointer-events-auto cursor-pointer group"
                onMouseEnter={() => setHoveredWireId(w.id)}
                onMouseLeave={() => setHoveredWireId(null)}
              >
                {/* Generous Hitbox */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="24"
                  onClick={() => {
                    onRemoveWire(w.id);
                    sounds.playSnap();
                  }}
                />

                {/* Cable Cast Shadow on ESD Mat */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="rgba(0,0,0,0.55)"
                  strokeWidth="6.5"
                  strokeLinecap="round"
                  transform="translate(0, 4.5)"
                />

                {/* Thick Matte Silicone Lead Insulation */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isHovered ? '#f43f5e' : wireColor}
                  strokeWidth={isHovered ? '6' : '5'}
                  strokeLinecap="round"
                />

                {/* Specular Highlight Sheen along top of cable */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Subtle Moving Electron Charge Packets */}
                {isCurrentActive && showCurrentFlow && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeDasharray="3 26"
                    strokeDashoffset={-particleOffset * 2}
                  />
                )}

                {/* Midpoint Delete Scissor Button */}
                {isHovered && (
                  <g 
                    transform={`translate(${midX}, ${midY})`} 
                    onClick={() => {
                      onRemoveWire(w.id);
                      sounds.playSnap();
                    }}
                    className="cursor-pointer"
                  >
                    <circle r="11" fill="#dc2626" stroke="#ffffff" strokeWidth="1.5" />
                    <text x="0" y="3.5" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                      ✕
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Active Banana Lead Under Drag */}
          {activeFromTerm && allTerminals[activeFromTerm] && (
            <g>
              {(() => {
                const p1 = allTerminals[activeFromTerm];
                const targetPos = snappedTermId && allTerminals[snappedTermId] 
                  ? allTerminals[snappedTermId] 
                  : mousePos;
                const dx = targetPos.x - p1.x;
                const dy = targetPos.y - p1.y;
                const sag = 20;
                const pathData = `M ${p1.x} ${p1.y} Q ${p1.x + dx / 2} ${p1.y + dy / 2 + sag}, ${targetPos.x} ${targetPos.y}`;

                return (
                  <>
                    <path
                      d={pathData}
                      fill="none"
                      stroke="rgba(245, 158, 11, 0.3)"
                      strokeWidth="7"
                      strokeLinecap="round"
                    />
                    <path
                      d={pathData}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="5 4"
                      className="animate-pulse"
                    />
                    {/* Banana Plug Probe Tip */}
                    <circle
                      cx={targetPos.x}
                      cy={targetPos.y}
                      r={snappedTermId ? '9' : '5'}
                      fill={snappedTermId ? '#10b981' : '#f59e0b'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </>
                );
              })()}
            </g>
          )}
        </svg>

        {/* 5-Way Brass / Bakelite Binding Posts Layer */}
        {Object.entries(allTerminals).map(([termId, pos]) => {
          const isFrom = activeFromTerm === termId;
          const isSnapped = snappedTermId === termId;
          const isPos = pos.polarity === 'pos';
          const isNeg = pos.polarity === 'neg';
          const isTargetAvailable = activeFromTerm !== null && activeFromTerm !== termId;

          return (
            <div
              key={termId}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute z-30 flex items-center justify-center select-none"
            >
              {isTargetAvailable && (
                <div className="absolute w-8 h-8 rounded-full bg-amber-400/20 animate-ping pointer-events-none" />
              )}

              {/* Machined 5-Way Binding Post */}
              <button
                onPointerDown={(e) => handleTerminalPointerDown(termId, e)}
                onPointerUp={(e) => handleTerminalPointerUp(termId, e)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!activeFromTerm) {
                    setActiveFromTerm(termId);
                    sounds.playSnap();
                  } else if (activeFromTerm !== termId) {
                    const exists = wires.some(
                      w => (w.fromTerminalId === activeFromTerm && w.toTerminalId === termId) ||
                           (w.fromTerminalId === termId && w.toTerminalId === activeFromTerm)
                    );
                    if (!exists) {
                      onAddWire(activeFromTerm, termId);
                      sounds.playSuccess();
                    }
                    setActiveFromTerm(null);
                    setSnappedTermId(null);
                  }
                }}
                className={`w-6 h-6 rounded-full transition-all duration-150 flex items-center justify-center cursor-pointer shadow-md group relative ${
                  isFrom
                    ? 'ring-4 ring-amber-400 scale-125'
                    : isSnapped
                      ? 'ring-4 ring-emerald-400 scale-130'
                      : isPos
                        ? 'bg-gradient-to-br from-rose-500 via-rose-600 to-rose-800 hover:scale-120'
                        : isNeg
                          ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 hover:scale-120'
                          : 'bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 hover:scale-120'
                } border-2 border-slate-900`}
                title={`${pos.name} • Click to connect test lead`}
              >
                {/* Central 4mm Banana Jack Aperture */}
                <div className="w-2 h-2 rounded-full bg-slate-950 border border-amber-400/60 flex items-center justify-center">
                  <div className="w-0.5 h-0.5 rounded-full bg-black" />
                </div>

                {/* Floating Nomenclature Badge */}
                <span className="absolute bottom-7 px-2 py-0.5 rounded bg-chassis-dark/95 text-[9px] font-mono text-slate-200 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-chassis-border shadow-lg z-50">
                  {pos.name}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
