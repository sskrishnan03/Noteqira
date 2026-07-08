import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  BookOpen,
  RotateCcw,
  Check,
  X,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Star,
  Clock,
  Layers,
  Plus,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Flashcards() {
  const [searchParams] = useSearchParams();
  const noteId = searchParams.get('note');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState<'browse' | 'study'>('browse');
  const [correct, setCorrect] = useState(0);
  const [incorrect, setIncorrect] = useState(0);

  const { data: flashcards, isLoading } = useQuery({
    queryKey: ['flashcards', noteId],
    queryFn: async () => {
      let query = supabase.from('flashcards').select('*, notes(title)');
      if (noteId) {
        query = query.eq('note_id', noteId);
      }
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const currentCard = flashcards?.[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % (flashcards?.length || 1));
    }, 200);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + (flashcards?.length || 1)) % (flashcards?.length || 1));
    }, 200);
  };

  const handleCorrect = () => {
    setCorrect((prev) => prev + 1);
    handleNext();
  };

  const handleIncorrect = () => {
    setIncorrect((prev) => prev + 1);
    handleNext();
  };

  const resetStudy = () => {
    setCurrentIndex(0);
    setCorrect(0);
    setIncorrect(0);
    setIsFlipped(false);
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
              <Layers className="w-5 h-5 text-primary-400" />
              <h1 className="font-semibold text-white">Flashcards</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {flashcards && flashcards.length > 0 && (
              <div className="flex items-center gap-2 bg-surface-900/50 rounded-xl p-1">
                <button
                  onClick={() => setStudyMode('browse')}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    studyMode === 'browse'
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-secondary-400 hover:text-white'
                  }`}
                >
                  Browse
                </button>
                <button
                  onClick={() => setStudyMode('study')}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    studyMode === 'study'
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-secondary-400 hover:text-white'
                  }`}
                >
                  Study
                </button>
              </div>
            )}
            <Link to="/notes/new" className="btn-primary">
              <Plus className="w-4 h-4" />
              Create Cards
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          {(!flashcards || flashcards.length === 0) ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-2xl bg-surface-800/50 flex items-center justify-center mx-auto mb-6">
                <Layers className="w-10 h-10 text-secondary-500" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">No flashcards yet</h2>
              <p className="text-secondary-400 mb-6">
                Create AI-powered flashcards from your notes
              </p>
              <Link to="/dashboard" className="btn-primary">
                <BookOpen className="w-4 h-4" />
                Browse Notes
              </Link>
            </motion.div>
          ) : studyMode === 'study' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Progress */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-400">
                  Card {currentIndex + 1} of {flashcards.length}
                </span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-accent-400">
                    <ThumbsUp className="w-4 h-4" /> {correct}
                  </span>
                  <span className="flex items-center gap-1 text-red-400">
                    <ThumbsDown className="w-4 h-4" /> {incorrect}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentIndex + 1) / flashcards.length) * 100}%`,
                  }}
                />
              </div>

              {/* Flip card */}
              <div
                className="perspective-1000 cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <motion.div
                  className="relative glass-card min-h-[300px] flex items-center justify-center p-10"
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.5 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div
                    className={`${isFlipped ? 'opacity-0' : 'opacity-100'}`}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <p className="text-center text-xl text-white font-medium">
                      {currentCard?.front_content}
                    </p>
                    <p className="text-center text-secondary-500 mt-4 text-sm">
                      Click to reveal answer
                    </p>
                  </div>

                  <div
                    className={`absolute inset-0 flex items-center justify-center p-10 ${
                      isFlipped ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <p className="text-center text-xl text-secondary-200">
                      {currentCard?.back_content}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Difficulty buttons (show only when flipped) */}
              <AnimatePresence>
                {isFlipped && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="flex justify-center gap-4"
                  >
                    <button
                      onClick={handleIncorrect}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <X className="w-5 h-5" />
                      Hard
                    </button>
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Okay
                    </button>
                    <button
                      onClick={handleCorrect}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-500/10 text-accent-400 hover:bg-accent-500/20 transition-colors"
                    >
                      <Check className="w-5 h-5" />
                      Easy
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={handlePrev}
                  className="btn-secondary"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
                <button onClick={resetStudy} className="btn-secondary">
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <p className="text-secondary-400 mb-4">
                {flashcards.length} flashcard{flashcards.length !== 1 ? 's' : ''}
              </p>
              <div className="grid gap-4">
                {flashcards.map((card, i) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-white font-medium mb-2">{card.front_content}</p>
                        <p className="text-secondary-400">{card.back_content}</p>
                        {card.notes && (
                          <p className="text-xs text-secondary-500 mt-2 flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {(card.notes as { title: string })?.title}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            card.difficulty === 'easy'
                              ? 'bg-accent-500/10 text-accent-400'
                              : card.difficulty === 'hard'
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-amber-500/10 text-amber-400'
                          }`}
                        >
                          {card.difficulty}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-xs text-secondary-500">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {card.review_count} reviews
                      </span>
                      <span className="flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {card.correct_count} correct
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(card.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
