import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { supabase } from '../lib/supabase'
import SEO from '../components/SEO'

const FALLBACK = `
<p>
  O <strong>PharmaNotes</strong> é uma plataforma colaborativa de notas clínicas
  e referências farmacêuticas. Nosso objetivo é centralizar informações
  confiáveis sobre fármacos, protocolos, alertas e farmacocinética em um único
  lugar acessível.
</p>
<p>
  Todo o conteúdo é produzido por profissionais da área farmacêutica e revisado
  antes da publicação, garantindo qualidade e confiabilidade nas informações
  disponibilizadas.
</p>
<h2>Como funciona</h2>
<ul>
  <li><strong>Acesso livre</strong> — qualquer pessoa pode ler as notas publicadas no feed</li>
  <li><strong>Colaboração</strong> — profissionais cadastrados podem submeter notas para revisão</li>
  <li><strong>Curadoria</strong> — todas as notas passam por revisão antes de serem publicadas</li>
  <li><strong>Favoritos</strong> — salve notas para consulta rápida no seu painel</li>
</ul>
<h2>Quer contribuir?</h2>
<p>
  Se você é farmacêutico, residente ou profissional da saúde e quer
  compartilhar conhecimento, crie sua conta e comece a colaborar. Seu cadastro
  será analisado pela equipe antes da aprovação.
</p>
`

export default function AboutPage() {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'about_content')
      .single()
      .then(({ data }) => {
        setContent(data?.value || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const html = content || FALLBACK

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 w-full">
      <SEO
        title="Sobre"
        description="Conheça o PharmaNotes: plataforma colaborativa de notas clínicas e referências farmacêuticas revisadas por especialistas."
        path="/about"
      />

      <article className="bg-white border border-gray-200 rounded-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">💊</span>
          <h1 className="text-xl font-semibold text-gray-900">
            Sobre o PharmaNotes
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <div
              className="prose prose-sm max-w-none text-gray-600"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
            />
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Desenvolvido por{' '}
                <a
                  href="https://www.linkedin.com/in/luizfdezorze"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-600 transition-colors"
                >
                  Luiz Fernando
                </a>
              </p>
              <Link
                to="/register"
                className="text-xs font-medium text-gray-900 hover:underline"
              >
                Criar conta →
              </Link>
            </div>
          </div>
        )}
      </article>
    </main>
  )
}
