import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  TrendingUp,
  BookOpen,
  Clock,
  Brain,
  FileText,
  Layers,
  HelpCircle,
  Flame,
  BarChart3,
  Calendar,
  Loader2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { supabase } from '@/lib/supabase';

const weeklyData = [
  { day: 'Mon', notes: 5, hours: 2.5 },
  { day: 'Tue', notes: 8, hours: 3.2 },
  { day: 'Wed', notes: 3, hours: 1.8 },
  { day: 'Thu', notes: 12, hours: 4.5 },
  { day: 'Fri', notes: 7, hours: 3.0 },
  { day: 'Sat', notes: 4, hours: 2.0 },
  { day: 'Sun', notes: 6, hours: 2.8 },
];

const sourceData = [
  { name: 'Manual', value: 45, color: '#3b82f6' },
  { name: 'Voice', value: 20, color: '#f43f5e' },
  { name: 'Image', value: 15, color: '#10b981' },
  { name: 'Document', value: 12, color: '#f59e0b' },
  { name: 'Video', value: 8, color: '#ef4444' },
];

export default function Analytics() {
  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('notes').select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: flashcards } = useQuery({
    queryKey: ['flashcards', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('flashcards').select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: quizzes } = useQuery({
    queryKey: ['quizzes', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('quizzes').select('*');
      if (error) throw error;
      return data;
    },
  });

  const stats = [
    {
      icon: FileText,
      label: 'Total Notes',
      value: notes?.length || 0,
      change: '+12%',
      positive: true,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Layers,
      label: 'Flashcards',
      value: flashcards?.length || 0,
      change: '+8%',
      positive: true,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: HelpCircle,
      label: 'Quizzes Taken',
      value: quizzes?.filter((q) => q.completed_at).length || 0,
      change: '+15%',
      positive: true,
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: Brain,
      label: 'AI Insights',
      value: notes?.filter((n) => n.ai_processed).length || 0,
      change: null,
      positive: true,
      color: 'from-primary-500 to-accent-500',
    },
  ];

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
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            to="/dashboard"
            className="p-2 rounded-lg text-secondary-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary-400" />
            <h1 className="font-semibold text-white">Analytics</h1>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-accent-500/10 text-accent-400">
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

          {/* Charts row */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Activity chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-white">Weekly Activity</h2>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                    Notes
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-accent-500" />
                    Hours
                  </span>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorNotes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        background: '#18181b',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="notes"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorNotes)"
                    />
                    <Area
                      type="monotone"
                      dataKey="hours"
                      stroke="#10b981"
                      fillOpacity={1}
                      fill="url(#colorHours)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Source breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <h2 className="font-semibold text-white mb-6">Note Sources</h2>
              <div className="flex items-center gap-8">
                <div className="h-48 w-48 mx-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {sourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  {sourceData.map((source, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: source.color }}
                        />
                        <span className="text-secondary-300 text-sm">{source.name}</span>
                      </div>
                      <span className="text-white font-medium">{source.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Study streak and productivity */}
          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">5</p>
                  <p className="text-secondary-400 text-sm">Day Streak</p>
                </div>
              </div>
              <p className="text-secondary-500 text-sm">Keep learning to maintain your streak!</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">23%</p>
                  <p className="text-secondary-400 text-sm">Productivity Up</p>
                </div>
              </div>
              <p className="text-secondary-500 text-sm">Compared to last week</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">12.5h</p>
                  <p className="text-secondary-400 text-sm">Study Time</p>
                </div>
              </div>
              <p className="text-secondary-500 text-sm">This week total</p>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
