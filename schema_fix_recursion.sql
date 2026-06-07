-- PharmaNotes - Fix: recursão infinita nas RLS policies de `users`
-- Rodar no SQL Editor do Supabase

-- ====================================================================
-- 1. Funções auxiliares (SECURITY DEFINER ignora RLS internamente,
--    quebrando o ciclo de recursão)
-- ====================================================================
create or replace function is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function is_active_user()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and status = 'active'
  );
$$;

-- ====================================================================
-- 2. Recriar policies de `users` usando as funções
-- ====================================================================
drop policy if exists "users_admin_read" on users;
drop policy if exists "users_admin_update" on users;

create policy "users_admin_read" on users
  for select using (is_admin());

create policy "users_admin_update" on users
  for update using (is_admin());

-- ====================================================================
-- 3. Recriar policies de `notes` que consultavam `users` diretamente
-- ====================================================================
drop policy if exists "notes_collaborator_insert" on notes;
drop policy if exists "notes_admin_read" on notes;
drop policy if exists "notes_admin_update" on notes;
drop policy if exists "notes_admin_delete" on notes;

create policy "notes_collaborator_insert" on notes
  for insert with check (
    auth.uid() = author_id and is_active_user()
  );

create policy "notes_admin_read" on notes
  for select using (is_admin());

create policy "notes_admin_update" on notes
  for update using (is_admin());

create policy "notes_admin_delete" on notes
  for delete using (is_admin());

-- ====================================================================
-- 4. Recriar policies de `note_tags` que consultavam `users` diretamente
-- ====================================================================
drop policy if exists "note_tags_admin_read" on note_tags;
drop policy if exists "note_tags_insert" on note_tags;
drop policy if exists "note_tags_delete" on note_tags;

create policy "note_tags_admin_read" on note_tags
  for select using (is_admin());

create policy "note_tags_insert" on note_tags
  for insert with check (
    exists (
      select 1 from notes
      where notes.id = note_tags.note_id
        and notes.author_id = auth.uid()
    )
    or is_admin()
  );

create policy "note_tags_delete" on note_tags
  for delete using (
    exists (
      select 1 from notes
      where notes.id = note_tags.note_id
        and notes.author_id = auth.uid()
    )
    or is_admin()
  );

-- ====================================================================
-- 5. Recriar policy de `tags` que consultava `users` diretamente
-- ====================================================================
drop policy if exists "tags_insert" on tags;

create policy "tags_insert" on tags
  for insert with check (is_active_user());
