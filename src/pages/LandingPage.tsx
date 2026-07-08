import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Zap,
  BookOpen,
  Mic,
  Image,
  FileText,
  Video,
  Link2,
  Layers,
  Star,
  Check,
  ArrowRight,
  Play,
  Users,
  NotebooK,
  Clock,
  TrendingUp,
  Shield,
  Globe,
} from 'lucide-react';

const features = [
  {
    icon: Mic,
    title: 'Voice Intelligence',
    description: 'Convert speech into structured notes with automatic headings, summaries, and action items.',
    color: 'from-rose-500 to-orange-500',
  },
  {
    icon: Image,
    title: 'Image & Handwriting OCR',
    description: 'Upload photos of notes, whiteboards, or handwriting. AI cleans, organizes, and digitizes everything.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: FileText,
    title: 'Document Intelligence',
    description: 'Extract insights from PDFs, Word docs, PowerPoint, Excel, and more. Get summaries, key points, and quizzes.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Video,
    title: 'Video & YouTube Analysis',
    description: 'Paste a video URL and get transcripts, chapter notes, key moments, and study materials.',
    color: 'from-red-500 to-pink-500',
  },
  {
    icon: Link2,
    title: 'Web Content Extraction',
    description: 'Save any webpage. AI strips ads, extracts content, and creates organized notes automatically.',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: Layers,
    title: 'Diagram Recognition',
    description: 'Upload hand-drawn diagrams and AI converts them to editable digital flowcharts and mind maps.',
    color: 'from-amber-500 to-yellow-500',
  },
];

const aiCapabilities = [
  { label: 'Auto-summarize', icon: Sparkles },
  { label: 'Generate flashcards', icon: BookOpen },
  { label: 'Create quizzes', icon: Check },
  { label: 'Extract action items', icon: Zap },
  { label: 'Smart categorization', icon: Brain },
  { label: 'Knowledge graphs', icon: Globe },
];

const stats = [
  { value: '50K+', label: 'Active Users' },
  { value: '10M+', label: 'Notes Created' },
  { value: '99.9%', label: 'Uptime' },
  { value: '4.9', label: 'App Rating' },
];

