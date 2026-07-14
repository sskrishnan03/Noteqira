import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface CalendarGridProps {
  currentDate: Date;
  viewMode: 'month' | 'week' | 'day';
  notesByDate: Record<string, any[]>;
  selectedDates: Date[];
  onDateSelect: (date: Date) => void;
  onCreateNote: (date: Date) => void;
}

export default function CalendarGrid({
  currentDate,
  viewMode,
  notesByDate,
  selectedDates,
  onDateSelect,
  onCreateNote,
}: CalendarGridProps) {
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Generate calendar days based on view mode
  const calendarDays = useMemo(() => {
    const days: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (viewMode === 'month') {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());
      
      const endDate = new Date(lastDay);
      endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
      
      const current = new Date(startDate);
      while (current <= endDate) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        days.push(day);
      }
    } else {
      days.push(new Date(currentDate));
    }

    return days;
  }, [currentDate, viewMode]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isSelected = (date: Date) => {
    return selectedDates.some(d => d.toDateString() === date.toDateString());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getNotesForDate = (date: Date) => {
    return notesByDate[date.toDateString()] || [];
  };

  const handleDateClick = (date: Date) => {
    const notes = getNotesForDate(date);
    if (notes.length > 0) {
      onDateSelect(date);
    } else {
      onCreateNote(date);
    }
  };

  if (viewMode === 'day') {
    const date = calendarDays[0];
    const notes = getNotesForDate(date);
    
    return (
      <div className="space-y-4">
        <div className="text-center py-12">
          <div className="text-4xl font-bold text-white mb-2">
            {date.getDate()}
          </div>
          <div className="text-lg text-[#8A8A8A]">
            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', year: 'numeric' })}
          </div>
          {isToday(date) && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-sm">
              Today
            </div>
          )}
        </div>
        
        <div className="bg-[#0B0B0B]/50 border border-[#2A2A2A] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {notes.length} {notes.length === 1 ? 'note' : 'notes'}
            </h3>
            {notes.length === 0 && (
              <button
                onClick={() => onCreateNote(date)}
                className="px-4 py-2 rounded-xl text-sm bg-white/10 text-white hover:bg-white/15 transition-all"
              >
                Create Note
              </button>
            )}
          </div>
          
          {notes.length === 0 ? (
            <div className="text-center py-8 text-[#8A8A8A]">
              No notes on this day
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => onDateSelect(date)}
                  className="p-4 rounded-xl bg-[#111111] border border-[#2A2A2A] hover:border-white/20 cursor-pointer transition-all"
                >
                  <div className="font-medium text-white mb-1">{note.title}</div>
                  <div className="text-sm text-[#8A8A8A]">
                    {note.source_type}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Week day headers */}
      {viewMode === 'month' && (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-[#8A8A8A] py-2"
            >
              {day}
            </div>
          ))}
        </div>
      )}

      {/* Calendar grid */}
      <div
        className={`grid gap-2 ${
          viewMode === 'month' ? 'grid-cols-7' : 'grid-cols-7'
        }`}
      >
        {calendarDays.map((date, index) => {
          const notes = getNotesForDate(date);
          const selected = isSelected(date);
          const today = isToday(date);
          const currentMonth = isCurrentMonth(date);
          
          return (
            <motion.div
              key={date.toDateString()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              onClick={() => handleDateClick(date)}
              onMouseEnter={() => setHoveredDate(date)}
              onMouseLeave={() => setHoveredDate(null)}
              className={`
                relative aspect-square rounded-xl border p-2 cursor-pointer transition-all
                ${selected
                  ? 'bg-white/10 border-white/30'
                  : today
                  ? 'bg-white/5 border-white/20'
                  : currentMonth
                  ? 'bg-[#0B0B0B]/50 border-[#2A2A2A] hover:border-white/20 hover:bg-[#111111]/50'
                  : 'bg-[#0B0B0B]/30 border-[#1A1A1A] opacity-50'
                }
              `}
            >
              {/* Date number */}
              <div
                className={`
                  text-sm font-medium mb-1
                  ${today ? 'text-white' : currentMonth ? 'text-[#C8C8C8]' : 'text-[#555555]'}
                `}
              >
                {date.getDate()}
              </div>

              {/* Today indicator */}
              {today && (
                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white" />
              )}

              {/* Notes count indicator */}
              {notes.length > 0 && (
                <div className="mt-auto">
                  <div className="flex items-center gap-1">
                    <div className="flex-1 h-1 rounded-full bg-white/20 overflow-hidden">
                      <div
                        className="h-full bg-white/60 rounded-full transition-all"
                        style={{ width: `${Math.min(notes.length * 20, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#8A8A8A]">
                      {notes.length}
                    </span>
                  </div>
                </div>
              )}

              {/* Hover tooltip */}
              {hoveredDate?.toDateString() === date.toDateString() && notes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 w-48 bg-[#161616] border border-[#2A2A2A] rounded-xl p-3 shadow-xl pointer-events-none"
                >
                  <div className="text-xs text-[#8A8A8A] mb-2">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="space-y-1">
                    {notes.slice(0, 3).map((note) => (
                      <div
                        key={note.id}
                        className="text-xs text-white truncate"
                      >
                        {note.title}
                      </div>
                    ))}
                    {notes.length > 3 && (
                      <div className="text-xs text-[#8A8A8A]">
                        +{notes.length - 3} more
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
