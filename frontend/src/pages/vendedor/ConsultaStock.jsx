import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { inventarioApi } from '../../api/inventario.api.js'
import { PageLoader } from '../../components/ui/index.jsx'
import SearchBar from '../../components/SearchBar.jsx'
import { Package, Store } from 'lucide-react'
import api from '../../api/axios.js'

const TIENDA_COLORES = {
  1: 'bg-blue-100 text-blue-700',
  2: 'bg-emerald-100 text-emerald-700',
  3: 'bg-violet-100 text-violet-700',
}

export default function ConsultaStock() {
  const [buscar, setBuscar] = useState('')
  const [tiendaFiltro, setTiendaFiltro] = useState('')

  const { data: tiendas } = useQuery({
    queryKey: ['tiendas'],
    queryFn: () => api.get('/tiendas').then(r => r.data.datos),
  })

  const { data: items, isLoading } = useQuery({
    queryKey: ['inventario-vendedor', tiendaFiltro],
    queryFn: () => inventarioApi.listar(tiendaFiltro ? { id_tienda: tiendaFiltro } : {}).then(r => r.data.datos),
  })

  const filtrado = items?.filter(i =>
    !buscar ||
    i.producto?.toLowerCase().includes(buscar.toLowerCase()) ||
    i.codigo_producto?.toLowerCase().includes(buscar.toLowerCase()) ||
    i.nombre_categoria?.toLowerCase().includes(buscar.toLowerCase())
  ) || []

  return (
    <div className="space-y-5">
      <h1 className="page-title">Consultar stock</h1>

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <SearchBar
          placeholder="Buscar por nombre, código o categoría..."
          onSearch={setBuscar}
          className="flex-1 min-w-48"
        />
        <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2 py-1">
          <Store size={14} className="text-gray-500" />
          <select className="bg-transparent text-xs font-medium text-gray-700 focus:outline-none cursor-pointer pr-1"
            value={tiendaFiltro} onChange={e => setTiendaFiltro(e.target.value)}>
            <option value="">Mi tienda</option>
            {tiendas?.map(t => (
              <option key={t.id_tienda} value={t.id_tienda}>{t.nombre_tienda}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card">
        {isLoading ? <PageLoader /> : (
          <div className="overflow-x-auto">
            <table className="table-auto w-full">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Marca</th>
                  <th>Tienda</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Disponibilidad</th>
                </tr>
              </thead>
              <tbody>
                {filtrado.map(i => {
                  const tc = TIENDA_COLORES[i.id_tienda] || TIENDA_COLORES[1]
                  return (
                    <tr key={i.id_inventario}>
                      <td className="font-mono text-xs text-gray-500">{i.codigo_producto}</td>
                      <td>
                        <p className="text-sm font-medium text-gray-900">{i.producto}</p>
                        {i.modelo && <p className="text-xs text-gray-400">{i.modelo}</p>}
                      </td>
                      <td><span className="badge-blue">{i.nombre_categoria}</span></td>
                      <td><span className="badge-gray">{i.nombre_marca}</span></td>
                      <td>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tc}`}>
                          {i.nombre_tienda}
                        </span>
                      </td>
                      <td className="font-semibold text-sm text-gray-900">
                        {new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(i.precio || 0)}
                      </td>
                      <td>
                        <span className={`font-bold text-sm ${
                          i.stock === 0 ? 'text-red-600' :
                          i.stock <= i.stock_minimo ? 'text-orange-500' :
                          'text-green-600'
                        }`}>{i.stock}</span>
                      </td>
                      <td>
                        {i.stock === 0
                          ? <span className="badge-red">Agotado</span>
                          : i.stock <= i.stock_minimo
                            ? <span className="badge-yellow">Bajo</span>
                            : <span className="badge-green">Disponible</span>
                        }
                      </td>
                    </tr>
                  )
                })}
                {filtrado.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      <Package size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No se encontraron productos</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Puedes consultar el stock de cualquier tienda. Los productos se pueden traer entre tiendas para la venta.
      </p>
    </div>
  )
}