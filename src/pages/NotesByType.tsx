import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { FileText, Mic, Image, FileUp, Plus, Clock, ArrowRight } from 'lucide-react';

import { db } from '@/lib/data';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';

const typeTabs = [
  { key: 'manual', icon: FileText, label: 'Notes', path: '/storage/manual', createPath: '/notes/new' },
  { key: 'voice', icon: Mic, label: 'Voice Notes', path: '/storage/voice', createPath: '/notes/new/voice' },
  { key: 'image', icon: Image, label: 'Images', path: '/storage/image', createPath: '/notes/new/image' },
  { key: 'document', icon: FileUp, label: 'Documents', path: '/storage/document', createPath: '/notes/new/document' },
];

const sourceLabel: Record<string, string> = {
  manual: 'Notes',
  voice: 'Voice Notes',
  image: 'Images',
  document: 'Documents',
};

const sourceIcons: Record<string, typeof FileText> = {
  manual: FileText,
  voice: Mic,
  image: Image,
  document: FileUp,
};

export default function NotesByType() {
  const { sourceType } = useParams<{ sourceType: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const activeType = sourceType || 'manual';

  const { data: notes } = useQuery({
    queryKey: ['notes', 'type', activeType],
    queryFn: () => db.getNotes({ archived: false, source_type: activeType, limit: 50 }),
    enabled: !!activeType,
  });

  return (
    <div className="bg-surface-950 min-h-screen">
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(true)} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-72' : 'lg:pl-[68px]'}`}>
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="px-4 lg:px-8 pb-8 max-w-7xl mx-auto pt-28">
          {/* Tabs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-white">Note Storage</h1>
              <Link
                to={typeTabs.find(t => t.key === activeType)?.createPath || '/notes/new'}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all"
              >
                <Plus className="w-4 h-4" />
                New {sourceLabel[activeType] || 'Note'}
              </Link>
            </div>

            <div className="flex gap-1 mb-8 bg-white/5 rounded-2xl p-1.5 border border-[#2A2A2A]">
              {typeTabs.map((tab) => {
                const isActive = activeType === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => navigate(tab.path)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex-1 justify-center ${
                      isActive
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-[#8A8A8A] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Notes list */}
            {notes && notes.length > 0 ? (
              <div className="space-y-3">
                {notes.map((note) => {
                  const Icon = sourceIcons[note.source_type] || FileText;
                  return (
                    <Link
                      key={note.id}
                      to={`/notes/${note.id}`}
                      className="block bg-[#161616] border border-[#2A2A2A] rounded-2xl p-4 hover:border-white/30 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#1B1B1B] flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white truncate">
                            {note.title || 'Untitled'}
                          </h3>
                          <p className="text-xs text-[#555555] mt-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(note.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#555555] flex-shrink-0 mt-2" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-[#161616] border border-[#2A2A2A] rounded-2xl">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                  {(() => {
                    const Icon = sourceIcons[activeType];
                    return <Icon className="w-8 h-8 text-[#555555]" />;
                  })()}
                </div>
                <h3 className="text-lg font-medium text-[#8A8A8A] mb-2">No {sourceLabel[activeType]?.toLowerCase()} yet</h3>
                <p className="text-[#555555] text-sm mb-6">
                  Create your first {sourceLabel[activeType]?.toLowerCase().slice(0, -1) || 'note'} to get started
                </p>
                <Link
                  to={typeTabs.find(t => t.key === activeType)?.createPath || '/notes/new'}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Create {sourceLabel[activeType]?.slice(0, -1) || 'Note'}
                </Link>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
