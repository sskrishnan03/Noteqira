import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Save, X, Upload, Copy, Download, Trash2, Type, Minus, Plus,
  FileText, Loader2, File, Undo2, Redo2, Printer,
  ScanLine, CheckCircle2, AlertCircle, RefreshCw,
  Maximize2, Minimize2, Clipboard, FileSpreadsheet, FileCode,
  List,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/data';
import { exportPDF } from '@/lib/export';
import ReadAloud from '@/components/ReadAloud/ReadAloud';

const FILE_TYPES: Record<string, string> = {
  txt: 'Plain Text', pdf: 'PDF Document', doc: 'Word Document',
  docx: 'Word Document', rtf: 'Rich Text', md: 'Markdown',
  csv: 'Spreadsheet', json: 'JSON Data', xml: 'XML Document',
  html: 'HTML Document', htm: 'HTML Document', log: 'Log File',
  odt: 'OpenDocument',
};

function getFileType(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  return FILE_TYPES[ext] || 'Document';
}

function getFileIcon(type: string) {
  if (['csv', 'json', 'xml'].includes(type)) return FileSpreadsheet;
  if (['html', 'htm', 'md', 'rtf', 'log'].includes(type)) return FileCode;
  return File;
}

function formatExtension(text: string): string {
  const blocks = text.split(/\n{3,}/).filter(b => b.trim());
  const formatted = blocks.map(block => {
    const lines = block.split('\n').filter(l => l.trim());
    if (!lines.length) return '';
    const first = lines[0].trim();

    if (first.length < 60 && lines.length > 1 && (first === first.toUpperCase() || !first.endsWith('.')))
      return `# ${first}\n${lines.slice(1).join('\n')}`;
    if (first.length < 40 && first.endsWith(':') && lines.length === 1)
      return `## ${first.slice(0, -1)}`;
    if (lines.every(l => /^[\s]*[-•*]\s/.test(l)))
      return lines.map(l => `- ${l.replace(/^[\s]*[-•*]\s*/, '')}`).join('\n');
    if (lines.every(l => /^\s*\d+[.)]\s/.test(l)))
      return lines.join('\n');
    if (lines.every(l => /^\s*\[(x| )\]\s/i.test(l)))
      return lines.map(l => `- [${l.match(/^\s*\[(.)\]/)?.[1] === 'x' ? 'x' : ' '}] ${l.replace(/^\s*\[(.)\]\s*/, '')}`).join('\n');

    const processed = lines.map(l => {
      let line = l;
      line = line.replace(/(https?:\/\/[^\s]+)/g, '$1');
      line = line.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+)/g, '$1');
      line = line.replace(/(\+?\d[\d\s-]{7,}\d)/g, '$1');
      return line;
    });
    return processed.join('\n');
  });
  return formatted.join('\n\n');
}

function htmlToFormattedText(html: string): string {
  const d = document.createElement('div');
  d.innerHTML = html;
  const parts: string[] = [];
  function walk(node: Node, depth: number) {
    if (node.nodeType === 3) {
      const text = node.textContent?.trim();
      if (text) parts.push(text);
    } else if (node.nodeType === 1) {
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      if (['h1', 'h2', 'h3', 'h4'].includes(tag)) {
        const prefix = '#'.repeat(parseInt(tag[1]));
        parts.push(`\n${prefix} ${el.textContent?.trim()}\n`);
      } else if (tag === 'li') {
        const parent = el.parentElement?.tagName?.toLowerCase();
        if (parent === 'ol') parts.push(`  ${el.textContent?.trim()}`);
        else parts.push(`- ${el.textContent?.trim()}`);
      } else if (tag === 'br') {
        parts.push('\n');
      } else if (['p', 'div', 'blockquote', 'pre'].includes(tag)) {
        if (depth > 0) parts.push('\n');
        for (let i = 0; i < el.childNodes.length; i++) walk(el.childNodes[i], depth + 1);
        parts.push('\n');
      } else if (tag === 'table') {
        parts.push('\n[TABLE]\n');
        for (const row of el.querySelectorAll('tr')) {
          const cells = Array.from(row.querySelectorAll('td, th')).map(c => c.textContent?.trim()).filter(Boolean);
          parts.push(cells.join(' | '));
        }
        parts.push('[/TABLE]\n');
      } else {
        for (let i = 0; i < el.childNodes.length; i++) walk(el.childNodes[i], depth + 1);
      }
    }
  }
  walk(d, 0);
  return parts.join('').replace(/\n{3,}/g, '\n\n').trim();
}

