import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ paginacion, onChange }) {
  if (!paginacion || paginacion.totalPaginas <= 1) return null
  const { pagina, totalPaginas, total, limite } = paginacion
  const desde = (pagina - 1) * limite + 1
  const hasta = Math.min(pagina * limite, total)

  return (
    <div className="flex items-center justify-between px-1 py-3 text-[11px] font-semibold text-gray-400">
      <span>Mostrando {desde}–{hasta} de {total}</span>
      <div className="flex gap-1">
        <button
          onClick={() => onChange(pagina - 1)}
          disabled={pagina === 1}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
          const p = Math.max(1, Math.min(pagina - 2 + i, totalPaginas - 4 + i))
          return (
            <button key={p} onClick={() => onChange(p)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                p === pagina
                  ? 'bg-red-600 text-white shadow-md'
                  : 'hover:bg-gray-100 text-gray-500'
              }`}>
              {p}
            </button>
          )
        })}
        <button
          onClick={() => onChange(pagina + 1)}
          disabled={pagina === totalPaginas}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}