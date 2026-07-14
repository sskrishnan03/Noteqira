import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Home,
  Star,
  Clock,
  Archive,
  Settings,
  Search,
  Database,
  BarChart3,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  Calendar as CalendarIcon,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

const navSections = [
  {
    title: 'Overview',
    items: [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: CalendarIcon, label: 'Calendar', path: '/calendar' },
      { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    ],
  },
  {
    title: 'Notes',
    items: [
      { icon: Database, label: 'Note Storage', path: '/storage' },
      { icon: Star, label: 'Favorites', path: '/favorites' },
      { icon: Clock, label: 'Recent', path: '/recent' },
      { icon: Archive, label: 'Archived', path: '/archived' },
      { icon: Trash2, label: 'Trash', path: '/trash' },
    ],
  },
];

function isActivePath(currentPath: string, itemPath: string) {
  if (itemPath === '/storage') return currentPath === '/storage' || currentPath.startsWith('/storage/');
  return currentPath === itemPath;
}

export default function Sidebar({ isOpen, onClose, onToggle }: SidebarProps) {
  const location = useLocation();

  const renderNavSections = (isMobile = false) => (
    <>
      {navSections.map((section) => (
        <div key={section.title} className="mb-6">
          {isOpen || isMobile ? (
            <div className="px-3 mb-2">
              <p className="text-[11px] uppercase tracking-wider text-[#555555]">{section.title}</p>
              <div className="h-px bg-[#2A2A2A] mt-2" />
            </div>
          ) : null}
          <ul className="space-y-1">
            {section.items.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={isMobile ? onClose : undefined}
                  className={`flex items-center rounded-xl transition-colors ${
                    isOpen || isMobile ? 'gap-3 px-3 py-2.5' : 'justify-center py-2.5 mx-auto w-10'
                  } ${
                    isActivePath(location.pathname, item.path)
                      ? 'bg-white/10 text-white'
                      : 'text-[#8A8A8A] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {(isOpen || isMobile) && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );

  return (
    <>
      <aside
        className={`fixed top-0 left-0 h-full z-50 hidden lg:block transition-all duration-300 ${
          isOpen ? 'w-72' : 'w-[68px]'
        }`}
      >
        <div className="h-full bg-[#111111]/95 backdrop-blur-xl border-r border-[#2A2A2A] flex flex-col overflow-hidden">
          <div className={`border-b border-[#2A2A2A] ${isOpen ? 'p-6' : 'py-4'}`}>
            <div className={`flex ${isOpen ? 'items-center justify-between' : 'flex-col items-center gap-3'}`}>
              <Link to="/" className={`flex items-center ${isOpen ? 'gap-3' : 'flex-col'}`}>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                {isOpen && (
                  <div>
                    <span className="text-xl font-bold text-white">Noteqira</span>
                    <span className="block text-xs text-[#8A8A8A]">Workspace</span>
                  </div>
                )}
              </Link>
              <button
                onClick={onToggle}
                className="p-2 rounded-lg text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-colors"
                title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                {isOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {isOpen && (
            <div className="p-4">
              <Link
                to="/search"
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0B0B0B]/50 border border-[#2A2A2A] text-[#8A8A8A] hover:bg-[#0B0B0B] transition-colors"
              >
                <Search className="w-5 h-5 shrink-0" />
                <span>Search</span>
                <kbd className="ml-auto text-xs px-2 py-1 bg-[#1B1B1B] rounded text-[#555555]">
                  Ctrl K
                </kbd>
              </Link>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto px-2 py-2">
            {renderNavSections()}
          </nav>

          <div className={`border-t border-[#2A2A2A] ${isOpen ? 'p-4' : 'py-3'}`}>
            <Link
              to="/settings"
              className={`flex items-center rounded-xl text-[#8A8A8A] hover:bg-white/5 hover:text-white transition-colors ${
                isOpen ? 'gap-3 px-3 py-2' : 'justify-center py-2 mx-auto w-10'
              }`}
            >
              <Settings className="w-5 h-5 shrink-0" />
              {isOpen && <span>Settings</span>}
            </Link>
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {!isOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed top-0 left-0 h-full w-72 bg-[#111111] z-50 lg:hidden"
          >
            <div className="w-72 h-full bg-[#111111] flex flex-col">
              <div className="p-6 border-b border-[#2A2A2A] flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3" onClick={onClose}>
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-xl font-bold text-white">Noteqira</span>
                    <span className="block text-xs text-[#8A8A8A]">Workspace</span>
                  </div>
                </Link>
                <button onClick={onClose} className="p-2 rounded-lg text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4">
                <Link
                  to="/search"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0B0B0B]/50 border border-[#2A2A2A] text-[#8A8A8A] hover:bg-[#0B0B0B] transition-colors"
                >
                  <Search className="w-5 h-5" />
                  <span>Search</span>
                  <kbd className="ml-auto text-xs px-2 py-1 bg-[#1B1B1B] rounded text-[#555555]">Ctrl K</kbd>
                </Link>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-2">
                {renderNavSections(true)}
              </nav>

              <div className="p-4 border-t border-[#2A2A2A]">
                <Link
                  to="/settings"
                  onClick={onClose}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-[#8A8A8A] hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
