export interface Note {
  id: string;
  notebook_id: string | null;
  title: string;
  content: { type: string; content: ContentBlock[] };
  content_plain: string;
  source_type: 'manual' | 'voice' | 'image' | 'document' | 'video' | 'url' | 'audio';
  source_url: string | null;
  source_file_name: string | null;
  ai_summary: string | null;
  ai_key_points: string[];
  ai_definitions: AIDefinition[];
  ai_sentiment: string | null;
  ai_category: string | null;
  ai_topics: string[];
  ai_action_items: AIActionItem[];
  ai_questions: AIQuestion[];
  ai_processed: boolean;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  is_favorite: boolean;
  is_pinned: boolean;
  is_archived: boolean;
  word_count: number;
  read_time_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface ContentBlock {
  type: 'paragraph' | 'heading' | 'list' | 'code' | 'quote' | 'image';
  content: string;
  level?: number;
  items?: string[];
  language?: string;
  url?: string;
}

export interface AIDefinition {
  term: string;
  definition: string;
}

export interface AIActionItem {
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

export interface AIQuestion {
  question: string;
  answer: string;
}

export interface Notebook {
  id: string;
  title: string;
  description: string | null;
  cover_color: string;
  icon: string;
  is_favorite: boolean;
  is_archived: boolean;
  parent_notebook_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  note_count?: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface NoteTag {
  id: string;
  note_id: string;
  tag_id: string;
  created_at: string;
}

export interface Flashcard {
  id: string;
  note_id: string;
  front_content: string;
  back_content: string;
  difficulty: 'easy' | 'medium' | 'hard';
  last_reviewed_at: string | null;
  review_count: number;
  correct_count: number;
  next_review_at: string | null;
  created_at: string;
}

export interface Quiz {
  id: string;
  note_id: string;
  title: string;
  questions: QuizQuestion[];
  score: number | null;
  completed_at: string | null;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank';
  options?: string[];
  correct_answer: string;
  explanation?: string;
}

export interface Reminder {
  id: string;
  note_id: string | null;
  title: string;
  description: string | null;
  reminder_type: 'assignment' | 'meeting' | 'deadline' | 'exam' | 'custom';
  due_date: string;
  is_completed: boolean;
  is_ai_generated: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  resource_type: 'note' | 'notebook' | 'flashcard' | 'quiz' | 'reminder';
  resource_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  theme: 'light' | 'dark' | 'system';
  language: string;
  keyboard_shortcuts_enabled: boolean;
  notification_preferences: {
    push: boolean;
    email: boolean;
    reminders: boolean;
  };
  ai_preferences: {
    auto_tag: boolean;
    auto_summarize: boolean;
    auto_flashcards: boolean;
  };
  storage_used: number;
  storage_limit: number;
  created_at: string;
  updated_at: string;
}

export interface Collaborator {
  id: string;
  resource_type: 'notebook' | 'note';
  resource_id: string;
  user_id: string | null;
  email: string | null;
  permission: 'view' | 'edit' | 'admin';
  invited_by: string;
  accepted_at: string | null;
  created_at: string;
}
