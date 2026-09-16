# Interactive Ohm's Law Virtual Laboratory 🔬⚡

An interactive, high-fidelity virtual physics laboratory web application for the **Verification of Ohm's Law ($V = IR$)**. Designed for school and undergraduate physics students, this simulation replicates the tangible experience of assembling real electrical apparatus on a laboratory workbench.

![Laboratory Banner](https://img.shields.io/badge/Physics-Simulation-cyan?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)

---

## 🌟 Key Features

### 1. Hands-on Circuit Workbench
- **Real Component Mechanics**: Connect DC Power Supply, Key Knife Switch, Precision Ammeter (series), Wire-Wound Resistor, and Precision Voltmeter (parallel).
- **Interactive Wires**: Click or drag between binding posts to establish connections. Realistic cubic bezier cable drape with magnetic proximity snapping ($32\text{ px}$).
- **Single-Wire Disconnect**: Hover over any wire to reveal a quick-disconnect scissors button.
- **Draggable Workbench Layout**: Move components around the bench; flexible rubber cables re-curve dynamically.

### 2. CK-12 & PhET Inspired Advanced Physics Controls
- **Dual Realistic vs. Schematic Mode**:
  - **Realistic Mode**: 3D-styled physical apparatus, ceramic resistors with standard 4-band color code rings, brass knife switch, dual-scale analog/digital meters.
  - **Schematic Mode**: Standard IEEE electrical engineering diagram symbols (DC cell, zig-zag resistor, circle meters, switch contacts).
- **Simulation Speed Control**:
  - Toggle between **0.25x (Slow Motion)**, **1.0x (Real-Time)**, and **2.0x (High-Speed)** to study charge carrier drift.
  - Switchable between **Conventional Current ($+ \to -$)** and **Electron Drift ($- \to +$)**.
- **Joule Heating & Power Dissipation ($P = I^2 R = V \cdot I$)**:
  - Real-time power monitor in Watts. Resistor displays thermal glow under high power, demonstrating why constant temperature is an essential condition of Ohm's Law.

### 3. Precision Instrumentation & Observation
- **Dual Analog & Digital Readout**:
  - Ammeter: Pivoting analog galvanometer needle ($0–1.00\text{ A}$) + 7-segment digital LCD readout.
  - Voltmeter: Calibrated analog curved dial ($0–10.0\text{ V}$) + digital OLED readout.
- **Pedagogical Circuit Diagnostics**:
  - Real-time safety engine detects short circuits, ammeter connected in parallel, voltmeter connected in series, and open circuits with constructive explanations.
- **Observation Table**: Manual "Record Reading" button forces active observation. Computes $R = V/I$ for each trial.

### 4. Mathematical Graphing & Hypothesis Verification
- **$V-I$ Characteristic Plot**: Plots recorded points with voltage on the Y-axis and current on the X-axis.
- **Dynamic Operating Point Tracker**: Real-time pulsing marker tracks live $(I(t), V(t))$ on the graph as voltage adjusts.
- **Linear Regression Best-Fit Line**: Computes experimental resistance from graph slope ($\text{Slope} = \Delta V / \Delta I = R$).
- **Percentage Error**: Compares experimental vs. nominal resistance with $|R_{\text{exp}} - R_{\text{nom}}| / R_{\text{nom}} \times 100\%$.
- **Hypothesis Verification Modal**: Interactive scientific conclusion debrief with celebratory confetti.

### 5. Gamification, Challenges & Assessment
- **3-Level Progressive Hint Drawer**: Concept clue $\to$ Placement clue $\to$ Full wiring schematic.
- **Scenario Challenges**: Target Current verification, Mystery Resistor identification, Voltmeter troubleshooting, Overcurrent hazard resolution.
- **Conceptual Quiz**: 8-question randomized diagnostic quiz with in-depth physics explanations.
- **Student Dashboard & Report**: 100-point rubric breakdown, metrics, and printable certificate.
- **Teacher Mode**: Custom nominal resistor banks, voltage limits, and experimental measurement noise ($\pm 1.2\%$).

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Custom Laboratory Glassmorphism Tokens
- **Icons**: Lucide React
- **Audio Engine**: Procedural Web Audio API (Zero external MP3 dependencies)
- **Effects**: Canvas Confetti

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation
```bash
# Clone the repository
git clone https://github.com/SakshamChawla76/ohms-law-virtual-lab.git

# Navigate to project directory
cd ohms-law-virtual-lab

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open [http://localhost:5188](http://localhost:5188) in your browser.

---

## 📜 License

MIT License © 2026 Saksham Chawla.
