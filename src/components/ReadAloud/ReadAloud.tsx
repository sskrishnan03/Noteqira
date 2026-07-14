import { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { useReadAloud } from './useReadAloud';
import ReadAloudPlayer from './ReadAloudPlayer';
import ReadAloudSettings from './ReadAloudSettings';

interface ReadAloudProps {
  text: string;
  textRef?: React.RefObject<HTMLTextAreaElement | HTMLDivElement>;
}

export default function ReadAloud({ text, textRef }: ReadAloudProps) {
  const [showPlayer, setShowPlayer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const {
    state,
    settings,
    availableVoices,
    isSupported,
    play,
    pause,
    resume,
    stop,
    skipForward,
    skipBackward,
    getCurrentSentence,
    updateSettings,
  } = useReadAloud(text);

  const highlightedTextRef = useRef<string>('');
  const voiceOptions = useMemo(
    () => availableVoices.map(v => ({ name: v.name, lang: v.lang })),
    [availableVoices]
  );

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === ' ' && showPlayer) {
        e.preventDefault();
        if (state.isPlaying && !state.isPaused) {
          pause();
        } else if (state.isPaused) {
          resume();
        } else {
          play();
        }
      }

      if (e.key === 'Escape' && showPlayer) {
        e.preventDefault();
        stop();
        setShowPlayer(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showPlayer, state.isPlaying, state.isPaused, play, pause, resume, stop]);

  // Handle text selection
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim()) {
        // Could add a context menu option to read selection
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  // Auto-scroll to highlighted sentence
  useEffect(() => {
    if (state.isPlaying && !state.isPaused && textRef?.current) {
      const currentSentence = getCurrentSentence();
      if (currentSentence && currentSentence !== highlightedTextRef.current) {
        highlightedTextRef.current = currentSentence;
        
        // Find the sentence in the text and scroll to it
        const textElement = textRef.current;
        let textContent = '';
        
        if (textElement instanceof HTMLTextAreaElement) {
          textContent = textElement.value;
        } else {
          textContent = textElement.textContent || '';
        }
        
        const sentenceIndex = textContent.indexOf(currentSentence);
        
        if (sentenceIndex !== -1 && textElement instanceof HTMLTextAreaElement) {
          // For textarea, we can calculate approximate position
          const linesBefore = textContent.substring(0, sentenceIndex).split('\n').length;
          const lineHeight = parseInt(window.getComputedStyle(textElement).lineHeight) || 20;
          const scrollTop = (linesBefore - 5) * lineHeight;
          textElement.scrollTop = Math.max(0, scrollTop);
        }
      }
    }
  }, [state.isPlaying, state.isPaused, getCurrentSentence, textRef]);

  // Stop playback when component unmounts
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  const handlePlay = () => {
    if (!text.trim()) return;
    setShowPlayer(true);
    play();
  };

  const handleClose = () => {
    stop();
    setShowPlayer(false);
  };

  const handleSettings = () => {
    setShowSettings(prev => !prev);
  };

  if (!isSupported) {
    return null;
  }

  return (
    <>
      {/* Read Aloud Button */}
      {!showPlayer && text.trim() && (
        <button
          onClick={handlePlay}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm bg-[#1B1B1B] border border-[#2A2A2A] text-[#C8C8C8] hover:bg-white/5 hover:text-white transition-all"
          title="Read Aloud"
        >
          <Volume2 className="w-4 h-4" />
          <span>Read Aloud</span>
        </button>
      )}

      {/* Settings Panel + Floating Player */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center">
        <ReadAloudSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          voice={settings.voice}
          volume={settings.volume}
          availableVoices={voiceOptions}
          onApply={(newSettings) => updateSettings(newSettings)}
        />
        
        <AnimatePresence>
          {showPlayer && (
            <ReadAloudPlayer
              isPlaying={state.isPlaying}
              isPaused={state.isPaused}
              currentTime={state.currentTime}
              duration={state.duration}
              currentSentence={state.currentSentence}
              totalSentences={state.totalSentences}
              onPlay={play}
              onPause={pause}
              onResume={resume}
              onStop={stop}
              onSkipForward={skipForward}
              onSkipBackward={skipBackward}
              onSettings={handleSettings}
              onClose={handleClose}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
