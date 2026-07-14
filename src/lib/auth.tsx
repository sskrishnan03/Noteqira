import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

export type PasswordStrength = 'weak' | 'medium' | 'strong' | 'very-strong';

export function getPasswordStrength(password: string): { level: PasswordStrength; score: number; label: string } {
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  if (score <= 2) return { level: 'weak', score, label: 'Weak' };
  if (score <= 3) return { level: 'medium', score, label: 'Medium' };
  if (score <= 4) return { level: 'strong', score, label: 'Strong' };
  return { level: 'very-strong', score, label: 'Very Strong' };
}

export const strengthColors: Record<PasswordStrength, string> = {
  'weak': 'bg-red-500',
  'medium': 'bg-orange-500',
  'strong': 'bg-yellow-500',
  'very-strong': 'bg-green-500',
};

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
  forgotPassword: (email: string) => Promise<void>;
  googleSignIn: (googleUser: { email: string; name: string; avatar_url: string | null; sub: string }) => Promise<void>;
  resetPassword: (token: string, email: string, newPassword: string) => Promise<void>;
  validateResetToken: (token: string, email: string) => Promise<boolean>;
  updateProfile: (data: { name?: string; avatar_url?: string | null }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface StoredUser {
  name: string;
  email: string;
  password: string;
  avatar_url: string | null;
  created_at: string;
  is_google_account?: boolean;
}

function getUsers(): Record<string, StoredUser> {
  try {
    return JSON.parse(localStorage.getItem('noteqira_users') || '{}');
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, StoredUser>) {
  localStorage.setItem('noteqira_users', JSON.stringify(users));
}

function getSession(): string | null {
  return localStorage.getItem('noteqira_session');
}

function saveSession(email: string) {
  localStorage.setItem('noteqira_session', email);
}

function clearSession() {
  localStorage.removeItem('noteqira_session');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const sessionEmail = getSession();
    if (sessionEmail) {
      const users = getUsers();
      const record = users[sessionEmail];
      if (record) {
        setUser({
          id: sessionEmail,
          name: record.name,
          email: sessionEmail,
          avatar_url: record.avatar_url,
          created_at: record.created_at,
        });
      } else {
        clearSession();
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await new Promise(r => setTimeout(r, 600));
    const users = getUsers();
    const record = users[email];
    if (!record) {
      throw new Error('Invalid email or password');
    }
    if (record.is_google_account) {
      throw new Error('This account uses Google. Please use Continue with Google.');
    }
    if (record.password !== password) {
      throw new Error('Invalid email or password');
    }
    saveSession(email);
    setUser({
      id: email,
      name: record.name,
      email,
      avatar_url: record.avatar_url,
      created_at: record.created_at,
    });
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    await new Promise(r => setTimeout(r, 600));
    const users = getUsers();
    if (users[email]) {
      throw new Error('An account with this email already exists');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    const now = new Date().toISOString();
    users[email] = { name, email, password, avatar_url: null, created_at: now };
    saveUsers(users);
    saveSession(email);
    setUser({ id: email, name, email, avatar_url: null, created_at: now });
  }, []);

  const signOut = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    const users = getUsers();
    if (!users[email]) {
      throw new Error('No account found with this email');
    }
    const res = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to send reset email');
    }
  }, []);

  const validateResetToken = useCallback(async (token: string, email: string) => {
    const res = await fetch('/api/validate-reset-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, email }),
    });
    if (!res.ok) throw new Error('Invalid or expired reset link');
    return true;
  }, []);

  const resetPassword = useCallback(async (token: string, email: string, newPassword: string) => {
    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    const res = await fetch('/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, email, newPassword }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Reset failed');
    }
    const users = getUsers();
    if (users[email]) {
      users[email].password = newPassword;
      users[email].is_google_account = false;
      saveUsers(users);
    }
  }, []);

  const googleSignIn = useCallback(async (googleUser: { email: string; name: string; avatar_url: string | null; sub: string }) => {
    const users = getUsers();
    const existing = users[googleUser.email];
    if (!existing) {
      const now = new Date().toISOString();
      users[googleUser.email] = {
        name: googleUser.name,
        email: googleUser.email,
        password: '',
        avatar_url: googleUser.avatar_url,
        created_at: now,
        is_google_account: true,
      };
      saveUsers(users);
    }
    saveSession(googleUser.email);
    setUser({
      id: googleUser.email,
      name: existing ? existing.name : googleUser.name,
      email: googleUser.email,
      avatar_url: googleUser.avatar_url,
      created_at: existing ? existing.created_at : new Date().toISOString(),
    });
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; avatar_url?: string | null }) => {
    if (!user) return;
    const users = getUsers();
    const record = users[user.email];
    if (record) {
      if (data.name !== undefined) record.name = data.name;
      if (data.avatar_url !== undefined) record.avatar_url = data.avatar_url;
      saveUsers(users);
      setUser({
        ...user,
        name: data.name ?? user.name,
        avatar_url: data.avatar_url !== undefined ? data.avatar_url : user.avatar_url,
      });
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
        forgotPassword,
        googleSignIn,
        resetPassword,
        validateResetToken,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