const testimonials = [
  {
    quote: "CogniNote transformed how I study. I upload lecture slides and get flashcards in seconds. It's like having a personal tutor.",
    author: 'Sarah Chen',
    role: 'Medical Student, Stanford',
    avatar: 'https://images.pexels.com/photos/7749094/pexels-photo-7749094.jpeg?w=100&h=100&fit=crop',
  },
  {
    quote: 'The diagram recognition is mind-blowing. I take photos of whiteboard sessions and CogniNote turns them into clean, editable diagrams.',
    author: 'Marcus Williams',
    role: 'Product Manager, Google',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=100&h=100&fit=crop',
  },
  {
    quote: "Finally, a note app that actually understands what I'm writing. The AI features save me hours every week.",
    author: 'Elena Rodriguez',
    role: 'Research Scientist, MIT',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?w=100&h=100&fit=crop',
  },
];

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Perfect for getting started',
    features: [
      '50 AI-enhanced notes/month',
      'Voice recording (10 mins)',
      'Image OCR (20 uploads)',
      'Basic flashcards & quizzes',
      '1 GB storage',
    ],
    cta: 'Start Free',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/month',
    description: 'For serious learners and professionals',
    features: [
      'Unlimited AI-enhanced notes',
      'Unlimited voice recording',
      'Unlimited image OCR',
      'Advanced diagrams & mind maps',
      'Video & YouTube analysis',
      '10 GB storage',
      'Priority AI processing',
    ],
    cta: 'Start Pro Trial',
    highlighted: true,
  },
  {
    name: 'Team',
    price: '$29',
    period: '/user/mo',
    description: 'For teams and organizations',
    features: [
      'Everything in Pro',
      'Real-time collaboration',
      'Team workspaces',
      'Admin dashboard',
      'SSO & advanced security',
      'Unlimited storage',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

const faqs = [
  {
    question: 'What types of content can CogniNote process?',
    answer: 'CogniNote handles virtually any content type: voice recordings, images of notes or whiteboards, PDFs, Word documents, PowerPoint, Excel, videos, YouTube URLs, and web articles. Our AI extracts, organizes, and enriches everything.',
  },
  {
    question: 'How accurate is the handwriting recognition?',
    answer: 'Our OCR achieves 98%+ accuracy on clear handwriting. For messy notes, AI automatically corrects spelling and organizes the content into readable, structured notes.',
  },
  {
    question: 'Can I export my notes?',
    answer: 'Absolutely. Export to PDF, Word, Markdown, HTML, JSON, PNG, and SVG. Your data is always yours.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. We use enterprise-grade encryption, SOC 2 Type II compliant infrastructure, and never train on your private data. Your knowledge stays yours.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-950 overflow-hidden">
      {/* Grid Background */}
      <div className="fixed inset-0 grid-bg opacity-50" />

      {/* Radial gradient glow */}
      <div className="fixed inset-0 radial-gradient pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">CogniNote</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-secondary-300 hover:text-white transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-secondary-300 hover:text-white transition-colors">
              Pricing
            </a>
            <a href="#testimonials" className="text-secondary-300 hover:text-white transition-colors">
              Reviews
            </a>
            <a href="#faq" className="text-secondary-300 hover:text-white transition-colors">
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="btn-ghost hidden sm:flex">
              Sign In
            </Link>
            <Link to="/dashboard" className="btn-primary">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4" />
                Powered by Advanced AI
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                The Intelligent Workspace That{' '}
                <span className="gradient-text">Understands Everything</span>
              </h1>

              <p className="text-xl text-secondary-400 mb-10 max-w-2xl mx-auto">
                Transform voice, handwriting, documents, videos, and web content into
                beautifully organized, searchable knowledge with AI-powered notes.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <Link to="/dashboard" className="btn-primary text-lg px-8 py-4">
                  Start Creating Notes
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button className="btn-secondary text-lg px-8 py-4">
                  <Play className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto"
            >
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-secondary-500 text-sm">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Hero Image/Preview */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-transparent to-transparent z-10" />
            <div className="glass-card overflow-hidden glow-effect mx-auto max-w-5xl">
              <div className="bg-surface-900 border-b border-white/5 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 text-center text-secondary-500 text-sm">
                  CogniNote Workspace
                </div>
              </div>
              <div className="h-[500px] bg-gradient-to-br from-surface-900 to-surface-950 p-8 relative">
                {/* Simulated workspace */}
                <div className="grid grid-cols-4 gap-4 h-full">
                  {/* Sidebar */}
                  <div className="bg-surface-950/50 rounded-xl p-4 border border-white/5">
                    <div className="space-y-3">
                      {['All Notes', 'Favorites', 'Recent', 'Flashcards', 'Quizzes'].map(
                        (item, i) => (
                          <div
                            key={i}
                            className={`px-3 py-2 rounded-lg text-sm ${
                              i === 0
                                ? 'bg-primary-500/20 text-primary-400'
                                : 'text-secondary-400 hover:bg-white/5'
                            }`}
                          >
                            {item}
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Main content */}
                  <div className="col-span-3 space-y-4">
                    {/* Search bar */}
                    <div className="bg-surface-950/50 rounded-xl px-4 py-3 border border-white/5 flex items-center gap-3">
                      <Brain className="w-5 h-5 text-primary-400" />
                      <span className="text-secondary-500">Ask AI anything about your notes...</span>
                    </div>

                    {/* Note cards */}
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        {
                          title: 'Machine Learning Fundamentals',
                          summary: 'Key concepts from lecture...',
                          color: 'from-blue-500/20 to-cyan-500/20',
                        },
                        {
                          title: 'Product Meeting Notes',
                          summary: 'Q4 roadmap decisions...',
                          color: 'from-emerald-500/20 to-teal-500/20',
                        },
                        {
                          title: 'Research Paper Summary',
                          summary: 'Breakthrough in quantum...',
                          color: 'from-purple-500/20 to-pink-500/20',
                        },
                        {
                          title: 'Chemistry Lab Notes',
                          summary: 'Organic reactions overview...',
                          color: 'from-amber-500/20 to-orange-500/20',
                        },
                      ].map((note, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 + i * 0.1 }}
                          className={`bg-gradient-to-br ${note.color} rounded-xl p-4 border border-white/10 hover-lift cursor-pointer`}
                        >
                          <h3 className="font-medium text-white mb-2">{note.title}</h3>
                          <p className="text-secondary-400 text-sm">{note.summary}</p>
                          <div className="mt-3 flex gap-2">
                            <span className="px-2 py-1 bg-white/10 rounded text-xs text-secondary-300">
                              AI Summary
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              One Workspace,{' '}
              <span className="gradient-text">Infinite Possibilities</span>
            </h2>
            <p className="text-xl text-secondary-400 max-w-2xl mx-auto">
              From voice to video, handwriting to PDFs. CogniNote transforms any content
              into organized, searchable knowledge.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group glass-card p-6 hover-lift"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-secondary-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Capabilities */}
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                AI That Actually{' '}
                <span className="gradient-text">Understands</span>
              </h2>
              <p className="text-xl text-secondary-400 mb-8">
                Every note is automatically analyzed, summarized, and enriched. Get
                flashcards, quizzes, and insights without any extra work.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {aiCapabilities.map((cap, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-900/50 border border-white/5"
                  >
                    <cap.icon className="w-5 h-5 text-primary-400" />
                    <span className="text-white font-medium">{cap.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass-card p-8 glow-effect">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-secondary-300 mb-2">
                        I've analyzed your lecture notes. Here's what I found:
                      </p>
                      <div className="space-y-2 text-sm text-secondary-400">
                        <p>Key Topics: Neural Networks, Backpropagation, Gradients</p>
                        <p>Important Formulas: 3 detected and converted to LaTeX</p>
                        <p>Generated: 15 Flashcards, 1 Quiz, Summary</p>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-white/10" />

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-xl bg-accent-500/10 border border-accent-500/20">
                      <BookOpen className="w-6 h-6 text-accent-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">15</div>
                      <div className="text-secondary-400 text-sm">Flashcards</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                      <Check className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">10</div>
                      <div className="text-secondary-400 text-sm">Quiz Q's</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <Zap className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-white">5</div>
                      <div className="text-secondary-400 text-sm">Actions</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Loved by <span className="gradient-text">Learners Everywhere</span>
            </h2>
            <p className="text-xl text-secondary-400">
              Join thousands of students, researchers, and professionals who trust CogniNote.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-secondary-300 mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-medium text-white">{testimonial.author}</div>
                    <div className="text-secondary-500 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Simple, <span className="gradient-text">Transparent</span> Pricing
            </h2>
            <p className="text-xl text-secondary-400">
              Start free. Upgrade when you need more power.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`glass-card p-8 ${
                  plan.highlighted ? 'ring-2 ring-primary-500 scale-105' : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-500 rounded-full text-sm font-medium text-white">
                    Most Popular
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-secondary-400">{plan.period}</span>
                  </div>
                  <p className="text-secondary-500 mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3 text-secondary-300">
                      <Check className="w-5 h-5 text-accent-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/dashboard"
                  className={`w-full ${
                    plan.highlighted ? 'btn-primary' : 'btn-secondary'
                  } justify-center`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 relative">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                <p className="text-secondary-400">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 relative">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 text-center glow-effect"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to Transform Your Notes?
            </h2>
            <p className="text-xl text-secondary-400 mb-8">
              Join 50,000+ learners who've already upgraded their note-taking.
            </p>
            <Link to="/dashboard" className="btn-primary text-lg px-10 py-4">
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">CogniNote</span>
              </div>
              <p className="text-secondary-500">
                The intelligent workspace that understands everything.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-secondary-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-secondary-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-secondary-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="h-px bg-white/5 mb-8" />

          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-secondary-500 text-sm">
              © 2024 CogniNote AI. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-secondary-400 hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="text-secondary-400 hover:text-white transition-colors">
                <Users className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
