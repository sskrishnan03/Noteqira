import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArchiveRestore,
  CalendarClock,
  Clock,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { db } from '@/lib/data';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import type { Note } from '@/types';

type TrashAction = 'restore' | 'delete';

function daysRemaining(note: Note) {
  if (!note.permanently_delete_at) return 30;
  const diff = new Date(note.permanently_delete_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDeletedDate(note: Note) {
  if (!note.deleted_at) return 'Moved recently';
  return new Date(note.deleted_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Trash() {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [pendingAction, setPendingAction] = useState<{ note: Note; action: TrashAction } | null>(null);

  const { data: trashNotes = [], isLoading } = useQuery({
    queryKey: ['notes', 'trash'],
    queryFn: () => db.getNotes({ trashed: true }),
  });

  const filteredNotes = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return trashNotes;
    return trashNotes.filter((note) =>
      note.title.toLowerCase().includes(q) ||
      note.content_plain.toLowerCase().includes(q)
    );
  }, [query, trashNotes]);

  const stats = useMemo(() => {
    const expiringSoon = trashNotes.filter((note) => daysRemaining(note) <= 7).length;
    const wordCount = trashNotes.reduce((sum, note) => sum + (note.word_count || 0), 0);
    const oldest = trashNotes.reduce((min, note) => {
      if (!note.deleted_at) return min;
      const days = Math.floor((Date.now() - new Date(note.deleted_at).getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(min, days);
    }, 0);

    return [
      { label: 'Items in Trash', value: trashNotes.length, icon: Trash2 },
      { label: 'Expiring Soon', value: expiringSoon, icon: CalendarClock },
      { label: 'Words Held', value: wordCount.toLocaleString(), icon: FileText },
      { label: 'Oldest Item', value: oldest ? `${oldest}d` : 'New', icon: Clock },
    ];
  }, [trashNotes]);

  const restoreMutation = useMutation({
    mutationFn: (id: string) => db.restoreNote(id),
    onSuccess: () => {
      toast.success('Note restored');
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes', 'trash'] });
    },
    onError: () => toast.error('Could not restore note'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => db.permanentlyDeleteNote(id),
    onSuccess: () => {
      toast.success('Note permanently deleted');
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes', 'trash'] });
    },
    onError: () => toast.error('Could not permanently delete note'),
  });

  const handleConfirm = () => {
    if (!pendingAction) return;
    if (pendingAction.action === 'restore') {
      restoreMutation.mutate(pendingAction.note.id);
    } else {
      deleteMutation.mutate(pendingAction.note.id);
    }
    setPendingAction(null);
  };

  return (
    <div className="bg-[#0B0B0B] min-h-screen">
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(true)}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-72' : 'lg:pl-[68px]'}`}>
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="px-4 lg:px-8 pb-8 max-w-7xl mx-auto pt-28">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">Trash</h1>
                </div>
                <p className="text-[#8A8A8A]">
                  Deleted notes stay here for at least 30 days before automatic cleanup.
                </p>
              </div>

              <div className="relative w-full lg:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search Trash..."
                  className="w-full pl-10 pr-4 py-3 bg-[#111111]/70 border border-[#2A2A2A] rounded-xl text-white placeholder:text-[#555555] focus:outline-none focus:border-white/30 transition-all"
                />
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-5"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-[#8A8A8A]">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {isLoading ? (
            <div className="min-h-[280px] flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          ) : filteredNotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20 bg-[#161616] border border-[#2A2A2A] rounded-2xl"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-[#555555]" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                {query ? 'No deleted notes found' : 'Trash is empty'}
              </h2>
              <p className="text-[#8A8A8A] mb-6">
                {query ? 'Try another word or clear the search.' : 'Notes you delete will appear here first.'}
              </p>
              {!query && (
                <Link to="/dashboard" className="btn-primary">
                  Back to Dashboard
                </Link>
              )}
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredNotes.map((note, index) => {
                const remaining = daysRemaining(note);
                return (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-5 flex flex-col min-h-[230px]"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="w-11 h-11 rounded-xl bg-[#0B0B0B] border border-[#2A2A2A] flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full border ${
                        remaining <= 7
                          ? 'bg-red-500/10 border-red-500/20 text-red-300'
                          : 'bg-white/5 border-white/10 text-[#C8C8C8]'
                      }`}>
                        {remaining} days left
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white line-clamp-1">{note.title || 'Untitled'}</h3>
                    <p className="text-sm text-[#8A8A8A] mt-2 line-clamp-3 flex-1">
                      {note.content_plain || 'No content'}
                    </p>

                    <div className="mt-5 pt-4 border-t border-[#2A2A2A]">
                      <div className="flex items-center justify-between text-xs text-[#555555] mb-4">
                        <span>Deleted {formatDeletedDate(note)}</span>
                        <span>{note.word_count || 0} words</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setPendingAction({ note, action: 'restore' })}
                          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-sm text-white hover:bg-white/15 transition-all"
                        >
                          <ArchiveRestore className="w-4 h-4" />
                          Restore
                        </button>
                        <button
                          onClick={() => setPendingAction({ note, action: 'delete' })}
                          className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300 hover:bg-red-500/15 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {pendingAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPendingAction(null)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-sm bg-[#161616] border border-[#2A2A2A] rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {pendingAction.action === 'restore' ? 'Restore Note' : 'Delete Forever'}
                </h3>
                <button
                  onClick={() => setPendingAction(null)}
                  className="p-1 rounded-lg text-[#8A8A8A] hover:text-white hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-[#C8C8C8] leading-relaxed mb-6">
                {pendingAction.action === 'restore'
                  ? `Restore "${pendingAction.note.title || 'Untitled'}" back to your notes?`
                  : `Permanently delete "${pendingAction.note.title || 'Untitled'}"? This cannot be undone.`}
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setPendingAction(null)}
                  className="px-4 py-2 rounded-xl text-sm text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={restoreMutation.isPending || deleteMutation.isPending}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    pendingAction.action === 'restore'
                      ? 'bg-white text-[#0B0B0B] hover:bg-[#C8C8C8]'
                      : 'bg-red-500/90 text-white hover:bg-red-500'
                  }`}
                >
                  {restoreMutation.isPending || deleteMutation.isPending ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                  {pendingAction.action === 'restore' ? 'Restore' : 'Delete Forever'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
