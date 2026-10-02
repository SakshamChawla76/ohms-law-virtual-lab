/**
 * Simulation Inquiry & Pedagogical Detail Repository
 * Provides rich simulation-specific quizzes, real-world engineering applications,
 * and quick-start interactive experiment presets for all laboratories.
 */

export const SIMULATION_DETAILS = {
  'newtons-cannon': {
    presets: [
      { name: 'Sub-Orbital Drop', desc: 'Low horizontal velocity results in ballistic impact', vel: 5500, alt: 300 },
      { name: 'Stable LEO Orbit', desc: 'Circular orbit where gravity equals centripetal acceleration (~7.8 km/s)', vel: 7850, alt: 350 },
      { name: 'High Earth Ellipse', desc: 'Highly elliptical orbit approaching geosynchronous altitude', vel: 9200, alt: 500 },
      { name: 'Escape Trajectory', desc: 'Exceeds escape velocity (v ≥ 11.2 km/s), breaking Earth gravity', vel: 11200, alt: 600 }
    ],
    applications: [
      {
        title: 'Low Earth Orbit (LEO) Satellite Constellations',
        icon: 'satellite',
        description: 'Starlink, Earth observation satellites, and the International Space Station (ISS) orbit Earth at ~7.8 km/s, continuously "falling around" the planet where gravitational pull precisely matches required centripetal force.'
      },
      {
        title: 'Interplanetary Planetary Probes',
        icon: 'rocket',
        description: 'Missions to Mars, Jupiter, and beyond (Voyager, Perseverance) must achieve escape velocity (11.2 km/s from Earth surface) to escape the gravitational potential well of Earth and enter heliocentric transfer orbits.'
      },
      {
        title: 'Ballistic Missile Trajectories & ICBM Defense',
        icon: 'target',
        description: 'Sub-orbital spaceflights and sub-orbital ballistic trajectories arc above the atmosphere at speeds between 4.0 and 7.0 km/s before atmospheric re-entry along parabolic gravitational arcs.'
      }
    ],
    quiz: [
      {
        id: 'nc_q1',
        question: 'Why does an orbiting satellite never fall to the ground despite Earth\'s gravity constantly pulling on it?',
        options: [
          { text: 'A) There is zero gravity in orbit', correct: false },
          { text: 'B) Its horizontal velocity curves it forward at the exact same rate the Earth surface curves away', correct: true },
          { text: 'C) Rocket engines continuously fire upward to keep it elevated', correct: false },
          { text: 'D) Solar radiation pressure counteracts gravitational pull', correct: false }
        ],
        explanation: 'In orbit, gravity is still ~90% as strong as on the surface! The satellite is in perpetual free-fall: as it drops toward Earth, its immense horizontal speed moves it forward so the surface curves away underneath it.'
      },
      {
        id: 'nc_q2',
        question: 'What happens to the trajectory if the launch velocity reaches or exceeds 11.2 km/s (at Earth\'s surface)?',
        options: [
          { text: 'A) The orbit becomes an ellipse that crashes into the Moon', correct: false },
          { text: 'B) The cannonball opens a black hole', correct: false },
          { text: 'C) The projectile achieves escape velocity and enters an open hyperbolic/parabolic trajectory', correct: true },
          { text: 'D) The projectile decelerates to zero immediately', correct: false }
        ],
        explanation: 'At 11.2 km/s, kinetic energy equals or exceeds the gravitational potential energy binding the object to Earth, allowing it to escape Earth\'s gravitational field entirely on a hyperbolic path.'
      }
    ]
  },

  'prom-night': {
    presets: [
      { name: 'Standard Full Mirror', desc: 'Optimal mirror at eye level (height = h / 2)', h: 170, mh: 85, off: 80, dist: 2.0 },
      { name: 'Clipped Feet', desc: 'Mirror placed too high cuts off shoes', h: 175, mh: 70, off: 110, dist: 2.0 },
      { name: 'Clipped Head', desc: 'Mirror placed too low cuts off hair', h: 170, mh: 65, off: 50, dist: 2.0 },
      { name: 'Close vs Far Myth', desc: 'Step back to see if required mirror size changes!', h: 170, mh: 85, off: 80, dist: 4.5 }
    ],
    applications: [
      {
        title: 'Architectural Dressing Mirrors',
        icon: 'eye',
        description: 'Dressing mirrors in interior architecture only need to be half the person\'s height (h/2) regardless of viewing distance, because by the Law of Reflection, the angle of incidence equals the angle of reflection.'
      },
      {
        title: 'Automotive Rearview & Side Mirrors',
        icon: 'car',
        description: 'Driver rearview mirrors utilize flat plane optical reflection to preserve 1:1 true scale and spatial depth without optical magnification distortion.'
      },
      {
        title: 'Periscopes & Optical Ray Tracing',
        icon: 'compass',
        description: 'Submarine periscopes and laser path routing use 45° plane mirrors where virtual images retain upright parity and geometric ray distances equal object distances.'
      }
    ],
    quiz: [
      {
        id: 'pn_q1',
        question: 'If you stand further away from a flat mirror, how does the minimum length of mirror needed to view your full body change?',
        options: [
          { text: 'A) It stays exactly the same (always half your height)', correct: true },
          { text: 'B) It decreases because you appear smaller', correct: false },
          { text: 'C) It increases because the angle widens', correct: false },
          { text: 'D) It doubles every meter you step back', correct: false }
        ],
        explanation: 'By similar triangles in ray optics, as you step back, the ray bundle narrows at the exact same rate your image distance increases. The required mirror height remains stubbornly h/2!'
      },
      {
        id: 'pn_q2',
        question: 'Where is the virtual image located relative to the plane mirror surface?',
        options: [
          { text: 'A) Directly on the mirror glass face', correct: false },
          { text: 'B) Exactly as far behind the mirror as the object is in front of it', correct: true },
          { text: 'C) Halfway between the person and the glass', correct: false },
          { text: 'D) At focal infinity', correct: false }
        ],
        explanation: 'Plane mirrors produce virtual, upright images with image distance equal to object distance (d_i = -d_o).'
      }
    ]
  },

  'walk-the-tightrope': {
    presets: [
      { name: 'Pro High-Wire Master', desc: 'Long pole (6m) with heavy tip masses for maximum rotational inertia', L: 6.5, M: 8.0 },
      { name: 'Dangerous Short Stick', desc: 'Short lightweight rod (2m) produces rapid violent wobbles', L: 2.0, M: 1.5 },
      { name: 'Heavy Center, Light Tips', desc: 'Mass placed near hands gives minimal moment of inertia', L: 3.5, M: 2.0 },
      { name: 'Ultra-Stable Giant Beam', desc: '8-meter pole with 10 kg end weights', L: 8.0, M: 10.0 }
    ],
    applications: [
      {
        title: 'Circus High-Wire Aerialists',
        icon: 'award',
        description: 'Funambulists carry long, downward-bowed balancing poles. Distributing mass far from the rotational axis dramatically increases moment of inertia (I = Σmr²), reducing angular acceleration caused by torque perturbations.'
      },
      {
        title: 'Reaction Wheels in Spacecraft',
        icon: 'rotate',
        description: 'Satellites like the Hubble Space Telescope use high-inertia spinning reaction wheels to rotate and stabilize instruments in zero-G without expending rocket fuel.'
      },
      {
        title: 'Skyscraper Tuned Mass Dampers',
        icon: 'layers',
        description: 'Tall buildings like Taipei 101 suspend massive counterweights (tuned mass dampers) to oppose sway and oscillation caused by hurricane winds and earthquakes.'
      }
    ],
    quiz: [
      {
        id: 'wt_q1',
        question: 'Why does carrying a long pole with weights on the ends make balancing easier on a tightrope?',
        options: [
          { text: 'A) It increases the athlete\'s aerodynamic lift', correct: false },
          { text: 'B) It vastly increases rotational inertia, slowing down tip-over angular acceleration (α = τ / I)', correct: true },
          { text: 'C) It lowers gravity on the wire', correct: false },
          { text: 'D) It magnetically locks the shoes to the steel cable', correct: false }
        ],
        explanation: 'Because moment of inertia scales with radius squared (I ∝ r²), placing mass at the tips of a long pole increases I by dozens of times. For any off-balance torque τ, angular acceleration α = τ / I becomes tiny, giving the acrobat plenty of time to correct.'
      },
      {
        id: 'wt_q2',
        question: 'If you double the length of the pole while keeping the end masses constant, the rotational inertia of the masses:',
        options: [
          { text: 'A) Doubles', correct: false },
          { text: 'B) Quadruples (increases 4×)', correct: true },
          { text: 'C) Remains unchanged', correct: false },
          { text: 'D) Cuts in half', correct: false }
        ],
        explanation: 'Moment of inertia for point masses at distance r is I = m·r². Doubling pole length doubles r = L/2, so (2r)² = 4r², quadrupling the rotational inertia!'
      }
    ]
  },

  'heat-engine': {
    presets: [
      { name: 'Automotive ICE Engine', desc: 'Hot combustion gas at 850 K, ambient cooling at 300 K', Th: 850, Tc: 300, rpm: 80 },
      { name: 'Geothermal Power Plant', desc: 'Steam at 450 K, cooling tower at 290 K (~35% theoretical max)', Th: 450, Tc: 290, rpm: 45 },
      { name: 'Superheated Steam Turbine', desc: 'Supercritical coal/nuclear boiler at 900 K with cold river cooling at 280 K', Th: 900, Tc: 280, rpm: 100 },
      { name: 'Low Thermal Gradient', desc: 'Ocean Thermal Energy (OTEC) with small ΔT (300 K / 278 K)', Th: 305, Tc: 278, rpm: 30 }
    ],
    applications: [
      {
        title: 'Thermal & Nuclear Power Generation',
        icon: 'flame',
        description: 'Nuclear and combined-cycle gas turbine plants generate electricity by converting thermal energy from high-temperature boilers (T_H) into mechanical turbine work before rejecting waste heat into cooling towers (T_C).'
      },
      {
        title: 'Automotive Internal Combustion Engines',
        icon: 'gauge',
        description: 'Car engines compress fuel-air mixtures, ignite them to generate high peak temperatures, and extract work via pistons, constrained fundamentally by the Carnot efficiency thermodynamic ceiling.'
      },
      {
        title: 'Stirling External Combustion Engines',
        icon: 'rotate',
        description: 'Closed-cycle Stirling engines operate on external temperature differences, enabling silent, long-duration submarine propulsion and solar dish heat-to-electricity generators.'
      }
    ],
    quiz: [
      {
        id: 'he_q1',
        question: 'What is the theoretical maximum efficiency (Carnot efficiency) of an engine operating between 600 K and 300 K?',
        options: [
          { text: 'A) 100%', correct: false },
          { text: 'B) 50% (η = 1 - 300/600)', correct: true },
          { text: 'C) 75%', correct: false },
          { text: 'D) 25%', correct: false }
        ],
        explanation: 'Carnot efficiency is defined as η = 1 - (T_cold / T_hot). For 300K/600K: η = 1 - 0.50 = 0.50 (50%). No real heat engine can ever exceed this ceiling.'
      },
      {
        id: 'he_q2',
        question: 'According to the Second Law of Thermodynamics, why is it physically impossible to build a 100% efficient heat engine?',
        options: [
          { text: 'A) Mechanical friction can never be lubricated completely', correct: false },
          { text: 'B) Some heat must always be rejected to a cold sink to complete a cyclic process without decreasing net entropy', correct: true },
          { text: 'C) Air resistance absorbs half the work', correct: false },
          { text: 'D) Heat only flows spontaneously from cold to hot', correct: false }
        ],
        explanation: 'The Kelvin-Planck statement of the 2nd Law states that no cyclic process can convert heat completely into work without rejecting some heat Q_C to a low-temperature reservoir, preserving the non-decrease of total universal entropy.'
      }
    ]
  },

  'hot-pack-cold-pack': {
    presets: [
      { name: 'Emergency Hand Warmer', desc: 'Exothermic dissolution of anhydrous CaCl2 (ΔH = -82.8 kJ/mol)', salt: 'cacl2', grams: 45 },
      { name: 'First-Aid Sports Cold Pack', desc: 'Endothermic dissolution of NH4NO3 (ΔH = +25.7 kJ/mol)', salt: 'nh4no3', grams: 50 },
      { name: 'Mild Heat Pack', desc: 'Low concentration CaCl2 for therapeutic sustained warmth', salt: 'cacl2', grams: 20 },
      { name: 'Max Cold Cryo Relief', desc: 'Near saturation cold pack reaching near freezing point', salt: 'nh4no3', grams: 60 }
    ],
    applications: [
      {
        title: 'Instant First-Aid Cold Compresses',
        icon: 'shield',
        description: 'Instant ice packs contain dry ammonium nitrate separated from a pouch of water. Breaking the pouch triggers spontaneous endothermic lattice breakdown, absorbing heat from bruised tissue.'
      },
      {
        title: 'Self-Heating MRE Rations & Camping Warmers',
        icon: 'flame',
        description: 'Military Meals Ready to Eat (MREs) and commercial hand warmers utilize highly exothermic hydration and oxidation reactions to heat meals without flame or electricity.'
      },
      {
        title: 'Road De-icing & Anti-Freeze Dissolution',
        icon: 'thermometer',
        description: 'Calcium chloride (CaCl2) melts road ice down to -25°C both by lowering the freezing point of water and by releasing exothermic dissolution enthalpy.'
      }
    ],
    quiz: [
      {
        id: 'hp_q1',
        question: 'Why does an instant cold pack feel cold to the touch when the chemical dissolves in room-temperature water?',
        options: [
          { text: 'A) The reaction creates ice molecules from heat', correct: false },
          { text: 'B) The lattice energy needed to separate the ions exceeds the hydration energy, absorbing thermal energy from surroundings (ΔH > 0)', correct: true },
          { text: 'C) It releases negative cold particles into the water', correct: false },
          { text: 'D) Water evaporates rapidly out of the sealed plastic pouch', correct: false }
        ],
        explanation: 'Dissolution enthalpy ΔH_sol = Lattice Energy (endothermic) + Hydration Energy (exothermic). When breaking the crystal lattice takes more energy than hydrating the ions releases, thermal kinetic energy is sucked from the water, dropping its temperature.'
      },
      {
        id: 'hp_q2',
        question: 'Which of the following is true for an exothermic dissolution reaction (such as CaCl₂ in water)?',
        options: [
          { text: 'A) The temperature of the solution rises and ΔH is negative', correct: true },
          { text: 'B) The temperature of the solution falls and ΔH is negative', correct: false },
          { text: 'C) The temperature stays constant and ΔH = 0', correct: false },
          { text: 'D) Heat is absorbed from the student\'s hands', correct: false }
        ],
        explanation: 'Exothermic reactions release chemical bond potential energy as thermal kinetic energy (heat), raising solution temperature (ΔT > 0) with a negative enthalpy change (ΔH < 0).'
      }
    ]
  },

  'battery-redox': {
    presets: [
      { name: 'Standard Daniell Cell', desc: '1.0 M ZnSO4 and 1.0 M CuSO4 producing standard E° = +1.10 V', conc: 1.0, load: 'voltmeter' },
      { name: 'Light Bulb Load', desc: 'Closes the circuit with an incandescent bulb demonstrating electrical work', conc: 1.0, load: 'bulb' },
      { name: 'High Concentration Cell', desc: 'Concentrated 2.0 M electrolyte maximizing ionic conduction', conc: 2.0, load: 'bulb' },
      { name: 'Dilute Depleted Cell', desc: 'Low electrolyte concentration near battery exhaustion', conc: 0.2, load: 'bulb' }
    ],
    applications: [
      {
        title: 'Lithium-Ion & EV Traction Batteries',
        icon: 'battery',
        description: 'Modern electric vehicles and smartphones operate on the exact same galvanic cell principles, shuttling lithium ions between anode and cathode via non-aqueous electrolytes.'
      },
      {
        title: 'Industrial Electroplating & Galvanization',
        icon: 'layers',
        description: 'Automotive and construction steels are coated with sacrificial zinc layers (galvanized steel) so zinc oxidizes preferentially before the underlying iron can corrode.'
      },
      {
        title: 'Fuel Cell Clean Energy Systems',
        icon: 'zap',
        description: 'Hydrogen fuel cells combine H2 oxidation at the anode with O2 reduction at the cathode to produce clean electricity and pure water vapor as the only exhaust.'
      }
    ],
    quiz: [
      {
        id: 'br_q1',
        question: 'In a Daniell galvanic cell with zinc and copper half-cells, which electrode undergoes oxidation and is consumed over time?',
        options: [
          { text: 'A) Copper Cathode', correct: false },
          { text: 'B) Zinc Anode (Zn(s) → Zn²⁺ + 2e⁻)', correct: true },
          { text: 'C) The porous salt bridge', correct: false },
          { text: 'D) The digital voltmeter needle', correct: false }
        ],
        explanation: 'Remember "An Ox" (Anode = Oxidation) and "Red Cat" (Reduction = Cathode). Zinc has a more negative reduction potential (-0.76V) than copper (+0.34V), so zinc metal oxidizes into Zn²⁺ ions, losing mass at the anode.'
      },
      {
        id: 'br_q2',
        question: 'What is the critical purpose of the salt bridge in a galvanic cell?',
        options: [
          { text: 'A) To allow electrons to travel between beakers', correct: false },
          { text: 'B) To maintain electrical neutrality by permitting counter-ion migration without mixing solutions', correct: true },
          { text: 'C) To generate heat to speed up the reaction', correct: false },
          { text: 'D) To store electrical energy like a capacitor', correct: false }
        ],
        explanation: 'Electrons flow through the external metallic wire. The salt bridge allows anions (NO3⁻) to migrate to the anode and cations (K⁺) to migrate to the cathode, preventing charge buildup that would immediately halt the reaction.'
      }
    ]
  },

  'balancing-equations': {
    presets: [
      { name: 'Water Synthesis', desc: 'Combine hydrogen and oxygen gas to form liquid water: 2H₂ + O₂ → 2H₂O', eq: 'water', c1: 2, c2: 1, c3: 2 },
      { name: 'Haber Ammonia Process', desc: 'Synthesize ammonia fertilizer from air: N₂ + 3H₂ → 2NH₃', eq: 'ammonia', c1: 1, c2: 3, c3: 2 },
      { name: 'Methane Combustion', desc: 'Burn natural gas with oxygen: CH₄ + 2O₂ → CO₂ + 2H₂O', eq: 'combustion', c1: 1, c2: 2, c3: 1, c4: 2 },
      { name: 'Unbalanced Challenge', desc: 'Test your balancing skills from a scrambled starting state', eq: 'water', c1: 1, c2: 2, c3: 1 }
    ],
    applications: [
      {
        title: 'Industrial Chemical Manufacturing',
        icon: 'beaker',
        description: 'Chemical engineers use balanced stoichiometric equations to determine precise reactant feed rates in mega-scale chemical refineries, avoiding wasteful unreacted feedstock.'
      },
      {
        title: 'Rocket Propellant Mixing Ratios',
        icon: 'rocket',
        description: 'Liquid rocket engines (SpaceX Raptor, Saturn V) mix liquid methane/hydrogen with liquid oxygen at exact stoichiometric oxidizer-to-fuel ratios to maximize specific impulse (I_sp).'
      },
      {
        title: 'Pharmaceutical Drug Synthesis',
        icon: 'shield',
        description: 'Synthesizing lifesaving antibiotics and vaccines requires exact atom-for-atom stoichiometry to maximize drug purity and prevent toxic side-reaction byproducts.'
      }
    ],
    quiz: [
      {
        id: 'be_q1',
        question: 'Why must chemical equations always be balanced with stoichiometric coefficients?',
        options: [
          { text: 'A) To make sure the volume of liquid never changes', correct: false },
          { text: 'B) To satisfy the Law of Conservation of Mass: atoms can neither be created nor destroyed', correct: true },
          { text: 'C) To ensure the temperature stays room temperature', correct: false },
          { text: 'D) Because elements can turn into other elements during chemical reactions', correct: false }
        ],
        explanation: 'In ordinary chemical reactions, nuclear transmutations do not occur. Every atom present in the reactants must appear in the products; only chemical bonds and groupings rearrange.'
      },
      {
        id: 'be_q2',
        question: 'In the combustion of methane: CH₄ + __ O₂ → CO₂ + 2 H₂O, what coefficient balances oxygen?',
        options: [
          { text: 'A) 1', correct: false },
          { text: 'B) 2 (since products have 2 in CO₂ + 2 in 2H₂O = 4 total O atoms)', correct: true },
          { text: 'C) 3', correct: false },
          { text: 'D) 4', correct: false }
        ],
        explanation: 'The products contain 1×CO₂ (2 oxygen atoms) + 2×H₂O (2 oxygen atoms) = 4 oxygen atoms total. Therefore, 2 O₂ molecules (2 × 2 = 4) are required on the reactant side.'
      }
    ]
  },

  'rock-candy-solubility': {
    presets: [
      { name: 'Boiling Hot Supersaturated', desc: 'Heat to 90°C and dissolve 450g sugar — cooling triggers rapid crystallization', temp: 90, sugar: 450 },
      { name: 'Room Temperature Saturated', desc: '20°C ambient solution holding maximum 200g sugar with no crystals forming', temp: 20, sugar: 200 },
      { name: 'Unsaturated Syrup', desc: 'High temperature with too little sugar — sugar stays fully dissolved', temp: 75, sugar: 220 },
      { name: 'Cryo-Nucleation', desc: 'Chill supersaturated syrup to 30°C to watch massive sugar crystals cluster', temp: 30, sugar: 400 }
    ],
    applications: [
      {
        title: 'Confectionery & Sugar Refining',
        icon: 'beaker',
        description: 'Candy makers control sucrose crystallization rates using temperature and supersaturation to create fine-grained fudge vs. giant crystalline rock candy.'
      },
      {
        title: 'Semiconductor Silicon Ingot Growth',
        icon: 'layers',
        description: 'Computer processors rely on monocrystalline silicon ingots grown from supersaturated molten silicon melts using the Czochralski crystallization method.'
      },
      {
        title: 'Pharmaceutical Active Ingredient Crystallization',
        icon: 'shield',
        description: 'Purifying therapeutic medicines involves cooling supersaturated solutions so pure medicine crystals precipitate out while liquid impurities remain dissolved.'
      }
    ],
    quiz: [
      {
        id: 'rc_q1',
        question: 'How do you create a supersaturated sucrose solution?',
        options: [
          { text: 'A) Dissolve sugar in ice water under high vacuum', correct: false },
          { text: 'B) Heat water to high temperature, dissolve sugar to maximum solubility, then cool gently without disturbing', correct: true },
          { text: 'C) Boil water until all liquid evaporates', correct: false },
          { text: 'D) Add table salt to clear syrup', correct: false }
        ],
        explanation: 'Sucrose solubility in water increases dramatically with temperature (from ~200g/100mL at 20°C to ~450g/100mL at 90°C). Heating dissolves excess solute; cooling traps more solute than normally soluble at the lower temperature.'
      },
      {
        id: 'rc_q2',
        question: 'What triggers rapid crystal growth when a sugar-coated wooden stick is dipped into a supersaturated solution?',
        options: [
          { text: 'A) The stick adds heat to the syrup', correct: false },
          { text: 'B) The sugar crystals on the stick act as nucleation seeds, lowering the activation energy for precipitation', correct: true },
          { text: 'C) Wood absorbs all the water molecules instantly', correct: false },
          { text: 'D) It changes the chemical formula of sucrose', correct: false }
        ],
        explanation: 'Supersaturated solutions are metastable. Introducing seed crystals provides nucleation sites for dissolved sucrose molecules to latch onto and form an organized crystal lattice.'
      }
    ]
  },

  'flat-vs-fizzy-soda': {
    presets: [
      { name: 'Ice Cold Sealed Can (3 atm, 4°C)', desc: 'High pressure and near-freezing temperature maximizes CO2 solubility', sealed: true, press: 3.5, temp: 4 },
      { name: 'Popped Cap at Room Temp', desc: 'Opening cap drops pressure to 1 atm, driving effervescent carbonation fizz', sealed: false, press: 1.0, temp: 22 },
      { name: 'Hot Opened Soda (35°C)', desc: 'Warm temperature and open cap causes CO2 gas to escape almost immediately', sealed: false, press: 1.0, temp: 35 },
      { name: 'Pressurized Warm Container', desc: 'High pressure prevents gas escape even at elevated temperature', sealed: true, press: 4.0, temp: 30 }
    ],
    applications: [
      {
        title: 'Carbonated Beverage Bottling',
        icon: 'beaker',
        description: 'Soda and sparkling water bottling plants inject CO2 gas at 3–4 atmospheres of pressure into cold liquid. Sealing the cap maintains equilibrium until opened by the consumer.'
      },
      {
        title: 'Deep-Sea Scuba Diving & The Bends',
        icon: 'shield',
        description: 'Under high hydrostatic ocean pressure, nitrogen gas dissolves in a diver\'s bloodstream. Ascending too fast drops pressure rapidly, forming agonizing nitrogen gas bubbles in joints.'
      },
      {
        title: 'Ocean Acidification & Marine Ecosystems',
        icon: 'thermometer',
        description: 'Rising atmospheric CO2 pressure increases carbonic acid (H2CO3) in ocean waters according to Henry\'s Law, lowering pH and dissolving delicate coral calcium carbonate shells.'
      }
    ],
    quiz: [
      {
        id: 'fs_q1',
        question: 'According to Henry\'s Law (C = k·P) and Le Chatelier\'s principle, why does opened soda go flat faster in a warm room than in a refrigerator?',
        options: [
          { text: 'A) Cold temperatures freeze the CO2 molecules into solid dry ice', correct: false },
          { text: 'B) Gas dissolution in liquid is an exothermic process, so higher temperatures decrease gas solubility', correct: true },
          { text: 'C) Warm air contains more oxygen that consumes carbon dioxide', correct: false },
          { text: 'D) Pressure inside an open bottle is higher in warm rooms', correct: false }
        ],
        explanation: 'Dissolving gas in liquid releases heat (ΔH < 0). By Le Chatelier\'s principle, adding heat (warming) shifts the equilibrium backward: CO₂(aq) → CO₂(g), expelling carbonation bubbles much faster.'
      },
      {
        id: 'fs_q2',
        question: 'What immediate physical change occurs the instant you unscrew a pressurized soda cap?',
        options: [
          { text: 'A) The liquid temperature instantly jumps 20°C', correct: false },
          { text: 'B) Headspace pressure drops from ~3 atm to 1 atm, dropping equilibrium concentration of dissolved CO2', correct: true },
          { text: 'C) Water begins decomposing into hydrogen and oxygen', correct: false },
          { text: 'D) The dissolved sugar turns into salt', correct: false }
        ],
        explanation: 'Opening the bottle drops the partial pressure of CO₂ above the liquid to atmospheric levels (~0.0004 atm CO₂). The solution becomes drastically supersaturated in gas, driving vigorous bubbling.'
      }
    ]
  },

  'flashlight': {
    presets: [
      { name: 'Standard 2x AA Flashlight (3.0V, 10Ω)', desc: '0.3 A current producing 0.9 W incandescent yellow glow', volts: 3.0, res: 10.0 },
      { name: 'Lantern Battery (6.0V, 12Ω)', desc: '0.5 A current with 3.0 W brilliant bright white beam', volts: 6.0, res: 12.0 },
      { name: 'Overvolt Burnout Test (12.0V, 8Ω)', desc: 'High voltage delivers 18 Watts — intense filament blinding incandescence', volts: 12.0, res: 8.0 },
      { name: 'Dead Battery Weak Glow (1.5V, 15Ω)', desc: 'Low voltage produces faint 0.15 W dull reddish filament glow', volts: 1.5, res: 15.0 }
    ],
    applications: [
      {
        title: 'Incandescent & Halogen Headlamps',
        icon: 'zap',
        description: 'Tungsten filament lamps pass electric current through a thin resistive wire, reaching 2,500°C where thermal blackbody radiation glows with visible white light.'
      },
      {
        title: 'Electric Stove & Toaster Heating Elements',
        icon: 'flame',
        description: 'Joule heating (P = I²R) directly converts electrical energy into thermal energy to toast bread, heat ovens, and boil water in electric kettles.'
      },
      {
        title: 'Electrical Fuses & Circuit Breakers',
        icon: 'shield',
        description: 'Safety fuses use deliberate thin metal ribbons calibrated to melt and break open when excessive current produces dangerous I²R Joule heating.'
      }
    ],
    quiz: [
      {
        id: 'fl_q1',
        question: 'If you double the battery voltage across a fixed filament resistor, by what factor does electrical power dissipation (P = V² / R) increase?',
        options: [
          { text: 'A) Power doubles (2×)', correct: false },
          { text: 'B) Power quadruples (4×)', correct: true },
          { text: 'C) Power stays constant', correct: false },
          { text: 'D) Power is halved', correct: false }
        ],
        explanation: 'Because electrical power scales with the square of voltage (P = V²/R), doubling voltage (2V)² results in 4 times the power dissipation, making the filament glow dramatically brighter and hotter!'
      },
      {
        id: 'fl_q2',
        question: 'What microscopic physical mechanism produces heat and light in an incandescent light bulb filament?',
        options: [
          { text: 'A) Free electrons colliding with vibrating metal lattice atoms (Joule heating)', correct: true },
          { text: 'B) Nuclear fusion of tungsten nuclei', correct: false },
          { text: 'C) Magnetic friction between north and south poles', correct: false },
          { text: 'D) Chemical combustion of oxygen inside the vacuum bulb', correct: false }
        ],
        explanation: 'Electrons propelled by the electric field accelerate and repeatedly collide with vibrating positive metal ions in the crystal lattice. These collisions transfer kinetic energy to lattice vibrations (thermal energy), heating the filament until it emits light.'
      }
    ]
  },

  'gold-foil': {
    presets: [
      { name: 'Standard Rutherford Setup (Po-210, 3 μm Gold)', desc: 'Streams of positive alpha particles penetrate 25,000 atomic layers', rate: 15, thick: 3 },
      { name: 'Ultra-Thin Leaf (1 μm Gold)', desc: 'Almost all alpha particles pass straight through with negligible deflection', rate: 20, thick: 1 },
      { name: 'Heavy Gold Barrier (6 μm Gold)', desc: 'Thicker foil produces more frequent large-angle electrostatic back-scattering', rate: 25, thick: 6 },
      { name: 'Low Intensity Single-Particle Tracking', desc: 'Low stream rate to clearly observe individual hyperbolic deflection tracks', rate: 6, thick: 2 }
    ],
    applications: [
      {
        title: 'Modern Rutherford Backscattering Spectrometry (RBS)',
        icon: 'target',
        description: 'Materials scientists shoot helium ions at thin semiconductor films to non-destructively measure atomic composition and layer thickness based on energy backscatter.'
      },
      {
        title: 'Radiation Shielding & Nuclear Medicine',
        icon: 'shield',
        description: 'Understanding Coulomb scattering dictates radiation shielding protocols for alpha emitters (radon, americium smoke detectors) vs gamma emitters.'
      },
      {
        title: 'Discovery of the Atomic Nucleus',
        icon: 'atom',
        description: 'Rutherford\'s experiment in 1911 shattered J.J. Thomson\'s plum pudding model, proving matter is over 99.999% empty space with a tiny positive nucleus.'
      }
    ],
    quiz: [
      {
        id: 'gf_q1',
        question: 'What astonishing observation in the gold foil experiment led Ernest Rutherford to conclude that atoms have a tiny, dense positive nucleus?',
        options: [
          { text: 'A) All alpha particles were completely absorbed by the gold foil', correct: false },
          { text: 'B) About 1 in 8,000 alpha particles bounced almost straight backwards (>90° deflection)', correct: true },
          { text: 'C) The gold foil turned into lead', correct: false },
          { text: 'D) Alpha particles turned into electrons upon contact', correct: false }
        ],
        explanation: 'Rutherford famously remarked: "It was as incredible as if you fired a 15-inch shell at a piece of tissue paper and it came back and hit you!" Only a concentrated, ultra-dense positive charge could produce electrostatic repulsion strong enough to reverse high-speed alpha particles.'
      },
      {
        id: 'gf_q2',
        question: 'Why did the vast majority (>99.9%) of alpha particles pass through the gold foil with virtually zero deflection?',
        options: [
          { text: 'A) The gold foil had microscopic holes drilled through it', correct: false },
          { text: 'B) Alpha particles are neutral and ignore charges', correct: false },
          { text: 'C) Atoms are overwhelmingly empty space, with electrons orbiting far from the microscopic nucleus', correct: true },
          { text: 'D) Gold atoms are transparent to radioactivity', correct: false }
        ],
        explanation: 'The atomic radius is roughly 100,000 times larger than the nuclear radius. If a nucleus were the size of a marble in the center of a stadium, the electrons would be orbiting in the highest bleachers!'
      }
    ]
  },

  'elevator': {
    presets: [
      { name: 'Accelerating Upward (+3.0 m/s²)', desc: 'Floor pushes up hard: passenger feels heavy! Normal force F_N = m(g+a)', acc: 3.0, mass: 70 },
      { name: 'Cruising Constant Speed (0 m/s²)', desc: 'Zero acceleration: scale reads true resting weight F_N = mg', acc: 0.0, mass: 70 },
      { name: 'Braking / Decelerating Down (-3.0 m/s²)', desc: 'Downward acceleration creates stomach-drop sensation of lightness', acc: -3.0, mass: 70 },
      { name: 'Cable Snapped Free-Fall (-9.81 m/s²)', desc: 'Zero-G weightlessness! Scale reads exactly 0 kg as passenger floats', acc: -9.8, mass: 70 }
    ],
    applications: [
      {
        title: 'High-Speed Skyscraper Elevators',
        icon: 'gauge',
        description: 'Super-tall skyscrapers (Burj Khalifa, Shanghai Tower) limit elevator jerk and acceleration to ~1.2 m/s² so passengers don\'t suffer nausea or inner-ear vestibular distress.'
      },
      {
        title: 'NASA Vomit Comet & Zero-G Astronaut Training',
        icon: 'rocket',
        description: 'Aircraft flying parabolic arcs enter free-fall acceleration (a = -g) for 25 seconds at a time, creating genuine weightlessness for astronaut training and microgravity science.'
      },
      {
        title: 'Amusement Park Free-Fall Drop Towers',
        icon: 'award',
        description: 'Drop towers release riders in near-complete free fall before magnetic eddy-current brakes apply rapid upward deceleration (a > 3g), creating intense apparent weight sensations.'
      }
    ],
    quiz: [
      {
        id: 'el_q1',
        question: 'A 70 kg person stands on a scale in an elevator accelerating upward at 2.8 m/s². What does the scale measure?',
        options: [
          { text: 'A) 70 kg (scales always measure true mass)', correct: false },
          { text: 'B) About 90 kg (Normal Force F_N = m(g + a) > mg)', correct: true },
          { text: 'C) About 50 kg', correct: false },
          { text: 'D) 0 kg', correct: false }
        ],
        explanation: 'A spring or load-cell scale measures the upward Normal Force F_N it exerts on your feet. By Newton\'s 2nd Law: F_N - mg = ma ⇒ F_N = m(g + a) = 70 × (9.81 + 2.8) = 882.7 N, which displays as 882.7 / 9.81 ≈ 90 kg!'
      },
      {
        id: 'el_q2',
        question: 'If the elevator support cable snaps and the cab falls freely with acceleration a = -9.81 m/s², what does the scale read?',
        options: [
          { text: 'A) 0 kg (apparent weightlessness)', correct: true },
          { text: 'B) Double the normal weight', correct: false },
          { text: 'C) 70 kg', correct: false },
          { text: 'D) Negative 70 kg', correct: false }
        ],
        explanation: 'In free-fall, both the passenger and the scale accelerate downward at g. The scale does not need to push up on the passenger to support them (F_N = 0 N), producing total apparent weightlessness.'
      }
    ]
  }
};
