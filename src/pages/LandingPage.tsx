import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Shield,
  Zap,
  BarChart3,
  BookOpen,
  ChevronRight,
  Menu,
  X,
  Mic,
  FileText,
  Target,
  ArrowRight,
  MessageSquare,
  Search,
  LogOut,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState, useRef } from 'react';
import AuthModal from '@/components/AuthModal';
import { useAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

const features = [
  {
    icon: Brain,
    title: 'Smart Notes',
    description: 'Capture your ideas with voice recording, image OCR, and document import. All your content in one place.',
  },
  {
    icon: Zap,
    title: 'Real-Time Sync',
    description: 'Seamlessly sync across all your devices. Access your notes anywhere, anytime.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'End-to-end encryption with zero-knowledge architecture. Your data stays yours.',
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    description: 'Track your productivity with detailed insights and visual analytics dashboards.',
  },
  {
    icon: BookOpen,
    title: 'Notebooks',
    description: 'Organize notes into custom notebooks with colors, icons, and drag-and-drop sorting.',
  },
  {
    icon: Sparkles,
    title: 'Quick Actions',
    description: 'Voice-to-text, OCR extraction, and document parsing at your fingertips.',
  },
];

const steps = [
  {
    icon: Mic,
    title: 'Capture Anywhere',
    description: 'Type notes, record voice, upload images, or import documents. Noteqira accepts content in any form and processes it instantly.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Brain,
    title: 'Organizes Everything',
    description: 'Voice transcription, OCR text extraction, and document parsing. Your knowledge structure builds itself.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Target,
    title: 'Master Instantly',
    description: 'Search with natural language, track analytics, and export your knowledge anytime.',
    color: 'from-emerald-500 to-green-500',
  },
];

const faqs = [
  {
    q: 'What is Noteqira and what does it do?',
    a: 'Noteqira is a modern note-taking workspace. It lets you capture notes via typing, voice recording (speech-to-text), image upload (OCR), or document import (PDF, DOCX, TXT). Your notes are organized and ready whenever you need them.',
  },
  {
    q: 'How do I create a note using voice, image, or document import?',
    a: 'On the Dashboard, click the relevant quick action or navigate to "New Note". For Voice: click the mic button to start recording (speech is transcribed in real-time via Chrome/Edge). For Image: upload an image of notes/whiteboard and text is extracted using OCR (Tesseract.js). For Document: upload a .txt, .pdf, or .docx file and content is parsed automatically.',
  },
  {
    q: 'How do I organize and find my notes?',
    a: 'You can organize notes using Notebooks/Collections (with custom colors and icons), Favorites (star important notes), Pinned notes, and Archived notes. The Search page lets you search across titles and content. The Recent page shows your most recently updated notes, and the Analytics dashboard provides insights into your note-taking activity.',
  },

];

function FloatingIcon({ icon: Icon, className, delay = 0, duration = 4 }: { icon: LucideIcon; className: string; delay?: number; duration?: number }) {
  return (
    <motion.div
      animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
      className={className}
    >
      <div className="w-16 h-16 rounded-2xl bg-[#111111] border border-[#1A1A1A] flex items-center justify-center shadow-2xl backdrop-blur-xl">
        <Icon className="w-7 h-7 text-[#555555]" />
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const heroRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, user, signOut } = useAuth();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen bg-[#0B0B0B] overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="fixed inset-0 noise-bg pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-white/[0.03] to-transparent pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0B0B]/80 backdrop-blur-xl border-b border-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -5 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center"
              >
                <Brain className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-xl font-bold text-white tracking-tight">Noteqira</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {['Features', 'How It Works', 'FAQ'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-[#666666] hover:text-white transition-colors text-sm tracking-wide relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <span className="hidden sm:block text-sm text-[#666666]">
                    {user?.name}
                  </span>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex items-center px-5 py-2 text-sm text-white bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/10 rounded-xl transition-all duration-200 tracking-wide"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => { signOut(); toast.success('Signed out'); }}
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#555555] hover:text-[#ff4444] hover:bg-white/5 rounded-lg transition-all"
                    title="Sign out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="hidden sm:inline-flex items-center px-5 py-2 text-sm text-[#666666] hover:text-white transition-colors tracking-wide"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="inline-flex items-center px-5 py-2 text-sm text-white bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/10 rounded-xl transition-all duration-200 tracking-wide group"
                  >
                    Get Started
                    <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[#666666] hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden border-t border-[#1A1A1A] bg-[#0B0B0B]/95 backdrop-blur-xl"
            >
              <div className="px-4 py-4 space-y-1">
                {['Features', 'How It Works', 'FAQ'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl text-[#666666] hover:bg-[#1A1A1A] hover:text-white transition-all"
                  >
                    {item}
                  </a>
                ))}
                <div className="border-t border-[#1A1A1A] my-2" />
                {isAuthenticated ? (
                  <>
                    <span className="block px-4 py-2 text-sm text-[#555555]">{user?.name}</span>
                    <button
                      onClick={() => { setMobileMenuOpen(false); navigate('/dashboard'); }}
                      className="block w-full text-left px-4 py-3 rounded-xl text-[#666666] hover:bg-[#1A1A1A] hover:text-white transition-all"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => { signOut(); toast.success('Signed out'); setMobileMenuOpen(false); }}
                      className="block w-full text-left px-4 py-3 rounded-xl text-[#666666] hover:bg-[#1A1A1A] hover:text-white transition-all"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }}
                    className="block w-full text-left px-4 py-3 rounded-xl text-[#666666] hover:bg-[#1A1A1A] hover:text-white transition-all"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>
        {/* Hero Section */}
        <section ref={heroRef} className="relative pt-36 pb-28 px-4 overflow-hidden min-h-screen flex items-center">
          {/* Animated floating icons */}
          <FloatingIcon icon={Mic} className="absolute top-48 left-[8%] hidden lg:block" delay={0} duration={4} />
          <FloatingIcon icon={FileText} className="absolute top-56 right-[8%] hidden lg:block" delay={0.5} duration={5} />
          <FloatingIcon icon={Sparkles} className="absolute bottom-1/3 left-[12%] hidden lg:block" delay={1} duration={4.5} />
          <FloatingIcon icon={Brain} className="absolute bottom-2/5 right-[10%] hidden lg:block" delay={0.3} duration={3.5} />
          <FloatingIcon icon={Search} className="absolute top-1/3 left-[4%] hidden xl:block" delay={0.8} duration={4.2} />
          <FloatingIcon icon={MessageSquare} className="absolute top-2/5 right-[4%] hidden xl:block" delay={1.2} duration={3.8} />

          {/* Glowing orb */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-radial from-white/[0.04] to-transparent pointer-events-none"
          />

          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="max-w-5xl mx-auto text-center relative w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#888888] mb-8"
            >
              <Brain className="w-3 h-3 text-white/60" />
              Modern Knowledge Workspace
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight"
            >
              Capture Every Thought.
              <br />
              <span className="bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-transparent">
                Master Every Insight.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-lg sm:text-xl text-[#666666] mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Note-taking that organizes and connects your ideas.
              The workspace designed for how your mind works.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {isAuthenticated ? (
                <button
                  onClick={() => navigate('/dashboard')}
                  className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 text-lg text-white rounded-xl overflow-hidden transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/5 border border-white/20 rounded-xl group-hover:border-white/40 transition-colors" />
                  <span className="relative z-10 flex items-center gap-2">
                    Go to Dashboard
                    <ChevronRight className="w-5 h-5" />
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 text-lg text-white rounded-xl overflow-hidden transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/5 border border-white/20 rounded-xl group-hover:border-white/40 transition-colors" />
                  <span className="relative z-10 flex items-center gap-2">
                    Start Free
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </motion.span>
                  </span>
                </button>
              )}
              <a
                href="#features"
                className="px-8 py-3.5 rounded-xl border border-[#1A1A1A] text-[#666666] hover:bg-[#111111] hover:text-white transition-all duration-200"
              >
                Learn More
              </a>
            </motion.div>

            {/* Floating preview cards */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-16 grid grid-cols-3 gap-3 max-w-lg mx-auto"
            >
              {[
                { label: 'Voice Notes', icon: Mic, desc: 'Record & transcribe' },
                { label: 'Image OCR', icon: Sparkles, desc: 'Extract text' },
                { label: 'Search', icon: Search, desc: 'Full-text search' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.2)' }}
                  className="p-3 rounded-xl bg-[#111111]/50 border border-[#1A1A1A] text-center group cursor-default transition-colors"
                >
                  <item.icon className="w-5 h-5 text-[#555555] mx-auto mb-1.5 group-hover:text-white transition-colors" />
                  <p className="text-xs text-white font-medium">{item.label}</p>
                  <p className="text-[10px] text-[#555555]">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Features */}
        <section id="features" className="py-24 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight"
              >
                Everything You Need
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-[#666666] text-lg max-w-2xl mx-auto"
              >
                Powerful features designed to organize your knowledge and boost productivity.
              </motion.p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="group relative p-6 rounded-2xl bg-[#111111] border border-[#1A1A1A] hover:border-[#333333] transition-all duration-300"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-[#1A1A1A] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 tracking-tight">{feature.title}</h3>
                    <p className="text-[#666666] text-sm leading-relaxed group-hover:text-[#888888] transition-colors">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works with Timeline */}
        <section id="how-it-works" className="py-24 px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight"
              >
                How It Works
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-[#666666] text-lg max-w-2xl mx-auto"
              >
                Three simple steps to capture and organize your knowledge.
              </motion.p>
            </div>

            <div className="relative">
              {/* Connecting line */}
              <div className="absolute top-24 left-1/2 -translate-x-1/2 w-px h-[60%] bg-gradient-to-b from-white/20 via-white/10 to-transparent hidden md:block" />

              <div className="space-y-12 md:space-y-0">
                {steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    className={`relative flex flex-col md:flex-row items-center gap-8 ${
                      i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                    } ${i > 0 ? 'md:mt-24' : ''}`}
                  >
                    <div className="flex-1">
                      <div className={`p-8 rounded-2xl bg-[#111111] border border-[#1A1A1A] group hover:border-[#333333] transition-all duration-300 ${
                        i % 2 === 0 ? 'md:text-right' : ''
                      }`}>
                        <span className="text-6xl font-bold text-[#1A1A1A] select-none tracking-tighter block mb-2">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <h3 className="text-xl font-semibold text-white mb-3 tracking-tight">{step.title}</h3>
                        <p className="text-[#666666] text-sm leading-relaxed">{step.description}</p>
                      </div>
                    </div>

                    <div className="relative z-10">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1A1A1A] to-[#111111] border border-[#333333] flex items-center justify-center shadow-2xl"
                      >
                        <step.icon className="w-8 h-8 text-white" />
                      </motion.div>
                    </div>

                    <div className="flex-1 hidden md:block" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent pointer-events-none" />
          <div className="max-w-3xl mx-auto relative">
            <div className="text-center mb-12">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight"
              >
                Frequently Asked Questions
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-[#666666] text-lg"
              >
                Everything you need to know about Noteqira.
              </motion.p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl bg-[#111111] border border-[#1A1A1A] overflow-hidden hover:border-[#333333] transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left group"
                  >
                    <span className="text-white font-medium pr-4 tracking-tight group-hover:text-white/80 transition-colors">{faq.q}</span>
                    <motion.div
                      animate={{ rotate: openFaq === i ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="w-5 h-5 text-[#555555] flex-shrink-0" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-5">
                          <p className="text-[#666666] text-sm leading-relaxed">{faq.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Get Started Section */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-12 lg:p-16 rounded-3xl bg-[#111111] border border-[#1A1A1A] relative overflow-hidden"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="w-16 h-16 rounded-2xl bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center mx-auto mb-6"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight"
              >
                Ready to Get Started?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="text-[#666666] text-lg mb-8 max-w-xl mx-auto"
              >
                Join the workspace designed for how you work.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                {isAuthenticated ? (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 text-lg text-white bg-[#1A1A1A] hover:bg-[#222222] rounded-xl transition-all duration-200 group tracking-wide border border-[#333333]"
                  >
                    Go to Dashboard
                    <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 text-lg text-white bg-[#1A1A1A] hover:bg-[#222222] rounded-xl transition-all duration-200 group tracking-wide border border-[#333333]"
                  >
                    Get Started Free
                    <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </motion.div>
            </motion.div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-[#1A1A1A] py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: -5 }}
                className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center"
              >
                <Brain className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-lg font-bold text-white tracking-tight">Noteqira</span>
            </Link>
            <div className="flex items-center gap-6 text-sm text-[#555555]">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            </div>
            <div className="text-sm text-[#444444]">
              &copy; 2026 Noteqira. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
