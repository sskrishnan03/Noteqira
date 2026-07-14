import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Star, Archive, FileText, Mic, Image, ChevronDown } from 'lucide-react';

type FilterType = 'all' | 'favorites' | 'archived' | 'manual' | 'voice' | 'image' | 'document';

interface CalendarFiltersProps {
  filterType: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filterOptions: { value: FilterType; label: string; icon: any }[] = [
  { value: 'all', label: 'All Notes', icon: FileText },
  { value: 'favorites', label: 'Favorites', icon: Star },
  { value: 'archived', label: 'Archived', icon: Archive },
  { value: 'manual', label: 'Documents', icon: FileText },
  { value: 'voice', label: 'Voice Notes', icon: Mic },
  { value: 'image', label: 'Images', icon: Image },
  { value: 'document', label: 'Files', icon: FileText },
];

export default function CalendarFilters({ filterType, onFilterChange }: CalendarFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = filterOptions.find(opt => opt.value === filterType);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#0B0B0B] border border-[#2A2A2A] rounded-xl text-[#C8C8C8] hover:bg-white/5 transition-all"
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm">{selectedOption?.label || 'All Notes'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute right-0 top-full mt-2 z-50 w-56 bg-[#161616] border border-[#2A2A2A] rounded-xl p-1 shadow-xl overflow-hidden"
            >
              {filterOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = option.value === filterType;

                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      onFilterChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isSelected
                        ? 'bg-white/10 text-white'
                        : 'text-[#C8C8C8] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{option.label}</span>
                    {isSelected && (
                      <X className="w-4 h-4 ml-auto" />
                    )}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
