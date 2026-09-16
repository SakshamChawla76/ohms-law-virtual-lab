// Circuit Simulator & Ohm's Law Physics Engine in pure JavaScript

export function getTerminalPositions(component) {
  const { id, type, x, y } = component;
  switch (type) {
    case 'battery':
      return {
        [`${id}-pos`]: { x: x + 55, y: y - 22, name: 'DC Supply (+) Red', polarity: 'pos' },
        [`${id}-neg`]: { x: x + 55, y: y + 22, name: 'DC Supply (-) Black', polarity: 'neg' },
      };
    case 'resistor':
      return {
        [`${id}-a`]: { x: x - 65, y: y, name: 'Resistor Terminal A', polarity: 'neutral' },
        [`${id}-b`]: { x: x + 65, y: y, name: 'Resistor Terminal B', polarity: 'neutral' },
      };
    case 'ammeter':
      return {
        [`${id}-pos`]: { x: x - 32, y: y + 36, name: 'Ammeter (+) Red', polarity: 'pos' },
        [`${id}-neg`]: { x: x + 32, y: y + 36, name: 'Ammeter (-) Black', polarity: 'neg' },
      };
    case 'voltmeter':
      return {
        [`${id}-pos`]: { x: x - 32, y: y + 36, name: 'Voltmeter (+) Red', polarity: 'pos' },
        [`${id}-neg`]: { x: x + 32, y: y + 36, name: 'Voltmeter (-) Black', polarity: 'neg' },
      };
    case 'switch':
      return {
        [`${id}-in`]: { x: x - 45, y: y + 8, name: 'Switch In', polarity: 'neutral' },
        [`${id}-out`]: { x: x + 45, y: y + 8, name: 'Switch Out', polarity: 'neutral' },
      };
    default:
      return {};
  }
}

