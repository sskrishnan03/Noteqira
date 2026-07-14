import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  LogOut,
  Mail,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth';

const settingsSections = [
  { id: 'profile', icon: User, label: 'Profile', description: 'Your account settings' },
];

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut, updateProfile } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');
  const [displayName, setDisplayName] = useState(user?.name || '');
  return (
    <div className="min-h-screen bg-[#0B0B0B]">
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0B0B0B]/80 backdrop-blur-xl border-b border-[#2A2A2A]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            to="/dashboard"
            className="p-2 rounded-lg text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold text-white">Settings</h1>
        </div>
      </header>

      <main className="pt-20 pb-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <nav className="space-y-1">
                {settingsSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-white/10 text-white'
                        : 'text-[#8A8A8A] hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    <div>
                      <span className="block text-sm font-medium">{section.label}</span>
                      <span className="block text-xs text-[#555555]">
                        {section.description}
                      </span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#161616] border border-[#2A2A2A] rounded-2xl p-6"
              >
                {activeSection === 'profile' && user && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white">Profile Settings</h2>

                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center">
                        <User className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.name}</p>
                        <p className="text-sm text-[#8A8A8A]">{user.email}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-[#555555]">
                          <Calendar className="w-3 h-3" />
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-[#8A8A8A] mb-2">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Your display name"
                          className="input-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[#8A8A8A] mb-2">
                          Email
                        </label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-[#0B0B0B]/50 border border-[#2A2A2A] rounded-xl text-[#8A8A8A]">
                          <Mail className="w-4 h-4" />
                          <span className="text-white">{user.email}</span>
                        </div>
                        <p className="text-xs text-[#555555] mt-1">Email cannot be changed</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={async () => {
                          try {
                            await updateProfile({ name: displayName });
                            toast.success('Profile updated');
                          } catch {
                            toast.error('Failed to update profile');
                          }
                        }}
                        className="btn-primary"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => { signOut(); toast.success('Signed out'); navigate('/'); }}
                        className="btn-secondary text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}


              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
