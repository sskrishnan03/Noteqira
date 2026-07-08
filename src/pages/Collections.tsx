import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  FolderOpen,
  Plus,
  MoreHorizontal,
  Edit3,
  Trash2,
  FileText,
  Loader2,
  Palette,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';

const colorOptions = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
];

export default function Collections() {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNotebook, setEditingNotebook] = useState<string | null>(null);
  const [newNotebook, setNewNotebook] = useState({
    title: '',
    description: '',
    cover_color: '#3b82f6',
    icon: 'folder',
  });

  const { data: notebooks, isLoading } = useQuery({
    queryKey: ['notebooks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notebooks')
        .select('*')
        .eq('is_archived', false)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: notes } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('id, notebook_id')
        .eq('is_archived', false);
      if (error) throw error;
      return data;
    },
  });

  const getNoteCount = (notebookId: string) => {
    return notes?.filter((n) => n.notebook_id === notebookId).length || 0;
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('notebooks').insert([newNotebook]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      toast.success('Notebook created');
      setShowCreateModal(false);
      setNewNotebook({
        title: '',
        description: '',
        cover_color: '#3b82f6',
        icon: 'folder',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Record<string, unknown> }) => {
      const { error } = await supabase
        .from('notebooks')
        .update(data.updates)
        .eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      toast.success('Notebook updated');
      setEditingNotebook(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notebooks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      toast.success('Notebook deleted');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950">
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="p-2 rounded-lg text-secondary-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary-400" />
              <h1 className="font-semibold text-white">Collections</h1>
            </div>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            New Collection
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-24 pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          {(!notebooks || notebooks.length === 0) ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-2xl bg-surface-800/50 flex items-center justify-center mx-auto mb-6">
                <FolderOpen className="w-10 h-10 text-secondary-500" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">No collections yet</h2>
              <p className="text-secondary-400 mb-6">
                Organize your notes into collections
              </p>
              <button onClick={() => setShowCreateModal(true)} className="btn-primary">
                <Plus className="w-4 h-4" />
                Create Collection
              </button>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {notebooks.map((notebook, i) => (
                <motion.div
                  key={notebook.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative"
                >
                  <Link
                    to={`/dashboard?notebook=${notebook.id}`}
                    className="glass-card p-6 flex flex-col hover:border-primary-500/30 transition-all hover:-translate-y-1"
                  >
                    <div
                      className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
                      style={{ backgroundColor: notebook.cover_color + '20' }}
                    >
                      <FolderOpen
                        className="w-6 h-6"
                        style={{ color: notebook.cover_color }}
                      />
                    </div>
                    <h3 className="font-medium text-white mb-1">{notebook.title}</h3>
                    {notebook.description && (
                      <p className="text-sm text-secondary-400 line-clamp-2">
                        {notebook.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-auto pt-4 text-xs text-secondary-500">
                      <FileText className="w-3 h-3" />
                      {getNoteCount(notebook.id)} notes
                    </div>
                  </Link>

                  {/* Actions overlay */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setEditingNotebook(notebook.id);
                          setNewNotebook({
                            title: notebook.title,
                            description: notebook.description || '',
                            cover_color: notebook.cover_color,
                            icon: notebook.icon,
                          });
                          setShowCreateModal(true);
                        }}
                        className="p-2 rounded-lg bg-surface-900/80 text-secondary-400 hover:text-white hover:bg-surface-800 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          deleteMutation.mutate(notebook.id);
                        }}
                        className="p-2 rounded-lg bg-surface-900/80 text-secondary-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowCreateModal(false);
              setEditingNotebook(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="glass-card p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-white mb-6">
                {editingNotebook ? 'Edit Collection' : 'New Collection'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-secondary-400 mb-2">Name</label>
                  <input
                    type="text"
                    value={newNotebook.title}
                    onChange={(e) => setNewNotebook({ ...newNotebook, title: e.target.value })}
                    placeholder="Collection name"
                    className="input-base"
                  />
                </div>

                <div>
                  <label className="block text-sm text-secondary-400 mb-2">Description</label>
                  <textarea
                    value={newNotebook.description}
                    onChange={(e) => setNewNotebook({ ...newNotebook, description: e.target.value })}
                    placeholder="Optional description"
                    className="input-base min-h-[80px] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-secondary-400 mb-2">Color</label>
                  <div className="flex gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewNotebook({ ...newNotebook, cover_color: color })}
                        className={`w-8 h-8 rounded-lg transition-all ${
                          newNotebook.cover_color === color
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-900'
                            : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingNotebook(null);
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (editingNotebook) {
                      updateMutation.mutate({
                        id: editingNotebook,
                        updates: newNotebook,
                      });
                    } else {
                      createMutation.mutate();
                    }
                  }}
                  disabled={!newNotebook.title}
                  className="btn-primary flex-1"
                >
                  {editingNotebook ? 'Save' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
