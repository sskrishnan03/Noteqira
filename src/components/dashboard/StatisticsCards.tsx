import { motion } from 'framer-motion';
import {
  FileText,
  Clock,
  Image,
} from 'lucide-react';

interface Note {
  id: string;
  word_count: number;
  source_type: string;
  created_at: string;
}

interface StatisticsCardsProps {
  notes: Note[];
}

export default function StatisticsCards({ notes }: StatisticsCardsProps) {
  const totalWords = notes.reduce((sum, n) => sum + (n.word_count || 0), 0);
  const docs = notes.filter((n) => n.source_type === 'document').length;
  const studyHours = totalWords > 0 ? Math.round(totalWords / 200 * 10) / 10 : 0;

  const stats = [
    {
      icon: FileText,
      label: 'Total Notes',
      value: notes.length,
    },
    {
      icon: Image,
      label: 'Documents',
      value: docs,
    },
    {
      icon: FileText,
      label: 'Words Written',
      value: totalWords.toLocaleString(),
    },
    {
      icon: Clock,
      label: 'Study Hours',
      value: studyHours > 0 ? `${studyHours}h` : 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-5"
        >
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <stat.icon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-[#8A8A8A]">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
