-- PharmaNotes - Patch de policies adicionais
-- Rodar no SQL Editor do Supabase após o schema.sql inicial

-- Admin: lê todas as notas (inclusive rascunhos de todos os autores)
create policy "notes_admin_read" on notes
  for select using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

-- Admin: publica ou edita qualquer nota
create policy "notes_admin_update" on notes
  for update using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

-- Admin: exclui qualquer nota
create policy "notes_admin_delete" on notes
  for delete using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

-- Colaborador: exclui os próprios rascunhos
create policy "notes_author_delete_own" on notes
  for delete using (
    auth.uid() = author_id and status = 'draft'
  );

-- Admin: lê note_tags de qualquer nota (inclusive rascunhos)
create policy "note_tags_admin_read" on note_tags
  for select using (
    exists (select 1 from users where id = auth.uid() and role = 'admin')
  );

-- Autor: lê note_tags das próprias notas
create policy "note_tags_author_read" on note_tags
  for select using (
    exists (
      select 1 from notes
      where notes.id = note_tags.note_id
        and notes.author_id = auth.uid()
    )
  );

-- Autor ou admin podem inserir note_tags
create policy "note_tags_insert" on note_tags
  for insert with check (
    exists (
      select 1 from notes
      where notes.id = note_tags.note_id
        and notes.author_id = auth.uid()
    )
    or exists (
      select 1 from users
      where users.id = auth.uid()
        and users.role = 'admin'
    )
  );

-- Autor ou admin podem remover note_tags
create policy "note_tags_delete" on note_tags
  for delete using (
    exists (
      select 1 from notes
      where notes.id = note_tags.note_id
        and notes.author_id = auth.uid()
    )
    or exists (
      select 1 from users
      where users.id = auth.uid()
        and users.role = 'admin'
    )
  );

-- Qualquer usuário ativo pode criar tags novas
create policy "tags_insert" on tags
  for insert with check (
    exists (
      select 1 from users
      where users.id = auth.uid()
        and users.status = 'active'
    )
  );