function formatCSV(text: string): string {
  const lines = text.split('\n').filter(l => l.trim());
  if (!lines.length) return '';
  return lines.map((line, i) => {
    const cells = line.split(',').map(c => c.trim());
    if (i === 0) return `# ${cells.join('  |  ')}`;
    return cells.join('  |  ');
  }).join('\n');
}

function formatJSON(text: string): string {
  try { return JSON.stringify(JSON.parse(text), null, 2); }
  catch { return text; }
}

function stripHTML(html: string): string {
  const d = document.createElement('div');
  d.innerHTML = html;
  d.querySelectorAll('script, style').forEach(el => el.remove());
  d.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, li, pre, blockquote, tr').forEach(el => {
    el.after(document.createTextNode('\n'));
  });
  return d.textContent?.replace(/\n{3,}/g, '\n\n').trim() || '';
}

function readingTime(text: string): string {
  const words = text.split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(words / 200);
  return minutes < 1 ? '< 1 min' : `${minutes} min read`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface RecentDoc {
  name: string; type: string; size: number; pages?: number; date: string;
}

function getRecentDocs(): RecentDoc[] {
  try { return JSON.parse(localStorage.getItem('recent-documents') || '[]'); }
  catch { return []; }
}

function addRecentDoc(doc: RecentDoc) {
  try {
    const docs = getRecentDocs().filter(d => d.name !== doc.name);
    docs.unshift(doc);
    localStorage.setItem('recent-documents', JSON.stringify(docs.slice(0, 10)));
  } catch { /* empty */ }
}

const PROCESS_STEPS = [
  { key: 'uploading' as const, label: 'Uploading Document...', icon: Upload },
  { key: 'reading' as const, label: 'Reading Pages...', icon: FileText },
  { key: 'extracting' as const, label: 'Extracting Text...', icon: ScanLine },
  { key: 'processing' as const, label: 'Processing Structure...', icon: List },
  { key: 'formatting' as const, label: 'Formatting Content...', icon: Type },
  { key: 'preparing' as const, label: 'Preparing Note...', icon: CheckCircle2 },
];

export default function DocumentNotePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pageCount, setPageCount] = useState<number | undefined>();
  const [fileTypeExt, setFileTypeExt] = useState('');

  const [processStatus, setProcessStatus] = useState<'idle' | 'uploading' | 'reading' | 'extracting' | 'processing' | 'formatting' | 'preparing' | 'done' | 'error'>('idle');
  const [processError, setProcessError] = useState<string | null>(null);
  const [processProgress, setProcessProgress] = useState(0);



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

  const changeFontSize = (delta: number) => {
    setFontSize(prev => {
      const next = Math.min(Math.max(prev + delta, 10), 28);
      localStorage.setItem('noteqira-font-size', String(next));
      return next;
    });
  };

  const processFile = useCallback(async (f: File) => {
    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    setFile(f);
    setFileTypeExt(ext);
    setTitle(f.name.replace(/\.[^/.]+$/, ''));
    setContent('');
    setProcessProgress(0);
    setProcessError(null);
    setPageCount(undefined);
    setHistory(['']);
    setHistoryIndex(0);
    setFileUrl(URL.createObjectURL(f));

    setProcessStatus('uploading');
    await new Promise(r => setTimeout(r, 200));
    setProcessProgress(10);

    try {
      if (f.size > 100 * 1024 * 1024) throw new Error('File exceeds 100 MB limit.');
      if (f.size === 0) throw new Error('File is empty.');

      setProcessStatus('reading');
      setProcessProgress(25);

      let text = '';
      const extMap: Record<string, () => Promise<string>> = {
        pdf: async () => {
          const arrayBuffer = await f.arrayBuffer();
          const pdfjsLib = await import('pdfjs-dist');
          pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
            'pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url
          ).toString();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          setPageCount(pdf.numPages);
          setProcessProgress(35);
          const pages: string[] = [];
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const tc = await page.getTextContent();
            const items = tc.items as any[];
            const lines = groupPDFLines(items, page.getViewport({ scale: 1 }).height);
            pages.push(lines.join('\n'));
            setProcessProgress(35 + Math.round((i / pdf.numPages) * 30));
          }
          return pages.join('\n\n---\n\n');
        },
        docx: async () => {
          const arrayBuffer = await f.arrayBuffer();
          const mammoth = await import('mammoth');
          const result = await mammoth.convertToHtml({ arrayBuffer });
          return htmlToFormattedText(result.value);
        },
        csv: async () => formatCSV(await f.text()),
        json: async () => formatJSON(await f.text()),
        html: async () => stripHTML(await f.text()),
        htm: async () => stripHTML(await f.text()),
        md: async () => await f.text(),
        txt: async () => await f.text(),
        log: async () => await f.text(),
        xml: async () => {
          const raw = await f.text();
          try {
            const parser = new DOMParser();
            const xml = parser.parseFromString(raw, 'text/xml');
            const serializer = new XMLSerializer();
            return serializer.serializeToString(xml);
          } catch { return raw; }
        },
      };

      const parser = extMap[ext];
      if (!parser) throw new Error(`Unsupported file format (.${ext}).`);

      setProcessStatus('extracting');
      text = await parser();

      setProcessStatus('processing');
      setProcessProgress(75);
      await new Promise(r => setTimeout(r, 200));

      const formatted = ext === 'md' || ext === 'csv' || ext === 'json' || ext === 'xml'
        ? text : formatExtension(text);

      setProcessStatus('formatting');
      setProcessProgress(88);
      await new Promise(r => setTimeout(r, 200));

      setContent(formatted);
      setHistory([formatted]);
      setHistoryIndex(0);

      setProcessStatus('preparing');
      setProcessProgress(95);
      await new Promise(r => setTimeout(r, 200));

      setProcessProgress(100);
      setProcessStatus('done');

      const extName = getFileType(f.name);
      addRecentDoc({ name: f.name, type: extName, size: f.size, pages: pageCount, date: new Date().toISOString() });

      if (!text.trim()) toast.error('No readable content found in this document.');
      else toast.success('Document processed successfully!');
    } catch (err: any) {
      setProcessStatus('error');
      setProcessError(err.message || 'Failed to process this document.');
      toast.error('Document processing failed.');
    }
  }, [pageCount]);

  function groupPDFLines(items: any[], _pageHeight: number): string[] {
    const lines: { y: number; x: number; text: string; size: number }[] = [];
    let currentY = -1;
    let currentX = Infinity;
    let currentText = '';
    let currentSize = 0;

    const sorted = [...items].sort((a, b) => {
      const ay = a.transform[5], by = b.transform[5];
      if (Math.abs(ay - by) > 3) return by - ay;
      return a.transform[4] - b.transform[4];
    });

    for (const item of sorted) {
      const y = Math.round(item.transform[5]);
      const x = Math.round(item.transform[4]);
      const size = Math.round((item.height || 10) * 10) / 10;
      if (currentY === -1) {
        currentY = y; currentX = x; currentText = item.str; currentSize = size;
      } else if (Math.abs(y - currentY) <= 3) {
        if (x - (currentX + currentText.length * (currentSize * 0.5)) > 5 * currentSize) currentText += '  ';
        currentText += item.str;
        currentX = Math.min(currentX, x);
        currentSize = Math.max(currentSize, size);
      } else {
        lines.push({ y: currentY, x: currentX, text: currentText, size: currentSize });
        currentY = y; currentX = x; currentText = item.str; currentSize = size;
      }
    }
    if (currentText) lines.push({ y: currentY, x: currentX, text: currentText, size: currentSize });

    const avgSize = lines.reduce((s, l) => s + l.size, 0) / lines.length;

    return lines.map(l => {
      const isHeading = l.size > avgSize * 1.3 && l.text.length < 80;
      const isSubheading = l.size > avgSize * 1.1 && l.size <= avgSize * 1.3 && l.text.length < 60;
      const prefix = isHeading ? '# ' : isSubheading ? '## ' : '';
      return prefix + l.text;
    });
  }

  const handleFile = useCallback((f: File) => {
    processFile(f);
  }, [processFile]);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.kind === 'file') {
        const f = item.getAsFile();
        if (f) { processFile(f); break; }
      }
    }
  }, [processFile]);

  useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

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
      setHistoryIndex(historyIndex - 1);
      setContent(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setContent(history[historyIndex + 1]);
    }
  };

  const exportText = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${title || 'document-note'}.txt`; a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportMarkdown = () => {
    const md = `# ${title || 'Document Note'}\n\n${content}`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${title || 'document-note'}.md`; a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportDoc = () => {
    const name = title || 'Document Note';
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

  const exportJSON = () => {
    const data = JSON.stringify({ title: title || 'Document Note', content, extractedAt: new Date().toISOString(), source: file?.name || '', pages: pageCount }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${title || 'document-note'}.json`; a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportPDFile = () => {
    exportPDF(title || 'Document Note', content);
    setShowExportMenu(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content).then(() => { toast.success('Copied to clipboard'); setShowExportMenu(false); });
  };

  const printNote = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${title || 'Document Note'}</title><style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;padding:20px;line-height:1.8;color:#1a1a1a;}h1{font-size:28px;border-bottom:2px solid #ddd;padding-bottom:8px;}p{margin-bottom:12px;}</style></head><body><h1>${title || 'Document Note'}</h1>${content.split('\n').filter(p => p.trim()).map(p => {
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
        title: title || 'Document Note',
        content_plain: content,
        content: { type: 'doc', content: [{ type: 'paragraph', content }] },
        source_type: 'document' as const,
        word_count: content.split(/\s+/).filter(Boolean).length,
        processing_status: 'completed' as const,
        document_name: file?.name || '',
      };
      const data = await db.createNote(noteData as any);
      await db.createActivity({
        action: 'created', resource_type: 'note', resource_id: data.id,
        metadata: { title: noteData.title, source_type: 'document', document_name: file?.name },
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success('Document note saved!');
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      navigate(`/notes/${data.id}`, { replace: true });
    },
    onError: () => toast.error('Failed to save note'),
  });

  const clearAll = () => {
    setFile(null);
    setContent('');
    setTitle('');
    setFileUrl(null);
    setProcessStatus('idle');
    setProcessError(null);
    setPageCount(undefined);
    setHistory(['']);
    setHistoryIndex(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    localStorage.removeItem('document-note-draft');
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) setShowExportMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!file) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('document-note-draft', JSON.stringify({
          title, content, fileName: file.name, fileSize: file.size, fileUrl,
          fileTypeExt, pageCount, processStatus: processStatus === 'done' ? 'done' : 'idle',
          updatedAt: new Date().toISOString(),
        }));
      } catch { /* empty */ }
    }, 2000);
    return () => clearTimeout(timer);
  }, [title, content, file, fileUrl, fileTypeExt, pageCount, processStatus]);

  useEffect(() => {
    try {
      const draft = localStorage.getItem('document-note-draft');
      if (draft) {
        const p = JSON.parse(draft);
        if (p.fileName) {
          setTitle(p.title || '');
          setContent(p.content || '');
          setFileTypeExt(p.fileTypeExt || '');
          setPageCount(p.pageCount);
          setProcessStatus(p.processStatus === 'done' ? 'done' : 'idle');
          if (p.content) { setHistory([p.content]); setHistoryIndex(0); }
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
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') { e.preventDefault(); redo(); }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (content && processStatus === 'done') saveMutation.mutate();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [undo, redo, content, processStatus, saveMutation]);

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const charCount = content.length;
  const readTime = readingTime(content);
  const isProcessing = processStatus !== 'idle' && processStatus !== 'done' && processStatus !== 'error';
  const currentStepIdx = PROCESS_STEPS.findIndex(s => s.key === processStatus);
  const FileIcon = fileTypeExt ? getFileIcon(fileTypeExt) : File;

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
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-[#666666] tracking-wide">Document Processor</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {file && processStatus === 'done' && (
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

          {!file && (
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
                  Document Processor
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-[#555555] mt-2"
                >
                  Upload a document to extract and format content automatically
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
                    <div className={`w-72 h-72 rounded-full border transition-all duration-500 ${dragOver ? 'border-white/[0.06] scale-110' : 'border-white/[0.02]'}`} />
                    <div className={`w-52 h-52 rounded-full border transition-all duration-500 ${dragOver ? 'border-white/[0.04] scale-110' : 'border-white/[0.015]'}`} />
                  </div>

                  <div className="relative z-10 flex flex-col items-center gap-5">
                    <motion.div
                      animate={dragOver ? { y: -5, scale: 1.1 } : { y: 0, scale: 1 }}
                      className="w-24 h-24 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center group-hover:border-[#444444] transition-all"
                    >
                      <Upload className="w-10 h-10 text-[#666666] group-hover:text-white transition-colors" />
                    </motion.div>
                    <div>
                      <p className="text-base text-white font-medium">Drop your document here</p>
                      <p className="text-sm text-[#555555] mt-1">or click to browse</p>
                    </div>
                    <button className="px-5 py-2.5 bg-white/5 border border-white/10 text-white text-sm rounded-xl hover:bg-white/10 transition-all">
                      Choose Document
                    </button>
                    <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg">
                      {Object.keys(FILE_TYPES).slice(0, 7).map((ext) => (
                        <span key={ext} className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[10px] text-[#555555] font-mono uppercase tracking-wide">
                          .{ext}
                        </span>
                      ))}
                      {Object.keys(FILE_TYPES).length > 7 && (
                        <span className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[10px] text-[#444444] font-mono">
                          +{Object.keys(FILE_TYPES).length - 7} more
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#444444]">
                      <span className="flex items-center gap-1.5">
                        <Clipboard className="w-3 h-3" />
                        Paste document (Ctrl+V)
                      </span>
                      <span>Up to 100 MB</span>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.pdf,.doc,.docx,.rtf,.md,.csv,.json,.xml,.html,.htm,.log,.odt"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  />
                </div>
              </motion.div>


            </motion.div>
          )}

          {file && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="bg-[#111111] border border-[#1A1A1A] rounded-2xl overflow-hidden">
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">
                    <FileIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                    <p className="text-xs text-[#555555] mt-0.5">
                      {getFileType(file.name)} &middot; {formatFileSize(file.size)}
                      {pageCount ? ` \u00B7 ${pageCount} pages` : ''}
                      {file.lastModified ? ` \u00B7 ${new Date(file.lastModified).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {fileUrl && (
                      <a
                        href={fileUrl}
                        download={file.name}
                        className="p-2 rounded-lg text-[#555555] hover:text-white hover:bg-white/5 transition-all"
                        title="Download original"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    <button onClick={clearAll} className="p-2 rounded-lg text-[#555555] hover:text-red-400 hover:bg-red-500/10 transition-all" title="Remove">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {isProcessing && (
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
                        {(() => { const step = PROCESS_STEPS.find(s => s.key === processStatus); const Icon = step?.icon || Loader2; return <Icon className="w-7 h-7 text-white/60" />; })()}
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-base text-white font-medium">
                        {PROCESS_STEPS.find(s => s.key === processStatus)?.label || 'Processing...'}
                      </p>
                      <p className="text-xs text-[#555555] mt-1">
                        {processStatus === 'uploading' && 'Reading file metadata and validating'}
                        {processStatus === 'reading' && 'Opening document and scanning pages'}
                        {processStatus === 'extracting' && 'Extracting readable content from document'}
                        {processStatus === 'processing' && 'Detecting headings, lists, and structure'}
                        {processStatus === 'formatting' && 'Organizing content into a clean note'}
                        {processStatus === 'preparing' && 'Finalizing your editable document'}
                      </p>
                    </div>

                    <div className="w-full max-w-xs">
                      <div className="h-1 bg-[#1A1A1A] rounded-full overflow-hidden">
                        <motion.div className="h-full bg-white/20 rounded-full" initial={{ width: '0%' }} animate={{ width: `${processProgress}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} />
                      </div>
                      <p className="text-xs text-[#444444] text-center mt-2 tabular-nums">{processProgress}%</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      {PROCESS_STEPS.map((s, i) => {
                        const StepIcon = s.icon;
                        const isActive = i === currentStepIdx;
                        return (
                          <motion.div
                            key={s.key}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] transition-all ${
                              isActive ? 'bg-white/5 text-white' : i < currentStepIdx ? 'text-[#555555]' : 'text-[#333333]'
                            }`}
                            animate={isActive ? { scale: [1, 1.05, 1] } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <StepIcon className="w-3 h-3" />
                            <span className="hidden sm:inline">{s.label.replace('...', '')}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {processStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#111111] border border-red-500/20 rounded-2xl p-8 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-7 h-7 text-red-400" />
                  </div>
                  <p className="text-white font-medium mb-1">Processing Failed</p>
                  <p className="text-sm text-[#666666] mb-4">{processError}</p>
                  <button
                    onClick={() => { if (file) processFile(file); }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                </motion.div>
              )}

              {processStatus === 'done' && (
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
                        <button onClick={undo} disabled={historyIndex === 0} className="p-1.5 rounded-lg text-[#444444] hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed" title="Undo (Ctrl+Z)">
                          <Undo2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-1.5 rounded-lg text-[#444444] hover:text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed" title="Redo (Ctrl+Shift+Z)">
                          <Redo2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-4 bg-[#1A1A1A] mx-1" />
                        <button onClick={copyToClipboard} className="p-1.5 rounded-lg text-[#444444] hover:text-white hover:bg-white/5 transition-all" title="Copy all">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEditorFullscreen(prev => !prev)} className="p-1.5 rounded-lg text-[#444444] hover:text-white hover:bg-white/5 transition-all" title={editorFullscreen ? 'Minimize editor' : 'Expand editor'}>
                          {editorFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <span className="text-xs text-[#444444]">{readTime}</span>
                    </div>

                    <textarea
                      ref={textareaRef}
                      value={content}
                      onChange={(e) => updateContent(e.target.value)}
                      className="w-full min-h-[300px] max-h-[65vh] p-5 bg-transparent text-[#C8C8C8] leading-relaxed resize-none outline-none placeholder:text-[#333333]"
                      style={{ fontSize: `${fontSize}px` }}
                      placeholder="Extracted content will appear here..."
                    />

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
                          <button onClick={() => setShowExportMenu(prev => !prev)} className="p-2 rounded-lg text-[#444444] hover:text-white hover:bg-white/5 transition-all" title="Export">
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
                                <button onClick={exportJSON} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#C8C8C8] hover:bg-white/5 transition-colors text-left">
                                  <FileCode className="w-4 h-4" /> Export as JSON
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
                This will remove the document and all extracted content. This action cannot be undone.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button onClick={() => setShowClearConfirm(false)} className="px-4 py-2 rounded-xl text-sm text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-all">
                  Cancel
                </button>
                <button onClick={() => { clearAll(); setShowClearConfirm(false); }} className="px-4 py-2 rounded-xl text-sm text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all">
                  Clear
                </button>
              </div>
            </motion.div>
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
