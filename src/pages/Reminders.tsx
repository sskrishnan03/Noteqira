import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Bell,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Trash2,
  Loader2,
  Brain,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

const reminderTypes = [
  { id: 'assignment', label: 'Assignment', icon: AlertCircle, color: 'text-amber-400' },
  { id: 'meeting', label: 'Meeting', icon: Calendar, color: 'text-primary-400' },
  { id: 'deadline', label: 'Deadline', icon: Clock, color: 'text-red-400' },
  { id: 'exam', label: 'Exam', icon: AlertCircle, color: 'text-purple-400' },
  { id: 'custom', label: 'Custom', icon: Bell, color: 'text-secondary-400' },
];

export default function Reminders() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReminder, setNewReminder] = useState({
    title: '',
    description: '',
    reminder_type: 'custom',
    due_date: '',
  });

  const { data: reminders, isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('reminders').insert([{
        ...newReminder,
        due_date: new Date(newReminder.due_date).toISOString(),
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder created');
      setShowCreateModal(false);
      setNewReminder({
        title: '',
        description: '',
        reminder_type: 'custom',
        due_date: '',
      });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reminders')
        .update({ is_completed: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder completed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reminders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Reminder deleted');
    },
  });

  const upcomingReminders = reminders?.filter((r) => !r.is_completed) || [];
  const completedReminders = reminders?.filter((r) => r.is_completed) || [];

  function formatDate(date: string): string {
    const d = new Date(date);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);

    if (hours < 0) return 'Overdue';
    if (hours < 1) return 'Within an hour';
    if (hours < 24) return `In ${hours}h`;
    if (days === 1) return 'Tomorrow';
    return d.toLocaleDateString();
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950">
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="p-2 rounded-lg text-secondary-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary-400" />
              <h1 className="font-semibold text-white">Reminders</h1>
            </div>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            New Reminder
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          {upcomingReminders.length === 0 && completedReminders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-2xl bg-surface-800/50 flex items-center justify-center mx-auto mb-6">
                <Bell className="w-10 h-10 text-secondary-500" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">No reminders</h2>
              <p className="text-secondary-400 mb-6">
                Stay on top of your tasks with reminders
              </p>
              <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                <Plus className="w-4 h-4" />
                Create Reminder
              </button>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {/* Upcoming */}
              {upcomingReminders.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-secondary-400 uppercase tracking-wider mb-4">
                    Upcoming ({upcomingReminders.length})
                  </h2>
                  <div className="space-y-3">
                    {upcomingReminders.map((reminder, i) => {
                      const type = reminderTypes.find((t) => t.id === reminder.reminder_type) || reminderTypes[4];
                      const Icon = type.icon;

                      return (
                        <motion.div
                          key={reminder.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="glass-card p-5"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-surface-800/50 flex items-center justify-center flex-shrink-0">
                              <Icon className={`w-5 h-5 ${type.color}`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-medium text-white">{reminder.title}</h3>
                                  {reminder.description && (
                                    <p className="text-sm text-secondary-400 mt-1">
                                      {reminder.description}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => completeMutation.mutate(reminder.id)}
                                    className="p-2 rounded-lg text-secondary-400 hover:text-accent-400 hover:bg-accent-500/10 transition-colors"
                                  >
                                    <CheckCircle className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => deleteMutation.mutate(reminder.id)}
                                    className="p-2 rounded-lg text-secondary-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 mt-3 text-xs">
                                <span className="text-secondary-500">
                                  {formatDate(reminder.due_date)}
                                </span>
                                {reminder.is_ai_generated && (
                                  <span className="flex items-center gap-1 text-primary-400">
                                    <Brain className="w-3 h-3" />
                                    AI detected
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Completed */}
              {completedReminders.length > 0 && (
                <div>
                  <h2 className="text-sm font-medium text-secondary-400 uppercase tracking-wider mb-4">
                    Completed ({completedReminders.length})
                  </h2>
                  <div className="space-y-3">
                    {completedReminders.slice(0, 5).map((reminder, i) => {
                      const type = reminderTypes.find((t) => t.id === reminder.reminder_type) || reminderTypes[4];
                      const Icon = type.icon;

                      return (
                        <motion.div
                          key={reminder.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="glass-card p-5 opacity-60"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-surface-800/50 flex items-center justify-center">
                              <Icon className={`w-5 h-5 ${type.color}`} />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-white line-through">
                                {reminder.title}
                              </h3>
                            </div>
                            <button
                              onClick={() => deleteMutation.mutate(reminder.id)}
                              className="p-2 rounded-lg text-secondary-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="glass-card p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold text-white mb-6">New Reminder</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-secondary-400 mb-2">Title</label>
                <input
                  type="text"
                  value={newReminder.title}
                  onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                  placeholder="Reminder title"
                  className="input-base"
                />
              </div>

              <div>
                <label className="block text-sm text-secondary-400 mb-2">Description</label>
                <textarea
                  value={newReminder.description}
                  onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                  placeholder="Optional description"
                  className="input-base min-h-[80px] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-secondary-400 mb-2">Type</label>
                <div className="flex flex-wrap gap-2">
                  {reminderTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setNewReminder({ ...newReminder, reminder_type: type.id })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        newReminder.reminder_type === type.id
                          ? 'bg-primary-500/20 text-primary-400'
                          : 'bg-surface-800/50 text-secondary-400 hover:bg-surface-800'
                      }`}
                    >
                      <type.icon className={`w-4 h-4 ${type.color}`} />
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-secondary-400 mb-2">Due Date</label>
                <input
                  type="datetime-local"
                  value={newReminder.due_date}
                  onChange={(e) => setNewReminder({ ...newReminder, due_date: e.target.value })}
                  className="input-base"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={!newReminder.title || !newReminder.due_date}
                className="btn-primary flex-1"
              >
                Create
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
