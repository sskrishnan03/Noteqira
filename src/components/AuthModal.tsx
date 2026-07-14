import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, User, Eye, EyeOff, X, ArrowLeft, Loader2, Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth, getPasswordStrength, strengthColors } from '@/lib/auth';
import { useGoogleLogin } from '@react-oauth/google';

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" className="w-5 h-5">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.54 28.59A14.5 14.5 0 0 1 9.5 24c0-1.59.28-3.14.76-4.59l-7.98-6.19A23.99 23.99 0 0 0 0 24c0 3.77.87 7.35 2.56 10.56l7.98-5.97z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 5.97C6.51 42.62 14.62 48 24 48z" />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

type AuthView = 'signin' | 'signup' | 'forgot';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp, forgotPassword, googleSignIn } = useAuth();
  const [view, setView] = useState<AuthView>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [signUpData, setSignUpData] = useState({ name: '', email: '', password: '' });
  const [forgotData, setForgotData] = useState({ email: '' });
  const [forgotSentEmail, setForgotSentEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [pendingCredentials, setPendingCredentials] = useState<{ email: string; password: string } | null>(null);
  const signUpPasswordStrength = signUpData.password ? getPasswordStrength(signUpData.password) : null;

  const resetForms = () => {
    setSignInData({ email: '', password: '' });
    setSignUpData({ name: '', email: '', password: '' });
    setForgotData({ email: '' });
    setForgotSentEmail('');
    setForgotSent(false);
    setShowPassword(false);
  };

  useEffect(() => {
    if (isOpen) {
      if (pendingCredentials) {
        setSignInData({ email: pendingCredentials.email, password: pendingCredentials.password });
        setPendingCredentials(null);
      } else {
        resetForms();
      }
      setView('signin');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInData.email || !signInData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      await signIn(signInData.email, signInData.password);
      toast.success('Welcome back!');
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign in failed');
    }
    setIsSubmitting(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpData.name || !signUpData.email || !signUpData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsSubmitting(true);
    try {
      await signUp(signUpData.name, signUpData.email, signUpData.password);
      setPendingCredentials({ email: signUpData.email, password: signUpData.password });
      toast.success('Account created successfully!');
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign up failed');
    }
    setIsSubmitting(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotData.email) {
      toast.error('Please enter your email');
      return;
    }
    setIsSubmitting(true);
    try {
      await forgotPassword(forgotData.email);
      setForgotSentEmail(forgotData.email);
      setForgotSent(true);
      toast.success('Reset link sent to your email!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Request failed');
    }
    setIsSubmitting(false);
  };

  const handleGoogleSuccess = async (tokenResponse: { access_token: string }) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch Google profile');
      const profile = await res.json();
      await googleSignIn({
        email: profile.email,
        name: profile.name,
        avatar_url: profile.picture || null,
        sub: profile.sub,
      });
      toast.success('Signed in with Google!');
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Google sign-in failed');
    }
    setIsSubmitting(false);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Google sign-in failed'),
    flow: 'implicit',
  });

  const handleGoogleSignIn = () => {
    googleLogin();
  };

  const switchView = (newView: AuthView) => {
    setView(newView);
    setShowPassword(false);
    if (newView !== 'forgot') setForgotSent(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <div className="relative bg-[#161616] border border-[#2A2A2A] rounded-2xl overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

                {/* Header */}
                <div className="relative z-10 px-6 pt-6 pb-4 border-b border-[#2A2A2A]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-lg font-bold text-white tracking-tight">Noteqira</span>
                    </div>
                    <button
                      onClick={handleClose}
                      className="p-2 rounded-lg text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={view}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm text-[#8A8A8A]"
                    >
                      {view === 'signin' && 'Sign in to your account'}
                      {view === 'signup' && 'Create your free account'}
                      {view === 'forgot' && 'Reset your password'}
                    </motion.p>
                  </AnimatePresence>
                </div>

                {/* Body */}
                <div className="relative z-10 px-6 py-6">
                  <AnimatePresence mode="wait">
                    {view === 'signin' && (
                      <motion.form
                        key="signin"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.15 }}
                        onSubmit={handleSignIn}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-sm text-[#8A8A8A] mb-2">Email</label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555] pointer-events-none" />
                            <input
                              type="email"
                              value={signInData.email}
                              onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                              placeholder="you@example.com"
                              className="w-full pl-10 pr-4 py-3 bg-[#0B0B0B]/50 border border-[#2A2A2A] rounded-xl text-white placeholder:text-[#555555] focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-[#8A8A8A] mb-2">Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555] pointer-events-none" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={signInData.password}
                              onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                              placeholder="Enter your password"
                              className="w-full pl-10 pr-12 py-3 bg-[#0B0B0B]/50 border border-[#2A2A2A] rounded-xl text-white placeholder:text-[#555555] focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#8A8A8A] transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => switchView('forgot')}
                            className="text-xs text-[#555555] hover:text-[#8A8A8A] transition-colors"
                          >
                            Forgot password?
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1A1A1A] border border-[#333333] text-white font-medium rounded-xl hover:bg-[#222222] focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          Sign In
                        </button>

                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#2A2A2A]" />
                          </div>
                          <div className="relative flex justify-center text-xs">
                            <span className="bg-[#161616] px-3 text-[#555555]">or continue with</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleGoogleSignIn}
                          disabled={isSubmitting}
                          className="w-full inline-flex items-center justify-center gap-3 px-6 py-3 bg-white/5 border border-[#2A2A2A] text-white font-medium rounded-xl hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200 disabled:opacity-50"
                        >
                          <GoogleLogo />
                          Continue with Google
                        </button>

                        <p className="text-center text-xs text-[#555555]">
                          Don't have an account?{' '}
                          <button
                            type="button"
                            onClick={() => switchView('signup')}
                            className="text-white hover:text-[#C8C8C8] transition-colors"
                          >
                            Sign up
                          </button>
                        </p>
                      </motion.form>
                    )}

                    {view === 'signup' && (
                      <motion.form
                        key="signup"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.15 }}
                        onSubmit={handleSignUp}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-sm text-[#8A8A8A] mb-2">Full Name</label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555] pointer-events-none" />
                            <input
                              type="text"
                              value={signUpData.name}
                              onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                              placeholder="John Doe"
                              className="w-full pl-10 pr-4 py-3 bg-[#0B0B0B]/50 border border-[#2A2A2A] rounded-xl text-white placeholder:text-[#555555] focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-[#8A8A8A] mb-2">Email</label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555] pointer-events-none" />
                            <input
                              type="email"
                              value={signUpData.email}
                              onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                              placeholder="you@example.com"
                              className="w-full pl-10 pr-4 py-3 bg-[#0B0B0B]/50 border border-[#2A2A2A] rounded-xl text-white placeholder:text-[#555555] focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-[#8A8A8A] mb-2">Password</label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555] pointer-events-none" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={signUpData.password}
                              onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                              placeholder="At least 6 characters"
                              className="w-full pl-10 pr-12 py-3 bg-[#0B0B0B]/50 border border-[#2A2A2A] rounded-xl text-white placeholder:text-[#555555] focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555555] hover:text-[#8A8A8A] transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {signUpPasswordStrength && (
                          <div className="space-y-1.5">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div
                                  key={i}
                                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                                    i <= signUpPasswordStrength.score
                                      ? strengthColors[signUpPasswordStrength.level]
                                      : 'bg-[#2A2A2A]'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className={`text-xs ${
                              signUpPasswordStrength.level === 'weak' ? 'text-red-400' :
                              signUpPasswordStrength.level === 'medium' ? 'text-orange-400' :
                              signUpPasswordStrength.level === 'strong' ? 'text-yellow-400' :
                              'text-green-400'
                            }`}>
                              {signUpPasswordStrength.label}
                            </p>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1A1A1A] border border-[#333333] text-white font-medium rounded-xl hover:bg-[#222222] focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          Create Account
                        </button>

                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#2A2A2A]" />
                          </div>
                          <div className="relative flex justify-center text-xs">
                            <span className="bg-[#161616] px-3 text-[#555555]">or continue with</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleGoogleSignIn}
                          disabled={isSubmitting}
                          className="w-full inline-flex items-center justify-center gap-3 px-6 py-3 bg-white/5 border border-[#2A2A2A] text-white font-medium rounded-xl hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200 disabled:opacity-50"
                        >
                          <GoogleLogo />
                          Continue with Google
                        </button>

                        <p className="text-center text-xs text-[#555555]">
                          Already have an account?{' '}
                          <button
                            type="button"
                            onClick={() => switchView('signin')}
                            className="text-white hover:text-[#C8C8C8] transition-colors"
                          >
                            Sign in
                          </button>
                        </p>
                      </motion.form>
                    )}

                    {view === 'forgot' && !forgotSent && (
                      <motion.form
                        key="forgot"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.15 }}
                        onSubmit={handleForgotPassword}
                        className="space-y-4"
                      >
                        <p className="text-sm text-[#666666] leading-relaxed">
                          Enter the email address associated with your account, and we'll send you a link to reset your password.
                        </p>

                        <div>
                          <label className="block text-sm text-[#8A8A8A] mb-2">Email</label>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555] pointer-events-none" />
                            <input
                              type="email"
                              value={forgotData.email}
                              onChange={(e) => setForgotData({ email: e.target.value })}
                              placeholder="you@example.com"
                              className="w-full pl-10 pr-4 py-3 bg-[#0B0B0B]/50 border border-[#2A2A2A] rounded-xl text-white placeholder:text-[#555555] focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1A1A1A] border border-[#333333] text-white font-medium rounded-xl hover:bg-[#222222] focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          Send Reset Link
                        </button>

                        <button
                          type="button"
                          onClick={() => switchView('signin')}
                          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-[#2A2A2A] text-white font-medium rounded-xl hover:bg-white/10 transition-all duration-200"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back to Sign In
                        </button>
                      </motion.form>
                    )}

                    {view === 'forgot' && forgotSent && (
                      <motion.div
                        key="forgot-sent"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-4"
                      >
                        <div className="flex flex-col items-center text-center py-4 space-y-3">
                          <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                            <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-white font-medium">Check your email</p>
                            <p className="text-sm text-[#666666] mt-1">
                              We sent a password reset link to <span className="text-white">{forgotSentEmail}</span>
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-[#555555] text-center">
                          Click the link in the email to reset your password. The link expires in 1 hour.
                        </p>

                        <button
                          type="button"
                          onClick={async () => {
                            setForgotSent(false);
                            setForgotData({ email: forgotSentEmail });
                          }}
                          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-[#2A2A2A] text-white font-medium rounded-xl hover:bg-white/10 transition-all duration-200"
                        >
                          Resend Email
                        </button>

                        <button
                          type="button"
                          onClick={() => switchView('signin')}
                          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-[#2A2A2A] text-white font-medium rounded-xl hover:bg-white/10 transition-all duration-200"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back to Sign In
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
