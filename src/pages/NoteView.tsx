import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Star,
  Pin,
  Share2,
  MoreHorizontal,
  Brain,
  Sparkles,
  BookOpen,
  CheckCircle,
  Clock,
  Tag,
  FileText,
  Mic,
  Image,
  Video,
  Link2,
  Wand2,
  HelpCircle,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

const sourceIcons: Record<string, typeof FileText> = {
  manual: FileText,
  voice: Mic,
  image: Image,
  video: Video,
  url: Link2,
  document: FileText,
  audio: Mic,
};

export default function NoteView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  const { data: note, isLoading } = useQuery({
    queryKey: ['note', id],
    queryFn: async () => {
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

  const { data: flashcards } = useQuery({
    queryKey: ['flashcards', 'note', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('note_id', id);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!note) return;
      const { error } = await supabase
        .from('notes')
        .update({ is_favorite: !note.is_favorite })
        .eq('id', note.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', id] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success(note?.is_favorite ? 'Removed from favorites' : 'Added to favorites');
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: async () => {
      if (!note) return;
      const { error } = await supabase
        .from('notes')
        .update({ is_pinned: !note.is_pinned })
        .eq('id', note.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', id] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success(note?.is_pinned ? 'Unpinned' : 'Pinned');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Note deleted');
      navigate('/dashboard');
    },
  });

  const handleChatSend = () => {
    if (!chatMessage.trim()) return;

    setChatMessages((prev) => [...prev, { role: 'user', content: chatMessage }]);

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Based on this note, here's what I found about "${chatMessage}"...`,
        },
      ]);
    }, 1000);

    setChatMessage('');
  };

  if (isLoading || !note) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  const Icon = sourceIcons[note.source_type] || FileText;

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
              <Icon className="w-5 h-5 text-primary-400" />
              <span className="text-sm text-secondary-400 capitalize">{note.source_type}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavoriteMutation.mutate()}
              className={`p-2 rounded-lg transition-colors ${
                note.is_favorite
                  ? 'text-amber-400 bg-amber-500/10'
                  : 'text-secondary-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Star className={`w-5 h-5 ${note.is_favorite ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              onClick={() => togglePinMutation.mutate()}
              className={`p-2 rounded-lg transition-colors ${
                note.is_pinned
                  ? 'text-primary-400 bg-primary-500/10'
                  : 'text-secondary-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Pin className={`w-5 h-5 ${note.is_pinned ? 'fill-primary-400' : ''}`} />
            </button>

            <Link
              to={`/notes/${id}/edit`}
              className="p-2 rounded-lg text-secondary-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Edit3 className="w-5 h-5" />
            </Link>

            <button
              onClick={() => setShowChat(!showChat)}
              className={`p-2 rounded-lg transition-colors ${
                showChat
                  ? 'text-primary-400 bg-primary-500/10'
                  : 'text-secondary-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>

            <button
              onClick={() => deleteMutation.mutate()}
              className="p-2 rounded-lg text-secondary-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
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
            className="space-y-8"
          >
            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-4">{note.title}</h1>
              <div className="flex items-center gap-4 text-sm text-secondary-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
                <span>{note.word_count} words</span>
                <span>{note.read_time_minutes} min read</span>
              </div>
            </div>

            {/* AI Summary */}
            {note.ai_summary && (
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5 text-primary-400" />
                  <h2 className="font-semibold text-white">AI Summary</h2>
                </div>
                <p className="text-secondary-300 leading-relaxed">{note.ai_summary}</p>
              </div>
            )}

            {/* Key Points */}
            {note.ai_key_points && Array.isArray(note.ai_key_points) && note.ai_key_points.length > 0 && (
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <h2 className="font-semibold text-white">Key Points</h2>
                </div>
                <ul className="space-y-2">
                  {note.ai_key_points.map((point: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-secondary-300">
                      <CheckCircle className="w-4 h-4 text-accent-400 flex-shrink-0 mt-1" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Note Content */}
            <div className="glass-card p-6">
              <h2 className="font-semibold text-white mb-4">Content</h2>
              <div className="prose-cogni">
                {note.content_plain?.split('\n').map((paragraph, i) => (
                  <p key={i} className="text-secondary-300 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Flashcards */}
            {flashcards && flashcards.length > 0 && (
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary-400" />
                    <h2 className="font-semibold text-white">Flashcards</h2>
                  </div>
                  <Link
                    to={`/flashcards?note=${id}`}
                    className="text-sm text-primary-400 hover:text-primary-300"
                  >
                    Study all {flashcards.length} cards
                  </Link>
                </div>
                <div className="grid gap-3">
                  {flashcards.slice(0, 3).map((card) => (
                    <div
                      key={card.id}
                      className="p-4 rounded-xl bg-surface-950/50 border border-white/5"
                    >
                      <p className="text-white font-medium">{card.front_content}</p>
                      <p className="text-secondary-400 text-sm mt-2">{card.back_content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {note.ai_topics && Array.isArray(note.ai_topics) && note.ai_topics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {note.ai_topics.map((topic: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full bg-surface-800/50 text-sm text-secondary-300 flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {topic}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* AI Chat overlay */}
      {showChat && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed right-4 bottom-4 w-96 max-h-[500px] glass-card flex flex-col z-50"
        >
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary-400" />
              <span className="font-medium text-white">Chat with Note</span>
            </div>
            <button
              onClick={() => setShowChat(false)}
              className="text-secondary-400 hover:text-white"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80">
            {chatMessages.length === 0 && (
              <div className="text-center py-8">
                <Brain className="w-10 h-10 text-primary-400 mx-auto mb-3" />
                <p className="text-secondary-400">Ask questions about this note</p>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-xl ${
                    msg.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-surface-800 text-secondary-200'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-white/5">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                placeholder="Ask anything..."
                className="flex-1 input-base"
              />
              <button onClick={handleChatSend} className="btn-primary px-4">
                <Wand2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
