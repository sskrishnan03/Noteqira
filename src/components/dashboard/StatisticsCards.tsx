import { motion } from 'framer-motion';
import {
  FileText,
  BookOpen,
  Clock,
  TrendingUp,
  Brain,
  CheckCircle,
} from 'lucide-react';

interface Note {
  id: string;
  word_count: number;
  created_at: string;
}

interface StatisticsCardsProps {
  notes: Note[];
}

export default function StatisticsCards({ notes }: StatisticsCardsProps) {
  const stats = [
    {
      icon: FileText,
      label: 'Total Notes',
      value: notes.length,
      change: '+12%',
      positive: true,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: BookOpen,
      label: 'Flashcards',
      value: 24,
      change: '+8%',
      positive: true,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Clock,
      label: 'Study Hours',
      value: '12.5h',
      change: '+23%',
      positive: true,
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Brain,
      label: 'AI Insights',
      value: 156,
      change: null,
      positive: true,
      color: 'from-primary-500 to-accent-500',
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
          className="glass-card p-5"
        >
          <div className="flex items-start justify-between">
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
            >
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            {stat.change && (
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.positive
                    ? 'bg-accent-500/10 text-accent-400'
                    : 'bg-red-500/10 text-red-400'
                }`}
              >
                {stat.change}
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-sm text-secondary-400">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
