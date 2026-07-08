import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
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
  ChevronRight,
  Plus,
  Search,
  Layers,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  notebooks: Array<{
    id: string;
    title: string;
    icon: string;
    cover_color: string;
  }>;
}

const mainNavItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: Star, label: 'Favorites', path: '/dashboard?filter=favorites' },
  { icon: Clock, label: 'Recent', path: '/dashboard?filter=recent' },
  { icon: Archive, label: 'Archived', path: '/dashboard?filter=archived' },
];

const toolsNavItems = [
  { icon: Layers, label: 'Flashcards', path: '/flashcards' },
  { icon: BookOpen, label: 'Quizzes', path: '/quizzes' },
  { icon: Bell, label: 'Reminders', path: '/reminders' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
];

export default function Sidebar({ isOpen, onClose, notebooks }: SidebarProps) {
  const location = useLocation();
  const [notebooksExpanded, setNotebooksExpanded] = useState(true);
  const [collectionsExpanded, setCollectionsExpanded] = useState(true);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 hidden lg:block transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="w-72 h-full bg-surface-900/95 backdrop-blur-xl border-r border-white/5 flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-white/5">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">CogniNote</span>
                <span className="block text-xs text-secondary-500">AI Workspace</span>
              </div>
            </Link>
          </div>

          {/* Search */}
          <div className="p-4">
            <Link
              to="/search"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-950/50 border border-white/5 text-secondary-400 hover:bg-surface-950 transition-colors"
            >
              <Search className="w-5 h-5" />
              <span>Search everything...</span>
              <kbd className="ml-auto text-xs px-2 py-1 bg-surface-800 rounded text-secondary-500">
                ⌘K
              </kbd>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-2">
            {/* Main Navigation */}
            <div className="mb-6">
              <ul className="space-y-1">
                {mainNavItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        location.pathname === item.path
                          ? 'bg-primary-500/10 text-primary-400'
                          : 'text-secondary-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tools Section */}
            <div className="mb-6">
              <h3 className="px-3 mb-2 text-xs font-semibold text-secondary-500 uppercase tracking-wider">
                Tools
              </h3>
              <ul className="space-y-1">
                {toolsNavItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                        location.pathname === item.path
                          ? 'bg-primary-500/10 text-primary-400'
                          : 'text-secondary-400 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Notebooks */}
            <div className="mb-6">
              <button
                onClick={() => setNotebooksExpanded(!notebooksExpanded)}
                className="flex items-center justify-between w-full px-3 mb-2 text-xs font-semibold text-secondary-500 uppercase tracking-wider hover:text-secondary-400 transition-colors"
              >
                <span>Notebooks</span>
                {notebooksExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              <AnimatePresence>
                {notebooksExpanded && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-1 overflow-hidden"
                  >
                    {notebooks.slice(0, 5).map((notebook) => (
                      <li key={notebook.id}>
                        <Link
                          to={`/collections?notebook=${notebook.id}`}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-secondary-400 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: notebook.cover_color }}
                          />
                          <span className="truncate">{notebook.title}</span>
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        to="/collections"
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-secondary-500 hover:bg-white/5 hover:text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>New Notebook</span>
                      </Link>
                    </li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* AI Features */}
            <div className="mb-6">
              <div className="px-3 py-4 rounded-xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-primary-400" />
                  <span className="text-sm font-medium text-white">AI Assistant</span>
                </div>
                <p className="text-xs text-secondary-400 mb-3">
                  Ask questions, generate summaries, and create study materials.
                </p>
                <Link
                  to="/notes/new"
                  className="block w-full text-center py-2 rounded-lg bg-primary-500/20 text-primary-400 text-sm font-medium hover:bg-primary-500/30 transition-colors"
                >
                  New AI Note
                </Link>
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/5">
            <Link
              to="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-secondary-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {!isOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed top-0 left-0 h-full w-72 bg-surface-900 z-50 lg:hidden"
          >
            {/* Same content as desktop sidebar */}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
