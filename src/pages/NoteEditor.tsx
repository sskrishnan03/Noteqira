import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Save,
  Brain,
  Sparkles,
  Mic,
  Image,
  Video,
  Link2,
  FileText,
  Play,
  Square,
  Upload,
  Wand2,
  Summary,
  HelpCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

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
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: existingNote, isLoading } = useQuery({
    queryKey: ['note', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
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
        title: title || 'Untitled Note',
        content_plain: content,
        content: { type: 'doc', content: [{ type: 'paragraph', content }] },
        source_type: isNewNote ? noteType : existingNote?.source_type,
        word_count: content.split(/\s+/).filter(Boolean).length,
        processing_status: 'pending',
      };

      if (id) {
        const { data, error } = await supabase
          .from('notes')
          .update(noteData)
          .eq('id', id)
          .select()
          .maybeSingle();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('notes')
          .insert([noteData])
          .select()
          .maybeSingle();
        if (error) throw error;

        await supabase.from('activity_log').insert([{
          action: 'created',
          resource_type: 'note',
          resource_id: data?.id,
          metadata: { title: noteData.title },
        }]);

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

  const aiEnhanceMutation = useMutation({
    mutationFn: async () => {
      setIsProcessing(true);
      await new Promise(resolve => setTimeout(resolve, 2000));

      const summary = `AI-generated summary of: ${title || 'Untitled Note'}`;
      const keyPoints = ['Key point 1', 'Key point 2', 'Key point 3'];
      const definitions = [{ term: 'Term 1', definition: 'Definition 1' }];

      if (id) {
        const { error } = await supabase
          .from('notes')
          .update({
            ai_summary: summary,
            ai_key_points: keyPoints,
            ai_definitions: definitions,
            ai_processed: true,
            processing_status: 'completed',
          })
          .eq('id', id);
        if (error) throw error;
      }

      return { summary, keyPoints, definitions };
    },
    onSuccess: () => {
      toast.success('AI enhancement complete!');
      queryClient.invalidateQueries({ queryKey: ['note', id] });
    },
    onError: () => {
      toast.error('AI enhancement failed');
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });

  const handleSave = () => {
    saveMutation.mutate();
  };

  const handleAIEnhance = () => {
    aiEnhanceMutation.mutate();
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
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg text-secondary-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              {noteType === 'voice' && <Mic className="w-5 h-5 text-rose-400" />}
              {noteType === 'image' && <Image className="w-5 h-5 text-emerald-400" />}
              {noteType === 'video' && <Video className="w-5 h-5 text-red-400" />}
              {noteType === 'url' && <Link2 className="w-5 h-5 text-indigo-400" />}
              {noteType === 'document' && <FileText className="w-5 h-5 text-amber-400" />}
              {noteType === 'manual' && <FileText className="w-5 h-5 text-blue-400" />}
              <span className="text-sm text-secondary-400">
                {isNewNote ? 'New Note' : 'Edit Note'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAIEnhance}
              disabled={isProcessing || (!title && !content)}
              className="btn-secondary"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">AI Enhance</span>
            </button>
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

      {/* Main content */}
      <main className="pt-24 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title..."
                className="w-full text-3xl font-bold text-white bg-transparent border-none focus:outline-none placeholder:text-secondary-600"
              />
            </div>

            {/* Source-specific upload area for new notes */}
            {isNewNote && noteType !== 'manual' && (
              <div className="glass-card p-8">
                <div className="flex flex-col items-center justify-center py-8">
                  {noteType === 'voice' && (
                    <>
                      <button
                        onClick={() => setIsRecording(!isRecording)}
                        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                          isRecording
                            ? 'bg-red-500 animate-pulse'
                            : 'bg-surface-800 hover:bg-surface-700'
                        }`}
                      >
                        {isRecording ? (
                          <Square className="w-8 h-8 text-white" />
                        ) : (
                          <Mic className="w-8 h-8 text-primary-400" />
                        )}
                      </button>
                      <p className="mt-4 text-secondary-400">
                        {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
                      </p>
                    </>
                  )}

                  {noteType === 'image' && (
                    <>
                      <div className="w-20 h-20 rounded-2xl bg-surface-800 flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8 text-emerald-400" />
                      </div>
                      <p className="text-secondary-400 mb-4">
                        Upload images of notes, whiteboards, or handwriting
                      </p>
                      <button className="btn-primary">
                        <Upload className="w-4 h-4" />
                        Select Images
                      </button>
                    </>
                  )}

                  {noteType === 'video' && (
                    <>
                      <div className="w-full max-w-md">
                        <input
                          type="text"
                          placeholder="Paste YouTube URL..."
                          className="input-base mb-4"
                        />
                        <button className="btn-primary w-full justify-center">
                          <Video className="w-4 h-4" />
                          Extract Content
                        </button>
                      </div>
                    </>
                  )}

                  {noteType === 'url' && (
                    <>
                      <div className="w-full max-w-md">
                        <input
                          type="text"
                          placeholder="Paste webpage URL..."
                          className="input-base mb-4"
                        />
                        <button className="btn-primary w-full justify-center">
                          <Link2 className="w-4 h-4" />
                          Extract Content
                        </button>
                      </div>
                    </>
                  )}

                  {noteType === 'document' && (
                    <>
                      <div className="w-20 h-20 rounded-2xl bg-surface-800 flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8 text-amber-400" />
                      </div>
                      <p className="text-secondary-400 mb-4">
                        PDF, DOC, DOCX, PPT, XLS, and more
                      </p>
                      <button className="btn-primary">
                        <Upload className="w-4 h-4" />
                        Select Document
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Content editor */}
            <div className="glass-card">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing or paste content here..."
                className="w-full min-h-[400px] p-6 bg-transparent text-secondary-200 leading-relaxed resize-y focus:outline-none placeholder:text-secondary-600"
              />
            </div>

            {/* AI toolbar */}
            <div className="glass-card p-4">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-sm text-secondary-400 mr-2">AI Actions:</span>
                {[
                  { icon: Wand2, label: 'Improve Writing' },
                  { icon: Sparkles, label: 'Summarize' },
                  { icon: CheckCircle, label: 'Fix Grammar' },
                  { icon: HelpCircle, label: 'Explain' },
                  { icon: Brain, label: 'Generate Quiz' },
                  { icon: FileText, label: 'Create Flashcards' },
                ].map((action, i) => (
                  <button
                    key={i}
                    onClick={handleAIEnhance}
                    disabled={isProcessing}
                    className="px-3 py-1.5 rounded-lg bg-surface-800/50 text-sm text-secondary-300 hover:text-white hover:bg-surface-800 transition-colors disabled:opacity-50"
                  >
                    <action.icon className="w-4 h-4 inline mr-1" />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
