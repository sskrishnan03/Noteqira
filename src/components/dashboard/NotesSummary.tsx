import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  FileText,
} from 'lucide-react';

interface Note {
  id: string;
  created_at: string;
}

interface NotesSummaryProps {
  notes?: Note[];
}

export default function NotesSummary({ notes = [] }: NotesSummaryProps) {
  const noteCount = notes.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-white" />
        <h2 className="text-lg font-semibold text-white">Your Notes</h2>
      </div>

      {noteCount === 0 ? (
        <div className="text-center py-6">
          <FileText className="w-8 h-8 text-white/30 mx-auto mb-3" />
          <p className="text-sm text-[#8A8A8A]">
            Create your first note to get started.
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
          <FileText className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-white">{noteCount} total notes</h3>
            <p className="text-xs text-[#8A8A8A]">In your workspace</p>
          </div>
        </div>
      )}

      <Link
        to="/storage"
        className="flex items-center justify-center gap-2 w-full mt-4 py-2 rounded-lg bg-[#1B1B1B] text-sm text-[#8A8A8A] hover:text-white hover:bg-[#2A2A2A] transition-colors"
      >
        View all notes
        <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}
