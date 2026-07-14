create table if not exists public.noteqira_profiles (
  id text primary key,
  email text not null,
  full_name text,
  avatar_url text,
  theme text not null default 'system',
  language text not null default 'en',
  keyboard_shortcuts_enabled boolean not null default true,
  storage_used bigint not null default 0,
  storage_limit bigint not null default 1073741824,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.noteqira_notebooks (
  id text primary key,
  owner_id text not null,
  title text not null default 'Untitled Collection',
  description text,
  cover_color text not null default '#3b82f6',
  icon text not null default 'folder',
  is_favorite boolean not null default false,
  is_archived boolean not null default false,
  parent_notebook_id text references public.noteqira_notebooks(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.noteqira_notes (
  id text primary key,
  owner_id text not null,
  notebook_id text references public.noteqira_notebooks(id) on delete set null,
  title text not null default 'Untitled',
  content jsonb not null default '{"type":"doc","content":[]}'::jsonb,
  content_plain text not null default '',
  source_type text not null default 'manual' check (source_type in ('manual', 'voice', 'image', 'document')),
  source_url text,
  source_file_name text,
  processing_status text not null default 'pending',
  is_favorite boolean not null default false,
  is_pinned boolean not null default false,
  is_archived boolean not null default false,
  deleted_at timestamptz,
  permanently_delete_at timestamptz,
  word_count integer not null default 0,
  read_time_minutes integer not null default 0,
  image_data text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.noteqira_tags (
  id text primary key,
  owner_id text not null,
  name text not null,
  color text not null default '#8A8A8A',
  created_at timestamptz not null default timezone('utc', now()),
  unique (owner_id, name)
);

create table if not exists public.noteqira_note_tags (
  id text primary key,
  owner_id text not null,
  note_id text not null references public.noteqira_notes(id) on delete cascade,
  tag_id text not null references public.noteqira_tags(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (note_id, tag_id)
);

create table if not exists public.noteqira_activity_log (
  id text primary key,
  owner_id text not null,
  action text not null,
  resource_type text not null check (resource_type in ('note', 'notebook')),
  resource_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists noteqira_notes_owner_updated_idx
  on public.noteqira_notes(owner_id, updated_at desc);

create index if not exists noteqira_notes_owner_deleted_idx
  on public.noteqira_notes(owner_id, deleted_at)
  where deleted_at is not null;

create index if not exists noteqira_notes_owner_source_idx
  on public.noteqira_notes(owner_id, source_type);

create index if not exists noteqira_notebooks_owner_sort_idx
  on public.noteqira_notebooks(owner_id, sort_order);

create index if not exists noteqira_activity_owner_created_idx
  on public.noteqira_activity_log(owner_id, created_at desc);

create or replace function public.noteqira_delete_expired_trash()
returns integer
language plpgsql
security definer
as $$
declare
  deleted_count integer;
begin
  delete from public.noteqira_notes
  where deleted_at is not null
    and permanently_delete_at is not null
    and permanently_delete_at <= timezone('utc', now());

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

alter table public.noteqira_profiles enable row level security;
alter table public.noteqira_notebooks enable row level security;
alter table public.noteqira_notes enable row level security;
alter table public.noteqira_tags enable row level security;
alter table public.noteqira_note_tags enable row level security;
alter table public.noteqira_activity_log enable row level security;

drop policy if exists noteqira_profiles_client_access on public.noteqira_profiles;
drop policy if exists noteqira_notebooks_client_access on public.noteqira_notebooks;
drop policy if exists noteqira_notes_client_access on public.noteqira_notes;
drop policy if exists noteqira_tags_client_access on public.noteqira_tags;
drop policy if exists noteqira_note_tags_client_access on public.noteqira_note_tags;
drop policy if exists noteqira_activity_log_client_access on public.noteqira_activity_log;

create policy noteqira_profiles_client_access
  on public.noteqira_profiles for all
  to anon, authenticated
  using (true)
  with check (true);

create policy noteqira_notebooks_client_access
  on public.noteqira_notebooks for all
  to anon, authenticated
  using (true)
  with check (true);

create policy noteqira_notes_client_access
  on public.noteqira_notes for all
  to anon, authenticated
  using (true)
  with check (true);

create policy noteqira_tags_client_access
  on public.noteqira_tags for all
  to anon, authenticated
  using (true)
  with check (true);

create policy noteqira_note_tags_client_access
  on public.noteqira_note_tags for all
  to anon, authenticated
  using (true)
  with check (true);

create policy noteqira_activity_log_client_access
  on public.noteqira_activity_log for all
  to anon, authenticated
  using (true)
  with check (true);
