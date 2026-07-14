import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Save, X, Upload, Copy, Download, Trash2, Type, Minus, Plus,
  ZoomIn, ZoomOut, RotateCw, RotateCcw, Maximize2, Minimize2,
  Camera, Clipboard, Undo2, Redo2, Printer,
  ScanLine, CheckCircle2, AlertCircle, RefreshCw, FileText, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/data';
import { exportPDF } from '@/lib/export';
import ReadAloud from '@/components/ReadAloud/ReadAloud';

function preprocessImage(imageSrc: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = data[i + 1] = data[i + 2] = gray;
      }

      let min = 255, max = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] < min) min = data[i];
        if (data[i] > max) max = data[i];
      }
      const range = max - min || 1;
      for (let i = 0; i < data.length; i += 4) {
        data[i] = ((data[i] - min) / range) * 255;
        data[i + 1] = data[i];
        data[i + 2] = data[i];
      }
      ctx.putImageData(imageData, 0, 0);

      const sharpened = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const srcPixels = sharpened.data;
      const w = canvas.width, h = canvas.height;
      const output = new Uint8ClampedArray(srcPixels.length);
      const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = (y * w + x) * 4;
          let r = 0, g = 0, b = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const nIdx = ((y + ky) * w + (x + kx)) * 4;
              const k = kernel[(ky + 1) * 3 + (kx + 1)];
              r += srcPixels[nIdx] * k;
              g += srcPixels[nIdx + 1] * k;
              b += srcPixels[nIdx + 2] * k;
            }
          }
          output[idx] = Math.min(255, Math.max(0, r));
          output[idx + 1] = Math.min(255, Math.max(0, g));
          output[idx + 2] = Math.min(255, Math.max(0, b));
          output[idx + 3] = 255;
        }
      }
      sharpened.data.set(output);
      ctx.putImageData(sharpened, 0, 0);

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
}

function formatOCRText(raw: string): string {
  const blocks = raw.split(/\n{2,}/).filter(b => b.trim());
  const formatted = blocks.map(block => {
    const lines = block.split('\n').filter(l => l.trim());
    if (!lines.length) return '';

    const firstLine = lines[0].trim();

    if (firstLine.length < 60 && lines.length > 1 && (firstLine === firstLine.toUpperCase() || !firstLine.endsWith('.'))) {
      return `# ${firstLine}\n${lines.slice(1).join('\n')}`;
    }

    if (firstLine.length < 40 && firstLine.endsWith(':') && lines.length === 1) {
      return `## ${firstLine.slice(0, -1)}`;
    }

    if (lines.every(l => /^[\s]*[-•*]\s/.test(l))) {
      return lines.map(l => `- ${l.replace(/^[\s]*[-•*]\s*/, '')}`).join('\n');
    }

    if (lines.every(l => /^\s*\d+[.)]\s/.test(l))) {
      return lines.join('\n');
    }

    const processedLines = lines.map(l => {
      let line = l;
      line = line.replace(/\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})\b/g, '$1/$2/$3');
      line = line.replace(/(https?:\/\/[^\s]+)/g, '$1');
      line = line.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+)/g, '$1');
      line = line.replace(/(\+?\d[\d\s-]{7,}\d)/g, '$1');
      return line;
    });

    return processedLines.join('\n');
  });

  return formatted.join('\n\n');
}

function readingTime(text: string): string {
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 200);
  if (minutes < 1) return '< 1 min';
  return `${minutes} min read`;
}

const OCR_STEPS = [
  { key: 'preprocessing' as const, label: 'Scanning Image...', icon: ScanLine },
  { key: 'reading' as const, label: 'Reading Text...', icon: FileText },
  { key: 'formatting' as const, label: 'Formatting Content...', icon: Type },
  { key: 'creating' as const, label: 'Creating Note...', icon: CheckCircle2 },
];

