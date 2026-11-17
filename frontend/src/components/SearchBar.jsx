import { Search, X } from 'lucide-react'
import { useState } from 'react'

export default function SearchBar({ placeholder = 'Buscar...', onSearch, className = '' }) {
  const [valor, setValor] = useState('')

  const handleChange = (e) => {
    setValor(e.target.value)
    onSearch(e.target.value)
  }

  const limpiar = () => {
    setValor('')
    onSearch('')
  }

  return (
    <div className={`relative ${className}`}>
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={valor}
        onChange={handleChange}
        placeholder={placeholder}
        className="input pl-9 pr-8"
      />
      {valor && (
        <button onClick={limpiar} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          <X size={14} />
        </button>
      )}
    </div>
  )
}