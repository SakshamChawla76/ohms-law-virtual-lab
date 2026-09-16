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
  FileCode2
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
  const [simSpeed, setSimSpeed] = useState(1.0); // 0.25x, 1.0x, 2.0x
  const [viewMode, setViewMode] = useState('realistic');

  // Dragging components state
  const [draggingCompId, setDraggingCompId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [particleOffset, setParticleOffset] = useState(0);

  // Compute all terminal coordinates (absolute inside container)
  const allTerminals = {};
  components.forEach(comp => {
    const terms = getTerminalPositions(comp);
    Object.entries(terms).forEach(([termId, pos]) => {
      allTerminals[termId] = { ...pos, componentId: comp.id };
    });
  });

  // Calculate mouse position relative to canvas
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

  // Find nearest terminal for magnetic snapping
  const findNearestTerminal = (x, y, excludeTermId = null) => {
    let nearestId = null;
    let minDist = 32; // 32px magnetic radius

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

  // Mouse move handler
  const handlePointerMove = (e) => {
    const coords = getCanvasCoords(e);
    setMousePos(coords);

    // Handle dragging component
    if (draggingCompId && onUpdateComponentPosition) {
      const newX = Math.max(70, Math.min(650, coords.x - dragOffset.x));
      const newY = Math.max(60, Math.min(360, coords.y - dragOffset.y));
      onUpdateComponentPosition(draggingCompId, newX, newY);
      return;
    }

    // Handle wire dragging magnetic snap
    if (activeFromTerm) {
      const snapped = findNearestTerminal(coords.x, coords.y, activeFromTerm);
      setSnappedTermId(snapped);
    }
  };

  // Start wire creation
  const handleTerminalPointerDown = (termId, e) => {
    e.stopPropagation();
    setActiveFromTerm(termId);
    setSnappedTermId(null);
    sounds.playSnap();
  };

  // Finish wire creation
  const handleTerminalPointerUp = (termId, e) => {
    e.stopPropagation();
    if (activeFromTerm && activeFromTerm !== termId) {
      // Connect!
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

  // Cancel wire on background click
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

  // Start dragging component
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
    const baseSpeed = Math.max(0.4, analysis.actualCurrent * 14) * simSpeed;

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

  // Sensible default wire colors
  const getWireColor = (fromId, toId) => {
    const isPos = fromId.includes('pos') || toId.includes('pos');
    const isNeg = fromId.includes('neg') || toId.includes('neg');
    if (isPos && !isNeg) return '#ef4444'; // Red for Positive
    if (isNeg && !isPos) return '#1e293b'; // Black / Dark Slate for Return
    return '#00f2fe'; // Neon Cyan for Sensor / Parallel leads
  };

  return (
    <div className="w-full rounded-3xl glass-panel border border-white/10 p-5 space-y-4 shadow-2xl relative select-none">
      {/* Canvas Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400 shadow-glow-cyan">
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              Virtual Laboratory Workbench
              {activeFromTerm && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-400 animate-pulse">
                  Connecting: {allTerminals[activeFromTerm]?.name}
                </span>
              )}
            </h2>
            <p className="text-[11px] text-slate-400">
              Click or drag between binding posts to connect. Click wire to disconnect. Drag components to rearrange.
            </p>
          </div>
        </div>

        {/* View Mode & Simulation Controls (CK-12 Signature Feature) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Realistic vs Schematic View Switcher */}
          <div className="flex items-center bg-slate-900/80 p-0.5 rounded-lg border border-white/10 text-xs font-mono">
            <button
              onClick={() => { sounds.playTick(); setViewMode('realistic'); }}
              className={`px-2 py-1 rounded flex items-center gap-1 transition-all ${
                viewMode === 'realistic' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="View realistic laboratory apparatus"
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Real</span>
            </button>
            <button
              onClick={() => { sounds.playTick(); setViewMode('schematic'); }}
              className={`px-2 py-1 rounded flex items-center gap-1 transition-all ${
                viewMode === 'schematic' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="View standard electrical engineering circuit schematic (IEEE)"
            >
              <FileCode2 className="w-3 h-3" />
              <span>Schematic</span>
            </button>
          </div>

          {/* Simulation Speed Switcher (CK-12 Slow Motion feature) */}
          <div className="hidden sm:flex items-center bg-slate-900/80 p-0.5 rounded-lg border border-white/10 text-xs font-mono">
            {[0.25, 1.0, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => { sounds.playTick(); setSimSpeed(s); }}
                className={`px-2 py-1 rounded transition-all ${
                  simSpeed === s ? 'bg-slate-700 text-cyan-300 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title={`Simulation Speed ${s}x`}
              >
                {s === 0.25 ? '0.25x Slow' : `${s}x`}
              </button>
            ))}
          </div>

          {/* Charge Flow Toggle */}
          <button
            onClick={() => setShowCurrentFlow(!showCurrentFlow)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono border transition-all flex items-center gap-1.5 ${
              showCurrentFlow 
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-glow-cyan' 
                : 'bg-slate-800 text-slate-400 border-white/10'
            }`}
            title="Toggle animated charge carrier particles"
          >
            {showCurrentFlow ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>Charges</span>
          </button>

          {showCurrentFlow && (
            <button
              onClick={() => setFlowDirection(d => d === 'conventional' ? 'electron' : 'conventional')}
              className="px-2 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10 text-[11px] font-mono transition-all"
              title="Toggle between Conventional Current (+ to -) and Electron Drift (- to +)"
            >
              {flowDirection === 'conventional' ? 'I: (+ → -)' : 'e⁻: (- → +)'}
            </button>
          )}

          {/* Auto-Wire Button */}
          <button
            onClick={() => { sounds.playSuccess(); onAutoWire(); }}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/30 to-teal-500/20 hover:from-emerald-500/40 hover:to-teal-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm transition-all"
            title="Automatically assemble the standard correct Ohm's Law circuit"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Auto-Wire Demo</span>
          </button>

          {/* Clear Wires Button */}
          <button
            onClick={() => { sounds.playSnap(); onClearWires(); }}
            className="px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-mono flex items-center gap-1.5 transition-all"
            title="Remove all wires from the canvas"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Wires</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Circuit Workbench */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handleCanvasPointerUp}
        className="relative w-full h-[430px] rounded-2xl bg-[#080d18] border-2 border-slate-800 bg-lab-grid shadow-inner overflow-hidden cursor-default"
      >
        {/* Subtle workbench grid rulers */}
        <div className="absolute top-2 left-3 text-[10px] font-mono text-slate-600 pointer-events-none select-none flex items-center gap-3">
          <span>BENCH AREA: 720 × 430 mm • SAFETY RATED 25V DC</span>
          {analysis.powerWatts > 0 && (
            <span className="text-amber-400 flex items-center gap-1">
              <Flame className="w-3 h-3" />
              Power Dissipated: {analysis.powerWatts.toFixed(3)} W (P = V·I)
            </span>
          )}
        </div>

        {/* Render Components */}
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
            {/* Component Header / Drag Handle */}
            <div 
              onPointerDown={(e) => handleStartDragComponent(comp.id, comp.x, comp.y, e)}
              className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-900/90 border border-white/10 text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 cursor-grab active:cursor-grabbing whitespace-nowrap shadow-md z-30"
              title="Drag to reposition component"
            >
              <Move className="w-2.5 h-2.5" />
              <span>Drag</span>
            </div>

            {/* Realistic View vs Schematic View Mode Rendering */}
            {viewMode === 'realistic' ? (
              <>
                {/* 1. Battery / DC Power Supply (Realistic) */}
                {comp.type === 'battery' && (
                  <div className="w-36 h-28 rounded-2xl bg-gradient-to-b from-slate-800 to-[#0c1424] border-2 border-slate-700 shadow-2xl p-3 flex flex-col justify-between items-center text-center relative">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 font-mono">
                      <BatteryCharging className="w-3.5 h-3.5" />
                      <span>DC SUPPLY</span>
                    </div>
                    <div className="font-mono text-2xl font-black text-emerald-400 tracking-wider">
                      {voltage.toFixed(1)} <span className="text-xs font-semibold text-emerald-500">V</span>
                    </div>
                    <div className="w-full flex justify-between px-1 text-[9px] font-mono text-slate-400 border-t border-white/5 pt-1">
                      <span className="text-rose-400 font-bold">+ Pos</span>
                      <span className="text-slate-300 font-bold">- Neg</span>
                    </div>
                  </div>
                )}

                {/* 2. Switch (Realistic) */}
                {comp.type === 'switch' && (
                  <div 
                    onClick={(e) => { e.stopPropagation(); onToggleSwitch(); }}
                    className={`w-36 h-24 rounded-2xl bg-gradient-to-b from-slate-800 to-[#0c1424] border-2 shadow-2xl p-2.5 flex flex-col justify-between items-center text-center cursor-pointer transition-all ${
                      isSwitchClosed ? 'border-emerald-500/60 shadow-glow-emerald' : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-300 font-mono">
                      <ToggleRight className="w-3.5 h-3.5" />
                      <span>KNIFE SWITCH</span>
                    </div>
                    <div className="relative w-24 h-7 flex items-center justify-between px-2">
                      <div className="w-3 h-4 bg-amber-600 rounded border border-amber-400 shadow-sm" />
                      <div 
                        className="absolute left-4 w-18 h-1.5 bg-gradient-to-r from-amber-400 to-amber-300 origin-left transition-transform duration-200 rounded shadow-md z-10"
                        style={{ transform: isSwitchClosed ? 'rotate(0deg)' : 'rotate(-30deg)' }}
                      >
                        <div className="absolute right-0 -top-1.5 w-4 h-4 rounded-full bg-rose-600 border border-rose-300 shadow-sm" />
                      </div>
                      <div className="w-3 h-4 bg-amber-600 rounded border border-amber-400 shadow-sm" />
                    </div>
                    <div className={`text-[10px] font-mono font-bold ${isSwitchClosed ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {isSwitchClosed ? 'CLOSED (ON)' : 'OPEN (OFF)'}
                    </div>
                  </div>
                )}

                {/* 3. Ammeter (Realistic) */}
                {comp.type === 'ammeter' && (
                  <div className="w-34 h-26 rounded-2xl bg-gradient-to-b from-slate-800 to-[#0c1424] border-2 border-slate-700 shadow-2xl p-2.5 flex flex-col justify-between items-center text-center">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 font-mono">
                      <Gauge className="w-3.5 h-3.5" />
                      <span>AMMETER (A)</span>
                    </div>
                    <div className="font-mono text-xl font-bold text-amber-400 tracking-wider">
                      {analysis.measuredCurrent.toFixed(3)} <span className="text-xs">A</span>
                    </div>
                    <div className="w-full flex justify-between px-2 text-[9px] font-mono border-t border-white/5 pt-1">
                      <span className="text-rose-400 font-bold">+ (Red)</span>
                      <span className="text-slate-300 font-bold">- (Blk)</span>
                    </div>
                  </div>
                )}

                {/* 4. Resistor (Realistic with thermal Joule heating indicator) */}
                {comp.type === 'resistor' && (
                  <div className={`w-40 h-24 rounded-2xl bg-gradient-to-b from-slate-800 to-[#0c1424] border-2 shadow-2xl p-2.5 flex flex-col justify-between items-center text-center transition-all ${
                    analysis.powerWatts > 0.4 ? 'border-amber-500/60 shadow-glow-amber' : 'border-slate-700'
                  }`}>
                    <div className="flex items-center justify-between w-full px-1">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-sky-400 font-mono">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>RESISTOR (R)</span>
                      </div>
                      {analysis.powerWatts > 0 && (
                        <span className="text-[9px] font-mono text-amber-300 flex items-center">
                          <Flame className="w-2.5 h-2.5 mr-0.5" />
                          {analysis.powerWatts.toFixed(2)}W
                        </span>
                      )}
                    </div>
                    <div className="w-28 h-5 bg-amber-100 rounded-full border-2 border-amber-300 flex items-center justify-around px-2 shadow-inner relative overflow-hidden">
                      {/* Thermal heating glow overlay if power is high */}
                      {analysis.powerWatts > 0.2 && (
                        <div 
                          className="absolute inset-0 bg-red-500/30 animate-pulse pointer-events-none"
                          style={{ opacity: Math.min(1, analysis.powerWatts / 1.5) }}
                        />
                      )}
                      <div className="w-2 h-full bg-green-700" />
                      <div className="w-2 h-full bg-black" />
                      <div className="w-2 h-full bg-black" />
                      <div className="w-2 h-full bg-yellow-600" />
                    </div>
                    <div className="font-mono text-xs font-bold text-sky-300">
                      R = {resistance} Ω (±5%)
                    </div>
                  </div>
                )}

                {/* 5. Voltmeter (Realistic) */}
                {comp.type === 'voltmeter' && (
                  <div className="w-34 h-26 rounded-2xl bg-gradient-to-b from-slate-800 to-[#0c1424] border-2 border-slate-700 shadow-2xl p-2.5 flex flex-col justify-between items-center text-center">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 font-mono">
                      <Activity className="w-3.5 h-3.5" />
                      <span>VOLTMETER (V)</span>
                    </div>
                    <div className="font-mono text-xl font-bold text-cyan-400 tracking-wider">
                      {analysis.measuredVoltage.toFixed(2)} <span className="text-xs">V</span>
                    </div>
                    <div className="w-full flex justify-between px-2 text-[9px] font-mono border-t border-white/5 pt-1">
                      <span className="text-rose-400 font-bold">+ (Red)</span>
                      <span className="text-slate-300 font-bold">- (Blk)</span>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Schematic IEEE Diagram View (CK-12 Signature View) */
              <div className="w-36 h-24 rounded-2xl bg-slate-950/90 border-2 border-cyan-500/40 p-2 flex flex-col items-center justify-between shadow-xl">
                <div className="text-[10px] font-mono text-cyan-300 font-bold uppercase">
                  {comp.label}
                </div>

                {/* Schematic Symbols */}
                {comp.type === 'battery' && (
                  <div className="flex items-center justify-center gap-1.5 py-1">
                    <div className="text-[9px] font-mono text-rose-400 font-bold">+</div>
                    <div className="w-1 h-8 bg-cyan-400 rounded-sm" />
                    <div className="w-1.5 h-4 bg-slate-400 rounded-sm" />
                    <div className="w-1 h-8 bg-cyan-400 rounded-sm" />
                    <div className="w-1.5 h-4 bg-slate-400 rounded-sm" />
                    <div className="text-[9px] font-mono text-slate-300 font-bold">-</div>
                  </div>
                )}

                {comp.type === 'switch' && (
                  <div 
                    onClick={(e) => { e.stopPropagation(); onToggleSwitch(); }}
                    className="flex items-center justify-center gap-1 py-2 cursor-pointer"
                  >
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-white" />
                    <div 
                      className="w-10 h-0.5 bg-amber-400 origin-left transition-transform duration-200"
                      style={{ transform: isSwitchClosed ? 'rotate(0deg)' : 'rotate(-28deg)' }}
                    />
                    <div className="w-2.5 h-2.5 rounded-full border-2 border-white" />
                  </div>
                )}

                {comp.type === 'resistor' && (
                  <div className="py-2 flex items-center justify-center">
                    <svg width="70" height="20" viewBox="0 0 70 20">
                      <path
                        d="M 5 10 L 15 10 L 20 2 L 30 18 L 40 2 L 50 18 L 55 10 L 65 10"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}

                {comp.type === 'ammeter' && (
                  <div className="w-10 h-10 rounded-full border-2 border-amber-400 flex items-center justify-center font-mono font-black text-amber-300 text-sm">
                    A
                  </div>
                )}

                {comp.type === 'voltmeter' && (
                  <div className="w-10 h-10 rounded-full border-2 border-cyan-400 flex items-center justify-center font-mono font-black text-cyan-300 text-sm">
                    V
                  </div>
                )}

                <div className="text-[9px] font-mono text-slate-400">
                  {comp.type === 'battery' && `${voltage.toFixed(1)}V DC`}
                  {comp.type === 'switch' && (isSwitchClosed ? 'Closed' : 'Open')}
                  {comp.type === 'resistor' && `${resistance} Ω`}
                  {comp.type === 'ammeter' && `${analysis.measuredCurrent.toFixed(3)} A`}
                  {comp.type === 'voltmeter' && `${analysis.measuredVoltage.toFixed(2)} V`}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* SVG Wire Layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
          <defs>
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#00f2fe" />
            </filter>
          </defs>

          {/* Render Completed Wires */}
          {wires.map(w => {
            const p1 = allTerminals[w.fromTerminalId];
            const p2 = allTerminals[w.toTerminalId];
            if (!p1 || !p2) return null;

            // Compute curved bezier path (realistic cable drape)
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const sag = Math.min(dist * 0.22, 45);
            const cx1 = p1.x + dx * 0.3;
            const cy1 = p1.y + dy * 0.3 + sag;
            const cx2 = p1.x + dx * 0.7;
            const cy2 = p1.y + dy * 0.7 + sag;
            const pathData = `M ${p1.x} ${p1.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p2.x} ${p2.y}`;

            const isHovered = hoveredWireId === w.id;
            const wireColor = w.color || getWireColor(w.fromTerminalId, w.toTerminalId);
            const isCurrentActive = analysis.isValid && isSwitchClosed && analysis.actualCurrent > 0;

            // Midpoint coordinates for scissors delete button
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2 + sag * 0.75;

            return (
              <g 
                key={w.id} 
                className="pointer-events-auto cursor-pointer group"
                onMouseEnter={() => setHoveredWireId(w.id)}
                onMouseLeave={() => setHoveredWireId(null)}
              >
                {/* Invisible wide hitbox for effortless hovering and clicking */}
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

                {/* Cable Drop Shadow */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="rgba(0,0,0,0.6)"
                  strokeWidth="7"
                  strokeLinecap="round"
                  transform="translate(0, 4)"
                />

                {/* Outer Insulated Rubber Cable */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isHovered ? '#f43f5e' : wireColor}
                  strokeWidth={isHovered ? '6' : '4.5'}
                  strokeLinecap="round"
                  filter={isCurrentActive ? 'url(#neon-glow)' : undefined}
                />

                {/* Inner Highlight Reflection */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />

                {/* Animated Luminous Charge Packets */}
                {isCurrentActive && showCurrentFlow && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray="4 24"
                    strokeDashoffset={-particleOffset * 2}
                  />
                )}

                {/* Midpoint scissors / delete badge */}
                {isHovered && (
                  <g 
                    transform={`translate(${midX}, ${midY})`} 
                    onClick={() => {
                      onRemoveWire(w.id);
                      sounds.playSnap();
                    }}
                    className="cursor-pointer"
                  >
                    <circle r="12" fill="#e11d48" stroke="#ffffff" strokeWidth="1.5" />
                    <text x="0" y="4" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
                      ✕
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Render Active Wire in Progress (tracking cursor) */}
          {activeFromTerm && allTerminals[activeFromTerm] && (
            <g>
              {(() => {
                const p1 = allTerminals[activeFromTerm];
                const targetPos = snappedTermId && allTerminals[snappedTermId] 
                  ? allTerminals[snappedTermId] 
                  : mousePos;
                const dx = targetPos.x - p1.x;
                const dy = targetPos.y - p1.y;
                const sag = 25;
                const pathData = `M ${p1.x} ${p1.y} Q ${p1.x + dx / 2} ${p1.y + dy / 2 + sag}, ${targetPos.x} ${targetPos.y}`;

                return (
                  <>
                    <path
                      d={pathData}
                      fill="none"
                      stroke="rgba(0, 242, 254, 0.4)"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    <path
                      d={pathData}
                      fill="none"
                      stroke="#00f2fe"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray="6 4"
                      className="animate-pulse"
                    />
                    {/* Banana Probe Tip at cursor */}
                    <circle
                      cx={targetPos.x}
                      cy={targetPos.y}
                      r={snappedTermId ? '10' : '6'}
                      fill={snappedTermId ? '#00f5a0' : '#00f2fe'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </>
                );
              })()}
            </g>
          )}
        </svg>

        {/* Top-Level Accurate Terminal Binding Posts Layer */}
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
              {/* Guidance Pulsing Halo when active wire is looking for target */}
              {isTargetAvailable && (
                <div className="absolute w-9 h-9 rounded-full bg-cyan-400/20 animate-ping pointer-events-none" />
              )}

              {/* Realistic 3D Binding Post Socket Button */}
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
                className={`w-7 h-7 rounded-full transition-all duration-150 flex items-center justify-center cursor-pointer shadow-lg group relative ${
                  isFrom
                    ? 'bg-cyan-400 ring-4 ring-cyan-400/60 scale-125'
                    : isSnapped
                      ? 'bg-emerald-400 ring-4 ring-emerald-400/70 scale-135'
                      : isPos
                        ? 'bg-gradient-to-br from-rose-500 to-rose-700 hover:scale-125 hover:ring-2 hover:ring-rose-300'
                        : isNeg
                          ? 'bg-gradient-to-br from-slate-800 to-black hover:scale-125 hover:ring-2 hover:ring-slate-400'
                          : 'bg-gradient-to-br from-amber-400 to-amber-600 hover:scale-125 hover:ring-2 hover:ring-amber-200'
                } border-2 border-slate-900`}
                title={`${pos.name} • Click to connect`}
              >
                {/* Metallic Inner Jack Core */}
                <div className="w-2.5 h-2.5 rounded-full bg-slate-950 border border-amber-300/80 shadow-inner flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-black" />
                </div>

                {/* Floating Tooltip Banner on Hover */}
                <span className="absolute bottom-8 px-2 py-0.5 rounded-md bg-slate-950/95 text-[10px] font-mono text-cyan-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-cyan-500/30 shadow-xl z-50">
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
