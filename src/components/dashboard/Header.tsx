import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Search,
  Bell,
  Settings,
  Plus,
  Brain,
  Mic,
  Image,
  FileText,
  Video,
  Link2,
  X,
} from 'lucide-react';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const createOptions = [
  { icon: FileText, label: 'New Note', path: '/notes/new', color: 'text-blue-400' },
  { icon: Mic, label: 'Voice Recording', path: '/notes/new?type=voice', color: 'text-rose-400' },
  { icon: Image, label: 'Upload Image', path: '/notes/new?type=image', color: 'text-emerald-400' },
  { icon: Video, label: 'Video/YouTube', path: '/notes/new?type=video', color: 'text-red-400' },
  { icon: Link2, label: 'From URL', path: '/notes/new?type=url', color: 'text-indigo-400' },
];

export default function Header({
  sidebarOpen,
  onToggleSidebar,
  searchQuery,
  onSearchChange,
}: HeaderProps) {
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-72 z-30 transition-all duration-300">
      <div className="bg-surface-950/80 backdrop-blur-xl border-b border-white/5 px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left section */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-secondary-400 hover:text-white hover:bg-white/5 lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-500" />
              <input
                type="text"
                placeholder="Search notes, ask AI..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setShowSearch(true)}
                className="w-80 pl-12 pr-4 py-2.5 bg-surface-900/50 border border-white/5 rounded-xl text-white placeholder:text-secondary-500 focus:outline-none focus:border-primary-500/50 transition-colors"
              />
              <kbd className="absolute right-4 top-1/2 -translate-y-1/2 text-xs px-2 py-1 bg-surface-800 rounded text-secondary-500">
                ⌘K
              </kbd>
            </div>

            {/* Mobile search button */}
            <button
              onClick={() => setShowSearch(true)}
              className="p-2.5 rounded-xl bg-surface-900/50 border border-white/5 md:hidden"
            >
              <Search className="w-5 h-5 text-secondary-400" />
            </button>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Create button */}
            <div className="relative">
              <button
                onClick={() => setShowCreateMenu(!showCreateMenu)}
                className="btn-primary"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Create</span>
              </button>

              <AnimatePresence>
                {showCreateMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-56 glass-card p-2 z-50"
                  >
                    {createOptions.map((option, i) => (
                      <Link
                        key={i}
                        to={option.path}
                        onClick={() => setShowCreateMenu(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary-300 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <option.icon className={`w-5 h-5 ${option.color}`} />
                        <span>{option.label}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <button className="relative p-2.5 rounded-xl bg-surface-900/50 border border-white/5 text-secondary-400 hover:text-white hover:bg-white/5 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Settings */}
            <Link
              to="/settings"
              className="p-2.5 rounded-xl bg-surface-900/50 border border-white/5 text-secondary-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </Link>

            {/* User avatar */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-surface-950/95 backdrop-blur-xl z-50 p-4 md:hidden"
          >
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-5 h-5 text-secondary-400" />
              <input
                type="text"
                placeholder="Search notes, ask AI..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder:text-secondary-500 focus:outline-none"
                autoFocus
              />
              <button onClick={() => setShowSearch(false)}>
                <X className="w-5 h-5 text-secondary-400" />
              </button>
            </div>

            <div className="text-secondary-400 text-sm">
              <p className="mb-2">Quick actions:</p>
              <div className="space-y-2">
                {['Create new note', 'View flashcards', 'Check reminders'].map((action, i) => (
                  <button
                    key={i}
                    onClick={() => setShowSearch(false)}
                    className="block w-full text-left px-4 py-3 rounded-xl bg-surface-900/50 border border-white/5 hover:bg-white/5 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
