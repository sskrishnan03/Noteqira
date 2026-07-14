import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Star,
  Pin,
  Clock,
  Archive,
  Trash2,
  Pencil,
  MoreHorizontal,
  FileText,
  Mic,
  Image,
} from 'lucide-react';

interface CalendarSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDates: Date[];
  notes: any[];
  onNoteClick: (noteId: string) => void;
  onToggleFavorite: (note: any) => void;
  onTogglePin: (note: any) => void;
  onToggleArchive: (note: any) => void;
  onDelete: (note: any) => void;
  openMenuId: string | null;
  onMenuToggle: (id: string | null) => void;
}

const sourceIcons: Record<string, typeof FileText> = {
  manual: FileText,
  voice: Mic,
  image: Image,
  document: FileText,
};

export default function CalendarSidePanel({
  isOpen,
  onClose,
  selectedDates,
  notes,
  onNoteClick,
  onToggleFavorite,
  onTogglePin,
  onToggleArchive,
  onDelete,
  openMenuId,
  onMenuToggle,
}: CalendarSidePanelProps) {
  const [previewNote, setPreviewNote] = useState<any | null>(null);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPreview = (content: string) => {
    if (!content) return 'No content';
    const lines = content.split('\n').filter(line => line.trim());
    return lines.slice(0, 2).join('\n') + (lines.length > 2 ? '...' : '');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full lg:w-[480px] bg-[#111111] border-l border-[#2A2A2A] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A]">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">
                  {selectedDates.length === 1
                    ? formatDate(selectedDates[0])
                    : `${selectedDates.length} dates selected`}
                </h2>
                <p className="text-sm text-[#8A8A8A]">
                  {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notes list */}
            <div className="flex-1 overflow-y-auto p-6">
              {notes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-[#1B1B1B] flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-[#555555]" />
                  </div>
                  <p className="text-[#8A8A8A]">No notes found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notes.map((note) => {
                    const Icon = sourceIcons[note.source_type] || FileText;
                    const isMenuOpen = openMenuId === note.id;

                    return (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group relative"
                      >
                        <div
                          onClick={() => onNoteClick(note.id)}
                          className="p-4 rounded-xl bg-[#161616] border border-[#2A2A2A] hover:border-white/20 cursor-pointer transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-white" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="font-medium text-white truncate">
                                  {note.title || 'Untitled'}
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

                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs text-[#555555] flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatTime(note.updated_at)}
                                </span>
                                <span className="text-xs text-[#555555]">
                                  {note.source_type}
                                </span>
                              </div>

                              {previewNote === note.id && (
                                <div className="mt-3 pt-3 border-t border-[#2A2A2A]">
                                  <p className="text-sm text-[#8A8A8A] whitespace-pre-wrap">
                                    {getPreview(note.content_plain)}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Quick actions */}
                          <div className="absolute right-4 top-4 pointer-events-none">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMenuToggle(isMenuOpen ? null : note.id);
                              }}
                              className="p-2 rounded-lg text-[#555555] hover:text-white hover:bg-white/5 transition-all pointer-events-auto"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            <AnimatePresence>
                              {isMenuOpen && (
                                <>
                                  <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => onMenuToggle(null)}
                                  />
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                                    className="absolute right-0 top-full mt-1 z-50 w-44 bg-[#161616] border border-[#2A2A2A] rounded-xl p-1 shadow-xl pointer-events-auto"
                                  >
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onMenuToggle(null);
                                        onNoteClick(note.id);
                                      }}
                                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-[#C8C8C8] hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                      <Pencil className="w-4 h-4" />
                                      Open
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onMenuToggle(null);
                                        onTogglePin(note);
                                      }}
                                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-[#C8C8C8] hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                      <Pin className="w-4 h-4" />
                                      {note.is_pinned ? 'Unpin' : 'Pin'}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onMenuToggle(null);
                                        onToggleFavorite(note);
                                      }}
                                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-[#C8C8C8] hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                      <Star className="w-4 h-4" />
                                      {note.is_favorite ? 'Unfavorite' : 'Favorite'}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onMenuToggle(null);
                                        onToggleArchive(note);
                                      }}
                                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-[#C8C8C8] hover:bg-white/5 hover:text-white transition-colors"
                                    >
                                      <Archive className="w-4 h-4" />
                                      {note.is_archived ? 'Unarchive' : 'Archive'}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onMenuToggle(null);
                                        onDelete(note);
                                      }}
                                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Delete
                                    </button>
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#2A2A2A]">
              <button
                onClick={() => setPreviewNote(previewNote ? null : notes[0]?.id)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-[#1B1B1B] border border-[#2A2A2A] text-[#C8C8C8] hover:bg-white/5 transition-all"
              >
                {previewNote ? 'Hide Previews' : 'Show Previews'}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
