const AVATAR_COLORS = [
  'bg-teal-500',
  'bg-indigo-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-emerald-500',
]

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function initials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}

export function avatarColor(name = '') {
  let hash = 0
  for (const ch of name) hash = ch.charCodeAt(0) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function normalizeNote(n) {
  return {
    id: n.id,
    title: n.title,
    content: n.content,
    status: n.status,
    date: n.created_at,
    category: n.categories?.name ?? 'Geral',
    author: {
      name: n.users?.name ?? 'Autor',
      role: n.users?.role ?? 'collaborator',
    },
    tags: n.note_tags?.map((nt) => nt.tags?.name).filter(Boolean) ?? [],
  }
}
