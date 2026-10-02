import React from 'react';
import { 
  Award, 
  CheckCircle2, 
  FileText, 
  RotateCcw, 
  BookOpen, 
  Printer,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { sounds } from '../../engine/audioEffects';

export const StudentDashboard = ({
  scoreState,
  trials,
  quizScore,
  nominalResistance,
  onRestart,
  onNavigateToLab,
}) => {
  const totalScore = Math.max(0, 
    scoreState.circuitAssembly + 
    scoreState.meterConnection + 
    scoreState.measurements + 
    scoreState.calculations + 
    scoreState.graphAnalysis - 
    scoreState.penalties
  );

  const isPassed = totalScore >= 60;

  const handlePrint = () => {
    sounds.playTick();
    window.print();
  };

  // Circular progress calculations for SVG ring
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, totalScore) / 100) * circumference;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fadeIn text-slate-100">
      {/* Printable Report Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 print:border-black">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1 print:text-black">
            <Award className="w-3.5 h-3.5 text-cyan-400 print:text-black" />
            Official Laboratory Performance Report
          </div>
          <h1 className="text-3xl font-extrabold text-white print:text-black tracking-tight">
            Experiment Dashboard & Assessment
          </h1>
          <p className="text-slate-400 text-sm mt-1 print:text-slate-700">
            Comprehensive evaluation of practical circuit skills, real-time telemetry, and conceptual mastery.
          </p>
        </div>

        <div className="flex items-center gap-2.5 print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold text-xs border border-white/10 flex items-center gap-2 transition-all shadow-sm hover:border-cyan-500/30"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            Print / Save PDF
          </button>

          <button
            onClick={onRestart}
            className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-xs flex items-center gap-2 transition-all shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            Restart Experiment
          </button>
        </div>
      </div>

      {/* Main Scorecard Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl relative overflow-hidden print:bg-white print:text-black print:border-black">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none print:hidden" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center relative z-10">
          {/* Circular Badge with SVG Radial Meter */}
          <div className="flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-white/10 print:border-gray-300">
            <div className="relative h-32 w-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 110 110">
                {/* Track */}
                <circle
                  cx="55"
                  cy="55"
                  r={radius}
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="8"
                  fill="none"
                  className="print:stroke-gray-200"
                />
                {/* Glowing Progress */}
                <circle
                  cx="55"
                  cy="55"
                  r={radius}
                  stroke={isPassed ? '#10b981' : '#f43f5e'}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-1000 ease-out"
                  style={{
                    filter: isPassed ? 'drop-shadow(0 0 6px rgba(16, 185, 129, 0.6))' : 'drop-shadow(0 0 6px rgba(244, 63, 94, 0.6))'
                  }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`text-3xl font-black font-mono tracking-tight ${isPassed ? 'text-emerald-400 print:text-emerald-700' : 'text-rose-400 print:text-rose-700'}`}>
                  {totalScore}
                </span>
                <span className="text-[10px] font-mono text-slate-400 print:text-slate-600 uppercase">out of 100</span>
              </div>
            </div>

            <span className={`text-xs font-bold uppercase tracking-wider mt-3 px-3 py-1 rounded-full border ${
              isPassed 
                ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30 print:text-emerald-800' 
                : 'text-rose-300 bg-rose-500/10 border-rose-500/30 print:text-rose-800'
            }`}>
              {isPassed ? 'VERIFICATION PASSED' : 'REVISION RECOMMENDED'}
            </span>
          </div>

          {/* Metrics */}
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 space-y-1 hover:border-cyan-500/30 transition-all print:bg-gray-100 print:border-gray-300">
              <span className="text-slate-400 print:text-slate-600 text-[10px] uppercase block tracking-wider">Recorded Trials</span>
              <span className="text-2xl font-bold text-white print:text-black">{trials.length} / 5</span>
              <span className="text-emerald-400 print:text-emerald-700 text-[10px] block font-semibold flex items-center gap-1">
                ✓ Complete Data
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 space-y-1 hover:border-cyan-500/30 transition-all print:bg-gray-100 print:border-gray-300">
              <span className="text-slate-400 print:text-slate-600 text-[10px] uppercase block tracking-wider">Circuit Topology</span>
              <span className="text-2xl font-bold text-emerald-400 print:text-emerald-700">Valid</span>
              <span className="text-slate-400 print:text-slate-600 text-[10px] block truncate">Series & Parallel OK</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 space-y-1 hover:border-cyan-500/30 transition-all print:bg-gray-100 print:border-gray-300">
              <span className="text-slate-400 print:text-slate-600 text-[10px] uppercase block tracking-wider">Quiz Accuracy</span>
              <span className="text-2xl font-bold text-amber-400 print:text-amber-700">{quizScore} / 8</span>
              <span className="text-slate-400 print:text-slate-600 text-[10px] block">{((quizScore / 8) * 100).toFixed(0)}% Score</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 space-y-1 hover:border-cyan-500/30 transition-all print:bg-gray-100 print:border-gray-300">
              <span className="text-slate-400 print:text-slate-600 text-[10px] uppercase block tracking-wider">Resistor Tested</span>
              <span className="text-2xl font-bold text-cyan-400 print:text-cyan-700">{nominalResistance} Ω</span>
              <span className="text-slate-400 print:text-slate-600 text-[10px] block">Ohmic Load</span>
            </div>
          </div>
        </div>
      </div>

      {/* 100-Point Rubric Breakdown */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl space-y-4 print:bg-white print:text-black print:border-black">
        <h2 className="text-base font-bold text-white print:text-black flex items-center gap-2 tracking-tight">
          <FileText className="w-4 h-4 text-cyan-400" />
          Laboratory Grading Rubric (100 Point Scale)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 hover:border-cyan-500/30 transition-all print:bg-gray-50 print:border-gray-300">
            <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase">1. Assembly</span>
            <div className="text-xl font-bold text-emerald-400 print:text-emerald-700 mt-1">{scoreState.circuitAssembly} / 20</div>
            <p className="text-[10px] text-slate-400 print:text-slate-600 mt-1.5 leading-relaxed">Closed series loop with supply & switch.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 hover:border-cyan-500/30 transition-all print:bg-gray-50 print:border-gray-300">
            <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase">2. Meters</span>
            <div className="text-xl font-bold text-emerald-400 print:text-emerald-700 mt-1">{scoreState.meterConnection} / 20</div>
            <p className="text-[10px] text-slate-400 print:text-slate-600 mt-1.5 leading-relaxed">Ammeter in series, voltmeter in parallel.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 hover:border-cyan-500/30 transition-all print:bg-gray-50 print:border-gray-300">
            <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase">3. Data</span>
            <div className="text-xl font-bold text-emerald-400 print:text-emerald-700 mt-1">{scoreState.measurements} / 20</div>
            <p className="text-[10px] text-slate-400 print:text-slate-600 mt-1.5 leading-relaxed">Recording 5+ distinct (V, I) trials.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 hover:border-cyan-500/30 transition-all print:bg-gray-50 print:border-gray-300">
            <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase">4. R = V/I Calc</span>
            <div className="text-xl font-bold text-emerald-400 print:text-emerald-700 mt-1">{scoreState.calculations} / 20</div>
            <p className="text-[10px] text-slate-400 print:text-slate-600 mt-1.5 leading-relaxed">Precise trial resistance computing.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-white/10 hover:border-cyan-500/30 transition-all print:bg-gray-50 print:border-gray-300">
            <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase">5. Graph Analysis</span>
            <div className="text-xl font-bold text-emerald-400 print:text-emerald-700 mt-1">{scoreState.graphAnalysis} / 20</div>
            <p className="text-[10px] text-slate-400 print:text-slate-600 mt-1.5 leading-relaxed">Slope = R linear regression verified.</p>
          </div>
        </div>

        {scoreState.penalties > 0 && (
          <div className="text-xs font-mono text-rose-300 bg-rose-500/10 p-3 rounded-2xl border border-rose-500/30 flex items-center justify-between">
            <span>Deductions Applied (Hints & Short-Circuit Faults):</span>
            <span className="font-bold text-rose-400">-{scoreState.penalties} Points</span>
          </div>
        )}
      </div>

      {/* Qualitative Feedback & Recommended Study */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl space-y-4 print:bg-white print:border-black print:text-black">
          <h3 className="text-sm font-bold text-emerald-400 print:text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Demonstrated Strengths
          </h3>
          <ul className="space-y-3 text-xs text-slate-300 print:text-slate-700 leading-relaxed">
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Correct identification and wiring of basic electrical laboratory apparatus.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Accurate observation of analog and digital meters without premature conclusion.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Linear regression verification that slope ΔV/ΔI equals ohmic resistance.</span>
            </li>
          </ul>
        </div>

        <div className="p-6 md:p-8 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-xl shadow-xl space-y-4 print:bg-white print:border-black print:text-black">
          <h3 className="text-sm font-bold text-cyan-400 print:text-blue-700 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            Recommended Next Topics
          </h3>
          <div className="space-y-3 text-xs text-slate-300 print:text-slate-700">
            <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-white/10 print:bg-gray-50 print:border-gray-300">
              <strong className="text-white print:text-black block mb-0.5">1. Series and Parallel Combination Circuits</strong>
              <span className="text-slate-400 print:text-slate-600">Explore how equivalent resistance behaves when combining multiple resistors.</span>
            </div>
            <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-white/10 print:bg-gray-50 print:border-gray-300">
              <strong className="text-white print:text-black block mb-0.5">2. Non-Ohmic Conductors</strong>
              <span className="text-slate-400 print:text-slate-600">Investigate filament lamps and semiconductor diodes where resistance varies dynamically with temperature and voltage.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Return to Lab CTA */}
      <div className="text-center pt-2 print:hidden">
        <button
          onClick={onNavigateToLab}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 active:scale-95 transition-all inline-flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Return to Virtual Laboratory Workspace
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

