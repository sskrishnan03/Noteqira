import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Palette,
  Bell,
  Brain,
  Shield,
  Keyboard,
  Globe,
  Database,
  HelpCircle,
  ChevronRight,
  Check,
} from 'lucide-react';

const settingsSections = [
  { id: 'profile', icon: User, label: 'Profile', description: 'Your account settings' },
  { id: 'appearance', icon: Palette, label: 'Appearance', description: 'Theme and display' },
  { id: 'notifications', icon: Bell, label: 'Notifications', description: 'Alerts and reminders' },
  { id: 'ai', icon: Brain, label: 'AI Preferences', description: 'Auto-processing settings' },
  { id: 'shortcuts', icon: Keyboard, label: 'Shortcuts', description: 'Keyboard shortcuts' },
  { id: 'storage', icon: Database, label: 'Storage', description: 'Manage data usage' },
  { id: 'privacy', icon: Shield, label: 'Privacy & Security', description: 'Data and permissions' },
  { id: 'language', icon: Globe, label: 'Language', description: 'App language' },
  { id: 'help', icon: HelpCircle, label: 'Help & Support', description: 'Documentation and FAQs' },
];

const themes = [
  { id: 'dark', label: 'Dark', color: 'bg-surface-900' },
  { id: 'light', label: 'Light', color: 'bg-white' },
  { id: 'system', label: 'System', color: 'bg-gradient-to-r from-surface-900 to-white' },
];

