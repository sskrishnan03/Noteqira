import { useState, useRef, useCallback, useEffect } from 'react';

interface ReadAloudSettings {
  voice: string | null;
  volume: number;
}

interface ReadAloudState {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  currentSentence: number;
  totalSentences: number;
}

const DEFAULT_SETTINGS: ReadAloudSettings = {
  voice: null,
  volume: 1,
};

export function useReadAloud(text: string) {
  const [state, setState] = useState<ReadAloudState>({
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    duration: 0,
    currentSentence: 0,
    totalSentences: 0,
  });

  const [settings, setSettings] = useState<ReadAloudSettings>(() => {
    try {
      const saved = localStorage.getItem('noteqira-read-aloud-settings');
      const parsed = saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
      const savedVolume = Number(parsed.volume);
      return {
        ...parsed,
        volume: Number.isFinite(savedVolume)
          ? Math.min(1, Math.max(0, savedVolume))
          : DEFAULT_SETTINGS.volume,
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSupported, setIsSupported] = useState(true);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sentencesRef = useRef<string[]>([]);
  const currentSentenceIndexRef = useRef(0);
  const timerRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const settingsRef = useRef(settings);
  const availableVoicesRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    availableVoicesRef.current = availableVoices;
  }, [availableVoices]);

  // Check browser support
  useEffect(() => {
    const supported = 'speechSynthesis' in window;
    setIsSupported(supported);
    
    if (supported) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };
      
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Split text into sentences
  const splitIntoSentences = useCallback((text: string): string[] => {
    if (!text.trim()) return [];
    
    // Split by sentence boundaries while preserving the delimiters
    const sentences = text.match(/[^.!?]+[.!?]+["']?|[^.!?]+$/g) || [];
    return sentences.map(s => s.trim()).filter(s => s.length > 0);
  }, []);

  // Estimate reading duration
  const estimateDuration = useCallback((text: string): number => {
    const words = text.split(/\s+/).filter(Boolean).length;
    const avgWordsPerMinute = 150;
    return Math.ceil((words / avgWordsPerMinute) * 60);
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<ReadAloudSettings>) => {
    const updated = { ...settings, ...newSettings };
    updated.volume = Math.min(1, Math.max(0, updated.volume));
    settingsRef.current = updated;
    if (utteranceRef.current) {
      utteranceRef.current.volume = updated.volume;
    }
    setSettings(updated);
    try {
      localStorage.setItem('noteqira-read-aloud-settings', JSON.stringify(updated));
    } catch {}
  }, [settings]);

  // Start playback
  const play = useCallback(() => {
    if (!isSupported || !text.trim()) return;

    // Stop any existing playback
    window.speechSynthesis.cancel();

    const sentences = splitIntoSentences(text);
    sentencesRef.current = sentences;
    currentSentenceIndexRef.current = 0;

    setState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      currentTime: 0,
      duration: estimateDuration(text),
      currentSentence: 0,
      totalSentences: sentences.length,
    }));

    // Speak first sentence
    speakSentence(0);
  }, [isSupported, text, splitIntoSentences, estimateDuration]);

  // Speak a specific sentence
  const speakSentence = useCallback((index: number) => {
    if (index >= sentencesRef.current.length) {
      // Finished speaking
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
      }));
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(sentencesRef.current[index]);
    utteranceRef.current = utterance;
    const currentSettings = settingsRef.current;

    utterance.volume = currentSettings.volume;

    // Apply voice setting
    if (currentSettings.voice) {
      const voice = availableVoicesRef.current.find(v => v.name === currentSettings.voice);
      if (voice) utterance.voice = voice;
    }

    // Handle sentence completion
    utterance.onend = () => {
      currentSentenceIndexRef.current++;
      setState(prev => ({
        ...prev,
        currentSentence: currentSentenceIndexRef.current,
      }));
      speakSentence(currentSentenceIndexRef.current);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      setState(prev => ({
        ...prev,
        isPlaying: false,
        isPaused: false,
      }));
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };

    // Start timer for progress tracking
    if (!timerRef.current) {
      startTimeRef.current = Date.now();
      timerRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setState(prev => ({
          ...prev,
          currentTime: elapsed,
        }));
      }, 100);
    }

    window.speechSynthesis.speak(utterance);
  }, []);

  // Pause playback
  const pause = useCallback(() => {
    if (state.isPlaying && !state.isPaused) {
      window.speechSynthesis.pause();
      setState(prev => ({
        ...prev,
        isPaused: true,
      }));
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [state.isPlaying, state.isPaused]);

  // Resume playback
  const resume = useCallback(() => {
    if (state.isPaused) {
      window.speechSynthesis.resume();
      setState(prev => ({
        ...prev,
        isPaused: false,
      }));
      startTimeRef.current = Date.now() - (state.currentTime * 1000);
      timerRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        setState(prev => ({
          ...prev,
          currentTime: elapsed,
        }));
      }, 100);
    }
  }, [state.isPaused, state.currentTime]);

  // Stop playback
  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setState(prev => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      currentTime: 0,
      currentSentence: 0,
    }));
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = 0;
    }
    currentSentenceIndexRef.current = 0;
  }, []);

  // Skip forward
  const skipForward = useCallback(() => {
    const nextIndex = Math.min(currentSentenceIndexRef.current + 1, sentencesRef.current.length - 1);
    window.speechSynthesis.cancel();
    currentSentenceIndexRef.current = nextIndex;
    setState(prev => ({
      ...prev,
      currentSentence: nextIndex,
    }));
    speakSentence(nextIndex);
  }, []);

  // Skip backward
  const skipBackward = useCallback(() => {
    const prevIndex = Math.max(currentSentenceIndexRef.current - 1, 0);
    window.speechSynthesis.cancel();
    currentSentenceIndexRef.current = prevIndex;
    setState(prev => ({
      ...prev,
      currentSentence: prevIndex,
    }));
    speakSentence(prevIndex);
  }, []);

  // Speak selected text only
  const speakSelection = useCallback((selectedText: string) => {
    if (!isSupported || !selectedText.trim()) return;

    window.speechSynthesis.cancel();

    const sentences = splitIntoSentences(selectedText);
    sentencesRef.current = sentences;
    currentSentenceIndexRef.current = 0;

    setState(prev => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      currentTime: 0,
      duration: estimateDuration(selectedText),
      currentSentence: 0,
      totalSentences: sentences.length,
    }));

    speakSentence(0);
  }, [isSupported, splitIntoSentences, estimateDuration]);

  // Get current sentence for highlighting
  const getCurrentSentence = useCallback((): string => {
    return sentencesRef.current[currentSentenceIndexRef.current] || '';
  }, []);

  return {
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
    speakSelection,
    getCurrentSentence,
    updateSettings,
    estimateDuration,
  };
}
