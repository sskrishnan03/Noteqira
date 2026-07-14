import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Search as SearchIcon,
  FileText,
  Mic,
  Image,
  Clock,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { db } from '@/lib/data';

const sourceIcons: Record<string, typeof FileText> = {
  manual: FileText,
  voice: Mic,
  image: Image,
  document: FileText,
};

export default function Search() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    title: string;
    source_type: string;
    created_at: string;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { data: recentNotes } = useQuery({
    queryKey: ['notes', 'recent'],
    queryFn: async () => {
      const data = await db.getNotes({ archived: false, limit: 10 });
      return data.map(({ id, title, source_type, created_at }) => ({ id, title, source_type, created_at }));
    },
  });

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    const data = await db.getNotes({ archived: false, search: query, limit: 20 });
    setSearchResults(data.map(({ id, title, source_type, created_at }) => ({ id, title, source_type, created_at })));

    setIsSearching(false);
  };

  const suggestions: string[] = [];

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />

      <main className="pt-16 px-4 pb-8">
        <div className="max-w-3xl mx-auto">
          {/* Back button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-4"
          >
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </motion.div>

          {/* Search header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
              <SearchIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Search</h1>
            <p className="text-[#8A8A8A]">
              Search across all your notes
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-2 mb-8"
          >
            <div className="flex items-center gap-3">
              <SearchIcon className="w-5 h-5 text-white ml-4" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search your notes..."
                className="flex-1 bg-transparent text-white py-4 focus:outline-none placeholder:text-[#555555]"
                autoFocus
              />
              <button
                onClick={handleSearch}
                disabled={isSearching || !query.trim()}
                className="btn-primary"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <SearchIcon className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </motion.div>

          {/* Suggestions */}
          {!hasSearched && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-sm font-medium text-[#8A8A8A] mb-3">
                Try asking:
              </h2>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(suggestion);
                      setTimeout(handleSearch, 100);
                    }}
                    className="px-4 py-2 rounded-full bg-[#111111]/50 border border-[#2A2A2A] text-[#C8C8C8] text-sm hover:bg-[#1B1B1B] hover:text-white transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Search results */}
          {hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-[#8A8A8A]">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </h2>
                <button
                  onClick={() => {
                    setHasSearched(false);
                    setSearchResults([]);
                    setQuery('');
                  }}
                  className="text-sm text-[#8A8A8A] hover:text-white"
                >
                  Clear search
                </button>
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-12 bg-[#161616] border border-[#2A2A2A] rounded-2xl">
                  <SearchIcon className="w-10 h-10 text-[#555555] mx-auto mb-4" />
                  <p className="text-[#8A8A8A]">No results found</p>
                  <p className="text-[#555555] text-sm mt-1">
                    Try different keywords or check your notes
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.map((note, i) => {
                    const Icon = sourceIcons[note.source_type] || FileText;
                    return (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Link
                          to={`/notes/${note.id}`}
                          className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-4 flex items-start gap-4 hover:border-white/30 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-xl bg-[#1B1B1B] flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white truncate">
                              {note.title}
                            </h3>
                            <p className="text-xs text-[#555555] mt-2 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(note.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-[#555555] flex-shrink-0" />
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* Recent notes (shown when not searching) */}
          {!hasSearched && recentNotes && recentNotes.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-12"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-[#8A8A8A]">Recent Notes</h2>
                <Link
                  to="/dashboard"
                  className="text-xs text-white hover:text-[#C8C8C8]"
                >
                  View all
                </Link>
              </div>
              <div className="space-y-2">
                {recentNotes.slice(5).map((note) => {
                  const Icon = sourceIcons[note.source_type] || FileText;
                  return (
                    <Link
                      key={note.id}
                      to={`/notes/${note.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#111111]/30 hover:bg-[#111111]/50 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-[#555555]" />
                      <span className="text-[#C8C8C8] truncate">{note.title}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
