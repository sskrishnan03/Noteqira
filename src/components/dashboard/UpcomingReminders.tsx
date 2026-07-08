import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

interface Reminder {
  id: string;
  title: string;
  description: string | null;
  reminder_type: string;
  due_date: string;
  is_ai_generated: boolean;
}

interface UpcomingRemindersProps {
  reminders: Reminder[];
  isLoading: boolean;
}

const reminderTypeIcons: Record<string, typeof Bell> = {
  assignment: AlertCircle,
  meeting: Calendar,
  deadline: Clock,
  exam: AlertCircle,
  custom: Bell,
};

const reminderTypeColors: Record<string, string> = {
  assignment: 'text-amber-400',
  meeting: 'text-primary-400',
  deadline: 'text-red-400',
  exam: 'text-purple-400',
  custom: 'text-secondary-400',
};

function formatDueDate(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);

  if (hours < 0) return 'Overdue';
  if (hours < 1) return 'Within an hour';
  if (hours < 24) return `In ${hours}h`;
  if (days === 1) return 'Tomorrow';
  return `In ${days} days`;
}

export default function UpcomingReminders({ reminders, isLoading }: UpcomingRemindersProps) {
  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary-400" />
          <h2 className="text-lg font-semibold text-white">Reminders</h2>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse h-16 bg-surface-800/50 rounded-xl" />
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
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary-400" />
          <h2 className="text-lg font-semibold text-white">Reminders</h2>
        </div>
        <Link
          to="/reminders"
          className="text-xs text-secondary-400 hover:text-white transition-colors"
        >
          View all
        </Link>
      </div>

      {reminders.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-xl bg-surface-800/50 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-6 h-6 text-accent-400" />
          </div>
          <p className="text-secondary-400 text-sm">All caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder, i) => {
            const Icon = reminderTypeIcons[reminder.reminder_type] || Bell;
            const colorClass = reminderTypeColors[reminder.reminder_type] || 'text-secondary-400';

            return (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-surface-950/50 border border-white/5"
              >
                <div className={`w-10 h-10 rounded-xl bg-surface-800/50 flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${colorClass}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">
                    {reminder.title}
                  </h3>
                  <p className="text-xs text-secondary-500 mt-1">
                    {formatDueDate(reminder.due_date)}
                    {reminder.is_ai_generated && (
                      <span className="ml-2 text-primary-400">AI detected</span>
                    )}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Link
        to="/reminders"
        className="flex items-center justify-center gap-2 w-full mt-4 py-2 rounded-lg bg-surface-800/50 text-sm text-secondary-400 hover:text-white hover:bg-surface-800 transition-colors"
      >
        Manage reminders
        <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}
