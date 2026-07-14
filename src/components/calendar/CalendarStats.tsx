import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface CalendarStatsProps {
  notes: any[];
  currentDate: Date;
  dateMode: 'created' | 'modified';
}

export default function CalendarStats({ notes, currentDate, dateMode }: CalendarStatsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    // Filter notes by date mode
    const notesWithDate = notes.map(note => ({
      ...note,
      date: new Date(dateMode === 'created' ? note.created_at : note.updated_at)
    }));
    
    // Notes this month
    const notesThisMonth = notesWithDate.filter(note => {
      const noteDate = new Date(note.date);
      noteDate.setHours(0, 0, 0, 0);
      return noteDate >= startOfMonth && noteDate <= endOfMonth;
    });
    
    // Notes this week
    const notesThisWeek = notesWithDate.filter(note => {
      const noteDate = new Date(note.date);
      noteDate.setHours(0, 0, 0, 0);
      return noteDate >= startOfWeek && noteDate <= today;
    });
    
    // Notes today
    const notesToday = notesWithDate.filter(note => {
      const noteDate = new Date(note.date);
      noteDate.setHours(0, 0, 0, 0);
      return noteDate.toDateString() === today.toDateString();
    });
    
    // Most active day
    const notesByDay: Record<string, number> = {};
    notesWithDate.forEach(note => {
      const dateKey = note.date.toDateString();
      notesByDay[dateKey] = (notesByDay[dateKey] || 0) + 1;
    });
    
    let mostActiveDay = 'No data';
    let maxNotes = 0;
    Object.entries(notesByDay).forEach(([date, count]) => {
      if (count > maxNotes) {
        maxNotes = count;
        mostActiveDay = date;
      }
    });
    
    if (maxNotes > 0) {
      const d = new Date(mostActiveDay);
      mostActiveDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    return {
      notesThisMonth: notesThisMonth.length,
      notesThisWeek: notesThisWeek.length,
      notesToday: notesToday.length,
      mostActiveDay,
    };
  }, [notes, currentDate, dateMode]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
    >
      <StatCard
        label="Notes This Month"
        value={stats.notesThisMonth}
        icon="📅"
      />
      <StatCard
        label="Notes This Week"
        value={stats.notesThisWeek}
        icon="📊"
      />
      <StatCard
        label="Notes Today"
        value={stats.notesToday}
        icon="📝"
      />
      <StatCard
        label="Most Active Day"
        value={stats.mostActiveDay}
        icon="⭐"
        isText
      />
    </motion.div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: string;
  isText?: boolean;
}

function StatCard({ label, value, icon, isText }: StatCardProps) {
  return (
    <div className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm text-[#8A8A8A]">{label}</span>
      </div>
      <div className={`font-semibold ${isText ? 'text-white text-lg' : 'text-white text-2xl'}`}>
        {value}
      </div>
    </div>
  );
}
