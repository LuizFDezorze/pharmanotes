-- PharmaNotes - Perfil do colaborador
-- Rodar no SQL Editor do Supabase

alter table users add column if not exists bio text default '';

-- Permitir leitura pública do perfil de usuários ativos
create policy "users_public_profile" on users
  for select using (status = 'active');

-- Colaborador atualiza seu próprio perfil
create policy "users_self_update" on users
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select role from users where id = auth.uid())
    and status = (select status from users where id = auth.uid())
  );
