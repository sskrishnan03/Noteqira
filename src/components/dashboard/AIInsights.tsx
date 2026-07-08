import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  Sparkles,
  BookOpen,
  Check,
  Zap,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const insights = [
  {
    icon: Sparkles,
    title: 'Study streak: 5 days',
    description: 'Keep learning to maintain your streak!',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  {
    icon: BookOpen,
    title: '12 flashcards due',
    description: 'Review them before they pile up',
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Productivity up 23%',
    description: 'Compared to last week',
    color: 'text-accent-400',
    bgColor: 'bg-accent-500/10',
  },
];

export default function AIInsights() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary-400" />
        <h2 className="text-lg font-semibold text-white">AI Insights</h2>
      </div>

      <div className="space-y-3">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`flex items-start gap-3 p-3 rounded-xl ${insight.bgColor}`}
          >
            <insight.icon className={`w-5 h-5 ${insight.color} flex-shrink-0 mt-0.5`} />
            <div>
              <h3 className="text-sm font-medium text-white">{insight.title}</h3>
              <p className="text-xs text-secondary-400">{insight.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <Link
        to="/analytics"
        className="flex items-center justify-center gap-2 w-full mt-4 py-2 rounded-lg bg-surface-800/50 text-sm text-secondary-400 hover:text-white hover:bg-surface-800 transition-colors"
      >
        View all insights
        <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}
