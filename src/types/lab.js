// Shared constants and identifiers
export const ComponentTypes = ['battery', 'resistor', 'ammeter', 'voltmeter', 'switch'];
export const TerminalPolarities = ['pos', 'neg', 'neutral'];
export const CircuitValidationStates = [
  'EMPTY',
  'INCOMPLETE',
  'SHORT_CIRCUIT',
  'AMMETER_PARALLEL',
  'VOLTMETER_SERIES',
  'OPEN_SWITCH',
  'READY',
  'ACTIVE',
];
