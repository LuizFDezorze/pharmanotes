# 💊 PharmaNotes

A collaborative clinical pharmacy notes app where hospital pharmacists can write, review, and publish evidence-based drug references — built for real clinical use.

**Live app → [pharmanotes.vercel.app](https://pharmanotes.vercel.app)**

---

## Features

- **Public feed** — Browse published clinical notes filtered by category and full-text search
- **Rich text editor** — Create notes with TipTap (headings, bold/italic/underline, lists, tables, images)
- **Role-based access** — Collaborators write drafts; admins review, publish, and manage all content
- **Approval workflow** — New registrations require admin approval before access is granted
- **Tag system** — Tag notes with drug names, conditions, or topics for easier discovery
- **Categories** — Alto Risco, Cálculos, Cardiovascular, Gastroenterologia, Microbiologia, Pneumologia, PK/PD, Protocolos, SNC
- **Password recovery** — Full email-based reset flow

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | [React 19](https://react.dev) + [Vite 8](https://vite.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Rich text | [TipTap v3](https://tiptap.dev) |
| Backend / Auth / DB | [Supabase](https://supabase.com) (Postgres + RLS + Auth + Storage) |
| Deployment | [Vercel](https://vercel.com) |

## Running locally

```bash
# 1. Clone the repository
git clone https://github.com/LuizFDezorze/pharmanotes.git
cd pharmanotes

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in your Supabase project URL and anon key

# 4. Start the dev server
npm run dev
```

### Environment variables

Create a `.env` file at the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Database setup

Run the SQL files in order on your Supabase project:

1. `schema.sql` — tables, triggers, and base RLS policies
2. `schema_patch.sql` — additional admin policies
3. `schema_fix_recursion.sql` — security-definer helpers to prevent RLS recursion
4. `migrate_categories.sql` — current clinical categories

## Contributing

PharmaNotes is an invite-style platform for clinical pharmacists:

1. **Register** at [pharmanotes.vercel.app/register](https://pharmanotes.vercel.app/register)
2. Wait for **admin approval** — your account starts as `pending`
3. Once approved, log in and access **Minhas Notas** to create drafts
4. Drafts are reviewed and published by an admin

## Author

**Luiz Fernando Dezorze**  
Hospital Pharmacist & Developer  
[GitHub](https://github.com/LuizFDezorze) · [LinkedIn](https://www.linkedin.com/in/luizfdezorze)

---

<sub>Built with React, Supabase, and TipTap · Deployed on Vercel</sub>
