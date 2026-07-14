import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  Clock,
  FileText,
  Flame,
  Loader2,
  Sparkles,
  Star,
  Target,
  TrendingUp,
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
  BarChart,
  Bar,
} from 'recharts';

import { db } from '@/lib/data';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import type { Note } from '@/types';

const sourceColors: Record<string, string> = {
  manual: '#60A5FA',
  voice: '#34D399',
  image: '#F59E0B',
  document: '#F472B6',
};

const sourceLabels: Record<string, string> = {
  manual: 'Typed Notes',
  voice: 'Voice Notes',
  image: 'Image Notes',
  document: 'Documents',
};

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function dayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isSameDay(dateValue: string, compare: Date) {
  return dayKey(new Date(dateValue)) === dayKey(compare);
}

function lastNDays(days: number) {
  return Array.from({ length: days }, (_, index) => {
    const date = startOfDay(new Date());
    date.setDate(date.getDate() - (days - index - 1));
    return date;
  });
}

function getCurrentStreak(notes: Note[]) {
  const noteDays = new Set(notes.map((note) => dayKey(new Date(note.created_at))));
  const cursor = startOfDay(new Date());
  let streak = 0;

  while (noteDays.has(dayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function getWeekCount(notes: Note[], offsetDays: number) {
  const end = startOfDay(new Date());
  end.setDate(end.getDate() - offsetDays + 1);
  const start = new Date(end);
  start.setDate(start.getDate() - 7);

  return notes.filter((note) => {
    const created = new Date(note.created_at);
    return created >= start && created < end;
  }).length;
}

function formatHours(minutes: number) {
  const hours = Math.round((minutes / 60) * 10) / 10;
  return hours > 0 ? `${hours}h` : '0h';
}

export default function Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data: allNotes = [], isLoading } = useQuery({
    queryKey: ['notes', 'analytics'],
    queryFn: () => db.getNotes({ includeTrashed: true }),
  });

  const analytics = useMemo(() => {
    const activeNotes = allNotes.filter((note) => !note.deleted_at);
    const trashNotes = allNotes.filter((note) => note.deleted_at);
    const today = startOfDay(new Date());
    const todayNotes = activeNotes.filter((note) => isSameDay(note.created_at, today));
    const totalWords = activeNotes.reduce((sum, note) => sum + (note.word_count || 0), 0);
    const totalMinutes = activeNotes.reduce((sum, note) => sum + (note.read_time_minutes || 0), 0);
    const favoriteCount = activeNotes.filter((note) => note.is_favorite).length;
    const archivedCount = activeNotes.filter((note) => note.is_archived).length;
    const streak = getCurrentStreak(activeNotes);
    const thisWeek = getWeekCount(activeNotes, 0);
    const previousWeek = getWeekCount(activeNotes, 7);
    const weeklyTrend = previousWeek === 0 ? (thisWeek > 0 ? 100 : 0) : Math.round(((thisWeek - previousWeek) / previousWeek) * 100);

    const dailyData = lastNDays(14).map((date) => {
      const notesForDay = activeNotes.filter((note) => isSameDay(note.created_at, date));
      const words = notesForDay.reduce((sum, note) => sum + (note.word_count || 0), 0);
      const minutes = notesForDay.reduce((sum, note) => sum + (note.read_time_minutes || 0), 0);
      return {
        label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        notes: notesForDay.length,
        words,
        hours: Math.round((minutes / 60) * 10) / 10,
      };
    });

    const sourceData = Object.keys(sourceLabels)
      .map((source) => ({
        name: sourceLabels[source],
        value: activeNotes.filter((note) => note.source_type === source).length,
        color: sourceColors[source],
      }))
      .filter((item) => item.value > 0);

    const weeklyBars = lastNDays(7).map((date) => {
      const notesForDay = activeNotes.filter((note) => isSameDay(note.created_at, date));
      return {
        day: date.toLocaleDateString(undefined, { weekday: 'short' }),
        notes: notesForDay.length,
        words: notesForDay.reduce((sum, note) => sum + (note.word_count || 0), 0),
      };
    });

    const peakDay = dailyData.reduce((best, day) => day.notes > best.notes ? day : best, dailyData[0] || { label: 'No data', notes: 0 });
    const longestNote = [...activeNotes].sort((a, b) => (b.word_count || 0) - (a.word_count || 0))[0];
    const topSource = sourceData.length
      ? [...sourceData].sort((a, b) => b.value - a.value)[0].name
      : 'No source yet';
    const expiringSoon = trashNotes.filter((note) => {
      if (!note.permanently_delete_at) return false;
      const days = Math.ceil((new Date(note.permanently_delete_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return days <= 7;
    }).length;

    return {
      activeNotes,
      trashNotes,
      todayNotes,
      totalWords,
      totalMinutes,
      favoriteCount,
      archivedCount,
      streak,
      weeklyTrend,
      dailyData,
      sourceData,
      weeklyBars,
      peakDay,
      longestNote,
      topSource,
      expiringSoon,
    };
  }, [allNotes]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  const statCards = [
    { icon: FileText, label: 'Active Notes', value: analytics.activeNotes.length, detail: `${analytics.archivedCount} archived` },
    { icon: TrendingUp, label: 'Weekly Trend', value: `${analytics.weeklyTrend >= 0 ? '+' : ''}${analytics.weeklyTrend}%`, detail: 'vs previous week' },
    { icon: Clock, label: 'Study Time', value: formatHours(analytics.totalMinutes), detail: `${analytics.totalWords.toLocaleString()} words` },
    { icon: Flame, label: 'Day Streak', value: analytics.streak, detail: analytics.streak ? 'Keep it moving' : 'Start today' },
  ];

  return (
    <div className="bg-[#0B0B0B] min-h-screen">
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(true)}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-72' : 'lg:pl-[68px]'}`}>
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="px-4 lg:px-8 pb-8 max-w-7xl mx-auto pt-28">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-white">Analytics</h1>
                </div>
                <p className="text-[#8A8A8A]">
                  Daily reports, writing rhythm, note sources, and cleanup health from your workspace.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm w-fit">
                <Sparkles className="w-4 h-4" />
                Live Report
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-5"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-[#8A8A8A]">{stat.label}</p>
                <p className="text-xs text-[#555555] mt-2">{stat.detail}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid xl:grid-cols-3 gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="xl:col-span-2 bg-[#161616] border border-[#2A2A2A] rounded-2xl p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                  <h2 className="font-semibold text-white">Daily Capture Flow</h2>
                  <p className="text-sm text-[#555555]">Notes and study hours across the last 14 days</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#8A8A8A]">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#60A5FA]" />Notes</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#34D399]" />Hours</span>
                </div>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.dailyData}>
                    <defs>
                      <linearGradient id="notesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34D399" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#34D399" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: '#111111',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                      labelStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="notes" stroke="#60A5FA" strokeWidth={2} fill="url(#notesGradient)" />
                    <Area type="monotone" dataKey="hours" stroke="#34D399" strokeWidth={2} fill="url(#hoursGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-6"
            >
              <h2 className="font-semibold text-white mb-1">Source Mix</h2>
              <p className="text-sm text-[#555555] mb-6">How your notes are entering the system</p>
              {analytics.sourceData.length ? (
                <>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.sourceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={58}
                          outerRadius={88}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {analytics.sourceData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: '#111111',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '12px',
                            color: '#fff',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {analytics.sourceData.map((source) => (
                      <div key={source.name} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-[#C8C8C8]">
                          <span className="w-3 h-3 rounded" style={{ backgroundColor: source.color }} />
                          {source.name}
                        </span>
                        <span className="text-white font-medium">{source.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-72 flex flex-col items-center justify-center text-center">
                  <Target className="w-10 h-10 text-[#555555] mb-3" />
                  <p className="text-[#8A8A8A]">Create notes to see source analytics</p>
                </div>
              )}
            </motion.div>
          </div>

          <div className="grid xl:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-6"
            >
              <h2 className="font-semibold text-white mb-1">Weekly Volume</h2>
              <p className="text-sm text-[#555555] mb-6">Last 7 days of note creation</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.weeklyBars}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: '#111111',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                    <Bar dataKey="notes" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-6"
            >
              <h2 className="font-semibold text-white mb-1">Today&apos;s Report</h2>
              <p className="text-sm text-[#555555] mb-6">A quick daily summary of your workspace</p>
              <div className="space-y-4">
                <ReportRow label="Notes created" value={analytics.todayNotes.length} />
                <ReportRow label="Words today" value={analytics.todayNotes.reduce((sum, note) => sum + (note.word_count || 0), 0).toLocaleString()} />
                <ReportRow label="Top source" value={analytics.topSource} />
                <ReportRow label="Favorites saved" value={analytics.favoriteCount} icon={<Star className="w-4 h-4 text-amber-300" />} />
                <ReportRow
                  label="Latest note"
                  value={analytics.todayNotes[0]?.title || analytics.activeNotes[0]?.title || 'No notes yet'}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-6"
            >
              <h2 className="font-semibold text-white mb-1">Focus Signals</h2>
              <p className="text-sm text-[#555555] mb-6">Patterns worth keeping an eye on</p>
              <div className="space-y-4">
                <Signal
                  label="Peak day"
                  value={analytics.peakDay.notes ? `${analytics.peakDay.label} with ${analytics.peakDay.notes} notes` : 'No activity yet'}
                />
                <Signal
                  label="Longest note"
                  value={analytics.longestNote ? `${analytics.longestNote.title || 'Untitled'} (${analytics.longestNote.word_count || 0} words)` : 'No notes yet'}
                />
                <Signal
                  label="Trash health"
                  value={`${analytics.trashNotes.length} deleted, ${analytics.expiringSoon} expiring soon`}
                  tone={analytics.expiringSoon ? 'warning' : 'normal'}
                />
                <Signal
                  label="Workspace depth"
                  value={`${analytics.totalWords.toLocaleString()} words across ${analytics.activeNotes.length} notes`}
                />
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

function ReportRow({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#2A2A2A] last:border-0 last:pb-0">
      <span className="text-sm text-[#8A8A8A]">{label}</span>
      <span className="flex items-center gap-2 text-sm font-medium text-white text-right">
        {icon}
        {value}
      </span>
    </div>
  );
}

function Signal({ label, value, tone = 'normal' }: { label: string; value: string; tone?: 'normal' | 'warning' }) {
  return (
    <div className={`p-4 rounded-xl border ${
      tone === 'warning'
        ? 'bg-red-500/10 border-red-500/20'
        : 'bg-[#0B0B0B]/50 border-[#2A2A2A]'
    }`}>
      <p className="text-xs uppercase tracking-wider text-[#555555] mb-1">{label}</p>
      <p className={`text-sm ${tone === 'warning' ? 'text-red-200' : 'text-[#C8C8C8]'}`}>{value}</p>
    </div>
  );
}
