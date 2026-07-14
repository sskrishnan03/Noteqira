import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Mic,
  Image,
  MoreHorizontal,
  Star,
  Pin,
  Clock,
  Pencil,
  Trash2,
  X,
  Archive,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { db } from '@/lib/data';

interface Note {
  id: string;
  title: string;
  source_type: string;
  is_favorite: boolean;
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

interface RecentNotesProps {
  notes: Note[];
  isLoading: boolean;
  title?: string;
}

const sourceIcons: Record<string, typeof FileText> = {
  manual: FileText,
  voice: Mic,
  image: Image,
  document: FileText,
};

function formatDate(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

export default function RecentNotes({ notes, isLoading, title = 'Recent Notes' }: RecentNotesProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);

  async function handleDelete() {
    if (!deleteTarget) return;
    await db.deleteNote(deleteTarget.id);
    setDeleteTarget(null);
    setOpenMenuId(null);
    queryClient.invalidateQueries({ queryKey: ['notes'] });
    toast.success('Moved to Trash');
  }

  async function handleArchive(note: Note) {
    await db.updateNote(note.id, { is_archived: !note.is_archived } as any);
    setOpenMenuId(null);
    queryClient.invalidateQueries({ queryKey: ['notes'] });
  }

  if (isLoading) {
    return (
      <div className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>
        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-[#1B1B1B]/50 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <Link
            to="/dashboard?filter=recent"
            className="text-sm text-white hover:text-[#C8C8C8] transition-colors"
          >
            View all
          </Link>
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-[#1B1B1B] flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-[#555555]" />
            </div>
            <p className="text-[#8A8A8A] mb-4">No notes yet</p>
            <Link
              to="/notes/new"
              className="text-white hover:text-[#C8C8C8] text-sm transition-colors"
            >
              Create your first note
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {notes.map((note, i) => {
              const Icon = sourceIcons[note.source_type] || FileText;

              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative"
                >
                  <Link
                    to={`/notes/${note.id}`}
                    className="group flex items-start gap-4 p-4 rounded-xl bg-[#0B0B0B]/50 border border-[#2A2A2A] hover:border-white/20 hover:bg-[#111111]/50 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-white group-hover:text-white transition-colors truncate">
                          {note.title}
                        </h3>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {note.is_pinned && (
                            <Pin className="w-4 h-4 text-white/60" />
                          )}
                          {note.is_favorite && (
                            <Star className="w-4 h-4 text-white/60" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-[#555555] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(note.updated_at)}
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === note.id ? null : note.id);
                      }}
                      className="p-2 rounded-lg text-[#555555] hover:text-white hover:bg-white/5 transition-all pointer-events-auto"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    <AnimatePresence>
                      {openMenuId === note.id && (
                        <>
                          <div
                            className="fixed inset-0 z-40"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                            className="absolute right-0 top-full mt-1 z-50 w-40 bg-[#161616] border border-[#2A2A2A] rounded-xl p-1 shadow-xl pointer-events-auto"
                          >
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setOpenMenuId(null);
                                navigate(`/notes/${note.id}/edit`);
                              }}
                              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-[#C8C8C8] hover:bg-white/5 hover:text-white transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setOpenMenuId(null);
                                handleArchive(note);
                              }}
                              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-[#C8C8C8] hover:bg-white/5 hover:text-white transition-colors"
                            >
                              <Archive className="w-4 h-4" />
                              {note.is_archived ? 'Unarchive' : 'Archive'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                setOpenMenuId(null);
                                setDeleteTarget(note);
                              }}
                              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-[#C8C8C8] hover:bg-white/5 hover:text-white transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setDeleteTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-sm bg-[#161616] border border-[#2A2A2A] rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Move to Trash</h3>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="p-1 rounded-lg text-[#8A8A8A] hover:text-white hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[#C8C8C8] mb-6">
                Move <span className="text-white font-medium">&ldquo;{deleteTarget.title}&rdquo;</span> to Trash? It will stay there for 30 days before automatic cleanup.
              </p>
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-xl text-sm text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-white text-[#0B0B0B] hover:bg-[#C8C8C8] transition-colors"
                >
                  Move to Trash
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
