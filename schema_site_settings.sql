-- PharmaNotes - Configurações do site (página Sobre editável)
-- Rodar no SQL Editor do Supabase

create table site_settings (
  key   text primary key,
  value text not null default ''
);

alter table site_settings enable row level security;

-- Leitura pública
create policy "site_settings_public_read" on site_settings
  for select using (true);

-- Apenas admin edita
create policy "site_settings_admin_update" on site_settings
  for update using (is_admin());

create policy "site_settings_admin_insert" on site_settings
  for insert with check (is_admin());

-- Inserir valores iniciais vazios (frontend usa fallback quando vazio)
insert into site_settings (key, value) values
  ('about_content', ''),
  ('feed_subtitle', '');
