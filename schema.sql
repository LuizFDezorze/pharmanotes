-- PharmaNotes - Supabase Schema

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- CATEGORIES
-- ============================================================
create table categories (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique
);

insert into categories (name) values
  ('Alertas'),
  ('Fármacos'),
  ('Protocolos'),
  ('Farmacocinética'),
  ('Geral');

-- ============================================================
-- USERS (mirrors auth.users via trigger)
-- ============================================================
create table users (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text        not null,
  email      text        not null unique,
  role       text        not null default 'collaborator' check (role in ('admin', 'collaborator')),
  status     text        not null default 'pending'      check (status in ('pending', 'active', 'rejected')),
  created_at timestamptz not null default now()
);

-- Auto-insert on Supabase signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into users (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ============================================================
-- NOTES
-- ============================================================
create table notes (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid        not null references users(id) on delete cascade,
  category_id uuid        not null references categories(id),
  title       text        not null,
  content     text        not null,
  status      text        not null default 'draft' check (status in ('draft', 'published')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger notes_updated_at
  before update on notes
  for each row execute procedure set_updated_at();

-- ============================================================
-- TAGS
-- ============================================================
create table tags (
  id   uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- ============================================================
-- NOTE_TAGS (junction)
-- ============================================================
create table note_tags (
  note_id uuid not null references notes(id) on delete cascade,
  tag_id  uuid not null references tags(id)  on delete cascade,
  primary key (note_id, tag_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table users      enable row level security;
alter table notes      enable row level security;
alter table categories enable row level security;
alter table tags       enable row level security;
alter table note_tags  enable row level security;

-- Categories & Tags: public read
create policy "categories_public_read" on categories for select using (true);
create policy "tags_public_read"       on tags       for select using (true);

-- Notes: published notes are public
create policy "notes_public_read" on notes
  for select using (status = 'published');

-- Notes: authors see their own drafts
create policy "notes_author_read_own" on notes
  for select using (auth.uid() = author_id);

-- Notes: collaborators insert (lands as draft)
create policy "notes_collaborator_insert" on notes
  for insert with check (
    auth.uid() = author_id
    and exists (
      select 1 from users
      where id = auth.uid() and status = 'active'
    )
  );

-- Notes: authors update their own drafts
create policy "notes_author_update_own" on notes
  for update using (
    auth.uid() = author_id and status = 'draft'
  );

-- Note_tags: same visibility as notes
create policy "note_tags_public_read" on note_tags
  for select using (
    exists (select 1 from notes where id = note_id and status = 'published')
  );

-- Users: each user sees their own row
create policy "users_self_read" on users
  for select using (auth.uid() = id);

-- Users: admin sees all
create policy "users_admin_read" on users
  for select using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

-- Users: admin updates (approve/reject)
create policy "users_admin_update" on users
  for update using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );
