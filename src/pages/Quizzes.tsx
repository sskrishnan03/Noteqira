import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  BookOpen,
  Loader2,
  Trophy,
  Clock,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank';
  options?: string[];
  correct_answer: string;
  explanation?: string;
}

export default function Quizzes() {
  const [searchParams] = useSearchParams();
  const noteId = searchParams.get('note');
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [quizComplete, setQuizComplete] = useState(false);

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ['quizzes', noteId],
    queryFn: async () => {
      let query = supabase.from('quizzes').select('*, notes(title)');
      if (noteId) {
        query = query.eq('note_id', noteId);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const currentQuiz = quizzes?.find((q) => q.id === selectedQuiz);
  const questions = currentQuiz?.questions as QuizQuestion[] | undefined;
  const currentQ = questions?.[currentQuestion];

  const score = questions
    ? questions.filter((q) => answers[q.id] === q.correct_answer).length
    : 0;

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    if (!currentQ || !selectedAnswer) return;

    setAnswers((prev) => ({ ...prev, [currentQ.id]: selectedAnswer }));
    setShowResult(true);

    setTimeout(() => {
      if (currentQuestion < (questions?.length || 0) - 1) {
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setQuizComplete(true);
      }
    }, 1500);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswers({});
    setQuizComplete(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950">
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="p-2 rounded-lg text-secondary-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary-400" />
              <h1 className="font-semibold text-white">Quizzes</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          {!selectedQuiz ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-xl font-semibold text-white mb-6">Available Quizzes</h2>

              {(!quizzes || quizzes.length === 0) ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 rounded-2xl bg-surface-800/50 flex items-center justify-center mx-auto mb-6">
                    <HelpCircle className="w-10 h-10 text-secondary-500" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No quizzes yet</h3>
                  <p className="text-secondary-400 mb-6">
                    AI will generate quizzes when you create notes
                  </p>
                  <Link to="/notes/new" className="btn-primary">
                    Create a Note
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizzes.map((quiz, i) => (
                    <motion.button
                      key={quiz.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => {
                        setSelectedQuiz(quiz.id);
                        resetQuiz();
                      }}
                      className="w-full glass-card p-5 text-left hover:border-primary-500/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-white">{quiz.title}</h3>
                          <p className="text-sm text-secondary-400 mt-1">
                            {(quiz.questions as QuizQuestion[])?.length || 0} questions
                          </p>
                          {quiz.notes && (
                            <p className="text-xs text-secondary-500 mt-2">
                              From: {(quiz.notes as { title: string }).title}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          {quiz.score !== null && (
                            <span className="text-sm text-accent-400">
                              Best: {quiz.score}/{(quiz.questions as QuizQuestion[])?.length || 0}
                            </span>
                          )}
                          <ChevronRight className="w-5 h-5 text-secondary-500" />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          ) : quizComplete ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h2>
              <p className="text-xl text-secondary-300 mb-6">
                You scored <span className="text-primary-400 font-bold">{score}</span> out of{' '}
                {questions?.length || 0}
              </p>

              <div className="flex justify-center gap-4">
                <button onClick={resetQuiz} className="btn-secondary">
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>
                <button
                  onClick={() => setSelectedQuiz(null)}
                  className="btn-primary"
                >
                  More Quizzes
                </button>
              </div>

              {/* Answer review */}
              <div className="mt-10 text-left">
                <h3 className="text-lg font-semibold text-white mb-4">Review Answers</h3>
                <div className="space-y-3">
                  {questions?.map((q, i) => {
                    const isCorrect = answers[q.id] === q.correct_answer;
                    return (
                      <div
                        key={q.id}
                        className={`p-4 rounded-xl border ${
                          isCorrect
                            ? 'bg-accent-500/5 border-accent-500/20'
                            : 'bg-red-500/5 border-red-500/20'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="font-medium text-white">{q.question}</p>
                            <p className="text-sm text-secondary-400 mt-1">
                              Correct: {q.correct_answer}
                            </p>
                            {q.explanation && (
                              <p className="text-sm text-secondary-500 mt-2">
                                {q.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Progress */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-400">
                  Question {currentQuestion + 1} of {questions?.length || 0}
                </span>
                <button
                  onClick={() => setSelectedQuiz(null)}
                  className="text-secondary-400 hover:text-white"
                >
                  Exit Quiz
                </button>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary-500"
                  animate={{
                    width: `${((currentQuestion + 1) / (questions?.length || 1)) * 100}%`,
                  }}
                />
              </div>

              {/* Question */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-medium text-white mb-6">
                  {currentQ?.question}
                </h3>

                {currentQ?.type === 'multiple_choice' && currentQ.options && (
                  <div className="space-y-3">
                    {currentQ.options.map((option, i) => {
                      const isSelected = selectedAnswer === option;
                      const isCorrect = showResult && option === currentQ.correct_answer;
                      const isWrong = showResult && isSelected && !isCorrect;

                      return (
                        <button
                          key={i}
                          onClick={() => handleAnswerSelect(option)}
                          className={`w-full p-4 rounded-xl text-left transition-all ${
                            isCorrect
                              ? 'bg-accent-500/10 border-accent-500/30'
                              : isWrong
                              ? 'bg-red-500/10 border-red-500/30'
                              : isSelected
                              ? 'bg-primary-500/10 border-primary-500/30'
                              : 'bg-surface-950/50 border-white/5 hover:border-white/10'
                          } border`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                isCorrect
                                  ? 'bg-accent-500 text-white'
                                  : isWrong
                                  ? 'bg-red-500 text-white'
                                  : isSelected
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-surface-800 text-secondary-400'
                              }`}
                            >
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span
                              className={`${
                                isCorrect
                                  ? 'text-accent-400'
                                  : isWrong
                                  ? 'text-red-400'
                                  : isSelected
                                  ? 'text-primary-400'
                                  : 'text-secondary-300'
                              }`}
                            >
                              {option}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentQ?.type === 'true_false' && (
                  <div className="flex gap-4">
                    {['True', 'False'].map((option) => {
                      const isSelected = selectedAnswer === option;
                      const isCorrect = showResult && option === currentQ.correct_answer;
                      const isWrong = showResult && isSelected && !isCorrect;

                      return (
                        <button
                          key={option}
                          onClick={() => handleAnswerSelect(option)}
                          className={`flex-1 p-6 rounded-xl text-center transition-all ${
                            isCorrect
                              ? 'bg-accent-500/10 border-accent-500/30'
                              : isWrong
                              ? 'bg-red-500/10 border-red-500/30'
                              : isSelected
                              ? 'bg-primary-500/10 border-primary-500/30'
                              : 'bg-surface-950/50 border-white/5 hover:border-white/10'
                          } border`}
                        >
                          <span
                            className={`text-lg font-medium ${
                              isCorrect
                                ? 'text-accent-400'
                                : isWrong
                                ? 'text-red-400'
                                : isSelected
                                ? 'text-primary-400'
                                : 'text-white'
                            }`}
                          >
                            {option}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Explanation (shown after answer) */}
              <AnimatePresence>
                {showResult && currentQ?.explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass-card p-4 border-primary-500/20"
                  >
                    <p className="text-sm text-secondary-300">
                      <span className="font-medium text-primary-400">Explanation: </span>
                      {currentQ.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex justify-between">
                <button
                  onClick={() => setSelectedQuiz(null)}
                  className="btn-secondary"
                >
                  Exit Quiz
                </button>
                <button
                  onClick={handleNext}
                  disabled={!selectedAnswer}
                  className="btn-primary disabled:opacity-50"
                >
                  {currentQuestion < (questions?.length || 0) - 1 ? (
                    'Next Question'
                  ) : (
                    'Finish Quiz'
                  )}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
