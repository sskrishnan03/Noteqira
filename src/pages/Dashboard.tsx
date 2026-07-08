import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Brain,
  Search,
  Plus,
  Home,
  BookOpen,
  FolderOpen,
  Star,
  Clock,
  Archive,
  Tag,
  Settings,
  BarChart3,
  Bell,
  ChevronDown,
  Menu,
  X,
  Layers,
  FileText,
  Mic,
  Image,
  Video,
  Link2,
  Sparkles,
  TrendingUp,
  Calendar,
  Zap,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentNotes from '@/components/dashboard/RecentNotes';
import AIInsights from '@/components/dashboard/AIInsights';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';
import UpcomingReminders from '@/components/dashboard/UpcomingReminders';
import StatisticsCards from '@/components/dashboard/StatisticsCards';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: notes, isLoading: notesLoading } = useQuery({
    queryKey: ['notes', 'recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('is_archived', false)
        .order('updated_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const { data: notebooks, isLoading: notebooksLoading } = useQuery({
    queryKey: ['notebooks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notebooks')
        .select('*')
        .eq('is_archived', false)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: reminders, isLoading: remindersLoading } = useQuery({
    queryKey: ['reminders', 'upcoming'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('is_completed', false)
        .gte('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities', 'recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-surface-950">
      {/* Grid background */}
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        notebooks={notebooks || []}
      />

      {/* Main content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:pl-72' : ''
        }`}
      >
        {/* Header */}
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Dashboard content */}
        <main className="px-4 lg:px-8 py-6 max-w-7xl mx-auto pt-20">
          {/* Welcome section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome to CogniNote
            </h1>
            <p className="text-secondary-400">
              Your intelligent workspace for capturing and organizing knowledge.
            </p>
          </motion.div>

          {/* Stats */}
          <StatisticsCards notes={notes || []} />

          {/* Quick Actions */}
          <QuickActions />

          {/* Main grid */}
          <div className="grid lg:grid-cols-3 gap-6 mt-8">
            {/* Recent Notes - takes 2 columns */}
            <div className="lg:col-span-2">
              <RecentNotes notes={notes || []} isLoading={notesLoading} />
            </div>

            {/* Sidebar widgets */}
            <div className="space-y-6">
              <AIInsights />
              <UpcomingReminders reminders={reminders || []} isLoading={remindersLoading} />
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="mt-8">
            <ActivityTimeline activities={activities || []} isLoading={activitiesLoading} />
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {!sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
