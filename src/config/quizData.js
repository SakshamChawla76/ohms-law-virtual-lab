export const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'What physical quantity does an ammeter measure, and in what SI units?',
    category: 'Meters',
    options: [
      'Potential difference across a component, measured in Volts (V)',
      'Rate of flow of electric charge (current), measured in Amperes (A)',
      'Total electrical energy stored, measured in Joules (J)',
      'Opposition to charge flow, measured in Ohms (Ω)'
    ],
    correctIndex: 1,
    explanation: 'An ammeter measures electric current (I = dq/dt), which is the rate at which electric charge flows through a cross-section of a conductor, expressed in Amperes (A).'
  },
  {
    id: 2,
    question: 'Why must an ammeter ALWAYS be connected in series with the circuit component?',
    category: 'Meters',
    options: [
      'Because it has high resistance and would draw too much voltage in parallel',
      'So that all current flowing through the branch passes directly through the ammeter with minimal voltage drop (R ≈ 0 Ω)',
      'To prevent the resistor from overheating',
      'Because it requires external electrostatic field orientation'
    ],
    correctIndex: 1,
    explanation: 'An ammeter has very low internal resistance (~0 Ω). In series, all circuit current traverses it without disturbing the circuit. Connecting it in parallel would cause a dangerous short circuit.'
  },
  {
    id: 3,
    question: 'How must a voltmeter be connected in a circuit, and what is its ideal internal resistance?',
    category: 'Meters',
    options: [
      'In series, with zero internal resistance (0 Ω)',
      'In parallel across the component, with infinite internal resistance (R → ∞)',
      'In series, with infinite internal resistance (R → ∞)',
      'In parallel, with zero internal resistance (0 Ω)'
    ],
    correctIndex: 1,
    explanation: 'A voltmeter measures the potential difference BETWEEN two points. It must be connected in parallel across the device and have extremely high (ideally infinite) resistance so it diverts virtually zero current from the main loop.'
  },
  {
    id: 4,
    question: 'According to Ohm\'s Law (V = IR), what happens to current (I) if voltage (V) is doubled while resistance (R) is kept strictly constant?',
    category: 'Ohm’s Law',
    options: [
      'Current is halved',
      'Current quadruples',
      'Current doubles (linearly proportional: I ∝ V)',
      'Current remains unchanged'
    ],
    correctIndex: 2,
    explanation: 'From V = IR, rearranging gives I = V / R. If V increases by a factor of 2 while R is constant, I also doubles, demonstrating direct linearity.'
  },
  {
    id: 5,
    question: 'What happens to the current in an active circuit if resistance is increased while supply voltage remains constant?',
    category: 'Ohm’s Law',
    options: [
      'Current decreases inversely (I ∝ 1/R)',
      'Current increases linearly',
      'Current remains constant',
      'Voltage drops to zero immediately'
    ],
    correctIndex: 0,
    explanation: 'Current is inversely proportional to resistance (I = V / R). Increasing resistance opposes current flow, leading to a proportional reduction in current.'
  },
  {
    id: 6,
    question: 'When plotting a V-I graph with Voltage (V) on the vertical Y-axis and Current (I) on the horizontal X-axis, what physical property does the slope of the best-fit line represent?',
    category: 'Calculations',
    options: [
      'Conductance (1/R)',
      'Electric Power (P)',
      'Resistance (R = ΔV / ΔI)',
      'Total electric charge (Q)'
    ],
    correctIndex: 2,
    explanation: 'Slope = Rise / Run = ΔV / ΔI. By Ohm\'s Law V = IR, ΔV / ΔI = R. Hence, the slope of the V-I graph directly gives the electrical resistance of the ohmic resistor.'
  },
  {
    id: 7,
    question: 'Under what fundamental physical condition is Ohm\'s Law strictly valid for a conductor?',
    category: 'Ohm’s Law',
    options: [
      'Under any condition regardless of temperature or geometry',
      'At constant physical conditions, especially constant temperature and mechanical strain',
      'Only in a vacuum at absolute zero temperature',
      'Only when alternating current (AC) at 50Hz is applied'
    ],
    correctIndex: 1,
    explanation: 'Ohm\'s Law states that the current through a conductor is directly proportional to the potential difference applied across it, provided all physical conditions, particularly temperature, remain constant.'
  },
  {
    id: 8,
    question: 'A student applies 6.0 V across a test resistor and observes an ammeter reading of 0.120 A. What is the experimental resistance?',
    category: 'Calculations',
    options: [
      '72 Ω',
      '0.72 Ω',
      '50 Ω',
      '0.02 Ω'
    ],
    correctIndex: 2,
    explanation: 'Using R = V / I: R = 6.0 V / 0.120 A = 50.0 Ω.'
  }
];
