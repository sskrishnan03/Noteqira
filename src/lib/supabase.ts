import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export type Database = {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string;
          notebook_id: string | null;
          title: string;
          content: { type: string; content: unknown[] };
          content_plain: string;
          source_type: string;
          source_url: string | null;
          source_file_name: string | null;
          ai_summary: string | null;
          ai_key_points: unknown;
          ai_definitions: unknown;
          ai_sentiment: string | null;
          ai_category: string | null;
          ai_topics: unknown;
          ai_action_items: unknown;
          ai_questions: unknown;
          ai_processed: boolean;
          processing_status: string;
          is_favorite: boolean;
          is_pinned: boolean;
          is_archived: boolean;
          word_count: number;
          read_time_minutes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          notebook_id?: string | null;
          title?: string;
          content?: { type: string; content: unknown[] };
          content_plain?: string;
          source_type?: string;
          source_url?: string | null;
          source_file_name?: string | null;
          ai_summary?: string | null;
          ai_key_points?: unknown;
          ai_definitions?: unknown;
          ai_sentiment?: string | null;
          ai_category?: string | null;
          ai_topics?: unknown;
          ai_action_items?: unknown;
          ai_questions?: unknown;
          ai_processed?: boolean;
          processing_status?: string;
          is_favorite?: boolean;
          is_pinned?: boolean;
          is_archived?: boolean;
          word_count?: number;
          read_time_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          notebook_id?: string | null;
          title?: string;
          content?: { type: string; content: unknown[] };
          content_plain?: string;
          source_type?: string;
          source_url?: string | null;
          source_file_name?: string | null;
          ai_summary?: string | null;
          ai_key_points?: unknown;
          ai_definitions?: unknown;
          ai_sentiment?: string | null;
          ai_category?: string | null;
          ai_topics?: unknown;
          ai_action_items?: unknown;
          ai_questions?: unknown;
          ai_processed?: boolean;
          processing_status?: string;
          is_favorite?: boolean;
          is_pinned?: boolean;
          is_archived?: boolean;
          word_count?: number;
          read_time_minutes?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      notebooks: {
        Row: {
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
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          cover_color?: string;
          icon?: string;
          is_favorite?: boolean;
          is_archived?: boolean;
          parent_notebook_id?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          cover_color?: string;
          icon?: string;
          is_favorite?: boolean;
          is_archived?: boolean;
          parent_notebook_id?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      tags: {
        Row: {
          id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          created_at?: string;
        };
      };
      note_tags: {
        Row: {
          id: string;
          note_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          note_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          note_id?: string;
          tag_id?: string;
          created_at?: string;
        };
      };
      flashcards: {
        Row: {
          id: string;
          note_id: string;
          front_content: string;
          back_content: string;
          difficulty: string;
          last_reviewed_at: string | null;
          review_count: number;
          correct_count: number;
          next_review_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          note_id: string;
          front_content: string;
          back_content: string;
          difficulty?: string;
          last_reviewed_at?: string | null;
          review_count?: number;
          correct_count?: number;
          next_review_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          note_id?: string;
          front_content?: string;
          back_content?: string;
          difficulty?: string;
          last_reviewed_at?: string | null;
          review_count?: number;
          correct_count?: number;
          next_review_at?: string | null;
          created_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          note_id: string | null;
          title: string;
          questions: unknown;
          score: number | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          note_id?: string | null;
          title: string;
          questions?: unknown;
          score?: number | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          note_id?: string | null;
          title?: string;
          questions?: unknown;
          score?: number | null;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      reminders: {
        Row: {
          id: string;
          note_id: string | null;
          title: string;
          description: string | null;
          reminder_type: string;
          due_date: string;
          is_completed: boolean;
          is_ai_generated: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          note_id?: string | null;
          title: string;
          description?: string | null;
          reminder_type?: string;
          due_date: string;
          is_completed?: boolean;
          is_ai_generated?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          note_id?: string | null;
          title?: string;
          description?: string | null;
          reminder_type?: string;
          due_date?: string;
          is_completed?: boolean;
          is_ai_generated?: boolean;
          created_at?: string;
        };
      };
      activity_log: {
        Row: {
          id: string;
          action: string;
          resource_type: string | null;
          resource_id: string | null;
          metadata: unknown;
          created_at: string;
        };
        Insert: {
          id?: string;
          action: string;
          resource_type?: string | null;
          resource_id?: string | null;
          metadata?: unknown;
          created_at?: string;
        };
        Update: {
          id?: string;
          action?: string;
          resource_type?: string | null;
          resource_id?: string | null;
          metadata?: unknown;
          created_at?: string;
        };
      };
    };
  };
};
