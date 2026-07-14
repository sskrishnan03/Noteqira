import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  Volume2,
  Settings as SettingsIcon,
  X,
} from 'lucide-react';

interface ReadAloudPlayerProps {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  currentSentence: number;
  totalSentences: number;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onSettings: () => void;
  onClose: () => void;
}

export default function ReadAloudPlayer({
  isPlaying,
  isPaused,
  currentTime,
  duration,
  currentSentence,
  totalSentences,
  onPlay,
  onPause,
  onResume,
  onStop,
  onSkipForward,
  onSkipBackward,
  onSettings,
  onClose,
}: ReadAloudPlayerProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="w-[min(92vw,600px)]"
    >
      <div className="bg-[#161616] border border-[#2A2A2A] rounded-2xl shadow-2xl p-4 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-white/60" />
            <span className="text-sm text-white/80">Reading Aloud</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onSettings}
              className="p-1.5 rounded-lg text-[#555555] hover:text-white hover:bg-white/5 transition-all"
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#555555] hover:text-white hover:bg-white/5 transition-all"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="h-1.5 bg-[#1B1B1B] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white/60 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs text-[#555555] tabular-nums">
              {formatTime(currentTime)}
            </span>
            <span className="text-xs text-[#555555]">
              Sentence {currentSentence + 1} of {totalSentences}
            </span>
            <span className="text-xs text-[#555555] tabular-nums">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onSkipBackward}
            className="p-2 rounded-xl text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-all"
            title="Skip back 10 seconds"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={onStop}
            className="p-2 rounded-xl text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-all"
            title="Stop"
          >
            <Square className="w-5 h-5" />
          </button>

          <button
            onClick={isPlaying && !isPaused ? onPause : isPaused ? onResume : onPlay}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-all"
            title={isPlaying && !isPaused ? 'Pause' : isPaused ? 'Resume' : 'Play'}
          >
            {isPlaying && !isPaused ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={onSkipForward}
            className="p-2 rounded-xl text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-all"
            title="Skip forward 10 seconds"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
