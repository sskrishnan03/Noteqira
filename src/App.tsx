import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from '@/pages/LandingPage';
import Dashboard from '@/pages/Dashboard';
import NoteEditor from '@/pages/NoteEditor';
import NoteView from '@/pages/NoteView';
import Flashcards from '@/pages/Flashcards';
import Quizzes from '@/pages/Quizzes';
import Search from '@/pages/Search';
import Settings from '@/pages/Settings';
import Reminders from '@/pages/Reminders';
import Analytics from '@/pages/Analytics';
import Collections from '@/pages/Collections';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notes/new" element={<NoteEditor />} />
        <Route path="/notes/:id" element={<NoteView />} />
        <Route path="/notes/:id/edit" element={<NoteEditor />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/quizzes" element={<Quizzes />} />
        <Route path="/search" element={<Search />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/collections" element={<Collections />} />
      </Routes>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#18181b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;
