export interface Note {
  id: string;
  notebook_id: string | null;
  title: string;
  content: { type: string; content: ContentBlock[] };
  content_plain: string;
  source_type: 'manual' | 'voice' | 'image' | 'document';
  source_url: string | null;
  source_file_name: string | null;
  processing_status: string;
  is_favorite: boolean;
  is_pinned: boolean;
  is_archived: boolean;
  deleted_at: string | null;
  permanently_delete_at: string | null;
  word_count: number;
  read_time_minutes: number;
  created_at: string;
  updated_at: string;
  image_data?: string | null;
}

export interface ContentBlock {
  type: 'paragraph' | 'heading' | 'list' | 'code' | 'quote' | 'image';
  content: string;
  level?: number;
  items?: string[];
  language?: string;
  url?: string;
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

export interface ActivityLog {
  id: string;
  action: string;
  resource_type: 'note' | 'notebook';
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
