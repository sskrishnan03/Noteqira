import { Link } from 'react-router-dom';
import {
  Menu,
  X,
} from 'lucide-react';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Header({
  sidebarOpen,
  onToggleSidebar,
}: HeaderProps) {
  return (
    <header className={`fixed top-0 right-0 left-0 z-30 transition-all duration-300 ${
          sidebarOpen ? 'lg:left-72' : 'lg:left-[68px]'
        }`}>
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

            <Link to="/">
              <span className="text-lg font-bold text-white hidden sm:block">Noteqira</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
