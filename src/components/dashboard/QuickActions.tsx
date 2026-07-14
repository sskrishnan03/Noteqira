import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic,
  Image,
  FileText,
  FileUp,
} from 'lucide-react';

const actions = [
  {
    icon: FileText,
    label: 'Notes',
    description: 'Create a new note',
    path: '/notes/new',
  },
  {
    icon: Mic,
    label: 'Voice Notes',
    description: 'Record voice to text',
    path: '/notes/new/voice',
  },
  {
    icon: Image,
    label: 'Images',
    description: 'Extract text from image',
    path: '/notes/new/image',
  },
  {
    icon: FileUp,
    label: 'Documents',
    description: 'Import PDF, DOC, PPT...',
    path: '/notes/new/document',
  },
];

export default function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8"
    >
      <h2 className="text-lg font-semibold text-white mb-4">Quick Create</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {actions.map((action, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={action.path}
              className="flex flex-col items-center p-4 rounded-2xl bg-white/5 border border-[#2A2A2A] hover:border-white/20 transition-all duration-200 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-white">{action.label}</span>
              <span className="text-xs text-[#8A8A8A]">{action.description}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
