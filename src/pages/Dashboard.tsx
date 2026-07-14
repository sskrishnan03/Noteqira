import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { db } from '@/lib/data';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import QuickActions from '@/components/dashboard/QuickActions';
import RecentNotes from '@/components/dashboard/RecentNotes';
import NotesSummary from '@/components/dashboard/NotesSummary';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';
import StatisticsCards from '@/components/dashboard/StatisticsCards';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter');

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities', 'recent'],
    queryFn: () => db.getActivity({ limit: 10 }),
  });

  const { data: notes = [], isLoading: notesLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: () => db.getNotes({ filter: filter ?? undefined }),
  });

  return (
    <div className="bg-surface-950">
      {/* Grid background */}
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(true)}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:pl-72' : 'lg:pl-[68px]'
        }`}
      >
        {/* Header */}
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Dashboard content */}
        <main className="px-4 lg:px-8 pb-8 max-w-7xl mx-auto pt-28">
          {/* Welcome section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-white mb-2">
              {filter === 'favorites' ? 'Favorites' : filter === 'archived' ? 'Archived' : filter === 'recent' ? 'Recent Notes' : 'Welcome to Noteqira'}
            </h1>
            <p className="text-secondary-400">
              {filter === 'favorites' ? 'Your starred notes.' : filter === 'archived' ? 'Notes you have archived.' : filter === 'recent' ? 'Your most recently updated notes.' : 'Your intelligent workspace for capturing and organizing knowledge.'}
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
              <NotesSummary notes={notes || []} />

            </div>
          </div>

          {/* Activity Timeline */}
          <div className="mt-8">
            <ActivityTimeline activities={activities || []} isLoading={activitiesLoading} />
          </div>
        </main>
      </div>

    </div>
  );
}
