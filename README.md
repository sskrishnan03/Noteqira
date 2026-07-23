<p align="center">
  <img src="img/note image.png" alt="Noteqira" width="100%" />
</p>

<h1 align="center">Noteqira</h1>

<p align="center">
  A modern, intelligent note workspace for typed, voice, image, and document notes — built to help you capture, organize, and revisit every idea from a single, beautifully crafted interface.
</p>

<p align="center">
  <a href="#overview">Overview</a> &nbsp;&middot;&nbsp;
  <a href="#key-features">Features</a> &nbsp;&middot;&nbsp;
  <a href="#how-it-works">How It Works</a> &nbsp;&middot;&nbsp;
  <a href="#installation">Installation</a> &nbsp;&middot;&nbsp;
  <a href="#usage">Usage</a> &nbsp;&middot;&nbsp;
  <a href="#license">License</a>
</p>

---

## Overview

Noteqira is a full-featured note-taking application designed to replace scattered apps and forgotten ideas with one unified workspace. Every piece of data stays on your device or in your own cloud — no third-party servers, no subscriptions, no compromises.

The application brings together four distinct note creation modes — typed text, live voice transcription, image-to-text OCR, and document parsing — under a single roof. Beyond capturing notes, Noteqira gives you a calendar to browse by date, analytics to track your writing rhythm, collections to keep things organized, and a read-aloud player to hear your notes spoken back to you.

Whether you are a student managing lecture notes, a professional tracking meeting minutes, or anyone who wants a dependable place to think, Noteqira gives you full control over your knowledge with a clean, distraction-free experience.

---

## Key Features

**Multi-Source Note Capture**

Write notes by hand, speak them into existence with real-time speech-to-text, upload an image and extract every word through OCR, or drop in a PDF, Word document, text file, CSV, JSON, XML, or HTML — Noteqira processes each source instantly and keeps the result in your library.

**Calendar Review**

Browse every note by its creation or modification date on an interactive calendar. Switch between month, week, and day views, filter by source type or favorites, and open a side panel to see all notes from any selected day at a glance.

**Workspace Analytics**

Track your daily capture flow with an area chart, compare weekly volume with bar charts, see your source mix through a pie chart, monitor your writing streak, and review a daily summary with your top source, word count, and most recent note — all computed live from your actual data.

**Read Aloud**

Have any note read back to you with a built-in text-to-speech player. Choose a voice, adjust the volume, skip forward or backward by sentence, and use keyboard shortcuts for hands-free listening.

**Collections**

Group related notes into color-coded collections with custom icons and descriptions. Create, rename, recolor, and delete collections as your thinking evolves.

**Search**

Find any note in seconds with a natural search that scans both titles and full content. Results update instantly, and keyboard shortcuts let you jump to search from anywhere in the app.

**Favorites and Recent Notes**

Star the notes that matter most for instant access on the favorites page. The recent page keeps your most recently updated notes one click away.

**Archive and Trash**

Archive notes you want to keep but hide from your active workspace. Delete notes you no longer need — they move to Trash, stay there for 30 days, and can be restored or permanently removed at any time. Expired trash is cleaned up automatically.

**PDF Export**

Export any note as a cleanly formatted PDF file with proper headings, paragraph spacing, and list formatting. Print directly from the editor or copy the full text to your clipboard.

**Undo and Redo**

Every edit in the note editor, voice editor, image editor, and document editor supports undo and redo with a 50-step history. Adjust font size, toggle fullscreen, and use keyboard shortcuts throughout.

**Secure Authentication**

Sign up with email and password, or use Google OAuth for instant access. Password reset flows through a dedicated email server. All sessions persist across browser refreshes.

**Data Persistence**

Notes, collections, tags, and activity logs are stored through Supabase when configured. If Supabase is unavailable, the app seamlessly falls back to a local browser database so your data always survives a refresh.

---

## How It Works

**1. Open the Application**

Launch the app in your browser. The landing page lets you sign in, sign up, or continue with Google. Everything loads instantly since the app runs entirely on your machine.

**2. Land on the Dashboard**

After signing in, the dashboard gives you a complete overview — total notes, favorites, archived count, quick actions for creating different note types, your most recent notes, a notes summary by type, and a timeline of your recent activity.

**3. Create a Note**

Tap the quick action for the type of note you want. Type a manual note, record your voice for automatic transcription, upload an image for OCR extraction, or drop in a document to have its contents parsed. Each editor provides undo, redo, font size controls, fullscreen mode, copy to clipboard, PDF export, and a read-aloud player.

**4. Browse by Calendar**

Open the calendar to see your notes mapped across dates. Toggle between created and modified dates, switch views, apply filters, and click any day to see a panel listing every note from that date.

**5. Review Analytics**

Head to analytics to see your writing streak, weekly trend, source mix, daily capture flow, and focus signals — all derived from your actual note data in real time.

**6. Organize with Collections**

Create collections with names, colors, and icons. Assign notes to collections from the editor. Browse collections from the sidebar to see grouped notes at a glance.

**7. Search and Navigate**

Press Command-K or Control-K to jump straight to search. Type a word or phrase and browse matching notes. Use the sidebar to move between dashboard, calendar, analytics, storage, favorites, recent, archived, and trash.

**8. Manage and Clean Up**

Archive notes you want to keep out of sight. Delete notes you no longer need and let them sit in Trash for 30 days before automatic cleanup. Restore anything before it expires.

---

## Installation

**Prerequisites**

- Node.js 18 or higher
- npm 9 or higher

**Setup**

```bash
git clone https://github.com/your-username/noteqira.git
cd noteqira
npm install
```

**Environment Configuration**

Create a `.env` file in the project root:

```
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

If you want password reset email to work, also create `server/.env`:

```
SMTP_EMAIL=your_email@gmail.com
SMTP_APP_PASSWORD=your_gmail_app_password
FRONTEND_URL=http://localhost:5173
PORT=3001
```

**Supabase Setup**

1. Open your Supabase project dashboard.
2. Navigate to the SQL editor.
3. Run the migration file at `supabase/migrations/20260714183000_noteqira_core.sql`.
4. Add your Supabase URL and anon key to `.env`.
5. Restart the app after updating environment values.

**Start the Application**

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## Usage

Once the application is running, you will land on the **Landing Page** where you can sign in or create an account.

- **Create a typed note** by pressing Command-N or Control-N, or use the quick action on the dashboard. Write freely with the built-in editor.
- **Record a voice note** by navigating to the voice note page. Speak naturally and watch the transcript appear in real time. Pause, resume, or stop at any moment.
- **Create an image note** by uploading a photo or screenshot. Noteqira will extract all text using OCR and present it for editing and saving.
- **Import a document** by uploading a PDF, Word file, plain text, CSV, JSON, XML, or HTML file. The content is parsed and loaded into the editor.
- **Browse your calendar** to find notes by date. Click any day to see what you captured, and use filters to narrow by type or favorites.
- **Check your analytics** to see your writing streak, source breakdown, weekly volume, and daily reports.
- **Organize notes** into collections with custom colors and icons from the collections page.
- **Search for anything** using the search page or the keyboard shortcut. Results appear instantly as you type.
- **Export any note** as a PDF or copy its full text to your clipboard from the editor toolbar.
- **Have notes read aloud** by clicking the speaker icon in any editor. Choose a voice and adjust the playback settings.
- **Archive or delete** notes you no longer need. Deleted notes go to Trash and stay there for 30 days before automatic cleanup.

---

## License

This project is provided for personal and educational use.
