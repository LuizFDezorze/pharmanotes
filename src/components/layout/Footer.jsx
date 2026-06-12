export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 py-4 px-4">
      <p className="text-center text-xs text-gray-400">
        Built by{' '}
        <a
          href="https://github.com/LuizFDezorze"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-600 transition-colors"
        >
          Luiz Fernando
        </a>
        {' · '}
        <a
          href="https://www.linkedin.com/in/luizfdezorze"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-600 transition-colors"
        >
          LinkedIn
        </a>
      </p>
    </footer>
  )
}
