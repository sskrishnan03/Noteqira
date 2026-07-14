<div align="center">
  <img src="public/favicon.svg" alt="Noteqira" width="88" />
  <h1>Noteqira</h1>
  <p>
    <strong>A modern note workspace for typed, voice, image, and document notes.</strong>
    <br />
    <em>Dashboard, calendar, analytics, search, storage, favorites, archive, trash, and persistent data in one clean app.</em>
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=111111" alt="React 18" />
    <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5" />
    <img src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white" alt="Vite 5" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 3" />
    <br />
    <img src="https://img.shields.io/badge/Supabase-Ready-3FCF8E?logo=supabase&logoColor=111111" alt="Supabase ready" />
    <img src="https://img.shields.io/badge/Recharts-Analytics-FF6384?logo=chartdotjs&logoColor=white" alt="Recharts analytics" />
    <img src="https://img.shields.io/badge/Tesseract-OCR-5A67D8" alt="Tesseract OCR" />
    <img src="https://img.shields.io/badge/Google-OAuth-4285F4?logo=google&logoColor=white" alt="Google OAuth" />
  </p>
</div>

---

## Overview

Noteqira is a full note-taking workspace built with React, TypeScript, Vite, Tailwind CSS, Supabase-ready persistence, and a local browser database fallback. It is designed so notes stay available after refresh, reopen, and normal day-to-day use.

The app supports manual notes, voice notes, image notes with OCR, document notes, calendar review, analytics charts, search, collections, favorites, recent notes, archived notes, and a trash system with restore and permanent delete controls.

---

## Features at a Glance

| Category | Features |
|---|---|
| **Dashboard** | Workspace summary, quick actions, recent notes, activity timeline, note statistics, and source overview |
| **Calendar** | Calendar-based note review, date navigation, filters, day details, archive controls, and trash confirmation |
| **Analytics** | Daily capture flow, weekly volume, source mix chart, study time, word count, streaks, focus signals, and trash health |
| **Note Storage** | Separate views for typed notes, voice notes, image notes, and uploaded documents |
| **Search** | Natural phrase and keyword search across note titles and note content |
| **Organization** | Favorites, recent notes, archived notes, pinned state, collections, colors, and icons |
| **Trash** | Soft delete confirmation, restore, permanent delete, and automatic cleanup after 30 days |
| **Input Types** | Manual editor, speech transcription, image OCR, PDF parsing, DOCX parsing, and TXT upload support |
| **Reading Tools** | Read-aloud player, voice settings, copy controls, and download/export actions |
| **Account** | Email login, password reset server, Google sign-in, profile settings, theme settings, and session persistence |
| **Data Layer** | Supabase REST storage when configured, plus local browser database fallback for saved notes |

---

## Main Navigation

| Area | Route | What it does |
|---|---|---|
| Landing | `/` | Public entry page with authentication access |
| Dashboard | `/dashboard` | Main workspace overview |
| Calendar | `/calendar` | Browse notes by date and activity |
| Analytics | `/analytics` | Charts, reports, trends, and workspace health |
| Note Storage | `/storage` | Browse saved notes by source type |
| Typed Notes | `/storage/manual` | Manual note library |
| Voice Notes | `/storage/voice` | Speech-based notes |
| Image Notes | `/storage/image` | OCR image notes |
| Documents | `/storage/document` | Uploaded document notes |
| Favorites | `/favorites` | Starred notes |
| Recent | `/recent` | Recently updated notes |
| Archived | `/archived` | Archived notes |
| Trash | `/trash` | Deleted notes with restore and permanent delete actions |
| Search | `/search` | Search titles and note content |
| Collections | `/collections` | Collection management |
| Settings | `/settings` | Profile and workspace preferences |
| Reset Password | `/reset-password` | Password reset flow |

---

## Note Workflows

| Workflow | Route | Details |
|---|---|---|
| New typed note | `/notes/new` | Write, format, save, read aloud, copy, download, and delete with confirmation |
| New voice note | `/notes/new/voice` | Record speech, transcribe, edit transcript, save, and keep drafts locally |
| New image note | `/notes/new/image` | Upload an image, extract text with OCR, edit, save, and keep drafts locally |
| New document note | `/notes/new/document` | Upload TXT, PDF, or DOCX files, parse text, edit, save, and keep recent document history |
| View note | `/notes/:id` | Read note details, favorite, archive, edit, or move to trash |
| Edit note | `/notes/:id/edit` | Update saved content without losing the existing note record |

---

## Trash Lifecycle

Noteqira uses a safe delete flow so saved notes are not removed immediately.

