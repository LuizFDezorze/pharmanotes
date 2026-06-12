-- PharmaNotes – Migração de categorias
-- Execute no Supabase SQL Editor

-- 1. Mover notas das categorias extintas para NULL-safe fallback
--    (as notas existentes terão category_id inválido após o delete;
--     o ON DELETE RESTRICT impede deletar se houver notas vinculadas)
--    Se houver notas nas categorias antigas, reatribua-as manualmente ou
--    use o bloco abaixo para reatribuí-las à primeira nova categoria.

-- Verificar notas vinculadas às categorias que serão removidas:
-- SELECT n.id, n.title, c.name
-- FROM notes n JOIN categories c ON c.id = n.category_id
-- WHERE c.name IN ('Alertas','Fármacos','Farmacocinética','Geral');

-- 2. Deletar categorias antigas (todas exceto 'Protocolos', que continua)
DELETE FROM categories
WHERE name IN ('Alertas', 'Fármacos', 'Farmacocinética', 'Geral');

-- 3. Inserir novas categorias
INSERT INTO categories (name) VALUES
  ('Alto Risco'),
  ('Cálculos'),
  ('Cardiovascular'),
  ('Gastroenterologia'),
  ('Microbiologia'),
  ('Pneumologia'),
  ('PK/PD'),
  ('SNC')
ON CONFLICT (name) DO NOTHING;

-- 'Protocolos' já existe e é mantida.

-- Resultado esperado (9 categorias):
-- Alto Risco, Cálculos, Cardiovascular, Gastroenterologia,
-- Microbiologia, Pneumologia, PK/PD, Protocolos, SNC
