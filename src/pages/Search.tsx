import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Search as SearchIcon,
  Brain,
  FileText,
  Mic,
  Image,
  Video,
  Link2,
  Clock,
  Star,
  ArrowRight,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

const sourceIcons: Record<string, typeof FileText> = {
  manual: FileText,
  voice: Mic,
  image: Image,
  video: Video,
  url: Link2,
  document: FileText,
  audio: Mic,
};

export default function Search() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    id: string;
    title: string;
    source_type: string;
    ai_summary: string | null;
    created_at: string;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const { data: recentNotes } = useQuery({
    queryKey: ['notes', 'recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('id, title, source_type, ai_summary, created_at')
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    const { data, error } = await supabase
      .from('notes')
      .select('id, title, source_type, ai_summary, created_at')
      .or(`title.ilike.%${query}%,content_plain.ilike.%${query}%,ai_summary.ilike.%${query}%`)
      .eq('is_archived', false)
      .limit(20);

    if (!error && data) {
      setSearchResults(data);
    }

    setIsSearching(false);
  };

  const suggestions = [
    'What are the key points from last week?',
    'Show me machine learning notes',
    'Find all voice recordings',
    'Notes about project planning',
  ];

  return (
    <div className="min-h-screen bg-surface-950">
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />

      <main className="pt-16 px-4 pb-8">
        <div className="max-w-3xl mx-auto">
          {/* Search header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">AI Search</h1>
            <p className="text-secondary-400">
              Search your notes with natural language
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-2 mb-8"
          >
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-primary-400 ml-4" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Ask anything about your notes..."
                className="flex-1 bg-transparent text-white py-4 focus:outline-none placeholder:text-secondary-500"
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
              <h2 className="text-sm font-medium text-secondary-400 mb-3">
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
                    className="px-4 py-2 rounded-full bg-surface-900/50 border border-white/5 text-secondary-300 text-sm hover:bg-surface-800 hover:text-white transition-colors"
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
                <h2 className="text-sm font-medium text-secondary-400">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </h2>
                <button
                  onClick={() => {
                    setHasSearched(false);
                    setSearchResults([]);
                    setQuery('');
                  }}
                  className="text-sm text-secondary-400 hover:text-white"
                >
                  Clear search
                </button>
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-12 glass-card">
                  <SearchIcon className="w-10 h-10 text-secondary-500 mx-auto mb-4" />
                  <p className="text-secondary-400">No results found</p>
                  <p className="text-secondary-500 text-sm mt-1">
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
                          className="glass-card p-4 flex items-start gap-4 hover:border-primary-500/30 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-xl bg-surface-800/50 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-primary-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white truncate">
                              {note.title}
                            </h3>
                            {note.ai_summary && (
                              <p className="text-sm text-secondary-400 line-clamp-2 mt-1">
                                {note.ai_summary}
                              </p>
                            )}
                            <p className="text-xs text-secondary-500 mt-2 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(note.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-secondary-500 flex-shrink-0" />
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
                <h2 className="text-sm font-medium text-secondary-400">Recent Notes</h2>
                <Link
                  to="/dashboard"
                  className="text-xs text-primary-400 hover:text-primary-300"
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
                      className="flex items-center gap-3 p-3 rounded-xl bg-surface-900/30 hover:bg-surface-900/50 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-secondary-500" />
                      <span className="text-secondary-300 truncate">{note.title}</span>
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