1. When a note is deleted, the app asks for confirmation.
2. Confirmed deletes move the note to Trash instead of removing it.
3. Trash keeps the note with `deleted_at` and `permanently_delete_at` timestamps.
4. The Trash page can restore the note or permanently delete it.
5. Notes can be automatically cleaned after 30 days.
6. Expired trash is checked in both Supabase mode and local fallback mode.

---

## Data and Database

Noteqira can run with Supabase as the shared database and also keeps a local browser database fallback. This means the app remains usable even before Supabase is configured, and saved data stays available after refresh.

### Supabase Tables

| Table | Purpose |
|---|---|
| `noteqira_profiles` | User profile, settings, avatar, storage limits, and preferences |
| `noteqira_notebooks` | Collections with colors, icons, ordering, favorites, and archive state |
| `noteqira_notes` | Notes, content, source type, favorite state, archive state, trash timestamps, counts, and image data |
| `noteqira_tags` | Tag names and colors |
| `noteqira_note_tags` | Many-to-many note/tag links |
| `noteqira_activity_log` | Workspace activity history |

The migration also includes indexes for note loading, trash filtering, source filtering, collection sorting, and activity history. It includes a database function named `noteqira_delete_expired_trash()` for expired trash cleanup.

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- A Supabase project for cloud persistence
- A Google OAuth client ID if Google sign-in is enabled
- Gmail SMTP credentials if password reset email is enabled

### Installation

```bash
npm install
cd server
npm install
cd ..
```

### Environment Variables

Create or update `.env` in the project root:

```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Create `server/.env` only when running password reset email:

```env
SMTP_EMAIL=your_email@gmail.com
SMTP_APP_PASSWORD=your_gmail_app_password
FRONTEND_URL=http://localhost:5173
PORT=3001
```

### Supabase Setup

1. Open your Supabase project.
2. Go to the SQL editor.
3. Run `supabase/migrations/20260714183000_noteqira_core.sql`.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env`.
5. Restart the app after changing environment values.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run server` | Start the password reset email server |
| `npm run dev:all` | Start frontend and reset server together |
| `npm run typecheck` | Run TypeScript checks |
| `npm run lint` | Run ESLint |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build locally |

Open the app at `http://localhost:5173`.

---

## Tech Stack

| Layer | Tools |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Routing | React Router |
| Data Fetching | TanStack Query |
| Charts | Recharts |
| Animation | Framer Motion |
| Icons | Lucide React |
| OCR | Tesseract.js |
| Documents | PDF.js, Mammoth |
| Export | jsPDF |
| Auth UI | Local email/password session and Google OAuth |
| Backend Helper | Express, Nodemailer, CORS |
| Database | Supabase REST tables with local browser database fallback |

---

## Project Structure

```text
Noteqira
+-- public/
|   +-- favicon.svg
+-- server/
|   +-- index.js
|   +-- package.json
+-- src/
|   +-- components/
|   |   +-- ReadAloud/
|   |   +-- calendar/
|   |   +-- dashboard/
|   +-- lib/
|   |   +-- auth.tsx
|   |   +-- data.ts
|   |   +-- export.ts
|   +-- pages/
|   |   +-- Analytics.tsx
|   |   +-- Calendar.tsx
|   |   +-- Dashboard.tsx
|   |   +-- Trash.tsx
|   |   +-- note creation and library pages
|   +-- types/
|   +-- App.tsx
|   +-- main.tsx
+-- supabase/
|   +-- migrations/
|   |   +-- 20260714183000_noteqira_core.sql
+-- package.json
+-- README.md
```

---

## Persistence Behavior

| Situation | Result |
|---|---|
| Supabase values are configured | Notes, collections, tags, and activity are saved through Supabase REST endpoints |
| Supabase is unavailable | The app falls back to the local browser database |
| Browser refresh | Saved local or Supabase-backed notes remain available |
| Note delete | Note moves to Trash after confirmation |
| Trash restore | Note returns to the active workspace |
| Permanent delete | Note is removed from storage |
| Trash reaches 30 days | Expired items can be cleaned automatically |

---

## Quality Checklist

- Dashboard, calendar, analytics, storage, favorites, recent, archived, trash, search, collections, and settings are routed.
- Notes can be created from typed text, voice, images, and documents.
- Deleted notes move to Trash first.
- Trash supports restore and permanent delete.
- Saved data survives refresh through Supabase or local fallback.
- Analytics reads real note data and shows charts, reports, and cleanup health.
- The app keeps environment configuration in `.env`.

---

## License

Private project.
