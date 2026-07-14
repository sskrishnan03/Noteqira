import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Loader2, Sparkles, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth, getPasswordStrength, strengthColors } from '@/lib/auth';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { validateResetToken, resetPassword } = useAuth();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [validating, setValidating] = useState(true);
  const [tokenError, setTokenError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const passwordStrength = newPassword ? getPasswordStrength(newPassword) : null;

  useEffect(() => {
    if (!token || !email) {
      setTokenError('Invalid reset link');
      setValidating(false);
      return;
    }
    validateResetToken(token, email)
      .then(() => {
        setValidating(false);
      })
      .catch((err) => {
        setTokenError(err instanceof Error ? err.message : 'Invalid or expired reset link');
        setValidating(false);
      });
  }, [token, email, validateResetToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(token, email, newPassword);
      toast.success('Password reset successfully!');
      setSuccess(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Reset failed');
    }
    setIsSubmitting(false);
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 text-white animate-spin" />
          <span className="text-[#8A8A8A] text-sm">Validating your reset link...</span>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="relative bg-[#161616] border border-[#2A2A2A] rounded-2xl p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <span className="text-red-400 text-2xl">!</span>
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Invalid or Expired Link</h2>
            <p className="text-sm text-[#666666] mb-6">{tokenError}</p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1A1A1A] border border-[#333333] text-white font-medium rounded-xl hover:bg-[#222222] transition-all duration-200"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-[#161616] border border-[#2A2A2A] rounded-2xl p-8 text-center"
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">Password Reset Successfully</h2>
            <p className="text-sm text-[#666666] mb-6">Your password has been updated. You can now sign in with your new password.</p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1A1A1A] border border-[#333333] text-white font-medium rounded-xl hover:bg-[#222222] transition-all duration-200"
            >
              Go to Sign In
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="relative bg-[#161616] border border-[#2A2A2A] rounded-2xl overflow-hidden">
          <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

          <div className="relative z-10 px-6 pt-6 pb-4 border-b border-[#2A2A2A]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Noteqira</span>
            </div>
            <p className="text-sm text-[#8A8A8A]">Set your new password for <span className="text-white">{email}</span></p>
          </div>

          <div className="relative z-10 px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[#8A8A8A] mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555] pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                {passwordStrength && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                            i <= passwordStrength.score
                              ? strengthColors[passwordStrength.level]
                              : 'bg-[#2A2A2A]'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs ${
                      passwordStrength.level === 'weak' ? 'text-red-400' :
                      passwordStrength.level === 'medium' ? 'text-orange-400' :
                      passwordStrength.level === 'strong' ? 'text-yellow-400' :
                      'text-green-400'
                    }`}>
                      {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-[#8A8A8A] mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555555] pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
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
                Reset Password
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
