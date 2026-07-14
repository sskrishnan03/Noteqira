import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from '@/lib/auth';

import LandingPage from '@/pages/LandingPage';
import Dashboard from '@/pages/Dashboard';
import Favorites from '@/pages/Favorites';
import Recent from '@/pages/Recent';
import Archived from '@/pages/Archived';
import Trash from '@/pages/Trash';
import NoteEditor from '@/pages/NoteEditor';
import NoteView from '@/pages/NoteView';
import NotesByType from '@/pages/NotesByType';
import Search from '@/pages/Search';
import Settings from '@/pages/Settings';
import Collections from '@/pages/Collections';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import VoiceNotePage from '@/pages/VoiceNotePage';
import ImageNotePage from '@/pages/ImageNotePage';
import DocumentNotePage from '@/pages/DocumentNotePage';
import Calendar from '@/pages/Calendar';
import Analytics from '@/pages/Analytics';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0B0B] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function GlobalShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        navigate('/search');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        navigate('/notes/new');
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [navigate]);

  return null;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
      <Route path="/recent" element={<ProtectedRoute><Recent /></ProtectedRoute>} />
      <Route path="/archived" element={<ProtectedRoute><Archived /></ProtectedRoute>} />
      <Route path="/trash" element={<ProtectedRoute><Trash /></ProtectedRoute>} />
      <Route path="/notes/new" element={<ProtectedRoute><NoteEditor /></ProtectedRoute>} />
      <Route path="/notes/new/voice" element={<ProtectedRoute><VoiceNotePage /></ProtectedRoute>} />
      <Route path="/notes/new/image" element={<ProtectedRoute><ImageNotePage /></ProtectedRoute>} />
      <Route path="/notes/new/document" element={<ProtectedRoute><DocumentNotePage /></ProtectedRoute>} />
      <Route path="/storage" element={<ProtectedRoute><NotesByType /></ProtectedRoute>} />
      <Route path="/storage/:sourceType" element={<ProtectedRoute><NotesByType /></ProtectedRoute>} />
      <Route path="/notes/type/manual" element={<ProtectedRoute><NotesByType /></ProtectedRoute>} />
      <Route path="/notes/type/voice" element={<ProtectedRoute><NotesByType /></ProtectedRoute>} />
      <Route path="/notes/type/image" element={<ProtectedRoute><NotesByType /></ProtectedRoute>} />
      <Route path="/notes/type/document" element={<ProtectedRoute><NotesByType /></ProtectedRoute>} />
      <Route path="/notes/:id" element={<ProtectedRoute><NoteView /></ProtectedRoute>} />
      <Route path="/notes/:id/edit" element={<ProtectedRoute><NoteEditor /></ProtectedRoute>} />
      <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/collections" element={<ProtectedRoute><Collections /></ProtectedRoute>} />

    </Routes>
  );
}

function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <GlobalShortcuts />
        <AppRoutes />
        <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1B1B1B',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#ffffff',
              secondary: '#0B0B0B',
            },
          },
          error: {
            iconTheme: {
              primary: '#ffffff',
              secondary: '#0B0B0B',
            },
          },
        }}
      />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