const accentColors = [
  { id: 'blue', color: 'bg-primary-500' },
  { id: 'green', color: 'bg-accent-500' },
  { id: 'purple', color: 'bg-purple-500' },
  { id: 'amber', color: 'bg-amber-500' },
  { id: 'rose', color: 'bg-rose-500' },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState('profile');
  const [theme, setTheme] = useState('dark');
  const [accentColor, setAccentColor] = useState('blue');
  const [aiPreferences, setAiPreferences] = useState({
    autoTag: true,
    autoSummarize: true,
    autoFlashcards: false,
  });

  return (
    <div className="min-h-screen bg-surface-950">
      <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            to="/dashboard"
            className="p-2 rounded-lg text-secondary-400 hover:text-white hover:bg-white/5 transition-colors"
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
                        ? 'bg-primary-500/10 text-primary-400'
                        : 'text-secondary-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    <div>
                      <span className="block text-sm font-medium">{section.label}</span>
                      <span className="block text-xs text-secondary-500">
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
                className="glass-card p-6"
              >
                {activeSection === 'profile' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white">Profile Settings</h2>

                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                        <User className="w-10 h-10 text-white" />
                      </div>
                      <button className="btn-secondary">
                        Change Photo
                      </button>
                    </div>

                    {/* Form fields */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-secondary-400 mb-2">
                          Display Name
                        </label>
                        <input
                          type="text"
                          defaultValue="CogniNote User"
                          className="input-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-secondary-400 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          defaultValue="user@example.com"
                          className="input-base"
                        />
                      </div>
                    </div>

                    <button className="btn-primary">Save Changes</button>
                  </div>
                )}

                {activeSection === 'appearance' && (
                  <div className="space-y-8">
                    <h2 className="text-xl font-semibold text-white">Appearance</h2>

                    {/* Theme */}
                    <div>
                      <h3 className="text-sm font-medium text-secondary-400 mb-3">Theme</h3>
                      <div className="grid grid-cols-3 gap-3">
                        {themes.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`p-4 rounded-xl border ${
                              theme === t.id
                                ? 'border-primary-500/50 bg-primary-500/10'
                                : 'border-white/5 hover:border-white/10'
                            } transition-colors`}
                          >
                            <div className={`w-full h-12 rounded-lg ${t.color} mb-2`} />
                            <span className="text-sm text-white">{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Accent Color */}
                    <div>
                      <h3 className="text-sm font-medium text-secondary-400 mb-3">
                        Accent Color
                      </h3>
                      <div className="flex gap-3">
                        {accentColors.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setAccentColor(c.id)}
                            className={`w-10 h-10 rounded-xl ${c.color} ${
                              accentColor === c.id
                                ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-900'
                                : ''
                            } transition-all`}
                          >
                            {accentColor === c.id && (
                              <Check className="w-5 h-5 text-white mx-auto" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font size */}
                    <div>
                      <h3 className="text-sm font-medium text-secondary-400 mb-3">
                        Font Size
                      </h3>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-secondary-500">A</span>
                        <input
                          type="range"
                          min="12"
                          max="20"
                          defaultValue="16"
                          className="flex-1"
                        />
                        <span className="text-lg text-secondary-500">A</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'ai' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white">AI Preferences</h2>
                    <p className="text-secondary-400 text-sm">
                      Control how AI processes your notes automatically.
                    </p>

                    <div className="space-y-4">
                      {[
                        {
                          key: 'autoTag',
                          label: 'Auto-tag notes',
                          description: 'AI will automatically add relevant tags',
                        },
                        {
                          key: 'autoSummarize',
                          label: 'Auto-summarize',
                          description: 'Generate summaries for new notes',
                        },
                        {
                          key: 'autoFlashcards',
                          label: 'Auto-generate flashcards',
                          description: 'Create study cards from your notes',
                        },
                      ].map((setting) => (
                        <div
                          key={setting.key}
                          className="flex items-center justify-between p-4 rounded-xl bg-surface-950/50"
                        >
                          <div>
                            <h3 className="font-medium text-white">{setting.label}</h3>
                            <p className="text-sm text-secondary-400">
                              {setting.description}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              setAiPreferences((prev) => ({
                                ...prev,
                                [setting.key]: !prev[setting.key as keyof typeof prev],
                              }))
                            }
                            className={`w-12 h-6 rounded-full transition-colors ${
                              aiPreferences[setting.key as keyof typeof aiPreferences]
                                ? 'bg-primary-500'
                                : 'bg-surface-700'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                aiPreferences[setting.key as keyof typeof aiPreferences]
                                  ? 'translate-x-6'
                                  : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white">Notifications</h2>
                    <div className="space-y-4">
                      {[
                        { label: 'Push notifications', enabled: true },
                        { label: 'Email digest', enabled: false },
                        { label: 'Reminder alerts', enabled: true },
                        { label: 'AI insights', enabled: true },
                      ].map((notif, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-4 rounded-xl bg-surface-950/50"
                        >
                          <span className="text-white">{notif.label}</span>
                          <button
                            className={`w-12 h-6 rounded-full transition-colors ${
                              notif.enabled ? 'bg-primary-500' : 'bg-surface-700'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                                notif.enabled ? 'translate-x-6' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === 'storage' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white">Storage</h2>
                    <div className="p-4 rounded-xl bg-surface-950/50">
                      <div className="flex justify-between mb-2">
                        <span className="text-secondary-400">Used</span>
                        <span className="text-white">2.4 GB / 5 GB</span>
                      </div>
                      <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
                        <div className="h-full w-[48%] bg-primary-500 rounded-full" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-secondary-400">Notes</span>
                        <span className="text-white">1.2 GB</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-secondary-400">Images</span>
                        <span className="text-white">800 MB</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-secondary-400">Documents</span>
                        <span className="text-white">400 MB</span>
                      </div>
                    </div>

                    <button className="btn-secondary">Clear Cache</button>
                  </div>
                )}

                {activeSection === 'privacy' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white">Privacy & Security</h2>
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-surface-950/50">
                        <h3 className="font-medium text-white mb-1">Data Encryption</h3>
                        <p className="text-sm text-secondary-400">
                          All your data is encrypted at rest and in transit
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-surface-950/50">
                        <h3 className="font-medium text-white mb-1">AI Data Usage</h3>
                        <p className="text-sm text-secondary-400">
                          Your notes are never used to train AI models
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-surface-950/50">
                        <h3 className="font-medium text-white mb-1">Export Data</h3>
                        <p className="text-sm text-secondary-400 mb-3">
                          Download all your data in JSON format
                        </p>
                        <button className="btn-secondary">Export All Data</button>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'shortcuts' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white">Keyboard Shortcuts</h2>
                    <div className="space-y-3">
                      {[
                        { keys: ['⌘', 'K'], action: 'Open search' },
                        { keys: ['⌘', 'N'], action: 'New note' },
                        { keys: ['⌘', 'S'], action: 'Save note' },
                        { keys: ['⌘', '/'], action: 'Toggle sidebar' },
                        { keys: ['⌘', 'F'], action: 'Find in note' },
                      ].map((shortcut, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-xl bg-surface-950/50"
                        >
                          <span className="text-secondary-300">{shortcut.action}</span>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, j) => (
                              <kbd
                                key={j}
                                className="px-2 py-1 bg-surface-800 rounded text-xs text-secondary-400"
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(activeSection === 'language' || activeSection === 'help') && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-white">
                      {activeSection === 'language' ? 'Language' : 'Help & Support'}
                    </h2>
                    <p className="text-secondary-400">
                      {activeSection === 'language'
                        ? 'Select your preferred language.'
                        : 'Get help with CogniNote.'}
                    </p>
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
