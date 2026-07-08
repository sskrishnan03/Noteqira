import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Mic,
  Image,
  Video,
  Link2,
  MoreHorizontal,
  Star,
  Pin,
  Brain,
  Clock,
} from 'lucide-react';

interface Note {
  id: string;
  title: string;
  source_type: string;
  ai_summary: string | null;
  is_favorite: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

interface RecentNotesProps {
  notes: Note[];
  isLoading: boolean;
}

const sourceIcons: Record<string, typeof FileText> = {
  manual: FileText,
  voice: Mic,
  image: Image,
  video: Video,
  url: Link2,
  document: FileText,
  audio: Mic,
};

const sourceColors: Record<string, string> = {
  manual: 'bg-blue-500',
  voice: 'bg-rose-500',
  image: 'bg-emerald-500',
  video: 'bg-red-500',
  url: 'bg-indigo-500',
  document: 'bg-amber-500',
  audio: 'bg-purple-500',
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

export default function RecentNotes({ notes, isLoading }: RecentNotesProps) {
  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Notes</h2>
        </div>
        <div className="grid gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-surface-800/50 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Recent Notes</h2>
        <Link
          to="/dashboard?filter=recent"
          className="text-sm text-primary-400 hover:text-primary-300 transition-colors"
        >
          View all
        </Link>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-surface-800/50 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-secondary-500" />
          </div>
          <p className="text-secondary-400 mb-4">No notes yet</p>
          <Link
            to="/notes/new"
            className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
          >
            Create your first note
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {notes.map((note, i) => {
            const Icon = sourceIcons[note.source_type] || FileText;
            const colorClass = sourceColors[note.source_type] || 'bg-blue-500';

            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/notes/${note.id}`}
                  className="group flex items-start gap-4 p-4 rounded-xl bg-surface-950/50 border border-white/5 hover:border-white/10 hover:bg-surface-900/50 transition-all"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${colorClass}/10 flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-white group-hover:text-primary-400 transition-colors truncate">
                        {note.title}
                      </h3>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {note.is_pinned && (
                          <Pin className="w-4 h-4 text-amber-400 fill-amber-400" />
                        )}
                        {note.is_favorite && (
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        )}
                      </div>
                    </div>

                    {note.ai_summary && (
                      <p className="text-sm text-secondary-400 line-clamp-2 mt-1">
                        {note.ai_summary}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-secondary-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(note.updated_at)}
                      </span>
                      {note.ai_summary && (
                        <span className="text-xs text-primary-400 flex items-center gap-1">
                          <Brain className="w-3 h-3" />
                          AI Enhanced
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => e.preventDefault()}
                    className="p-2 rounded-lg text-secondary-500 hover:text-white hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
