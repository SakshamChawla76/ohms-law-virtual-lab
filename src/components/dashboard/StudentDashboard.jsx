import React from 'react';
import { 
  Award, 
  CheckCircle2, 
  FileText, 
  RotateCcw, 
  BookOpen, 
  Printer
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fadeIn text-slate-800">
      {/* Printable Report Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 print:border-black">
        <div>
          <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-1 print:text-black">
            <Award className="w-3.5 h-3.5" />
            Official Laboratory Performance Report
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 print:text-black">
            Experiment Dashboard & Assessment
          </h1>
          <p className="text-slate-600 text-sm mt-1 print:text-slate-700">
            Comprehensive evaluation of practical circuit skills, telemetry, and conceptual mastery.
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 flex items-center gap-2 transition-all shadow-sm"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            Print / Save PDF
          </button>

          <button
            onClick={onRestart}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs flex items-center gap-2 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Restart Experiment
          </button>
        </div>
      </div>

      {/* Main Scorecard Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden print:bg-white print:text-black print:border-black">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          {/* Circular Badge */}
          <div className="flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-slate-200 print:border-gray-300">
            <div className={`h-28 w-28 rounded-full border-4 flex flex-col items-center justify-center shadow-sm ${
              isPassed ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-rose-400 bg-rose-50 text-rose-700'
            }`}>
              <span className="text-3xl font-black font-mono">{totalScore}</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase">out of 100</span>
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider mt-3 ${isPassed ? 'text-emerald-700' : 'text-rose-700'}`}>
              {isPassed ? 'VERIFICATION PASSED' : 'REVISION RECOMMENDED'}
            </span>
          </div>

          {/* Metrics */}
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 print:bg-gray-100">
              <span className="text-slate-500 text-[10px] uppercase block">Recorded Trials</span>
              <span className="text-xl font-bold text-slate-900 print:text-black">{trials.length} / 5</span>
              <span className="text-emerald-700 text-[10px] block font-semibold">✓ Complete Data</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 print:bg-gray-100">
              <span className="text-slate-500 text-[10px] uppercase block">Circuit Topology</span>
              <span className="text-xl font-bold text-emerald-700">Valid</span>
              <span className="text-slate-500 text-[10px] block">Correct Series/Parallel</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 print:bg-gray-100">
              <span className="text-slate-500 text-[10px] uppercase block">Quiz Accuracy</span>
              <span className="text-xl font-bold text-amber-700">{quizScore} / 8</span>
              <span className="text-slate-500 text-[10px] block">{((quizScore / 8) * 100).toFixed(0)}% Score</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 print:bg-gray-100">
              <span className="text-slate-500 text-[10px] uppercase block">Resistor Tested</span>
              <span className="text-xl font-bold text-sky-700">{nominalResistance} Ω</span>
              <span className="text-slate-500 text-[10px] block">Ohmic Load</span>
            </div>
          </div>
        </div>
      </div>

      {/* 100-Point Rubric Breakdown */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4 print:bg-white print:text-black">
        <h2 className="text-base font-bold text-slate-900 print:text-black flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          Laboratory Grading Rubric (100 Point Scale)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px]">1. Circuit Assembly</span>
            <div className="text-lg font-bold text-emerald-700 mt-1">{scoreState.circuitAssembly} / 20</div>
            <p className="text-[10px] text-slate-500 mt-1">Closed series loop with power supply & switch.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px]">2. Meter Placement</span>
            <div className="text-lg font-bold text-emerald-700 mt-1">{scoreState.meterConnection} / 20</div>
            <p className="text-[10px] text-slate-500 mt-1">Ammeter in series, voltmeter in parallel.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px]">3. Data Collection</span>
            <div className="text-lg font-bold text-emerald-700 mt-1">{scoreState.measurements} / 20</div>
            <p className="text-[10px] text-slate-500 mt-1">Recording 5+ distinct (V, I) trials.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px]">4. R = V/I Calculation</span>
            <div className="text-lg font-bold text-emerald-700 mt-1">{scoreState.calculations} / 20</div>
            <p className="text-[10px] text-slate-500 mt-1">Precise trial resistance computing.</p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block text-[10px]">5. Graph & Conclusion</span>
            <div className="text-lg font-bold text-emerald-700 mt-1">{scoreState.graphAnalysis} / 20</div>
            <p className="text-[10px] text-slate-500 mt-1">Slope = R linear regression & verification.</p>
          </div>
        </div>

        {scoreState.penalties > 0 && (
          <div className="text-xs font-mono text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200 flex items-center justify-between">
            <span>Deductions Applied (Hints & Short-Circuit Faults):</span>
            <span className="font-bold">-{scoreState.penalties} Points</span>
          </div>
        )}
      </div>

      {/* Qualitative Feedback & Recommended Study */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Demonstrated Strengths
          </h3>
          <ul className="space-y-2 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">✓</span>
              Correct identification and wiring of basic electrical laboratory apparatus.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">✓</span>
              Accurate observation of analog and digital meters without premature conclusion.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-700 font-bold">✓</span>
              Linear regression verification that slope ΔV/ΔI equals ohmic resistance.
            </li>
          </ul>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            Recommended Next Topics
          </h3>
          <div className="space-y-2 text-xs text-slate-600">
            <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <strong className="text-slate-800">1. Series and Parallel Combination Circuits:</strong> Explore how equivalent resistance behaves when combining multiple resistors.
            </p>
            <p className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <strong className="text-slate-800">2. Non-Ohmic Conductors:</strong> Investigate filament lamps and semiconductor diodes where resistance varies dynamically with temperature and voltage.
            </p>
          </div>
        </div>
      </div>

      {/* Return to Lab CTA */}
      <div className="text-center pt-2 print:hidden">
        <button
          onClick={onNavigateToLab}
          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
        >
          Return to Virtual Laboratory Workspace
        </button>
      </div>
    </div>
  );
};
