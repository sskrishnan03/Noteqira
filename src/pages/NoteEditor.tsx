import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Save,
  Mic,
  Image,
  FileText,
  Upload,
  Loader2,
  StopCircle,
  Download, Trash2, Type, Minus, Plus,
  Undo2, Redo2, Maximize2, Minimize2, Printer, Clipboard,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '@/lib/data';
import { exportPDF } from '@/lib/export';
import ReadAloud from '@/components/ReadAloud/ReadAloud';

export default function NoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const isNewNote = !id;
  const noteType = searchParams.get('type') || 'manual';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [editorExpanded, setEditorExpanded] = useState(false);

  const handleContentChange = (val: string) => {
    setUndoStack(prev => [...prev.slice(-49), content]);
    setRedoStack([]);
    setContent(val);
  };

  const undo = () => {
    if (!undoStack.length) return;
    setRedoStack(prev => [...prev, content]);
    setContent(undoStack[undoStack.length - 1]);
    setUndoStack(prev => prev.slice(0, -1));
  };

  const redo = () => {
    if (!redoStack.length) return;
    setUndoStack(prev => [...prev, content]);
    setContent(redoStack[redoStack.length - 1]);
    setRedoStack(prev => prev.slice(0, -1));
  };

  const [fontSize, setFontSize] = useState(() => {
    try { return parseInt(localStorage.getItem('noteqira-font-size') || '15'); }
    catch { return 15; }
  });

  const changeFontSize = (delta: number) => {
    setFontSize(prev => {
      const next = Math.min(Math.max(prev + delta, 10), 28);
      localStorage.setItem('noteqira-font-size', String(next));
      return next;
    });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) setShowExportMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const { data: existingNote, isLoading } = useQuery({
    queryKey: ['note', id],
    queryFn: async () => {
      if (!id) return null;
      return db.getNote(id);
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setContent(existingNote.content_plain || '');
    }
  }, [existingNote]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const noteData = {
        title: title,
        content_plain: content,
        content: { type: 'doc', content: [{ type: 'paragraph', content }] },
        source_type: isNewNote ? noteType : existingNote?.source_type,
        word_count: content.split(/\s+/).filter(Boolean).length,
        processing_status: 'pending' as const,
      };

      if (id) {
        return db.updateNote(id, noteData);
      } else {
        const data = await db.createNote(noteData);
        await db.createActivity({
          action: 'created',
          resource_type: 'note',
          resource_id: data.id,
          metadata: { title: noteData.title },
        });
        return data;
      }
    },
    onSuccess: (data) => {
      toast.success('Note saved!');
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      if (isNewNote && data?.id) {
        navigate(`/notes/${data.id}`, { replace: true });
      }
    },
    onError: () => {
      toast.error('Failed to save note');
    },
  });

  const toggleRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsRecording(false);
      setInterimText('');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      if (finalTranscript) {
        setContent(prev => prev + finalTranscript + ' ');
      }
      setInterimText(interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error !== 'no-speech') {
        toast.error('Speech recognition error: ' + event.error);
      }
      setIsRecording(false);
      setInterimText('');
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimText('');
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, [isRecording]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageUrl = event.target?.result as string;
        try {
          const Tesseract = await import('tesseract.js');
          const { data } = await Tesseract.recognize(imageUrl.replace(/^data:image\/\w+;base64,/, ''), 'eng');
          setContent(prev => (prev ? prev + '\n\n' : '') + data.text);
          toast.success('Text extracted from image!');
        } catch {
          toast.error('OCR failed. The image text could not be extracted.');
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error('Failed to process image');
      setIsUploading(false);
    }
  }, []);

  const handleDocumentUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileName = file.name.toLowerCase();

    try {
      if (fileName.endsWith('.txt')) {
        const text = await file.text();
        setContent(prev => (prev ? prev + '\n\n' : '') + text);
        toast.success('Text file loaded!');
      } else if (fileName.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url
        ).toString();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n\n';
        }
        setContent(prev => (prev ? prev + '\n\n' : '') + fullText.trim());
        toast.success(`PDF extracted (${pdf.numPages} pages)!`);
      } else if (fileName.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ arrayBuffer });
        setContent(prev => (prev ? prev + '\n\n' : '') + result.value);
        toast.success('Word document loaded!');
      } else {
        toast.error('Unsupported file format. Please use .txt, .pdf, or .docx');
      }
    } catch {
      toast.error('Failed to parse document. Try a different format.');
    }
    setIsUploading(false);
  }, []);

  const triggerFileUpload = (type: 'image' | 'document') => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/*' : '.txt,.pdf,.docx,.doc';
      fileInputRef.current.click();
    }
  };

  const handleSave = () => {
    saveMutation.mutate();
  };

  const copyText = () => {
    navigator.clipboard.writeText(content).then(() => toast.success('Copied'));
  };

  const exportText = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${title || 'note'}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportDoc = () => {
    const name = title || 'Note';
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${name}</title></head><body style="font-family:Calibri,'Segoe UI',Arial,sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.6;color:#1a1a1a;background:#fff;"><h1 style="font-size:26px;margin-bottom:16px;border-bottom:2px solid #e0e0e0;padding-bottom:8px;">${name}</h1>${content.split('\n').filter(p => p.trim()).map(p => `<p style="margin-bottom:10px;font-size:14px;">${p}</p>`).join('\n')}</body></html>`;
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${name}.doc`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportMarkdown = () => {
    const name = title || 'note';
    const md = `# ${name}\n\n${content}`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${name}.md`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDFNote = () => {
    exportPDF(content, title || 'Note');
  };

  const printContent = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${title || 'Note'}</title><style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:20px;line-height:1.6;color:#000;}h1{font-size:24px;border-bottom:2px solid #eee;padding-bottom:8px;}p{margin-bottom:10px;}</style></head><body><h1>${title || 'Note'}</h1>${content.split('\n').filter(p => p.trim()).map(p => `<p>${p}</p>`).join('')}</body></html>`);
    win.document.close();
    win.print();
  };

  const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0;
  const charCount = content.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  const getSourceIcon = () => {
    switch (noteType) {
      case 'voice': return <Mic className="w-5 h-5 text-white" />;
      case 'image': return <Image className="w-5 h-5 text-white" />;
      case 'document': return <FileText className="w-5 h-5 text-white" />;
      default: return <FileText className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />

      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0B0B0B]/80 backdrop-blur-xl border-b border-[#2A2A2A]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              {getSourceIcon()}
              <span className="text-sm text-[#8A8A8A]">
                {isNewNote ? 'New Note' : 'Edit Note'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleSave} className="btn-primary" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save</span>
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title..."
                className="w-full text-3xl font-bold text-white bg-transparent border-none focus:outline-none placeholder:text-[#555555]"
              />
            </div>

            {isNewNote && noteType !== 'manual' && (
              <div className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-8">
                <div className="flex flex-col items-center justify-center py-8">
                  {noteType === 'voice' && (
                    <>
                      <button
                        onClick={toggleRecording}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                          isRecording
                            ? 'bg-white/20 animate-pulse'
                            : 'bg-[#1B1B1B] hover:bg-[#2A2A2A]'
                        }`}
                      >
                        {isRecording ? (
                          <StopCircle className="w-8 h-8 text-white" />
                        ) : (
                          <Mic className="w-8 h-8 text-white" />
                        )}
                      </button>
                      <p className="mt-4 text-[#8A8A8A]">
                        {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
                      </p>
                      {isRecording && (
                        <p className="mt-2 text-sm text-white animate-pulse">
                          {interimText || 'Listening...'}
                        </p>
                      )}
                      {!isRecording && !interimText && (
                        <p className="mt-2 text-xs text-[#555555]">
                          Speech will be transcribed in real-time. Works best in Chrome/Edge.
                        </p>
                      )}
                    </>
                  )}

                  {noteType === 'image' && (
                    <>
                      <div className="w-20 h-20 rounded-2xl bg-[#1B1B1B] flex items-center justify-center mb-4">
                        {isUploading ? (
                          <Loader2 className="w-8 h-8 text-white animate-spin" />
                        ) : (
                          <Upload className="w-8 h-8 text-white" />
                        )}
                      </div>
                      <p className="text-[#8A8A8A] mb-2">
                        Upload images of notes, whiteboards, or handwriting
                      </p>
                      <p className="text-xs text-[#555555] mb-4">
                        Text will be extracted using OCR
                      </p>
                      <button
                        onClick={() => triggerFileUpload('image')}
                        className="btn-primary"
                        disabled={isUploading}
                      >
                        <Upload className="w-4 h-4" />
                        {isUploading ? 'Processing...' : 'Select Image'}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={noteType === 'image' ? handleImageUpload : handleDocumentUpload}
                        accept={noteType === 'image' ? 'image/*' : '.txt,.pdf,.docx,.doc'}
                      />
                    </>
                  )}

                  {noteType === 'document' && (
                    <>
                      <div className="w-20 h-20 rounded-2xl bg-[#1B1B1B] flex items-center justify-center mb-4">
                        {isUploading ? (
                          <Loader2 className="w-8 h-8 text-white animate-spin" />
                        ) : (
                          <Upload className="w-8 h-8 text-white" />
                        )}
                      </div>
                      <p className="text-[#8A8A8A] mb-2">
                        PDF, DOC, DOCX, TXT and more
                      </p>
                      <p className="text-xs text-[#555555] mb-4">
                        Content will be automatically extracted
                      </p>
                      <button
                        onClick={() => triggerFileUpload('document')}
                        className="btn-primary"
                        disabled={isUploading}
                      >
                        <Upload className="w-4 h-4" />
                        {isUploading ? 'Processing...' : 'Select Document'}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleDocumentUpload}
                        accept=".txt,.pdf,.docx,.doc"
                      />
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="bg-[#161616] border border-[#2A2A2A] rounded-2xl overflow-hidden">
              <textarea
                ref={editorRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder={
                  noteType === 'voice'
                    ? 'Your speech transcription will appear here...'
                    : noteType === 'image'
                    ? 'OCR text will appear here after uploading an image...'
                    : noteType === 'document'
                    ? 'Document content will appear here after uploading...'
                    : 'Start writing or paste content here...'
                }
                className="w-full min-h-[400px] p-6 bg-transparent text-[#C8C8C8] leading-relaxed resize-y focus:outline-none placeholder:text-[#555555]"
                style={{ fontSize: `${fontSize}px` }}
              />
              <div className="px-6 py-3 border-t border-[#2A2A2A] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4 text-xs text-[#444444]">
                  <span className="flex items-center gap-1.5">
                    <Type className="w-3 h-3" />
                    {wordCount} words
                  </span>
                  <span>{charCount} chars</span>
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
                  <button onClick={copyText} className="p-2 rounded-lg text-[#444444] hover:text-white hover:bg-white/5 transition-all" title="Copy to Clipboard">
                    <Clipboard className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setEditorExpanded(v => !v)} className="p-2 rounded-lg text-[#444444] hover:text-white hover:bg-white/5 transition-all" title={editorExpanded ? 'Minimize editor' : 'Expand editor'}>
                    {editorExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                  </button>
                  <div className="w-px h-5 bg-[#2A2A2A] mx-1" />
                  <ReadAloud text={content} textRef={editorRef} />
                  <div className="w-px h-5 bg-[#2A2A2A] mx-1" />
                  <button onClick={() => setShowClearConfirm(true)} className="p-2 rounded-lg text-[#444444] hover:text-white hover:bg-white/5 transition-all" title="Clear">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="relative" ref={exportMenuRef}>
                    <button onClick={() => setShowExportMenu(v => !v)} className="p-2 rounded-lg text-[#444444] hover:text-white hover:bg-white/5 transition-all" title="Export">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    {showExportMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute right-0 bottom-full mb-1 w-56 bg-[#161616] border border-[#2A2A2A] rounded-xl overflow-hidden shadow-2xl z-50"
                      >
                        <button onClick={() => { exportText(); setShowExportMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C8C8C8] hover:bg-white/5 transition-colors text-left">
                          <FileText className="w-4 h-4" /> Download as Text
                        </button>
                        <button onClick={() => { exportMarkdown(); setShowExportMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C8C8C8] hover:bg-white/5 transition-colors text-left">
                          <FileText className="w-4 h-4" /> Download as Markdown
                        </button>
                        <button onClick={() => { exportPDFNote(); setShowExportMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C8C8C8] hover:bg-white/5 transition-colors text-left">
                          <FileText className="w-4 h-4" /> Download as PDF
                        </button>
                        <button onClick={() => { exportDoc(); setShowExportMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C8C8C8] hover:bg-white/5 transition-colors text-left">
                          <Download className="w-4 h-4" /> Download as Document
                        </button>
                        <div className="border-t border-[#2A2A2A]" />
                        <button onClick={() => { copyText(); setShowExportMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C8C8C8] hover:bg-white/5 transition-colors text-left">
                          <Clipboard className="w-4 h-4" /> Copy to Clipboard
                        </button>
                        <button onClick={() => { printContent(); setShowExportMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C8C8C8] hover:bg-white/5 transition-colors text-left">
                          <Printer className="w-4 h-4" /> Print
                        </button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

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
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
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
                This will remove all content from the editor. This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 rounded-xl text-sm text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setContent(''); setShowClearConfirm(false); }}
                  className="px-4 py-2 rounded-xl text-sm text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all"
                >
                  Clear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
