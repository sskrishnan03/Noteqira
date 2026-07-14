declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, ArrowLeft, Square, Pause, X,
  Copy, Trash2, Download, FileText, RotateCcw,
  AlertCircle, Save, Type, Minus, Plus,
  Undo2, Redo2, Maximize2, Minimize2, Printer, Clipboard,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/data';
import { exportPDF } from '@/lib/export';
import ReadAloud from '@/components/ReadAloud/ReadAloud';

type Status = 'idle' | 'recording' | 'paused';

export default function VoiceNotePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<Status>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [browserSupported, setBrowserSupported] = useState(true);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [editorExpanded, setEditorExpanded] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showHeaderExportMenu, setShowHeaderExportMenu] = useState(false);
  const headerExportMenuRef = useRef<HTMLDivElement>(null);
  const [showStatsExportMenu, setShowStatsExportMenu] = useState(false);
  const statsExportMenuRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState(() => {
    try { return parseInt(localStorage.getItem('noteqira-font-size') || '15'); }
    catch { return 15; }
  });

  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);

  const handleTranscriptChange = (val: string) => {
    setUndoStack(prev => [...prev.slice(-49), transcript]);
    setRedoStack([]);
    setTranscript(val);
  };

  const undo = () => {
    if (!undoStack.length) return;
    setRedoStack(prev => [...prev, transcript]);
    setTranscript(undoStack[undoStack.length - 1]);
    setUndoStack(prev => prev.slice(0, -1));
  };

  const redo = () => {
    if (!redoStack.length) return;
    setUndoStack(prev => [...prev, transcript]);
    setTranscript(redoStack[redoStack.length - 1]);
    setRedoStack(prev => prev.slice(0, -1));
  };

  const changeFontSize = (delta: number) => {
    setFontSize(prev => {
      const next = Math.min(Math.max(prev + delta, 10), 28);
      localStorage.setItem('noteqira-font-size', String(next));
      return next;
    });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (headerExportMenuRef.current && !headerExportMenuRef.current.contains(e.target as Node)) setShowHeaderExportMenu(false);
      if (statsExportMenuRef.current && !statsExportMenuRef.current.contains(e.target as Node)) setShowStatsExportMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const lastClickRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fullscreenCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const supported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    setBrowserSupported(supported);
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, interimText]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.height = 'auto';
      editorRef.current.style.height = editorRef.current.scrollHeight + 'px';
    }
  }, [transcript]);

  useEffect(() => {
    if (!title && transcript) {
      setTitle(transcript.split('\n')[0].slice(0, 60).trim() || '');
    }
  }, [transcript]);

  useEffect(() => {
    if (transcript) {
      const timer = setTimeout(() => {
        try {
          localStorage.setItem('voice-note-draft', JSON.stringify({ title, transcript, updatedAt: new Date().toISOString() }));
        } catch { }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [transcript, title]);

  useEffect(() => {
    try {
      const draft = localStorage.getItem('voice-note-draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.transcript) {
          setTranscript(parsed.transcript);
          setTitle(parsed.title || '');
        }
      }
    } catch { }
  }, []);

  useEffect(() => {
    if (!showFullscreen && status === 'idle' && animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
  }, [status, showFullscreen]);

  const cleanup = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { }
      recognitionRef.current = null;
    }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = 0; }
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = 0; }
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
    analyserRef.current = null;
  }, []);

  const drawWaveform = useCallback((analyser: AnalyserNode, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const radius = 70;
    const bars = 48;

    const draw = () => {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setAudioLevel(Math.min(avg / 128, 1));

      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
        const freqIndex = Math.floor((i / bars) * dataArray.length);
        const value = dataArray[freqIndex] / 255;
        const barHeight = 4 + value * 24;
        const innerR = radius - 8;
        const x1 = cx + Math.cos(angle) * innerR;
        const y1 = cy + Math.sin(angle) * innerR;
        const x2 = cx + Math.cos(angle) * (innerR + barHeight);
        const y2 = cy + Math.sin(angle) * (innerR + barHeight);
        ctx.strokeStyle = `rgba(255,255,255,${0.15 + value * 0.5})`;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  }, []);

  const drawFullscreenWaveform = useCallback((analyser: AnalyserNode, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const radius = 120;
    const bars = 72;

    const draw = () => {
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setAudioLevel(Math.min(avg / 128, 1));

      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2 - Math.PI / 2;
        const freqIndex = Math.floor((i / bars) * dataArray.length);
        const value = dataArray[freqIndex] / 255;
        const barHeight = 6 + value * 40;
        const innerR = radius - 12;
        const x1 = cx + Math.cos(angle) * innerR;
        const y1 = cy + Math.sin(angle) * innerR;
        const x2 = cx + Math.cos(angle) * (innerR + barHeight);
        const y2 = cy + Math.sin(angle) * (innerR + barHeight);
        ctx.strokeStyle = `rgba(255,255,255,${0.1 + value * 0.6})`;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  }, []);

  const setupAudio = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    audioContextRef.current = new AudioContext();
    const source = audioContextRef.current.createMediaStreamSource(stream);
    const analyser = audioContextRef.current.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;
    return analyser;
  }, []);

  const setupRecognition = useCallback((): any => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let final = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (final) setTranscript(prev => prev + final);
      setInterimText(interim);
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      if (status === 'recording' || showFullscreen) {
        try {
          recognition.start();
        } catch { }
      }
    };

    return recognition;
  }, [status, showFullscreen]);

  const startRecording = useCallback(async (useFullscreenCanvas: boolean = false) => {
    setError(null);
    try {
      const analyser = await setupAudio();
      if (useFullscreenCanvas && fullscreenCanvasRef.current) {
        drawFullscreenWaveform(analyser, fullscreenCanvasRef.current);
      } else if (canvasRef.current) {
        drawWaveform(analyser, canvasRef.current);
      } else {
        drawWaveform(analyser, canvasRef.current!);
      }

      const recognition = setupRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        recognition.start();
      }

      setStatus('recording');
      setDuration(0);
      timerRef.current = window.setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Microphone access was denied. Please allow microphone permissions in your browser settings and try again.');
      } else {
        setError('Could not access your microphone. Please check your device connections and try again.');
      }
    }
  }, [setupAudio, setupRecognition, drawWaveform, drawFullscreenWaveform]);

  const stopRecording = useCallback(() => {
    cleanup();
    setStatus('idle');
    setInterimText('');
    setAudioLevel(0);
  }, [cleanup]);

  const handleSingleClick = () => {
    const now = Date.now();
    if (now - lastClickRef.current < 400) return;
    lastClickRef.current = now;

    if (status === 'idle') startRecording(false);
    else if (status === 'recording') stopRecording();
  };

  const handleDoubleClick = () => {
    if (status === 'recording') {
      stopRecording();
    }
    setShowFullscreen(true);
    setTimeout(() => startRecording(true), 400);
  };

  const closeFullscreen = useCallback(() => {
    cleanup();
    setShowFullscreen(false);
    setStatus('idle');
    setAudioLevel(0);
  }, [cleanup]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const noteData = {
        title: title || 'Voice Note',
        content_plain: transcript,
        content: { type: 'doc', content: [{ type: 'paragraph', content: transcript }] },
        source_type: 'voice',
        word_count: transcript.split(/\s+/).filter(Boolean).length,
      };
      const data = await db.createNote(noteData);
      await db.createActivity({
        action: 'created', resource_type: 'note', resource_id: data.id,
        metadata: { title: noteData.title, source_type: 'voice' },
      });
      localStorage.removeItem('voice-note-draft');
      return data;
    },
    onSuccess: (data) => {
      toast.success('Voice note saved!');
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      navigate(`/notes/${data.id}`, { replace: true });
    },
    onError: () => toast.error('Failed to save note'),
  });

  const copyTranscript = () => {
    navigator.clipboard.writeText(transcript).then(() => toast.success('Copied'));
  };

  const clearTranscript = () => {
    setTranscript('');
    setInterimText('');
    setTitle('');
    setDuration(0);
    localStorage.removeItem('voice-note-draft');
    toast.success('Cleared');
  };

  const exportText = () => {
    const blob = new Blob([transcript], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${title || 'voice-note'}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportDoc = () => {
    const name = title || 'Voice Note';
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${name}</title></head><body style="font-family:Calibri,'Segoe UI',Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.6;color:#1a1a1a;background:#fff;"><h1 style="font-size:26px;margin-bottom:16px;border-bottom:2px solid #e0e0e0;padding-bottom:8px;">${name}</h1>${transcript.split('\n').filter(p => p.trim()).map(p => `<p style="margin-bottom:10px;font-size:14px;">${p}</p>`).join('\n')}<hr style="margin-top:32px;border:none;border-top:1px solid #eee;"><p style="color:#888;font-size:12px;">Recorded on ${new Date().toLocaleString()}</p></body></html>`;
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${name}.doc`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDFile = () => {
    exportPDF(title || 'Voice Note', transcript);
  };

  const exportMarkdown = () => {
    const name = title || 'voice-note';
    const md = `# ${name}\n\n${transcript}`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${name}.md`; a.click();
    URL.revokeObjectURL(url);
  };

  const printContent = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${title || 'Voice Note'}</title><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.6;color:#000;}h1{font-size:24px;border-bottom:2px solid #eee;padding-bottom:8px;}p{margin-bottom:10px;}</style></head><body><h1>${title || 'Voice Note'}</h1>${transcript.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('')}</body></html>`);
    win.document.close();
    win.print();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const wordCount = transcript ? transcript.split(/\s+/).filter(Boolean).length : 0;
  const charCount = transcript.length;

  return (
    <div className="min-h-screen bg-[#0B0B0B] selection:bg-white/10">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0B0B0B]/80 backdrop-blur-xl border-b border-[#1A1A1A]">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl text-[#555555] hover:text-white hover:bg-white/5 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-[#666666] tracking-wide">Voice Note</span>
          </div>
          <div className="flex items-center gap-2">
            {transcript && (
              <>
                <button onClick={copyTranscript} className="p-2 rounded-xl text-[#555555] hover:text-white hover:bg-white/5 transition-all" title="Copy">
                  <Copy className="w-4 h-4" />
                </button>
                <div className="relative" ref={headerExportMenuRef}>
                  <button onClick={() => setShowHeaderExportMenu(v => !v)} className="p-2 rounded-xl text-[#555555] hover:text-white hover:bg-white/5 transition-all" title="Export">
                    <Download className="w-4 h-4" />
                  </button>
                  {showHeaderExportMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 top-full mt-1 w-52 bg-[#161616] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-2xl z-50"
                    >
                      <button onClick={() => { exportText(); setShowHeaderExportMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C8C8C8] hover:bg-white/5 transition-colors text-left">
                        <FileText className="w-4 h-4" /> Download as Text
                      </button>
                      <button onClick={() => { exportPDFile(); setShowHeaderExportMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C8C8C8] hover:bg-white/5 transition-colors text-left">
                        <FileText className="w-4 h-4" /> Download as PDF
                      </button>
                      <button onClick={() => { exportDoc(); setShowHeaderExportMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C8C8C8] hover:bg-white/5 transition-colors text-left">
                        <Download className="w-4 h-4" /> Download as Document
                      </button>
                    </motion.div>
                  )}
                </div>
                <div className="w-px h-5 bg-[#1A1A1A] mx-1" />
              </>
            )}
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !transcript}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {saveMutation.isPending ? (
                <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save
            </button>
          </div>
        </div>
      </header>

      <main className="pt-20 pb-12 px-4">
        <div className="max-w-3xl mx-auto">

          {/* Mic Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 md:py-20"
          >
            {/* Unsupported browser */}
            {!browserSupported && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-[#555555]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Browser Not Supported</h3>
                <p className="text-sm text-[#666666] max-w-sm">
                  Speech recognition is not available in your browser. For the best experience, please use{' '}
                  <span className="text-white">Google Chrome</span> or{' '}
                  <span className="text-white">Microsoft Edge</span>.
                </p>
              </motion.div>
            )}

            {/* Permission error */}
            {error && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 max-w-sm">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-7 h-7 text-[#555555]" />
                </div>
                <p className="text-sm text-[#666666] mb-4">{error}</p>
                <button
                  onClick={() => startRecording(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>
              </motion.div>
            )}

            {/* Mic + Waveform */}
            {browserSupported && !error && (
              <div className="relative flex flex-col items-center">
                {/* Circular waveform canvas */}
                <div className="relative w-48 h-48 md:w-56 md:h-56 flex items-center justify-center">
                  <canvas
                    ref={canvasRef}
                    width={224}
                    height={224}
                    className={`absolute inset-0 w-full h-full ${status === 'recording' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
                  />

                  {/* Mic button */}
                  <motion.button
                    onClick={handleSingleClick}
                    onDoubleClick={handleDoubleClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative z-10 w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-all duration-500 ${
                      status === 'recording'
                        ? 'bg-white/10 border-2 border-white/30'
                        : 'bg-[#111111] border border-[#2A2A2A] hover:border-[#444444] shadow-[0_0_30px_-10px_rgba(255,255,255,0.08)] hover:shadow-[0_0_40px_-8px_rgba(255,255,255,0.15)]'
                    }`}
                    style={status === 'recording' ? { boxShadow: `0 0 ${30 + audioLevel * 40}px -8px rgba(255,255,255,${0.08 + audioLevel * 0.25})` } : undefined}
                  >
                    {status === 'recording' ? (
                      <motion.div
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Mic className="w-10 h-10 md:w-12 md:h-12 text-white" />
                      </motion.div>
                    ) : (
                      <Mic className="w-10 h-10 md:w-12 md:h-12 text-[#666666] group-hover:text-white transition-colors" />
                    )}
                  </motion.button>
                </div>

                {/* Timer + Status */}
                {status === 'recording' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mt-6"
                  >
                    <p className="text-4xl md:text-5xl font-light text-white tracking-widest tabular-nums">
                      {formatTime(duration)}
                    </p>
                    <p className="text-xs text-[#555555] mt-2 tracking-widest uppercase">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse mr-2 align-middle" />
                      Listening
                    </p>
                  </motion.div>
                )}

                {/* Idle hint */}
                {status === 'idle' && !transcript && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-xs text-[#444444] mt-6 tracking-wide"
                  >
                    Click to record &middot; Double-click for fullscreen
                  </motion.p>
                )}

                {/* Clear button */}
                {status === 'idle' && transcript && (
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setShowClearConfirm(true)}
                    className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-[#555555] hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>

          {/* Transcript Editor */}
          {(transcript || status === 'recording') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Title */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title..."
                className="w-full text-2xl md:text-3xl font-semibold text-white bg-transparent border-none outline-none placeholder:text-[#333333] tracking-tight"
              />

              {/* Editor card */}
              <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="p-5">
                  <textarea
                    ref={editorRef}
                    value={transcript + (interimText ? '\n' + interimText : '')}
                    onChange={(e) => {
                      handleTranscriptChange(e.target.value);
                      setInterimText('');
                    }}
                    placeholder="Your speech will appear here..."
                    className="w-full min-h-[180px] max-h-[60vh] bg-transparent text-[#C8C8C8] leading-relaxed resize-none outline-none placeholder:text-[#333333]"
                    style={{ fontSize: `${fontSize}px` }}
                    spellCheck
                  />
                  <div ref={transcriptEndRef} />
                </div>

                {/* Stats + Actions bar */}
                <div className="px-5 py-3 border-t border-[#1A1A1A] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-4 text-xs text-[#444444]">
                    <span className="flex items-center gap-1.5">
                      <Type className="w-3 h-3" />
                      {wordCount} words
                    </span>
                    <span>{charCount} chars</span>
                    {duration > 0 && (
                      <span className="tabular-nums">{formatTime(duration)} recorded</span>
                    )}
                    <span className="flex items-center gap-1">
                      <button onClick={() => changeFontSize(-1)} className="p-0.5 rounded text-[#444444] hover:text-white transition-colors">
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="tabular-nums w-5 text-center">{fontSize}</span>
                      <button onClick={() => changeFontSize(1)} className="p-0.5 rounded text-[#444444] hover:text-white transition-colors">
                        <Plus className="w-3 h-3" />
                      </button>
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={undo} disabled={!undoStack.length} className="p-2 rounded-lg text-[#444444] hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed" title="Undo">
                      <Undo2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={redo} disabled={!redoStack.length} className="p-2 rounded-lg text-[#444444] hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed" title="Redo">
                      <Redo2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-5 bg-[#2A2A2A] mx-1" />
                    <button onClick={copyTranscript} className="p-2 rounded-lg text-[#444444] hover:text-white hover:bg-white/5 transition-all" title="Copy to Clipboard">
                      <Clipboard className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setEditorExpanded(v => !v)} className="p-2 rounded-lg text-[#444444] hover:text-white hover:bg-white/5 transition-all" title={editorExpanded ? 'Minimize editor' : 'Expand editor'}>
                      {editorExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </button>
                    <div className="w-px h-5 bg-[#2A2A2A] mx-1" />
                    <ReadAloud text={transcript} textRef={editorRef} />
                    <div className="w-px h-5 bg-[#2A2A2A] mx-1" />
                    <button onClick={() => setShowClearConfirm(true)} className="p-2 rounded-lg text-[#444444] hover:text-white hover:bg-white/5 transition-all" title="Clear">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="relative" ref={statsExportMenuRef}>
                      <button onClick={() => setShowStatsExportMenu(v => !v)} className="p-2 rounded-lg text-[#444444] hover:text-white hover:bg-white/5 transition-all" title="Export">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      {showStatsExportMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute right-0 bottom-full mb-1 w-56 bg-[#161616] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-2xl z-50"
                        >
                          <button onClick={() => { exportText(); setShowStatsExportMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C8C8C8] hover:bg-white/5 transition-colors text-left">
                            <FileText className="w-4 h-4" /> Download as Text
                          </button>
                          <button onClick={() => { exportMarkdown(); setShowStatsExportMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C8C8C8] hover:bg-white/5 transition-colors text-left">
                            <FileText className="w-4 h-4" /> Download as Markdown
                          </button>
                          <button onClick={() => { exportPDFile(); setShowStatsExportMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C8C8C8] hover:bg-white/5 transition-colors text-left">
                            <FileText className="w-4 h-4" /> Download as PDF
                          </button>
                          <button onClick={() => { exportDoc(); setShowStatsExportMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C8C8C8] hover:bg-white/5 transition-colors text-left">
                            <Download className="w-4 h-4" /> Download as Document
                          </button>
                          <div className="border-t border-[#2A2A2A]" />
                          <button onClick={() => { copyTranscript(); setShowStatsExportMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C8C8C8] hover:bg-white/5 transition-colors text-left">
                            <Clipboard className="w-4 h-4" /> Copy to Clipboard
                          </button>
                          <button onClick={() => { printContent(); setShowStatsExportMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C8C8C8] hover:bg-white/5 transition-colors text-left">
                            <Printer className="w-4 h-4" /> Print
                          </button>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {showFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#0B0B0B]/95 backdrop-blur-2xl" />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center"
              >
                {/* Fullscreen canvas waveform */}
                <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center">
                  <canvas
                    ref={fullscreenCanvasRef}
                    width={320}
                    height={320}
                    className="absolute inset-0 w-full h-full"
                  />

                  {/* Center mic */}
                  <motion.div
                    animate={status === 'recording' ? { scale: [1, 1.06, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative z-10 w-24 h-24 md:w-28 md:h-28 rounded-full bg-[#111111] border-2 border-white/20 flex items-center justify-center shadow-[0_0_60px_-15px_rgba(255,255,255,0.1)]"
                  >
                    <Mic className="w-11 h-11 md:w-13 md:h-13 text-white" />
                  </motion.div>
                </div>

                {/* Timer */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl md:text-6xl font-light text-white tracking-widest tabular-nums mt-8"
                >
                  {formatTime(duration)}
                </motion.p>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-xs text-[#555555] mt-3 tracking-widest uppercase"
                >
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse mr-2 align-middle" />
                  Recording
                </motion.p>

                {/* Controls */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-4 mt-10"
                >
                  <button
                    onClick={closeFullscreen}
                    className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#555555] hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                    title="Cancel"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      stopRecording();
                      setShowFullscreen(false);
                    }}
                    className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/15 transition-all"
                    title="Stop"
                  >
                    <Square className="w-6 h-6 text-white" />
                  </button>
                  <button
                    onClick={closeFullscreen}
                    className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#555555] hover:text-white hover:bg-white/10 hover:border-white/20 transition-all"
                    title="Pause"
                  >
                    <Pause className="w-5 h-5" />
                  </button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor expand overlay */}
      <AnimatePresence>
        {editorExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0B0B0B]"
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between px-6 py-3 border-b border-[#1A1A1A]">
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditorExpanded(false)} className="p-2 rounded-xl text-[#555555] hover:text-white hover:bg-white/5 transition-all">
                    <Minimize2 className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-[#666666]">{title || 'Untitled'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#444444]">
                  <span>{wordCount} words</span>
                  <span className="w-px h-3 bg-[#1A1A1A]" />
                  <span>{charCount} chars</span>
                </div>
              </div>
              <textarea
                value={transcript}
                onChange={(e) => { handleTranscriptChange(e.target.value); setInterimText(''); }}
                className="flex-1 w-full p-8 bg-transparent text-[#C8C8C8] leading-relaxed resize-none outline-none"
                style={{ fontSize: `${fontSize}px` }}
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear confirmation modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-[#161616] border border-[#2A2A2A] rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Clear content?</h3>
              <p className="text-sm text-[#8A8A8A] mb-6 leading-relaxed">
                This will remove all recorded text and reset the note. This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 rounded-xl text-sm text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { clearTranscript(); setShowClearConfirm(false); }}
                  className="px-4 py-2 rounded-xl text-sm text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background pattern */}
      <div className="fixed inset-0 grid-bg opacity-[0.03] pointer-events-none" />
    </div>
  );
}
