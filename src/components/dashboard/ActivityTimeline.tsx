import { motion } from 'framer-motion';
import {
  FileText,
  BookOpen,
  CheckCircle,
  Star,
  Archive,
  Edit3,
  Trash2,
  Plus,
} from 'lucide-react';

interface Activity {
  id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
  isLoading: boolean;
}

const actionIcons: Record<string, typeof FileText> = {
  created: Plus,
  updated: Edit3,
  deleted: Trash2,
  favorited: Star,
  archived: Archive,
  completed: CheckCircle,
  reviewed: BookOpen,
};

const actionColors: Record<string, string> = {
  created: 'text-accent-400',
  updated: 'text-primary-400',
  deleted: 'text-red-400',
  favorited: 'text-amber-400',
  archived: 'text-secondary-400',
  completed: 'text-accent-400',
  reviewed: 'text-primary-400',
};

const actionLabels: Record<string, string> = {
  created: 'Created',
  updated: 'Updated',
  deleted: 'Deleted',
  favorited: 'Favorited',
  archived: 'Archived',
  completed: 'Completed',
  reviewed: 'Reviewed',
};

function formatTime(date: string): string {
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

export default function ActivityTimeline({ activities, isLoading }: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Activity</h2>
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-surface-800/50" />
              <div className="flex-1 h-12 bg-surface-800/50 rounded-xl" />
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
      <h2 className="text-lg font-semibold text-white mb-6">Activity Timeline</h2>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-secondary-400">No recent activity</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-white/5" />

          <div className="space-y-4">
            {activities.map((activity, i) => {
              const Icon = actionIcons[activity.action] || FileText;
              const colorClass = actionColors[activity.action] || 'text-secondary-400';
              const label = actionLabels[activity.action] || activity.action;
              const resourceName = (activity.metadata as { title?: string })?.title || 'Unknown';

              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative flex items-start gap-4 pl-2"
                >
                  <div className={`w-6 h-6 rounded-full bg-surface-900 flex items-center justify-center z-10 ${colorClass}`}>
                    <Icon className="w-3 h-3" />
                  </div>

                  <div className="flex-1 py-1">
                    <p className="text-sm text-secondary-300">
                      <span className="text-white font-medium">{label}</span>{' '}
                      {activity.resource_type === 'note' ? 'note' : activity.resource_type || 'item'}:
                      <span className="text-white ml-1">{resourceName}</span>
                    </p>
                    <p className="text-xs text-secondary-500 mt-0.5">
                      {formatTime(activity.created_at)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
