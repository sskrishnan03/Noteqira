import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  FolderOpen,
  Plus,
  Edit3,
  Trash2,
  FileText,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { db } from '@/lib/data';

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
    queryFn: () => db.getNotebooks(),
  });

  const { data: notes } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const data = await db.getNotes({ archived: false });
      return data.map(({ id, notebook_id }) => ({ id, notebook_id }));
    },
  });

  const getNoteCount = (notebookId: string) => {
    return notes?.filter((n) => n.notebook_id === notebookId).length || 0;
  };

  const createMutation = useMutation({
    mutationFn: () => db.createNotebook(newNotebook),
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
    mutationFn: (data: { id: string; updates: Record<string, unknown> }) => db.updateNotebook(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      toast.success('Notebook updated');
      setEditingNotebook(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => db.deleteNotebook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] });
      toast.success('Notebook deleted');
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0B0B0B]/80 backdrop-blur-xl border-b border-[#2A2A2A]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="p-2 rounded-lg text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-white" />
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
              <div className="w-20 h-20 rounded-2xl bg-[#1B1B1B] flex items-center justify-center mx-auto mb-6">
                <FolderOpen className="w-10 h-10 text-[#555555]" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">No collections yet</h2>
              <p className="text-[#8A8A8A] mb-6">
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
                    className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-6 flex flex-col hover:border-white/30 transition-all hover:-translate-y-1"
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
                      <p className="text-sm text-[#8A8A8A] line-clamp-2">
                        {notebook.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-auto pt-4 text-xs text-[#555555]">
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
                        className="p-2 rounded-lg bg-[#111111]/80 text-[#8A8A8A] hover:text-white hover:bg-[#1B1B1B] transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          deleteMutation.mutate(notebook.id);
                        }}
                        className="p-2 rounded-lg bg-[#111111]/80 text-[#8A8A8A] hover:text-white hover:bg-white/10 transition-colors"
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
              className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold text-white mb-6">
                {editingNotebook ? 'Edit Collection' : 'New Collection'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#8A8A8A] mb-2">Name</label>
                  <input
                    type="text"
                    value={newNotebook.title}
                    onChange={(e) => setNewNotebook({ ...newNotebook, title: e.target.value })}
                    placeholder="Collection name"
                    className="input-base"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#8A8A8A] mb-2">Description</label>
                  <textarea
                    value={newNotebook.description}
                    onChange={(e) => setNewNotebook({ ...newNotebook, description: e.target.value })}
                    placeholder="Optional description"
                    className="input-base min-h-[80px] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#8A8A8A] mb-2">Color</label>
                  <div className="flex gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewNotebook({ ...newNotebook, cover_color: color })}
                        className={`w-8 h-8 rounded-lg transition-all ${
                          newNotebook.cover_color === color
                            ? 'ring-2 ring-white ring-offset-2 ring-offset-[#111111]'
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
