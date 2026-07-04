# PharmaNotes

Plataforma colaborativa de notas clínicas e referências farmacêuticas.

## Stack

- **Frontend:** React 19 + Vite + Tailwind CSS 4
- **Backend/Auth/DB:** Supabase (PostgreSQL com RLS, Auth, Storage)
- **Deploy:** Vercel (pharmanotes.vercel.app)
- **Editor de texto:** TipTap v3 (rich text) — extensões: StarterKit, Table (resizable), Image, Underline, Superscript, Subscript, TextAlign, TextStyle, FontFamily, FontSize
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
    ├── PublicFeed.jsx             # / — feed com filtro, busca, paginação, subtítulo editável
    ├── NotePage.jsx               # /notes/:id
    ├── ProfilePage.jsx            # /profile/:id — perfil público do colaborador
    ├── AboutPage.jsx              # /about — conteúdo do banco com fallback estático
    ├── LoginPage.jsx              # /login
    ├── RegisterPage.jsx           # /register
    ├── ForgotPasswordPage.jsx     # /forgot-password
    ├── ResetPasswordPage.jsx      # /reset-password
    ├── admin/AdminDashboard.jsx   # /admin — tabs: Usuários, Notas, Site (subtítulo + Sobre)
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
- **site_settings** — key (text PK), value (text) — conteúdo editável (chaves: about_content, feed_subtitle)

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
- `schema_site_settings.sql` — tabela site_settings (Sobre + subtítulo do feed)

## Editor (RichTextEditor.jsx)

Toolbar em grupos:

```
[Fonte▼] [Tam▼]  |  B  I  U  X²  X₂  |  H1  H2  H3  |  Esq  Cen  Dir  Jus  |  • Lista  1. Lista  ⇥  ⇤  |  Tabela  |  🔗  |  Ω
```

- **Fonte:** família (Padrão, Sans-serif, Serif, Mono, Sistema) e tamanho (10–48px) via dropdowns; usam `TextStyle` + `FontFamily` + `FontSize` do pacote `@tiptap/extension-text-style` (named exports, sem default)
- **Formatação inline:** negrito, itálico, sublinhado, sobrescrito (`<sup>`), subscrito (`<sub>`)
- **Alinhamento:** esquerda/centro/direita/justificado via `TextAlign` (`style="text-align"` — preservado pelo DOMPurify por padrão)
- **Listas:** bullet, numerada, recuo ⇥/⇤ (`sinkListItem`/`liftListItem`)
- **Tabela:** inserir, +coluna, +linha, excluir; redimensionamento de colunas por arrasto (`resizable: true`) com handle `.column-resize-handle` estilizado em `index.css`
- **Link para nota (🔗):** `@tiptap/extension-link` com `openOnClick: false`, `autolink: false`, `linkOnPaste: false`, `protocols: ['http', 'https']` — o único jeito de criar um link é pelo seletor `NoteLinkPicker`, que busca notas **publicadas** (`status = 'published'`) por título e insere `href="/notes/{id}"`; não existe campo de URL livre, então o autor nunca digita um `href` diretamente. `NotePage.jsx` e `NoteCard.jsx` interceptam cliques em `<a href="/notes/...">` dentro do HTML renderizado e navegam via `react-router` (`navigate()`) em vez de recarregar a página; em `NoteCard.jsx` o clique também dá `stopPropagation` para não disparar a navegação do card inteiro.
- **Paleta Ω:** 31 símbolos Unicode em 4 grupos (Gregos, Operadores, Setas, Outros) — inseridos como texto puro, zero impacto no DOMPurify
- **Imagem:** upload para Supabase Storage (`note-images/`), URL pública inserida no editor

> Não usar `overflow-hidden` no wrapper do editor — o painel Ω usa `position: absolute` e seria cortado.

## Segurança

- HTML das notas sanitizado com **DOMPurify** antes de renderizar (previne XSS) — é a barreira final mesmo que conteúdo colado no editor traga atributos inesperados (ex: DOMPurify já remove `href="javascript:..."` por padrão)
- `style` está no allowlist padrão do DOMPurify — `text-align` funciona sem configuração extra
- Links entre notas nunca aceitam `href` livre digitado pelo autor (ver seção Editor acima) — reduz a superfície de ataque a "qual nota publicada escolher", não "qual URL/protocolo injetar"
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
