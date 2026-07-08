import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic,
  Image,
  FileText,
  Video,
  Link2,
  Brain,
  Upload,
} from 'lucide-react';

const actions = [
  {
    icon: FileText,
    label: 'New Note',
    description: 'Start writing',
    path: '/notes/new',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    icon: Mic,
    label: 'Voice Recording',
    description: 'AI transcribes',
    path: '/notes/new?type=voice',
    color: 'from-rose-500 to-orange-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
  },
  {
    icon: Image,
    label: 'Upload Image',
    description: 'OCR & enhance',
    path: '/notes/new?type=image',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  {
    icon: Video,
    label: 'Video/YouTube',
    description: 'Extract content',
    path: '/notes/new?type=video',
    color: 'from-red-500 to-pink-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
  {
    icon: FileText,
    label: 'Documents',
    description: 'PDF, DOC, PPT...',
    path: '/notes/new?type=document',
    color: 'from-amber-500 to-yellow-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  {
    icon: Link2,
    label: 'From URL',
    description: 'Web content',
    path: '/notes/new?type=url',
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={action.path}
              className={`group flex flex-col items-center p-4 rounded-2xl ${action.bgColor} border ${action.borderColor} hover:border-white/20 transition-all duration-200 hover:-translate-y-1`}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
              >
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-white">{action.label}</span>
              <span className="text-xs text-secondary-400">{action.description}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
