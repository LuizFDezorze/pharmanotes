import { Helmet } from 'react-helmet-async'

const SITE = 'PharmaNotes'
const BASE_URL = 'https://pharmanotes.vercel.app'
const DEFAULT_DESCRIPTION =
  'Plataforma colaborativa de notas clínicas, alertas farmacêuticos, protocolos e referências de farmacocinética revisadas por especialistas.'

export default function SEO({ title, description, path = '/' }) {
  const pageTitle = title ? `${title} — ${SITE}` : `${SITE} — Notas clínicas e referências farmacêuticas`
  const desc = description || DEFAULT_DESCRIPTION
  const url = `${BASE_URL}${path}`

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={desc} />
    </Helmet>
  )
}
