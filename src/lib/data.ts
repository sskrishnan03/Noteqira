import type { ActivityLog, Note, Notebook, Tag } from '@/types';

type StoredNote = Note & {
  owner_id: string;
  processing_status: string;
  deleted_at: string | null;
  permanently_delete_at: string | null;
  image_data?: string | null;
};

type StoredNotebook = Notebook & {
  owner_id: string;
};

type StoredTag = Tag & {
  owner_id: string;
};

type StoredActivity = ActivityLog & {
  owner_id: string;
};

type DatabaseSnapshot = {
  notes: StoredNote[];
  notebooks: StoredNotebook[];
  tags: StoredTag[];
  activityLog: StoredActivity[];
  idCounter: number;
};

type NoteQueryOptions = {
  archived?: boolean;
  trashed?: boolean;
  includeTrashed?: boolean;
  limit?: number;
  notebook?: string;
  search?: string;
  favorites?: boolean;
  filter?: string;
  source_type?: string;
};

const STORAGE_KEY = 'noteqira_database_v1';
const TRASH_RETENTION_DAYS = 30;

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey);

const emptySnapshot = (): DatabaseSnapshot => ({
  notes: [],
  notebooks: [],
  tags: [],
  activityLog: [],
  idCounter: 100,
});

function getOwnerId(): string {
  try {
    return localStorage.getItem('noteqira_session') || 'local-user';
  } catch {
    return 'local-user';
  }
}

function safeParseSnapshot(value: string | null): DatabaseSnapshot {
  if (!value) return emptySnapshot();
  try {
    const parsed = JSON.parse(value) as Partial<DatabaseSnapshot>;
    return {
      notes: Array.isArray(parsed.notes) ? parsed.notes.map((note) => normalizeExistingNote(note as Partial<StoredNote> & Record<string, unknown>)) : [],
      notebooks: Array.isArray(parsed.notebooks) ? parsed.notebooks.map((notebook) => normalizeExistingNotebook(notebook as Partial<StoredNotebook> & Record<string, unknown>)) : [],
      tags: Array.isArray(parsed.tags) ? parsed.tags.map((tag) => normalizeExistingTag(tag as Partial<StoredTag> & Record<string, unknown>)) : [],
      activityLog: Array.isArray(parsed.activityLog) ? parsed.activityLog.map((activity) => normalizeExistingActivity(activity as Partial<StoredActivity> & Record<string, unknown>)) : [],
      idCounter: typeof parsed.idCounter === 'number' ? parsed.idCounter : 100,
    };
  } catch {
    return emptySnapshot();
  }
}

function loadLocal(): DatabaseSnapshot {
  try {
    return safeParseSnapshot(localStorage.getItem(STORAGE_KEY));
  } catch {
    return emptySnapshot();
  }
}

function saveLocal(snapshot: DatabaseSnapshot) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.warn('Could not persist Noteqira data locally', error);
  }
}

