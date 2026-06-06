import { categoryColors } from '../../data/mock'

export default function CategoryFilter({ categories, selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selected === null
            ? 'bg-gray-900 text-white'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
        }`}
      >
        Todas
      </button>

      {categories.map((cat) => {
        const color = categoryColors[cat.name] ?? categoryColors['Geral']
        const active = selected === cat.id

        return (
          <button
            key={cat.id}
            onClick={() => onChange(active ? null : cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
              active
                ? `${color.bg} ${color.text}`
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {cat.name}
          </button>
        )
      })}
    </div>
  )
}
