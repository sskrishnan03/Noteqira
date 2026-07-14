import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { db } from '@/lib/data';
import Sidebar from '@/components/dashboard/Sidebar';
import Header from '@/components/dashboard/Header';
import CalendarGrid from '@/components/calendar/CalendarGrid';
import CalendarStats from '@/components/calendar/CalendarStats';
import CalendarSidePanel from '@/components/calendar/CalendarSidePanel';
import CalendarFilters from '@/components/calendar/CalendarFilters';

type ViewMode = 'month' | 'week' | 'day';
type DateMode = 'created' | 'modified';
type FilterType = 'all' | 'favorites' | 'archived' | 'manual' | 'voice' | 'image' | 'document';

export default function Calendar() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [dateMode, setDateMode] = useState<DateMode>('created');
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  
  // Quick actions state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  // Fetch all notes
  const { data: allNotes = [] } = useQuery({
    queryKey: ['notes', 'calendar'],
    queryFn: () => db.getNotes(),
  });

  // Filter notes based on current settings
  const filteredNotes = useMemo(() => {
    let notes = [...allNotes];
    
    // Apply filter type
    if (filterType === 'favorites') notes = notes.filter(n => n.is_favorite);
    else if (filterType === 'archived') notes = notes.filter(n => n.is_archived);
    else if (filterType === 'manual') notes = notes.filter(n => n.source_type === 'manual');
    else if (filterType === 'voice') notes = notes.filter(n => n.source_type === 'voice');
    else if (filterType === 'image') notes = notes.filter(n => n.source_type === 'image');
    else if (filterType === 'document') notes = notes.filter(n => n.source_type === 'document');
    else notes = notes.filter(n => !n.is_archived);
    
    // Apply search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      notes = notes.filter(n => 
        n.title.toLowerCase().includes(q) || 
        n.content_plain.toLowerCase().includes(q)
      );
    }
    
    return notes;
  }, [allNotes, filterType, searchQuery]);

  // Get notes for selected dates
  const selectedDateNotes = useMemo(() => {
    if (selectedDates.length === 0) return [];
    
    return filteredNotes.filter(note => {
      const noteDate = new Date(dateMode === 'created' ? note.created_at : note.updated_at);
      return selectedDates.some(selectedDate => 
        noteDate.toDateString() === selectedDate.toDateString()
      );
    });
  }, [filteredNotes, selectedDates, dateMode]);

  // Group notes by date for calendar display
  const notesByDate = useMemo(() => {
    const grouped: Record<string, typeof allNotes> = {};
    
    filteredNotes.forEach(note => {
      const date = new Date(dateMode === 'created' ? note.created_at : note.updated_at);
      const dateKey = date.toDateString();
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(note);
    });
    
    return grouped;
  }, [filteredNotes, dateMode]);

  // Navigation handlers
  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
      else if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
      else newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  }, [viewMode]);

  const goToNext = useCallback(() => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
      else if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
      else newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  }, [viewMode]);

  // Date selection handler
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDates([date]);
    setSidePanelOpen(true);
  }, []);

  // Quick action handlers
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await db.deleteNote(deleteTarget.id);
    setDeleteTarget(null);
    setOpenMenuId(null);
    queryClient.invalidateQueries({ queryKey: ['notes'] });
    toast.success('Moved to Trash');
  }, [deleteTarget, queryClient]);

  const handleToggleFavorite = useCallback(async (note: any) => {
    await db.updateNote(note.id, { is_favorite: !note.is_favorite } as any);
    setOpenMenuId(null);
    queryClient.invalidateQueries({ queryKey: ['notes'] });
    toast.success(note.is_favorite ? 'Removed from favorites' : 'Added to favorites');
  }, [queryClient]);

  const handleTogglePin = useCallback(async (note: any) => {
    await db.updateNote(note.id, { is_pinned: !note.is_pinned } as any);
    setOpenMenuId(null);
    queryClient.invalidateQueries({ queryKey: ['notes'] });
    toast.success(note.is_pinned ? 'Unpinned' : 'Pinned');
  }, [queryClient]);

  const handleToggleArchive = useCallback(async (note: any) => {
    await db.updateNote(note.id, { is_archived: !note.is_archived } as any);
    setOpenMenuId(null);
    queryClient.invalidateQueries({ queryKey: ['notes'] });
    toast.success(note.is_archived ? 'Unarchived' : 'Archived');
  }, [queryClient]);

  const handleOpenNote = useCallback((noteId: string) => {
    navigate(`/notes/${noteId}`);
  }, [navigate]);

  const handleCreateNote = useCallback((_date: Date) => {
    navigate('/notes/new');
  }, [navigate]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidePanelOpen(false);
        setSelectedDates([]);
        setOpenMenuId(null);
        setDeleteTarget(null);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Persist view mode
  useEffect(() => {
    const saved = localStorage.getItem('noteqira-calendar-view');
    if (saved && ['month', 'week', 'day'].includes(saved)) {
      setViewMode(saved as ViewMode);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('noteqira-calendar-view', viewMode);
  }, [viewMode]);

  return (
    <div className="bg-[#0B0B0B] min-h-screen">
      {/* Grid background */}
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(true)}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-72' : 'lg:pl-[68px]'}`}>
        {/* Header */}
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Calendar content */}
        <main className="px-4 lg:px-8 pb-8 max-w-7xl mx-auto pt-28">
          {/* Header section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-white">Calendar</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDateMode(dateMode === 'created' ? 'modified' : 'created')}
                  className="px-4 py-2 rounded-xl text-sm bg-[#161616] border border-[#2A2A2A] text-[#C8C8C8] hover:bg-white/5 transition-all"
                >
                  {dateMode === 'created' ? 'Created Date' : 'Modified Date'}
                </button>
              </div>
            </div>
            <p className="text-[#8A8A8A]">
              Browse and organize your notes by {dateMode === 'created' ? 'creation' : 'modification'} date
            </p>
          </motion.div>

          {/* Statistics */}
          <CalendarStats notes={filteredNotes} currentDate={currentDate} dateMode={dateMode} />

          {/* Calendar controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-6 mb-6"
          >
            {/* Navigation */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPrevious}
                  className="p-2 rounded-lg text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-all"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={goToToday}
                  className="px-4 py-2 rounded-xl text-sm bg-[#1B1B1B] border border-[#2A2A2A] text-[#C8C8C8] hover:bg-white/5 transition-all"
                >
                  Today
                </button>
                <button
                  onClick={goToNext}
                  className="p-2 rounded-lg text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-all"
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <span className="ml-4 text-lg font-semibold text-white">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>

              {/* View mode selector */}
              <div className="flex items-center gap-1 bg-[#0B0B0B] rounded-xl p-1">
                {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                      viewMode === mode
                        ? 'bg-[#1B1B1B] text-white'
                        : 'text-[#8A8A8A] hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Search and filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555]" />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#0B0B0B] border border-[#2A2A2A] rounded-xl text-white placeholder:text-[#555555] focus:outline-none focus:border-white/30 transition-all"
                />
              </div>
              <CalendarFilters
                filterType={filterType}
                onFilterChange={setFilterType}
              />
            </div>

            {/* Calendar grid */}
            <CalendarGrid
              currentDate={currentDate}
              viewMode={viewMode}
              notesByDate={notesByDate}
              selectedDates={selectedDates}
              onDateSelect={handleDateSelect}
              onCreateNote={handleCreateNote}
            />
          </motion.div>
        </main>
      </div>

      {/* Side panel */}
      <AnimatePresence>
        {sidePanelOpen && (
          <CalendarSidePanel
            isOpen={sidePanelOpen}
            onClose={() => {
              setSidePanelOpen(false);
              setSelectedDates([]);
            }}
            selectedDates={selectedDates}
            notes={selectedDateNotes}
            onNoteClick={handleOpenNote}
            onToggleFavorite={handleToggleFavorite}
            onTogglePin={handleTogglePin}
            onToggleArchive={handleToggleArchive}
            onDelete={setDeleteTarget}
            openMenuId={openMenuId}
            onMenuToggle={setOpenMenuId}
          />
        )}
      </AnimatePresence>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-black/60"
              onClick={() => setDeleteTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-sm bg-[#161616] border border-[#2A2A2A] rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Move to Trash</h3>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="p-1 rounded-lg text-[#8A8A8A] hover:text-white hover:bg-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[#C8C8C8] mb-6">
                Move <span className="text-white font-medium">&ldquo;{deleteTarget.title}&rdquo;</span> to Trash? It will stay there for 30 days before automatic cleanup.
              </p>
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-xl text-sm text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-white text-[#0B0B0B] hover:bg-[#C8C8C8] transition-colors"
                >
                  Move to Trash
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
