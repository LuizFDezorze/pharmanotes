-- PharmaNotes - Favoritos
-- Rodar no SQL Editor do Supabase

create table favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  note_id uuid not null references notes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, note_id)
);

alter table favorites enable row level security;

create policy "favorites_own_read" on favorites
  for select using (auth.uid() = user_id);

create policy "favorites_own_insert" on favorites
  for insert with check (auth.uid() = user_id);

create policy "favorites_own_delete" on favorites
  for delete using (auth.uid() = user_id);
