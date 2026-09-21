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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fadeIn text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <GraduationCap className="w-3.5 h-3.5" />
            Knowledge Assessment & Diagnostic Quiz
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Conceptual Physics Quiz</h1>
          <p className="text-slate-600 text-sm mt-1">
            Test your understanding of circuit principles, meter connections, and Ohm's Law dynamics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-blue-700 font-bold">
            Score: {totalScore} / {QUIZ_QUESTIONS.length}
          </div>
          <button
            onClick={() => onNavigate('dashboard')}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Award className="w-4 h-4 text-amber-600" />
            View Student Report
          </button>
        </div>
      </div>

      {!isFinished ? (
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 space-y-6 shadow-sm">
          {/* Progress Tracker */}
          <div className="flex items-center justify-between text-xs font-mono text-slate-500">
            <span>Question {currentIdx + 1} of {QUIZ_QUESTIONS.length}</span>
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              {currentQ.category}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
            />
          </div>

          {/* Question Title */}
          <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-relaxed">
            {currentQ.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = userChoice === idx;
              const isCorrect = idx === currentQ.correctIndex;
              const hasAnswered = userChoice !== undefined;

              let style = 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-slate-800';
              if (hasAnswered) {
                if (isCorrect) {
                  style = 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm font-semibold';
                } else if (isSelected) {
                  style = 'bg-rose-50 border-rose-400 text-rose-900 font-semibold';
                } else {
                  style = 'bg-slate-50/40 border-slate-100 opacity-50 text-slate-400';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={hasAnswered}
                  className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between text-xs md:text-sm shadow-sm ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-mono font-bold text-xs shrink-0 text-slate-700 shadow-sm">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>
                  {hasAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                  {hasAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Educational Explanation Box */}
          {showExplanation && (
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs font-mono space-y-1 text-slate-800 animate-fadeIn">
              <div className="font-bold text-blue-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Physical Explanation:
              </div>
              <p className="leading-relaxed text-slate-700 font-sans">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={handlePrev}
              disabled={currentIdx === 0}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 text-xs font-semibold border border-slate-200"
            >
              Previous
            </button>

            {userChoice !== undefined && (
              <button
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
              >
                {currentIdx < QUIZ_QUESTIONS.length - 1 ? 'Next Question' : 'Finish Quiz'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Quiz Finished Result Screen */
        <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-6 shadow-sm animate-fadeIn">
          <div className="h-20 w-20 mx-auto rounded-3xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
            <Award className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Quiz Completed!</h2>
            <p className="text-slate-600 text-sm">
              You scored <strong className="text-blue-700 text-lg">{totalScore}</strong> out of <strong className="text-slate-900 text-lg">{QUIZ_QUESTIONS.length}</strong> ({((totalScore / QUIZ_QUESTIONS.length) * 100).toFixed(0)}%).
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 flex items-center gap-2 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Quiz
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
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
