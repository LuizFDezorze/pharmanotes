import { Link } from 'react-router-dom'
import SEO from '../components/SEO'

export default function AboutPage() {
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

        <div className="flex flex-col gap-5 text-sm text-gray-600 leading-relaxed">
          <p>
            O <strong className="text-gray-900">PharmaNotes</strong> é uma
            plataforma colaborativa de notas clínicas e referências
            farmacêuticas. Nosso objetivo é centralizar informações confiáveis
            sobre fármacos, protocolos, alertas e farmacocinética em um único
            lugar acessível.
          </p>

          <p>
            Todo o conteúdo é produzido por profissionais da área farmacêutica e
            revisado antes da publicação, garantindo qualidade e confiabilidade
            nas informações disponibilizadas.
          </p>

          <div>
            <h2 className="text-base font-medium text-gray-900 mb-2">
              Como funciona
            </h2>
            <ul className="list-disc list-inside flex flex-col gap-1.5 text-gray-600">
              <li>
                <strong className="text-gray-700">Acesso livre</strong> — qualquer
                pessoa pode ler as notas publicadas no feed
              </li>
              <li>
                <strong className="text-gray-700">Colaboração</strong> — profissionais
                cadastrados podem submeter notas para revisão
              </li>
              <li>
                <strong className="text-gray-700">Curadoria</strong> — todas as notas
                passam por revisão antes de serem publicadas
              </li>
              <li>
                <strong className="text-gray-700">Favoritos</strong> — salve notas
                para consulta rápida no seu painel
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-medium text-gray-900 mb-2">
              Quer contribuir?
            </h2>
            <p>
              Se você é farmacêutico, residente ou profissional da saúde e quer
              compartilhar conhecimento,{' '}
              <Link
                to="/register"
                className="font-medium text-gray-900 underline underline-offset-2 hover:text-gray-700 transition-colors"
              >
                crie sua conta
              </Link>{' '}
              e comece a colaborar. Seu cadastro será analisado pela equipe
              antes da aprovação.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100">
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
          </div>
        </div>
      </article>
    </main>
  )
}