export function simulateCircuit(
  components,
  wires,
  supplyVoltage,
  resistance,
  isSwitchClosed,
  noiseEnabled = false,
  noiseMagnitude = 0.012
) {
  const battery = components.find(c => c.type === 'battery');
  const resistor = components.find(c => c.type === 'resistor');
  const ammeter = components.find(c => c.type === 'ammeter');
  const voltmeter = components.find(c => c.type === 'voltmeter');
  const sw = components.find(c => c.type === 'switch');

  const baseResult = {
    state: 'EMPTY',
    isValid: false,
    isClosedLoop: false,
    isShortCircuit: false,
    isSwitchClosed,
    supplyVoltage,
    actualCurrent: 0,
    measuredVoltage: 0,
    measuredCurrent: 0,
    resistance,
    powerWatts: 0,
    statusTitle: 'Empty Workspace',
    message: 'Place the DC Power Supply, Resistor, Ammeter, Voltmeter, and Switch on the canvas to begin.',
    activePathNodes: [],
  };

  if (!battery) {
    return {
      ...baseResult,
      message: 'Add a DC Power Supply to provide voltage.',
    };
  }

  if (components.length < 3 || wires.length < 2) {
    return {
      ...baseResult,
      state: 'INCOMPLETE',
      statusTitle: 'Circuit Incomplete',
      message: 'Connect components using wires by dragging from one terminal pin to another.',
      pedagogicalFix: 'Create a closed loop: Power Supply (+) -> Switch -> Ammeter -> Resistor -> Power Supply (-).',
    };
  }

  // Build Adjacency Graph of Terminals
  const adj = new Map();
  const addEdge = (u, v) => {
    if (!adj.has(u)) adj.set(u, new Set());
    if (!adj.has(v)) adj.set(v, new Set());
    adj.get(u).add(v);
    adj.get(v).add(u);
  };

  wires.forEach(w => {
    addEdge(w.fromTerminalId, w.toTerminalId);
  });

  const getWireEquivalenceClass = (start) => {
    const visited = new Set();
    const queue = [start];
    visited.add(start);
    while (queue.length > 0) {
      const curr = queue.shift();
      const neighbors = adj.get(curr);
      if (neighbors) {
        for (const nxt of neighbors) {
          if (!visited.has(nxt)) {
            visited.add(nxt);
            queue.push(nxt);
          }
        }
      }
    }
    return visited;
  };

  const bPos = `${battery.id}-pos`;
  const bNeg = `${battery.id}-neg`;

  // 1. Direct short check across battery
  const bPosReach = getWireEquivalenceClass(bPos);
  if (bPosReach.has(bNeg)) {
    return {
      ...baseResult,
      state: 'SHORT_CIRCUIT',
      isShortCircuit: true,
      statusTitle: 'Danger: Short Circuit!',
      message: 'The positive and negative terminals of the power supply are connected directly with negligible resistance!',
      pedagogicalFix: 'Current will surge uncontrollably and damage equipment. Remove the direct bypass wire between (+) and (-).',
    };
  }

  // 2. Check ammeter parallel short circuit
  if (ammeter) {
    const aPos = `${ammeter.id}-pos`;
    const aNeg = `${ammeter.id}-neg`;
    const aPosReach = getWireEquivalenceClass(aPos);
    if (aPosReach.has(aNeg)) {
      return {
        ...baseResult,
        state: 'SHORT_CIRCUIT',
        isShortCircuit: true,
        statusTitle: 'Ammeter Shorted',
        message: 'Ammeter terminals are shorted together by a wire.',
      };
    }
    if ((bPosReach.has(aPos) && bPosReach.has(aNeg)) || (bPosReach.has(aPos) && getWireEquivalenceClass(bNeg).has(aNeg))) {
      return {
        ...baseResult,
        state: 'AMMETER_PARALLEL',
        isShortCircuit: true,
        statusTitle: 'Ammeter in Parallel!',
        message: 'An ammeter has very low internal resistance (~0 Ω). Connecting it in parallel creates a short circuit!',
        pedagogicalFix: 'Connect the ammeter in SERIES so current flows THROUGH it, not across it.',
      };
    }
  }

  // 3. Resistor check
  if (!resistor) {
    return {
      ...baseResult,
      state: 'INCOMPLETE',
      statusTitle: 'Missing Resistor',
      message: 'Place a resistor on the board to provide resistance for Ohm\'s Law verification.',
    };
  }

  const rA = `${resistor.id}-a`;
  const rB = `${resistor.id}-b`;

  if (ammeter) {
    const aPos = `${ammeter.id}-pos`;
    const aNeg = `${ammeter.id}-neg`;
    const rAReach = getWireEquivalenceClass(rA);
    const rBReach = getWireEquivalenceClass(rB);
    const aConnectedAcrossR = (rAReach.has(aPos) && rBReach.has(aNeg)) || (rAReach.has(aNeg) && rBReach.has(aPos));
    if (aConnectedAcrossR) {
      return {
        ...baseResult,
        state: 'AMMETER_PARALLEL',
        statusTitle: 'Ammeter Connected Across Resistor',
        message: 'The ammeter is connected in parallel across the resistor. Because ammeters have negligible resistance, it will bypass the resistor entirely!',
        pedagogicalFix: 'Place the ammeter in SERIES with the resistor in the main loop.',
      };
    }
  }

  // Voltmeter check
  let voltmeterProperlyConnected = false;
  if (voltmeter) {
    const vPos = `${voltmeter.id}-pos`;
    const vNeg = `${voltmeter.id}-neg`;
    const rAReach = getWireEquivalenceClass(rA);
    const rBReach = getWireEquivalenceClass(rB);

    voltmeterProperlyConnected =
      (rAReach.has(vPos) && rBReach.has(vNeg)) ||
      (rAReach.has(vNeg) && rBReach.has(vPos));
  }

  // Internal bridge graph
  const fullAdj = new Map();
  const addFullEdge = (u, v) => {
    if (!fullAdj.has(u)) fullAdj.set(u, new Set());
    if (!fullAdj.has(v)) fullAdj.set(v, new Set());
    fullAdj.get(u).add(v);
    fullAdj.get(v).add(u);
  };

  wires.forEach(w => addFullEdge(w.fromTerminalId, w.toTerminalId));
  if (ammeter) addFullEdge(`${ammeter.id}-pos`, `${ammeter.id}-neg`);
  addFullEdge(rA, rB);
  if (sw && isSwitchClosed) addFullEdge(`${sw.id}-in`, `${sw.id}-out`);

  const findPath = (start, target, mustPassThrough) => {
    const visited = new Set();
    const path = [];

    const dfs = (curr) => {
      visited.add(curr);
      path.push(curr);
      if (curr === target) {
        const allPresent = mustPassThrough.every(node => path.includes(node));
        if (allPresent) return true;
      }
      const neighbors = fullAdj.get(curr);
      if (neighbors) {
        for (const nxt of neighbors) {
          if (voltmeter) {
            const vPos = `${voltmeter.id}-pos`;
            const vNeg = `${voltmeter.id}-neg`;
            if ((curr === vPos && nxt === vNeg) || (curr === vNeg && nxt === vPos)) {
              continue;
            }
          }
          if (!visited.has(nxt)) {
            if (dfs(nxt)) return true;
          }
        }
      }
      path.pop();
      return false;
    };

    if (dfs(start)) return path;
    return null;
  };

  // Check if voltmeter is blocking the main loop (Voltmeter in series)
  if (voltmeter) {
    const testAdj = new Map();
    const addTestEdge = (u, v) => {
      if (!testAdj.has(u)) testAdj.set(u, new Set());
      if (!testAdj.has(v)) testAdj.set(v, new Set());
      testAdj.get(u).add(v);
      testAdj.get(v).add(u);
    };
    wires.forEach(w => addTestEdge(w.fromTerminalId, w.toTerminalId));
    if (ammeter) addTestEdge(`${ammeter.id}-pos`, `${ammeter.id}-neg`);
    addTestEdge(rA, rB);
    if (sw) addTestEdge(`${sw.id}-in`, `${sw.id}-out`);

    const vPos = `${voltmeter.id}-pos`;
    const vNeg = `${voltmeter.id}-neg`;
    const testWithVMBridge = new Map(testAdj);
    if (!testWithVMBridge.has(vPos)) testWithVMBridge.set(vPos, new Set());
    if (!testWithVMBridge.has(vNeg)) testWithVMBridge.set(vNeg, new Set());
    testWithVMBridge.get(vPos).add(vNeg);
    testWithVMBridge.get(vNeg).add(vPos);

    const hasPathOnlyWithVM = (() => {
      const q = [bPos];
      const vis = new Set([bPos]);
      while (q.length > 0) {
        const u = q.shift();
        if (u === bNeg) return true;
        for (const v of testWithVMBridge.get(u) || []) {
          if (!vis.has(v)) { vis.add(v); q.push(v); }
        }
      }
      return false;
    })();

    const hasPathWithoutVM = (() => {
      const q = [bPos];
      const vis = new Set([bPos]);
      while (q.length > 0) {
        const u = q.shift();
        if (u === bNeg) return true;
        for (const v of testAdj.get(u) || []) {
          if (!vis.has(v)) { vis.add(v); q.push(v); }
        }
      }
      return false;
    })();

    if (hasPathOnlyWithVM && !hasPathWithoutVM) {
      return {
        ...baseResult,
        state: 'VOLTMETER_SERIES',
        statusTitle: 'Voltmeter in Series!',
        message: 'The voltmeter is inserted directly into the main series loop. Ideal voltmeters have megaohm resistance and will block current!',
        pedagogicalFix: 'Connect the voltmeter in PARALLEL across the resistor terminals.',
      };
    }
  }

  // Check if switch is open
  if (sw && !isSwitchClosed) {
    const requiredNodes = [rA, rB];
    if (ammeter) requiredNodes.push(`${ammeter.id}-pos`);

    const wouldBeComplete = findPath(bPos, bNeg, requiredNodes) !== null;
    return {
      ...baseResult,
      state: 'OPEN_SWITCH',
      isClosedLoop: false,
      statusTitle: 'Switch is Open',
      message: wouldBeComplete
        ? 'The circuit is properly assembled! Close the switch to begin conducting the experiment.'
        : 'The switch is currently OPEN. Incomplete circuit path detected.',
      pedagogicalFix: wouldBeComplete ? 'Click the switch to close it.' : 'Verify all components form a continuous loop.',
    };
  }

  // Active path check
  const requiredNodes = [rA, rB];
  if (ammeter) requiredNodes.push(`${ammeter.id}-pos`);
  const activePath = findPath(bPos, bNeg, requiredNodes);

  if (!activePath) {
    return {
      ...baseResult,
      state: 'INCOMPLETE',
      statusTitle: 'Open / Incomplete Circuit',
      message: 'The circuit loop is not closed or a required component is disconnected.',
      pedagogicalFix: 'Ensure wires connect from Battery (+) through Switch and Ammeter to Resistor, and back to Battery (-).',
    };
  }

  // Closed and valid!
  let actualI = supplyVoltage / resistance;
  let measuredV = supplyVoltage;
  let measuredI = actualI;

  if (noiseEnabled && actualI > 0) {
    const noiseFactor = Math.sin(supplyVoltage * 12.34 + resistance * 5.67) * noiseMagnitude;
    measuredI = actualI * (1 + noiseFactor);
    measuredV = supplyVoltage * (1 - noiseFactor * 0.4);
  }

  if (!voltmeterProperlyConnected) {
    measuredV = 0;
  }

  return {
    state: 'ACTIVE',
    isValid: true,
    isClosedLoop: true,
    isShortCircuit: false,
    isSwitchClosed,
    supplyVoltage,
    actualCurrent: actualI,
    measuredVoltage: Number(measuredV.toFixed(3)),
    measuredCurrent: Number(measuredI.toFixed(3)),
    resistance,
    powerWatts: Number((measuredV * measuredI).toFixed(3)),
    statusTitle: 'Circuit Active & Operational',
    message: voltmeterProperlyConnected
      ? 'Ohm\'s Law circuit is correctly connected. Current is flowing through the resistor.'
      : 'Current is flowing, but Voltmeter is not connected across the resistor to read potential difference.',
    pedagogicalFix: voltmeterProperlyConnected
      ? undefined
      : 'Connect Voltmeter (+) and (-) across Resistor terminals A and B to measure voltage.',
    activePathNodes: activePath,
  };
}
