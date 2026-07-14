import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Archive } from 'lucide-react';

import { db } from '@/lib/data';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import RecentNotes from '@/components/dashboard/RecentNotes';

export default function Archived() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes', 'archived'],
    queryFn: () => db.getNotes({ archived: true, limit: 50 }),
  });

  return (
    <div className="bg-[#0B0B0B]">
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(true)} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-72' : 'lg:pl-[68px]'}`}>
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="px-4 lg:px-8 pb-8 max-w-7xl mx-auto pt-28">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Archive className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">Archived</h1>
            </div>
            <p className="text-sm text-[#666666]">Notes you have archived.</p>
          </motion.div>
          <RecentNotes notes={notes || []} isLoading={isLoading} title="Archived Notes" />
        </main>
      </div>
    </div>
  );
}
