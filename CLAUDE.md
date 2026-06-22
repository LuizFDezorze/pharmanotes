# PharmaNotes

Plataforma colaborativa de notas clínicas e referências farmacêuticas.

## Stack

- **Frontend:** React 19 + Vite + Tailwind CSS 4
- **Backend/Auth/DB:** Supabase (PostgreSQL com RLS, Auth, Storage)
- **Deploy:** Vercel (pharmanotes.vercel.app)
- **Editor de texto:** TipTap v3 (rich text)
- **Analytics:** Vercel Analytics (plano Hobby)

## Comandos

```bash
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção
npm run lint     # eslint
```

## Estrutura do projeto

```
src/
├── components/
│   ├── SEO.jsx                    # meta tags dinâmicas (react-helmet-async)
│   ├── editor/RichTextEditor.jsx  # editor TipTap
│   ├── layout/Header.jsx
│   ├── layout/Footer.jsx
│   ├── layout/ProtectedRoute.jsx  # guarda rotas por role/status
│   └── notes/
│       ├── CategoryFilter.jsx
│       ├── FavoriteButton.jsx
│       └── NoteCard.jsx
├── context/AuthContext.jsx        # auth state global (Supabase Auth)
├── hooks/useFavorites.js          # toggle otimista de favoritos
├── lib/
│   ├── supabase.js                # cliente Supabase (env vars)
│   └── utils.js                   # formatDate, initials, avatarColor, stripHtml, normalizeNote
├── data/mock.js                   # só categoryColors (não há mocks)
└── pages/
    ├── PublicFeed.jsx             # / — feed com filtro, busca, paginação
    ├── NotePage.jsx               # /notes/:id
    ├── ProfilePage.jsx            # /profile/:id — perfil público do colaborador
    ├── AboutPage.jsx              # /about — conteúdo do banco com fallback estático
    ├── LoginPage.jsx              # /login
    ├── RegisterPage.jsx           # /register
    ├── ForgotPasswordPage.jsx     # /forgot-password
    ├── ResetPasswordPage.jsx      # /reset-password
    ├── admin/AdminDashboard.jsx   # /admin — gestão de notas, usuários e página Sobre
    └── collaborator/
        └── CollaboratorDashboard.jsx  # /dashboard — minhas notas, bio, favoritos
```

## Modelo de dados (Supabase)

- **users** — id, name, email, role (admin|collaborator), status (pending|active|rejected), bio, created_at
- **notes** — id, author_id, category_id, title, content (HTML do TipTap), status (draft|published), created_at, updated_at
- **categories** — id, name
- **tags** — id, name
- **note_tags** — note_id, tag_id (junction)
- **favorites** — user_id, note_id, created_at
- **site_settings** — key (text PK), value (text) — conteúdo editável (ex: página Sobre)

### RLS

- Funções `is_admin()` e `is_active_user()` com `SECURITY DEFINER` para evitar recursão
- Notas publicadas: leitura pública; drafts: só o autor
- Favoritos: cada usuário gerencia os seus
- Perfil: leitura pública para usuários ativos; self-update da bio
- site_settings: leitura pública, escrita apenas admin

### Migrations (SQL files na raiz)

- `schema.sql` — schema inicial
- `schema_fix_recursion.sql` — fix RLS recursion
- `schema_patch.sql` — patches incrementais
- `schema_favorites.sql` — tabela favorites
- `schema_profile.sql` — coluna bio + policies de perfil
- `schema_site_settings.sql` — tabela site_settings (página Sobre editável)

## Segurança

- HTML das notas sanitizado com **DOMPurify** antes de renderizar (previne XSS)
- Chaves Supabase via variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- `.env` no `.gitignore`

## SEO

- `index.html` com meta tags padrão (Open Graph, Twitter Cards, lang pt-BR)
- Componente `<SEO>` com react-helmet-async para meta tags dinâmicas por página
- Cada nota e perfil tem título e description próprios

## Convenções

- Idioma da UI: português brasileiro
- Commits em português, prefixo convencional (feat/fix)
- Componentes React em JSX (não TypeScript)
- Estilos: Tailwind utility classes, sem CSS custom
- Sem testes automatizados por enquanto
