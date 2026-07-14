import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Star,
  Pin,
  Archive,
  FileText,
  Mic,
  Image,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '@/lib/data';

const sourceIcons: Record<string, typeof FileText> = {
  manual: FileText,
  voice: Mic,
  image: Image,
  document: FileText,
};

export default function NoteView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: note, isLoading } = useQuery({
    queryKey: ['note', id],
    queryFn: () => db.getNote(id!),
    enabled: !!id,
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!note) return;
      await db.updateNote(note.id, { is_favorite: !note.is_favorite });
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
      await db.updateNote(note.id, { is_pinned: !note.is_pinned });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', id] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success(note?.is_pinned ? 'Unpinned' : 'Pinned');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await db.deleteNote(id!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Moved to Trash');
      navigate('/trash');
    },
  });

  const toggleArchiveMutation = useMutation({
    mutationFn: async () => {
      if (!note) return;
      await db.updateNote(note.id, { is_archived: !note.is_archived });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['note', id] });
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success(note?.is_archived ? 'Unarchived' : 'Archived');
    },
  });

  if (isLoading || !note) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  const Icon = sourceIcons[note.source_type] || FileText;
  const processingComplete = note.processing_status === 'completed' || note.processing_status === 'done';
  const processingError = note.processing_status === 'error';
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
              <Icon className="w-5 h-5 text-white" />
              <span className="text-sm text-[#8A8A8A] capitalize">{note.source_type}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavoriteMutation.mutate()}
              className={`p-2 rounded-lg transition-colors ${
                note.is_favorite
                  ? 'text-white bg-white/10'
                  : 'text-[#8A8A8A] hover:text-white hover:bg-white/5'
              }`}
              title={note.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star className={`w-5 h-5 ${note.is_favorite ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={() => togglePinMutation.mutate()}
              className={`p-2 rounded-lg transition-colors ${
                note.is_pinned
                  ? 'text-white bg-white/10'
                  : 'text-[#8A8A8A] hover:text-white hover:bg-white/5'
              }`}
              title={note.is_pinned ? 'Unpin' : 'Pin'}
            >
              <Pin className={`w-5 h-5 ${note.is_pinned ? 'fill-white' : ''}`} />
            </button>

            <Link
              to={`/notes/${id}/edit`}
              className="p-2 rounded-lg text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-colors"
              title="Edit note"
            >
              <Edit3 className="w-5 h-5" />
            </Link>

            <button
              onClick={() => toggleArchiveMutation.mutate()}
              className={`p-2 rounded-lg transition-colors ${
                note.is_archived
                  ? 'text-white bg-white/10'
                  : 'text-[#8A8A8A] hover:text-white hover:bg-white/5'
              }`}
              title={note.is_archived ? 'Unarchive' : 'Archive'}
            >
              <Archive className={`w-5 h-5 ${note.is_archived ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-lg text-[#8A8A8A] hover:text-white hover:bg-white/10 transition-colors"
              title="Move to Trash"
            >
              <Trash2 className="w-5 h-5" />
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
            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-3">{note.title}</h1>

              {/* Status badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {note.is_pinned && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-white/10 text-white">
                    <Pin className="w-3 h-3" />
                    Pinned
                  </span>
                )}
                {note.is_favorite && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-white/10 text-white">
                    <Star className="w-3 h-3 fill-white" />
                    Favorite
                  </span>
                )}
                {note.is_archived && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-white/10 text-white">
                    <Archive className="w-3 h-3" />
                    Archived
                  </span>
                )}
                {processingComplete && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-green-500/10 text-green-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Processed
                  </span>
                )}
                {processingError && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-red-500/10 text-red-400">
                    <AlertCircle className="w-3 h-3" />
                    Error
                  </span>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-6">
              <h2 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider text-[#8A8A8A]">Details</h2>
              <div className="space-y-1">
                <p className="text-xs text-[#555555]">Created</p>
                <p className="text-sm text-white">{new Date(note.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            {/* Image Preview (for image notes) */}
            {(note as any).image_data && (
              <div className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-6">
                <h2 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider text-[#8A8A8A]">Source Image</h2>
                <img
                  src={(note as any).image_data}
                  alt="Source"
                  className="max-h-[400px] w-full object-contain rounded-xl bg-[#0B0B0B]"
                />
              </div>
            )}

            {/* Content */}
            <div className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-6">
              <h2 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider text-[#8A8A8A]">Content</h2>
              <div className="prose-cogni">
                {note.content_plain ? (
                  note.content_plain.split('\n').map((paragraph: string, i: number) => (
                    paragraph.trim() ? (
                      <p key={i} className="text-[#C8C8C8] leading-relaxed mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    ) : (
                      <br key={i} />
                    )
                  ))
                ) : (
                  <p className="text-[#555555] italic">No content</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-sm bg-[#161616] border border-[#2A2A2A] rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-lg font-semibold text-white mb-2">Move note to Trash?</h3>
              <p className="text-sm text-[#8A8A8A] mb-6 leading-relaxed">
                &ldquo;{note.title || 'Untitled'}&rdquo; will stay in Trash for 30 days before it can be automatically removed.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-xl text-sm text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    deleteMutation.mutate();
                  }}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 rounded-xl text-sm text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all disabled:opacity-50"
                >
                  Move to Trash
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
