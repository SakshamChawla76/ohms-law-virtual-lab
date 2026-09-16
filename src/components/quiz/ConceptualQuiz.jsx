import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  GraduationCap, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Sparkles,
  Award
} from 'lucide-react';
import { QUIZ_QUESTIONS } from '../../config/quizData';
import { sounds } from '../../engine/audioEffects';

export const ConceptualQuiz = ({
  onNavigate,
  onUpdateQuizScore,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = QUIZ_QUESTIONS[currentIdx];
  const userChoice = selectedAnswers[currentQ.id];

  const handleSelect = (choiceIdx) => {
    if (userChoice !== undefined) return; // already answered
    const nextAnswers = { ...selectedAnswers, [currentQ.id]: choiceIdx };
    setSelectedAnswers(nextAnswers);
    setShowExplanation(true);

    if (choiceIdx === currentQ.correctIndex) {
      sounds.playSuccess();
    } else {
      sounds.playSnap();
    }

    // Check if last question
    if (Object.keys(nextAnswers).length === QUIZ_QUESTIONS.length) {
      const correctCount = QUIZ_QUESTIONS.filter(q => nextAnswers[q.id] === q.correctIndex).length;
      onUpdateQuizScore(correctCount);
      if (correctCount >= 6) {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    }
  };

  const handleNext = () => {
    sounds.playTick();
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setShowExplanation(selectedAnswers[QUIZ_QUESTIONS[currentIdx + 1]?.id] !== undefined);
    } else {
      setIsFinished(true);
    }
  };

  const handlePrev = () => {
    sounds.playTick();
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
      setShowExplanation(selectedAnswers[QUIZ_QUESTIONS[currentIdx - 1]?.id] !== undefined);
    }
  };

  const handleRestart = () => {
    sounds.playSnap();
    setSelectedAnswers({});
    setCurrentIdx(0);
    setShowExplanation(false);
    setIsFinished(false);
  };

  const totalScore = QUIZ_QUESTIONS.filter(q => selectedAnswers[q.id] === q.correctIndex).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <GraduationCap className="w-3.5 h-3.5" />
            Knowledge Assessment & Diagnostic Quiz
          </div>
          <h1 className="text-3xl font-extrabold text-white">Conceptual Physics Quiz</h1>
          <p className="text-slate-300 text-sm mt-1">
            Test your understanding of circuit principles, meter connections, and Ohm's Law dynamics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-cyan-300">
            Score: {totalScore} / {QUIZ_QUESTIONS.length}
          </div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-white/10 flex items-center gap-1.5 transition-all"
          >
            <Award className="w-4 h-4 text-amber-400" />
            View Student Report
          </button>
        </div>
      </div>

      {!isFinished ? (
        <div className="p-6 md:p-8 rounded-3xl glass-panel border border-cyan-500/30 space-y-6 shadow-2xl">
          {/* Progress Tracker */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}</span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-white/10">
              {currentQ.category}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-cyan-400 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
            />
          </div>

          {/* Question Title */}
          <h2 className="text-lg md:text-xl font-bold text-white leading-relaxed">
            {currentQ.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = userChoice === idx;
              const isCorrect = idx === currentQ.correctIndex;
              const hasAnswered = userChoice !== undefined;

              let style = 'bg-slate-900/80 border-white/10 hover:bg-slate-800/80 hover:border-cyan-500/40 text-slate-200';
              if (hasAnswered) {
                if (isCorrect) {
                  style = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-glow-emerald';
                } else if (isSelected) {
                  style = 'bg-rose-950/60 border-rose-500 text-rose-200';
                } else {
                  style = 'bg-slate-900/40 border-white/5 opacity-50 text-slate-400';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={hasAnswered}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between text-xs md:text-sm ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>
                  {hasAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                  {hasAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Educational Explanation Box */}
          {showExplanation && (
            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono space-y-1 text-slate-200 animate-fadeIn">
              <div className="font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Physical Explanation:
              </div>
              <p className="leading-relaxed text-slate-300">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="px-4 py-2 rounded-xl bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-semibold border border-white/10"
            >
              Previous
            </button>

            {userChoice !== undefined && (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-glow-cyan"
              >
                {currentIdx < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'Finish Quiz'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Quiz Finished Result Screen */
        <div className="p-8 rounded-3xl glass-panel border border-cyan-500/40 text-center space-y-6 shadow-2xl animate-fadeIn">
          <div className="h-20 w-20 mx-auto rounded-3xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-glow-cyan">
            <Award className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Quiz Completed!</h2>
            <p className="text-slate-300 text-sm">
              You scored <strong className="text-cyan-300 text-lg">{totalScore}</strong> out of <strong className="text-white text-lg">{QUIZ_QUESTIONS.length}</strong> ({((totalScore / QUIZ_QUESTIONS.length) * 100).toFixed(0)}%).
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-white/10 flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Quiz
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-glow-cyan"
            >
              <Award className="w-4 h-4" />
              View Student Dashboard & Certificate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