export default function ImageNotePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraCanvasRef = useRef<HTMLCanvasElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);

  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showImageFullscreen, setShowImageFullscreen] = useState(false);

  const [ocrStatus, setOcrStatus] = useState<'idle' | 'preprocessing' | 'reading' | 'formatting' | 'creating' | 'done' | 'error'>('idle');
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState(0);

  const [content, setContent] = useState('');
  const [editorFullscreen, setEditorFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(() => {
    try { return parseInt(localStorage.getItem('noteqira-font-size') || '15'); }
    catch { return 15; }
  });

  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [dragOver, setDragOver] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);

  const changeFontSize = (delta: number) => {
    setFontSize(prev => {
      const next = Math.min(Math.max(prev + delta, 10), 28);
      localStorage.setItem('noteqira-font-size', String(next));
      return next;
    });
  };

  const loadImage = useCallback((src: string, name: string, size: number) => {
    setImageSrc(src);
    setFileName(name);
    setFileSize(size);
    setTitle(name.replace(/\.[^/.]+$/, ''));
    setZoom(1);
    setRotation(0);
    setContent('');
    setOcrStatus('preprocessing');
    setOcrError(null);
    setHistory(['']);
    setHistoryIndex(0);
    setOcrProgress(0);
    (async () => {
      try {
        setOcrProgress(10);
        const processed = await preprocessImage(src);
        setOcrStatus('reading');
        setOcrProgress(30);

        const Tesseract = await import('tesseract.js');
        const { data } = await Tesseract.recognize(processed, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text' && m.progress) {
              setOcrProgress(30 + Math.round(m.progress * 40));
            }
          },
        });

        setOcrStatus('formatting');
        setOcrProgress(75);
        await new Promise(r => setTimeout(r, 200));

        const formatted = formatOCRText(data.text);
        setOcrStatus('creating');
        setOcrProgress(90);
        await new Promise(r => setTimeout(r, 200));

        setContent(formatted);
        setHistory([formatted]);
        setHistoryIndex(0);
        setOcrProgress(100);
        setOcrStatus('done');

        if (!data.text.trim()) {
          toast.error('No readable text found in this image.');
        } else {
          toast.success('Text extracted successfully!');
        }
      } catch {
        setOcrStatus('error');
        setOcrError('Failed to extract text. Please try a different image.');
        toast.error('Text extraction failed.');
      }
    })();
  }, []);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) {
      toast.error('Unsupported file format. Please upload an image.');
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      toast.error('Image is too large. Maximum size is 50 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      loadImage(src, f.name, f.size);
    };
    reader.readAsDataURL(f);
  }, [loadImage]);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const f = item.getAsFile();
        if (f) handleFile(f);
        break;
      }
    }
  }, [handleFile]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } });
      cameraStreamRef.current = stream;
      setShowCameraModal(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch {
      toast.error('Could not access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !cameraCanvasRef.current) return;
    const video = videoRef.current;
    const canvas = cameraCanvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) {
        const f = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        handleFile(f);
      }
      stopCamera();
    }, 'image/jpeg', 0.92);
  };

  const stopCamera = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
    }
    setShowCameraModal(false);
  };

  const updateContent = (newContent: string) => {
    setContent(newContent);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    if (newHistory.length > 50) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  const exportText = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${title || 'image-note'}.txt`; a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportMarkdown = () => {
    const md = `# ${title || 'Image Note'}\n\n${content}`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${title || 'image-note'}.md`; a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportDoc = () => {
    const name = title || 'Image Note';
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${name}</title></head><body style="font-family:Calibri,'Segoe UI',Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.6;color:#1a1a1a;background:#fff;"><h1 style="font-size:26px;margin-bottom:16px;border-bottom:2px solid #e0e0e0;padding-bottom:8px;">${name}</h1>${content.split('\n').filter(p => p.trim()).map(p => {
      if (p.startsWith('# ')) return `<h2 style="font-size:20px;margin-top:20px;margin-bottom:8px;">${p.slice(2)}</h2>`;
      if (p.startsWith('## ')) return `<h3 style="font-size:16px;margin-top:16px;margin-bottom:6px;color:#333;">${p.slice(3)}</h3>`;
      if (p.startsWith('- ')) return `<li style="margin-left:20px;margin-bottom:4px;">${p.slice(2)}</li>`;
      return `<p style="margin-bottom:10px;font-size:14px;">${p}</p>`;
    }).join('\n')}</body></html>`;
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${name}.doc`; a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportPDFile = () => {
    exportPDF(title || 'Image Note', content);
    setShowExportMenu(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content).then(() => {
      toast.success('Copied to clipboard');
      setShowExportMenu(false);
    });
  };

  const printNote = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${title || 'Image Note'}</title><style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;padding:20px;line-height:1.8;color:#1a1a1a;}h1{font-size:28px;border-bottom:2px solid #ddd;padding-bottom:8px;}p{margin-bottom:12px;}</style></head><body><h1>${title || 'Image Note'}</h1>${content.split('\n').filter(p => p.trim()).map(p => {
      if (p.startsWith('# ')) return `<h2>${p.slice(2)}</h2>`;
      if (p.startsWith('## ')) return `<h3>${p.slice(3)}</h3>`;
      if (p.startsWith('- ')) return `<li>${p.slice(2)}</li>`;
      return `<p>${p}</p>`;
    }).join('\n')}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
    setShowExportMenu(false);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const noteData = {
        title: title || 'Image Note',
        content_plain: content,
        content: { type: 'doc', content: [{ type: 'paragraph', content }] },
        source_type: 'image',
        word_count: content.split(/\s+/).filter(Boolean).length,
        processing_status: 'completed' as const,
        image_data: imageSrc,
      };
      const data = await db.createNote(noteData as any);
      await db.createActivity({
        action: 'created',
        resource_type: 'note',
        resource_id: data.id,
        metadata: { title: noteData.title, source_type: 'image' },
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success('Image note saved!');
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      navigate(`/notes/${data.id}`, { replace: true });
    },
    onError: () => toast.error('Failed to save note'),
  });

  const clearAll = () => {
    setImageSrc(null);
    setContent('');
    setTitle('');
    setOcrStatus('idle');
    setOcrError(null);
    setZoom(1);
    setRotation(0);
    setHistory(['']);
    setHistoryIndex(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    localStorage.removeItem('image-note-draft');
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) setShowExportMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!imageSrc) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('image-note-draft', JSON.stringify({
          title, content, imageSrc, fileName, fileSize, ocrStatus,
          updatedAt: new Date().toISOString(),
        }));
      } catch { /* empty */ }
    }, 2000);
    return () => clearTimeout(timer);
  }, [title, content, imageSrc, fileName, fileSize, ocrStatus]);

  useEffect(() => {
    try {
      const draft = localStorage.getItem('image-note-draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        if (parsed.imageSrc) {
          setImageSrc(parsed.imageSrc);
          setTitle(parsed.title || '');
          setContent(parsed.content || '');
          setFileName(parsed.fileName || '');
          setFileSize(parsed.fileSize || 0);
          setOcrStatus(parsed.ocrStatus === 'done' ? 'done' : 'idle');
          if (parsed.content) {
            setHistory([parsed.content]);
            setHistoryIndex(0);
          }
        }
      }
    } catch { /* empty */ }
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showCameraModal) {
        if (e.key === 'Escape') stopCamera();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (content && ocrStatus === 'done') saveMutation.mutate();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [undo, redo, content, ocrStatus, saveMutation, showCameraModal]);

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const charCount = content.length;
  const readTime = readingTime(content);
  const isOcrRunning = ocrStatus === 'preprocessing' || ocrStatus === 'reading' || ocrStatus === 'formatting' || ocrStatus === 'creating';

  const currentStepIdx = OCR_STEPS.findIndex(s => s.key === ocrStatus);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#0B0B0B] selection:bg-white/10">
      <div className="fixed inset-0 grid-bg opacity-[0.03] pointer-events-none" />

      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0B0B0B]/80 backdrop-blur-xl border-b border-[#1A1A1A]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 rounded-xl text-[#555555] hover:text-white hover:bg-white/5 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <ScanLine className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-[#666666] tracking-wide">Document Scanner</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {imageSrc && ocrStatus === 'done' && (
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || !content}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-white/10 hover:bg-white/15 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                {saveMutation.isPending ? (
                  <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">

          {!imageSrc && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-8 md:pt-16"
            >
              <div className="text-center mb-8">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-2xl md:text-3xl font-semibold text-white tracking-tight"
                >
                  Document Scanner
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-[#555555] mt-2"
                >
                  Upload an image to extract and format text automatically
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative bg-[#111111] border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all duration-300 overflow-hidden group ${
                    dragOver
                      ? 'border-white/40 bg-white/[0.03] shadow-[0_0_60px_-20px_rgba(255,255,255,0.1)]'
                      : 'border-[#1A1A1A] hover:border-[#333333] hover:shadow-[0_0_40px_-20px_rgba(255,255,255,0.05)]'
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-72 h-72 rounded-full border transition-all duration-500 ${
                      dragOver ? 'border-white/[0.06] scale-110' : 'border-white/[0.02]'
                    }`} />
                    <div className={`w-52 h-52 rounded-full border transition-all duration-500 ${
                      dragOver ? 'border-white/[0.04] scale-110' : 'border-white/[0.015]'
                    }`} />
                  </div>

                  <div className="relative z-10 flex flex-col items-center gap-5">
                    <motion.div
                      animate={dragOver ? { y: -5, scale: 1.1 } : { y: 0, scale: 1 }}
                      className="w-24 h-24 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center group-hover:border-[#444444] transition-all"
                    >
                      <Upload className="w-10 h-10 text-[#666666] group-hover:text-white transition-colors" />
                    </motion.div>
                    <div>
                      <p className="text-base text-white font-medium">Drop your image here</p>
                      <p className="text-sm text-[#555555] mt-1">or click to browse &middot; PNG, JPG, WEBP, BMP, TIFF</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="px-5 py-2.5 bg-white/5 border border-white/10 text-white text-sm rounded-xl hover:bg-white/10 transition-all">
                        Choose Image
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); startCamera(); }}
                        className="px-5 py-2.5 bg-white/5 border border-white/10 text-white text-sm rounded-xl hover:bg-white/10 transition-all inline-flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        Camera
                      </button>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#444444]">
                      <span className="flex items-center gap-1.5">
                        <Clipboard className="w-3 h-3" />
                        Paste image (Ctrl+V)
                      </span>
                      <span>Up to 50 MB</span>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/bmp,image/gif,image/tiff"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}

          {imageSrc && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="relative bg-[#111111] border border-[#1A1A1A] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-center p-4 bg-[#0B0B0B]">
                  <motion.img
                    layout
                    src={imageSrc}
                    alt="Preview"
                    className="max-h-[50vh] object-contain rounded-lg"
                    style={imageSrc ? {
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transition: 'transform 0.3s ease',
                    } : undefined}
                  />
                </div>

                <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#1A1A1A] bg-[#0D0D0D]">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#444444] font-mono">{fileName}</span>
                    <span className="text-xs text-[#333333]">{(fileSize / 1024).toFixed(0)} KB</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setZoom(z => Math.min(z + 0.25, 3))} className="p-1.5 rounded-lg text-[#555555] hover:text-white hover:bg-white/5 transition-all" title="Zoom in">
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs text-[#444444] w-8 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.25))} className="p-1.5 rounded-lg text-[#555555] hover:text-white hover:bg-white/5 transition-all" title="Zoom out">
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-4 bg-[#1A1A1A] mx-1" />
                    <button onClick={() => setRotation(r => r - 90)} className="p-1.5 rounded-lg text-[#555555] hover:text-white hover:bg-white/5 transition-all" title="Rotate left">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setRotation(r => r + 90)} className="p-1.5 rounded-lg text-[#555555] hover:text-white hover:bg-white/5 transition-all" title="Rotate right">
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-4 bg-[#1A1A1A] mx-1" />
                    <button onClick={() => { setZoom(1); setRotation(0); }} className="p-1.5 rounded-lg text-[#555555] hover:text-white hover:bg-white/5 transition-all" title="Reset">
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setShowImageFullscreen(true)} className="p-1.5 rounded-lg text-[#555555] hover:text-white hover:bg-white/5 transition-all" title="Fullscreen">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-4 bg-[#1A1A1A] mx-1" />
                    <button onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded-lg text-[#555555] hover:text-white hover:bg-white/5 transition-all" title="Replace image">
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                    <button onClick={() => setShowClearConfirm(true)} className="p-1.5 rounded-lg text-[#555555] hover:text-red-400 hover:bg-red-500/10 transition-all" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {isOcrRunning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-[#111111] border border-[#1A1A1A] rounded-2xl p-8"
                >
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 rounded-full border-2 border-[#1A1A1A]" />
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-t-white/30 border-r-white/30"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        {(() => {
                          const step = OCR_STEPS.find(s => s.key === ocrStatus);
                          const Icon = step?.icon || Loader2;
                          return <Icon className="w-7 h-7 text-white/60" />;
                        })()}
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-base text-white font-medium">
                        {OCR_STEPS.find(s => s.key === ocrStatus)?.label || 'Processing...'}
                      </p>
                      <p className="text-xs text-[#555555] mt-1">
                        {ocrStatus === 'preprocessing' && 'Enhancing image quality for better text recognition'}
                        {ocrStatus === 'reading' && 'Running optical character recognition'}
                        {ocrStatus === 'formatting' && 'Organizing detected text into a structured format'}
                        {ocrStatus === 'creating' && 'Building your editable note'}
                      </p>
                    </div>

                    <div className="w-full max-w-xs">
                      <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-white/20 rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: `${ocrProgress}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                      </div>
                      <p className="text-xs text-[#444444] text-center mt-2 tabular-nums">{ocrProgress}%</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {OCR_STEPS.map((s, i) => {
                        const StepIcon = s.icon;
                        const isActive = i === currentStepIdx;
                        const isPast = i < currentStepIdx;
                        return (
                          <motion.div
                            key={s.key}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all ${
                              isActive ? 'bg-white/5 text-white' : isPast ? 'text-[#555555]' : 'text-[#333333]'
                            }`}
                            animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <StepIcon className="w-3 h-3" />
                            <span>{s.label.replace('...', '')}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {ocrStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#111111] border border-red-500/20 rounded-2xl p-8 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-7 h-7 text-red-400" />
                  </div>
                  <p className="text-white font-medium mb-1">Text Extraction Failed</p>
                  <p className="text-sm text-[#666666] mb-4">{ocrError}</p>
                  <button
                    onClick={() => { if (imageSrc) loadImage(imageSrc, fileName, fileSize); }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                </motion.div>
              )}

              {ocrStatus === 'done' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Note title..."
                    className="w-full text-2xl md:text-3xl font-semibold text-white bg-transparent border-none outline-none placeholder:text-[#333333] tracking-tight"
                  />

                  <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-2 border-b border-[#1A1A1A]">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={undo}
                          disabled={historyIndex === 0}
                          className="p-1.5 rounded-lg text-[#444444] hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Undo (Ctrl+Z)"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={redo}
                          disabled={historyIndex >= history.length - 1}
                          className="p-1.5 rounded-lg text-[#444444] hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Redo (Ctrl+Shift+Z)"
                        >
                          <Redo2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-4 bg-[#1A1A1A] mx-1" />
                        <button onClick={copyToClipboard} className="p-1.5 rounded-lg text-[#444444] hover:text-white hover:bg-white/5 transition-all" title="Copy all">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEditorFullscreen(v => !v)} className="p-1.5 rounded-lg text-[#444444] hover:text-white hover:bg-white/5 transition-all" title={editorFullscreen ? 'Minimize editor' : 'Expand editor'}>
                          {editorFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <span className="text-xs text-[#444444]">{readTime}</span>
                    </div>

                    <div className="relative">
                      <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => updateContent(e.target.value)}
                        className="w-full min-h-[250px] max-h-[60vh] p-5 bg-transparent text-[#C8C8C8] leading-relaxed resize-none outline-none placeholder:text-[#333333]"
                        style={{ fontSize: `${fontSize}px` }}
                        placeholder="Extracted text will appear here..."
                      />
                    </div>

                    <div className="px-5 py-3 border-t border-[#1A1A1A] flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-4 text-xs text-[#444444]">
                        <span className="flex items-center gap-1.5">
                          <Type className="w-3 h-3" />
                          {wordCount} words
                        </span>
                        <span>{charCount} chars</span>
                        <span className="hidden sm:inline">{readTime}</span>
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
                        <button onClick={() => setShowClearConfirm(true)} className="p-2 rounded-lg text-[#444444] hover:text-white hover:bg-white/5 transition-all" title="Clear">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-5 bg-[#2A2A2A] mx-1" />
                        <ReadAloud text={content} textRef={textareaRef} />
                        <div className="w-px h-5 bg-[#2A2A2A] mx-1" />
                        <div className="relative" ref={exportMenuRef}>
                          <button onClick={() => setShowExportMenu(v => !v)} className="p-2 rounded-lg text-[#444444] hover:text-white hover:bg-white/5 transition-all" title="Export">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <AnimatePresence>
                            {showExportMenu && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                className="absolute right-0 bottom-full mb-1 w-52 bg-[#161616] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-2xl z-50"
                              >
                                <button onClick={exportText} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C8C8C8] hover:bg-white/5 transition-colors text-left">
                                  <FileText className="w-4 h-4" /> Download as Text
                                </button>
                                <button onClick={exportMarkdown} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C8C8C8] hover:bg-white/5 transition-colors text-left">
                                  <FileText className="w-4 h-4" /> Download as Markdown
                                </button>
                                <button onClick={exportPDFile} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C8C8C8] hover:bg-white/5 transition-colors text-left">
                                  <FileText className="w-4 h-4" /> Download as PDF
                                </button>
                                <button onClick={exportDoc} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C8C8C8] hover:bg-white/5 transition-colors text-left">
                                  <Download className="w-4 h-4" /> Download as Document
                                </button>
                                <div className="h-px bg-[#1A1A1A]" />
                                <button onClick={copyToClipboard} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C8C8C8] hover:bg-white/5 transition-colors text-left">
                                  <Copy className="w-4 h-4" /> Copy to Clipboard
                                </button>
                                <button onClick={printNote} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C8C8C8] hover:bg-white/5 transition-colors text-left">
                                  <Printer className="w-4 h-4" /> Print
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {showImageFullscreen && imageSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0B0B]/95 backdrop-blur-2xl"
          >
            <button onClick={() => setShowImageFullscreen(false)} className="absolute top-4 right-4 z-10 p-3 rounded-xl bg-white/5 border border-white/10 text-[#555555] hover:text-white hover:bg-white/10 transition-all">
              <X className="w-5 h-5" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={imageSrc}
              alt="Fullscreen preview"
              className="max-w-[95vw] max-h-[95vh] object-contain"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
              <h3 className="text-lg font-semibold text-white mb-2">Clear all content?</h3>
              <p className="text-sm text-[#8A8A8A] mb-6 leading-relaxed">
                This will remove the image and all extracted text. This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 rounded-xl text-sm text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-all">
                  Cancel
                </button>
                <button
                  onClick={() => { clearAll(); setShowClearConfirm(false); }}
                  className="px-4 py-2 rounded-xl text-sm text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCameraModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl"
          >
            <div className="relative w-full max-w-2xl mx-4">
              <video ref={videoRef} autoPlay playsInline className="w-full rounded-2xl bg-black" />
              <canvas ref={cameraCanvasRef} className="hidden" />
              <div className="flex items-center justify-center gap-6 mt-6">
                <button onClick={stopCamera} className="px-6 py-3 rounded-xl text-sm text-[#8A8A8A] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all">
                  Cancel
                </button>
                <button
                  onClick={capturePhoto}
                  className="w-16 h-16 rounded-full bg-white border-4 border-white/30 flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <div className="w-10 h-10 rounded-full bg-white" />
                </button>
                <div className="w-24" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editorFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0B0B0B]"
          >
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between px-6 py-3 border-b border-[#1A1A1A]">
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditorFullscreen(false)} className="p-2 rounded-xl text-[#555555] hover:text-white hover:bg-white/5 transition-all">
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
                value={content}
                onChange={(e) => updateContent(e.target.value)}
                className="flex-1 w-full p-8 bg-transparent text-[#C8C8C8] leading-relaxed resize-none outline-none"
                style={{ fontSize: `${fontSize}px` }}
                autoFocus
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