function nextId(snapshot: DatabaseSnapshot, prefix: string): string {
  const next = snapshot.idCounter + 1;
  snapshot.idCounter = next;
  return `${prefix}-${String(next).padStart(3, '0')}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function readTimeMinutes(wordCount: number): number {
  return wordCount > 0 ? Math.max(1, Math.ceil(wordCount / 200)) : 0;
}

function isSourceType(value: unknown): value is Note['source_type'] {
  return value === 'manual' || value === 'voice' || value === 'image' || value === 'document';
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function normalizeExistingNote(note: Partial<StoredNote> & Record<string, unknown>): StoredNote {
  const now = new Date().toISOString();
  const contentPlain = typeof note.content_plain === 'string' ? note.content_plain : '';
  const wordCount = typeof note.word_count === 'number' ? note.word_count : countWords(contentPlain);
  const sourceType = isSourceType(note.source_type) ? note.source_type : 'manual';
  const createdAt = typeof note.created_at === 'string' ? note.created_at : now;
  const updatedAt = typeof note.updated_at === 'string' ? note.updated_at : createdAt;

  return {
    id: typeof note.id === 'string' ? note.id : crypto.randomUUID(),
    owner_id: typeof note.owner_id === 'string' ? note.owner_id : getOwnerId(),
    notebook_id: typeof note.notebook_id === 'string' ? note.notebook_id : null,
    title: typeof note.title === 'string' ? note.title : 'Untitled',
    content: note.content && typeof note.content === 'object'
      ? note.content as Note['content']
      : { type: 'doc', content: [] },
    content_plain: contentPlain,
    source_type: sourceType,
    source_url: typeof note.source_url === 'string' ? note.source_url : null,
    source_file_name: typeof note.source_file_name === 'string'
      ? note.source_file_name
      : typeof note.document_name === 'string'
      ? note.document_name
      : null,
    processing_status: typeof note.processing_status === 'string' ? note.processing_status : 'pending',
    is_favorite: Boolean(note.is_favorite),
    is_pinned: Boolean(note.is_pinned),
    is_archived: Boolean(note.is_archived),
    deleted_at: typeof note.deleted_at === 'string' ? note.deleted_at : null,
    permanently_delete_at: typeof note.permanently_delete_at === 'string' ? note.permanently_delete_at : null,
    word_count: wordCount,
    read_time_minutes: typeof note.read_time_minutes === 'number' ? note.read_time_minutes : readTimeMinutes(wordCount),
    created_at: createdAt,
    updated_at: updatedAt,
    image_data: typeof note.image_data === 'string' ? note.image_data : null,
  };
}

function normalizeExistingNotebook(notebook: Partial<StoredNotebook> & Record<string, unknown>): StoredNotebook {
  const now = new Date().toISOString();
  const createdAt = typeof notebook.created_at === 'string' ? notebook.created_at : now;

  return {
    id: typeof notebook.id === 'string' ? notebook.id : crypto.randomUUID(),
    owner_id: typeof notebook.owner_id === 'string' ? notebook.owner_id : getOwnerId(),
    title: typeof notebook.title === 'string' ? notebook.title : 'Untitled Collection',
    description: typeof notebook.description === 'string' ? notebook.description : null,
    cover_color: typeof notebook.cover_color === 'string' ? notebook.cover_color : '#3b82f6',
    icon: typeof notebook.icon === 'string' ? notebook.icon : 'folder',
    is_favorite: Boolean(notebook.is_favorite),
    is_archived: Boolean(notebook.is_archived),
    parent_notebook_id: typeof notebook.parent_notebook_id === 'string' ? notebook.parent_notebook_id : null,
    sort_order: typeof notebook.sort_order === 'number' ? notebook.sort_order : 0,
    created_at: createdAt,
    updated_at: typeof notebook.updated_at === 'string' ? notebook.updated_at : createdAt,
  };
}

function normalizeExistingTag(tag: Partial<StoredTag> & Record<string, unknown>): StoredTag {
  return {
    id: typeof tag.id === 'string' ? tag.id : crypto.randomUUID(),
    owner_id: typeof tag.owner_id === 'string' ? tag.owner_id : getOwnerId(),
    name: typeof tag.name === 'string' ? tag.name : 'untagged',
    color: typeof tag.color === 'string' ? tag.color : '#8A8A8A',
    created_at: typeof tag.created_at === 'string' ? tag.created_at : new Date().toISOString(),
  };
}

function normalizeExistingActivity(activity: Partial<StoredActivity> & Record<string, unknown>): StoredActivity {
  return {
    id: typeof activity.id === 'string' ? activity.id : crypto.randomUUID(),
    owner_id: typeof activity.owner_id === 'string' ? activity.owner_id : getOwnerId(),
    action: typeof activity.action === 'string' ? activity.action : 'updated',
    resource_type: activity.resource_type === 'notebook' ? 'notebook' : 'note',
    resource_id: typeof activity.resource_id === 'string' ? activity.resource_id : null,
    metadata: asRecord(activity.metadata),
    created_at: typeof activity.created_at === 'string' ? activity.created_at : new Date().toISOString(),
  };
}

function buildNote(data: Record<string, unknown>, snapshot: DatabaseSnapshot): StoredNote {
  const now = new Date().toISOString();
  const contentPlain = typeof data.content_plain === 'string' ? data.content_plain : '';
  const wordCount = typeof data.word_count === 'number' ? data.word_count : countWords(contentPlain);

  return normalizeExistingNote({
    id: nextId(snapshot, 'note'),
    owner_id: getOwnerId(),
    notebook_id: null,
    title: 'Untitled',
    content: { type: 'doc', content: [] },
    content_plain: contentPlain,
    source_type: 'manual',
    source_url: null,
    source_file_name: null,
    processing_status: 'pending',
    is_favorite: false,
    is_pinned: false,
    is_archived: false,
    deleted_at: null,
    permanently_delete_at: null,
    word_count: wordCount,
    read_time_minutes: readTimeMinutes(wordCount),
    created_at: now,
    updated_at: now,
    ...data,
  });
}

function buildNotebook(data: Record<string, unknown>, snapshot: DatabaseSnapshot): StoredNotebook {
  const now = new Date().toISOString();
  return normalizeExistingNotebook({
    id: nextId(snapshot, 'nb'),
    owner_id: getOwnerId(),
    title: 'Untitled Collection',
    description: null,
    cover_color: '#3b82f6',
    icon: 'folder',
    is_favorite: false,
    is_archived: false,
    parent_notebook_id: null,
    sort_order: 0,
    created_at: now,
    updated_at: now,
    ...data,
  });
}

function filterNotes(notes: StoredNote[], options?: NoteQueryOptions): StoredNote[] {
  let result = notes.filter((note) => note.owner_id === getOwnerId());

  if (options?.trashed || options?.filter === 'trash') {
    result = result.filter((note) => Boolean(note.deleted_at));
  } else if (!options?.includeTrashed) {
    result = result.filter((note) => !note.deleted_at);
  }

  if (options?.archived === false) result = result.filter((note) => !note.is_archived);
  if (options?.archived === true) result = result.filter((note) => note.is_archived);
  if (options?.favorites) result = result.filter((note) => note.is_favorite);
  if (options?.filter === 'archived') result = result.filter((note) => note.is_archived);
  if (options?.filter === 'favorites') result = result.filter((note) => note.is_favorite);
  if (options?.filter === 'recent') result = result.filter((note) => !note.is_archived);
  if (options?.notebook) result = result.filter((note) => note.notebook_id === options.notebook);
  if (options?.source_type) result = result.filter((note) => note.source_type === options.source_type);

  if (options?.search) {
    const query = options.search.toLowerCase();
    result = result.filter((note) =>
      note.title.toLowerCase().includes(query) ||
      note.content_plain.toLowerCase().includes(query)
    );
  }

  result = result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  if (options?.limit) result = result.slice(0, options.limit);
  return result;
}

function purgeExpiredTrashLocal(snapshot: DatabaseSnapshot): boolean {
  const now = Date.now();
  const before = snapshot.notes.length;
  snapshot.notes = snapshot.notes.filter((note) => {
    if (!note.deleted_at) return true;
    const deleteAt = note.permanently_delete_at || addDays(new Date(note.deleted_at), TRASH_RETENTION_DAYS).toISOString();
    return new Date(deleteAt).getTime() > now;
  });
  return before !== snapshot.notes.length;
}

function mirrorNotesToLocal(notes: StoredNote[]) {
  const snapshot = loadLocal();
  const ownerId = getOwnerId();
  const otherNotes = snapshot.notes.filter((note) => note.owner_id !== ownerId);
  snapshot.notes = [...otherNotes, ...notes];
  saveLocal(snapshot);
}

function mirrorNotebooksToLocal(notebooks: StoredNotebook[]) {
  const snapshot = loadLocal();
  const ownerId = getOwnerId();
  const otherNotebooks = snapshot.notebooks.filter((notebook) => notebook.owner_id !== ownerId);
  snapshot.notebooks = [...otherNotebooks, ...notebooks];
  saveLocal(snapshot);
}

async function supabaseRequest<T>(
  table: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    query?: Record<string, string>;
    body?: unknown;
    prefer?: string;
  } = {}
): Promise<T> {
  const url = new URL(`${supabaseUrl}/rest/v1/${table}`);
  Object.entries(options.query || {}).forEach(([key, value]) => url.searchParams.set(key, value));

  const response = await fetch(url.toString(), {
    method: options.method || 'GET',
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
      Prefer: options.prefer || 'return=representation',
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

const ownerFilter = () => `eq.${getOwnerId()}`;
const idFilter = (id: string) => `eq.${id}`;

async function fetchSupabaseNotes(): Promise<StoredNote[]> {
  const rows = await supabaseRequest<Array<Partial<StoredNote> & Record<string, unknown>>>('noteqira_notes', {
    query: {
      owner_id: ownerFilter(),
      order: 'updated_at.desc',
    },
  });
  return rows.map(normalizeExistingNote);
}

async function purgeExpiredTrashSupabase(notes?: StoredNote[]) {
  const source = notes || await fetchSupabaseNotes();
  const expired = source.filter((note) => {
    if (!note.deleted_at) return false;
    const deleteAt = note.permanently_delete_at || addDays(new Date(note.deleted_at), TRASH_RETENTION_DAYS).toISOString();
    return new Date(deleteAt).getTime() <= Date.now();
  });

  await Promise.all(expired.map((note) =>
    supabaseRequest('noteqira_notes', {
      method: 'DELETE',
      query: { id: idFilter(note.id), owner_id: ownerFilter() },
      prefer: 'return=minimal',
    })
  ));
}

async function readNotes(): Promise<StoredNote[]> {
  if (hasSupabase) {
    try {
      const notes = await fetchSupabaseNotes();
      await purgeExpiredTrashSupabase(notes);
      const freshNotes = notes.filter((note) => {
        if (!note.deleted_at) return true;
        const deleteAt = note.permanently_delete_at || addDays(new Date(note.deleted_at), TRASH_RETENTION_DAYS).toISOString();
        return new Date(deleteAt).getTime() > Date.now();
      });
      mirrorNotesToLocal(freshNotes);
      return freshNotes;
    } catch (error) {
      console.warn('Supabase notes unavailable, using local database', error);
    }
  }

  const snapshot = loadLocal();
  if (purgeExpiredTrashLocal(snapshot)) saveLocal(snapshot);
  return snapshot.notes;
}

async function writeNoteToSupabase(note: StoredNote): Promise<StoredNote> {
  const rows = await supabaseRequest<Array<Partial<StoredNote> & Record<string, unknown>>>('noteqira_notes', {
    method: 'POST',
    query: { on_conflict: 'id' },
    body: note,
    prefer: 'resolution=merge-duplicates,return=representation',
  });
  return normalizeExistingNote(rows[0] || note);
}

async function patchNoteInSupabase(id: string, updates: Partial<StoredNote>): Promise<StoredNote> {
  const rows = await supabaseRequest<Array<Partial<StoredNote> & Record<string, unknown>>>('noteqira_notes', {
    method: 'PATCH',
    query: { id: idFilter(id), owner_id: ownerFilter() },
    body: updates,
  });
  if (!rows[0]) throw new Error('Note not found');
  return normalizeExistingNote(rows[0]);
}

async function createActivityLocal(data: Record<string, unknown>, snapshot = loadLocal()): Promise<StoredActivity> {
  const activity = normalizeExistingActivity({
    id: nextId(snapshot, 'act'),
    owner_id: getOwnerId(),
    action: 'updated',
    resource_type: 'note',
    resource_id: null,
    metadata: {},
    created_at: new Date().toISOString(),
    ...data,
  });
  snapshot.activityLog.unshift(activity);
  saveLocal(snapshot);
  return activity;
}

async function createActivitySupabase(activity: StoredActivity): Promise<StoredActivity> {
  const rows = await supabaseRequest<Array<Partial<StoredActivity> & Record<string, unknown>>>('noteqira_activity_log', {
    method: 'POST',
    body: activity,
  });
  return normalizeExistingActivity(rows[0] || activity);
}

async function createActivityEverywhere(data: Record<string, unknown>): Promise<StoredActivity> {
  const snapshot = loadLocal();
  const activity = normalizeExistingActivity({
    id: nextId(snapshot, 'act'),
    owner_id: getOwnerId(),
    action: 'updated',
    resource_type: 'note',
    resource_id: null,
    metadata: {},
    created_at: new Date().toISOString(),
    ...data,
  });
  snapshot.activityLog.unshift(activity);
  saveLocal(snapshot);

  if (hasSupabase) {
    try {
      return await createActivitySupabase(activity);
    } catch (error) {
      console.warn('Could not write activity to Supabase', error);
    }
  }

  return activity;
}

export const db = {
  async getNotes(options?: NoteQueryOptions) {
    const notes = await readNotes();
    return filterNotes(notes, options);
  },

  async getTrashNotes() {
    return this.getNotes({ trashed: true });
  },

  async getNote(id: string) {
    const notes = await readNotes();
    const note = notes.find((item) => item.id === id && item.owner_id === getOwnerId());
    if (!note) throw new Error('Note not found');
    return note;
  },

  async createNote(data: Record<string, unknown>) {
    const snapshot = loadLocal();
    const note = buildNote(data, snapshot);
    snapshot.notes.unshift(note);
    saveLocal(snapshot);

    if (hasSupabase) {
      try {
        const saved = await writeNoteToSupabase(note);
        const freshSnapshot = loadLocal();
        const idx = freshSnapshot.notes.findIndex((item) => item.id === saved.id);
        if (idx >= 0) freshSnapshot.notes[idx] = saved;
        saveLocal(freshSnapshot);
        return saved;
      } catch (error) {
        console.warn('Could not write note to Supabase', error);
      }
    }

    return note;
  },

  async updateNote(id: string, data: Record<string, unknown>) {
    const snapshot = loadLocal();
    const idx = snapshot.notes.findIndex((note) => note.id === id && note.owner_id === getOwnerId());
    if (idx === -1) throw new Error('Note not found');

    const existing = snapshot.notes[idx];
    const merged = normalizeExistingNote({
      ...existing,
      ...data,
      id,
      owner_id: existing.owner_id,
      word_count: typeof data.word_count === 'number'
        ? data.word_count
        : typeof data.content_plain === 'string'
        ? countWords(data.content_plain)
        : existing.word_count,
      read_time_minutes: typeof data.word_count === 'number'
        ? readTimeMinutes(data.word_count)
        : typeof data.content_plain === 'string'
        ? readTimeMinutes(countWords(data.content_plain))
        : existing.read_time_minutes,
      updated_at: new Date().toISOString(),
    });
    snapshot.notes[idx] = merged;
    saveLocal(snapshot);

    if (hasSupabase) {
      try {
        const saved = await patchNoteInSupabase(id, merged);
        const freshSnapshot = loadLocal();
        const freshIdx = freshSnapshot.notes.findIndex((note) => note.id === id && note.owner_id === getOwnerId());
        if (freshIdx >= 0) freshSnapshot.notes[freshIdx] = saved;
        saveLocal(freshSnapshot);
        return saved;
      } catch (error) {
        console.warn('Could not update note in Supabase', error);
      }
    }

    return merged;
  },

  async deleteNote(id: string) {
    const now = new Date();
    const deletedAt = now.toISOString();
    const permanentlyDeleteAt = addDays(now, TRASH_RETENTION_DAYS).toISOString();
    const note = await this.updateNote(id, {
      deleted_at: deletedAt,
      permanently_delete_at: permanentlyDeleteAt,
      is_archived: false,
      updated_at: deletedAt,
    });
    await createActivityEverywhere({
      action: 'moved_to_trash',
      resource_type: 'note',
      resource_id: id,
      metadata: { title: note.title, permanently_delete_at: permanentlyDeleteAt },
    });
  },

  async restoreNote(id: string) {
    const note = await this.updateNote(id, {
      deleted_at: null,
      permanently_delete_at: null,
    });
    await createActivityEverywhere({
      action: 'restored',
      resource_type: 'note',
      resource_id: id,
      metadata: { title: note.title },
    });
    return note;
  },

  async permanentlyDeleteNote(id: string) {
    const snapshot = loadLocal();
    const note = snapshot.notes.find((item) => item.id === id && item.owner_id === getOwnerId());
    snapshot.notes = snapshot.notes.filter((item) => !(item.id === id && item.owner_id === getOwnerId()));
    saveLocal(snapshot);

    if (hasSupabase) {
      try {
        await supabaseRequest('noteqira_notes', {
          method: 'DELETE',
          query: { id: idFilter(id), owner_id: ownerFilter() },
          prefer: 'return=minimal',
        });
      } catch (error) {
        console.warn('Could not permanently delete note in Supabase', error);
      }
    }

    await createActivityEverywhere({
      action: 'permanently_deleted',
      resource_type: 'note',
      resource_id: id,
      metadata: { title: note?.title || 'Untitled' },
    });
  },

  async emptyExpiredTrash() {
    if (hasSupabase) {
      try {
        await purgeExpiredTrashSupabase();
      } catch (error) {
        console.warn('Could not clean Supabase trash', error);
      }
    }

    const snapshot = loadLocal();
    if (purgeExpiredTrashLocal(snapshot)) saveLocal(snapshot);
  },

  async getNotebooks() {
    if (hasSupabase) {
      try {
        const rows = await supabaseRequest<Array<Partial<StoredNotebook> & Record<string, unknown>>>('noteqira_notebooks', {
          query: { owner_id: ownerFilter(), order: 'sort_order.asc' },
        });
        const notebooks = rows.map(normalizeExistingNotebook).filter((notebook) => !notebook.is_archived);
        mirrorNotebooksToLocal(notebooks);
        return notebooks;
      } catch (error) {
        console.warn('Supabase notebooks unavailable, using local database', error);
      }
    }

    return loadLocal().notebooks
      .filter((notebook) => notebook.owner_id === getOwnerId() && !notebook.is_archived)
      .sort((a, b) => a.sort_order - b.sort_order);
  },

  async getNotebook(id: string) {
    const notebook = loadLocal().notebooks.find((item) => item.id === id && item.owner_id === getOwnerId());
    return notebook;
  },

  async createNotebook(data: Record<string, unknown>) {
    const snapshot = loadLocal();
    const notebook = buildNotebook(data, snapshot);
    snapshot.notebooks.push(notebook);
    saveLocal(snapshot);

    if (hasSupabase) {
      try {
        const rows = await supabaseRequest<Array<Partial<StoredNotebook> & Record<string, unknown>>>('noteqira_notebooks', {
          method: 'POST',
          query: { on_conflict: 'id' },
          body: notebook,
          prefer: 'resolution=merge-duplicates,return=representation',
        });
        return normalizeExistingNotebook(rows[0] || notebook);
      } catch (error) {
        console.warn('Could not write notebook to Supabase', error);
      }
    }

    return notebook;
  },

  async updateNotebook(id: string, data: Record<string, unknown>) {
    const snapshot = loadLocal();
    const idx = snapshot.notebooks.findIndex((notebook) => notebook.id === id && notebook.owner_id === getOwnerId());
    if (idx === -1) throw new Error('Notebook not found');

    const updated = normalizeExistingNotebook({
      ...snapshot.notebooks[idx],
      ...data,
      id,
      updated_at: new Date().toISOString(),
    });
    snapshot.notebooks[idx] = updated;
    saveLocal(snapshot);

    if (hasSupabase) {
      try {
        const rows = await supabaseRequest<Array<Partial<StoredNotebook> & Record<string, unknown>>>('noteqira_notebooks', {
          method: 'PATCH',
          query: { id: idFilter(id), owner_id: ownerFilter() },
          body: updated,
        });
        return normalizeExistingNotebook(rows[0] || updated);
      } catch (error) {
        console.warn('Could not update notebook in Supabase', error);
      }
    }

    return updated;
  },

  async deleteNotebook(id: string) {
    const snapshot = loadLocal();
    snapshot.notebooks = snapshot.notebooks.filter((notebook) => !(notebook.id === id && notebook.owner_id === getOwnerId()));
    snapshot.notes = snapshot.notes.map((note) => note.notebook_id === id ? { ...note, notebook_id: null } : note);
    saveLocal(snapshot);

    if (hasSupabase) {
      try {
        await supabaseRequest('noteqira_notebooks', {
          method: 'DELETE',
          query: { id: idFilter(id), owner_id: ownerFilter() },
          prefer: 'return=minimal',
        });
      } catch (error) {
        console.warn('Could not delete notebook in Supabase', error);
      }
    }
  },

  async getNoteCounts() {
    const notes = await this.getNotes({ archived: false });
    return notes.reduce((acc, note) => {
      if (note.notebook_id) acc[note.notebook_id] = (acc[note.notebook_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  },

  async getTags() {
    return loadLocal().tags.filter((tag) => tag.owner_id === getOwnerId());
  },

  async createActivity(data: Record<string, unknown>) {
    if (!hasSupabase) return createActivityLocal(data);
    return createActivityEverywhere(data);
  },

  async getActivity(options?: { limit?: number }) {
    if (hasSupabase) {
      try {
        const rows = await supabaseRequest<Array<Partial<StoredActivity> & Record<string, unknown>>>('noteqira_activity_log', {
          query: { owner_id: ownerFilter(), order: 'created_at.desc' },
        });
        let activities = rows.map(normalizeExistingActivity);
        if (options?.limit) activities = activities.slice(0, options.limit);
        return activities;
      } catch (error) {
        console.warn('Supabase activity unavailable, using local database', error);
      }
    }

    let activities = loadLocal().activityLog
      .filter((activity) => activity.owner_id === getOwnerId())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (options?.limit) activities = activities.slice(0, options.limit);
    return activities;
  },
};
