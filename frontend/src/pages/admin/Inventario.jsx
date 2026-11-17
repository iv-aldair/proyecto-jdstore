import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inventarioApi } from '../../api/inventario.api.js'
import { PageLoader, Modal } from '../../components/ui/index.jsx'
import SearchBar from '../../components/SearchBar.jsx'
import { formatMoneda } from '../../utils/formatMoneda.js'
import { Edit2, Save, X, Barcode, Trash2, Store, Settings2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios.js'
import { productosApi } from '../../api/productos.api.js'

const TIENDA_COLORES = {
  1: { badge: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500' },
  2: { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  3: { badge: 'bg-violet-100 text-violet-700',   dot: 'bg-violet-500' },
}

// ModalSeries Component
function ModalSeries({ open, onClose, item, onGuardado }) {
  const [nuevaSerie, setNuevaSerie] = useState('')
  const qc = useQueryClient()

  const { data: series, isLoading } = useQuery({
    queryKey: ['series', item?.id_producto],
    queryFn: () => productosApi.series.listar({ id_producto: item.id_producto, limite: 100 }).then(r => r.data.datos.series),
    enabled: !!item?.id_producto && open,
  })

  const agregarSerie = useMutation({
    mutationFn: (ns) => productosApi.series.crear({ id_producto: item.id_producto, numero_serie: ns, id_tienda: item.id_tienda }),
    onSuccess: () => {
      toast.success('Serie agregada')
      setNuevaSerie('')
      qc.invalidateQueries(['series', item?.id_producto])
      onGuardado()
    },
    onError: (e) => toast.error(e.response?.data?.mensaje || 'Error al agregar')
  })

  const eliminarSerie = useMutation({
    mutationFn: (id) => productosApi.series.eliminar(id),
    onSuccess: () => {
      toast.success('Serie desactivada')
      qc.invalidateQueries(['series', item?.id_producto])
      onGuardado()
    },
    onError: (e) => toast.error(e.response?.data?.mensaje || 'Error al eliminar')
  })

  if (!item) return null

  return (
    <Modal open={open} onClose={onClose} title={`Series: ${item.producto}`} maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="flex gap-2">
          <input 
            type="text" className="input flex-1 uppercase" 
            placeholder="Escanear o escribir S/N..."
            value={nuevaSerie}
            onChange={e => setNuevaSerie(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && nuevaSerie && agregarSerie.mutate(nuevaSerie)}
            autoFocus
          />
          <button 
            className="btn-primary"
            disabled={!nuevaSerie || agregarSerie.isPending}
            onClick={() => agregarSerie.mutate(nuevaSerie)}
          >
            Agregar
          </button>
        </div>
        
        <div className="border border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-gray-500">Cargando...</div>
          ) : series?.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No hay series registradas</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-3 py-2 font-medium">S/N</th>
                  <th className="px-3 py-2 font-medium">Estado</th>
                  <th className="px-3 py-2 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {series?.map(s => (
                  <tr key={s.id_serie}>
                    <td className="px-3 py-2 font-mono text-xs">{s.numero_serie}</td>
                    <td className="px-3 py-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${s.estado === 1 ? 'bg-green-100 text-green-700' : s.estado === 2 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {s.estado_texto}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      {s.estado === 1 && (
                        <button 
                          onClick={() => { if(confirm('¿Desactivar esta serie? Se reducirá el stock.')) eliminarSerie.mutate(s.id_serie) }}
                          className="text-red-400 hover:text-red-600" title="Desactivar (Reduce Stock)"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="text-xs text-gray-400">
          * Al agregar o eliminar series disponibles, el stock general en Inventario se actualizará automáticamente.
        </p>
      </div>
    </Modal>
  )
}

// ModalAsignar — Asignar/quitar productos de tiendas
function ModalAsignar({ open, onClose }) {
  const qc = useQueryClient()
  const [tiendaSel, setTiendaSel] = useState('')
  const [buscar, setBuscar] = useState('')

  const { data: tiendas } = useQuery({
    queryKey: ['tiendas'],
    queryFn: () => api.get('/tiendas').then(r => r.data.datos),
  })

  const { data: todosProductos } = useQuery({
    queryKey: ['productos-todos'],
    queryFn: () => productosApi.listar({ limite: 500, estado: 1 }).then(r => r.data.datos.productos),
    enabled: open,
  })

  const { data: invGlobal } = useQuery({
    queryKey: ['inventario-global'],
    queryFn: () => inventarioApi.listarGlobal().then(r => r.data.datos),
    enabled: open,
  })

  const asignar = useMutation({
    mutationFn: (datos) => inventarioApi.asignar(datos),
    onSuccess: () => { toast.success('Producto asignado'); qc.invalidateQueries(['inventario-global']); qc.invalidateQueries(['inventario']); },
    onError: (e) => toast.error(e.response?.data?.mensaje || 'Error'),
  })

  const quitar = useMutation({
    mutationFn: ({ id_producto, id_tienda }) => inventarioApi.quitar(id_producto, id_tienda),
    onSuccess: () => { toast.success('Producto quitado'); qc.invalidateQueries(['inventario-global']); qc.invalidateQueries(['inventario']); },
    onError: (e) => toast.error(e.response?.data?.mensaje || 'No se puede quitar (tiene stock)'),
  })

  const productosEnTienda = new Set(
    (invGlobal || []).filter(i => String(i.id_tienda) === tiendaSel).map(i => i.id_producto)
  )

  const productosFiltrados = (todosProductos || []).filter(p => {
    if (!buscar) return true
    const term = buscar.toLowerCase()
    return (p.nombre || '').toLowerCase().includes(term) ||
           (p.codigo_producto || '').toLowerCase().includes(term) ||
           (p.modelo || '').toLowerCase().includes(term)
  })

  return (
    <Modal open={open} onClose={onClose} title="Asignar productos a tiendas" maxWidth="max-w-xl">
      <div className="space-y-4">
        <div>
          <label className="label">Selecciona una tienda</label>
          <select className="input" value={tiendaSel} onChange={e => setTiendaSel(e.target.value)}>
            <option value="">— Seleccionar tienda —</option>
            {tiendas?.map(t => <option key={t.id_tienda} value={t.id_tienda}>{t.nombre_tienda}</option>)}
          </select>
        </div>

        {tiendaSel && (
          <div className="space-y-3">
            <SearchBar placeholder="Buscar por nombre, código o modelo..." onSearch={setBuscar} />
            <div className="border border-gray-200 rounded-lg max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">Producto</th>
                  <th className="px-3 py-2 text-center font-medium text-gray-600 w-24">Asignado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productosFiltrados?.map(p => {
                  const asignado = productosEnTienda.has(p.id_producto)
                  return (
                    <tr key={p.id_producto} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <p className="font-medium text-gray-800 text-xs">{p.nombre}</p>
                        <p className="text-[10px] text-gray-400">{p.modelo || 'Sin modelo'}</p>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => asignado
                            ? quitar.mutate({ id_producto: p.id_producto, id_tienda: parseInt(tiendaSel) })
                            : asignar.mutate({ id_producto: p.id_producto, id_tienda: parseInt(tiendaSel) })
                          }
                          disabled={asignar.isPending || quitar.isPending}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${asignado ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${asignado ? 'translate-x-4' : 'translate-x-0.5'}`} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          </div>
        )}
        <p className="text-xs text-gray-400">Solo se pueden quitar productos con stock 0 en esa tienda.</p>
      </div>
    </Modal>
  )
}

// Fila editable inline
function FilaInventario({ item, onGuardado, onAbrirSeries, mostrarTienda }) {
  const [editando, setEditando] = useState(false)
  const [vals, setVals] = useState({
    precio_costo_pen: item.precio_costo_pen ?? '',
    stock_minimo:     item.stock_minimo     ?? 5,
    precio:           item.precio           ?? 0,
    stock:            item.stock            ?? 0,
  })

  const guardar = async () => {
    try {
      if (vals.precio_costo_pen !== item.precio_costo_pen) {
        await api.patch(`/inventario/${item.id_producto}/costo`, {
          precio_costo_pen: parseFloat(vals.precio_costo_pen) || 0,
        })
      }
      if (vals.stock_minimo !== item.stock_minimo) {
        await inventarioApi.actualizarMinimo(item.id_producto, {
          stock_minimo: parseInt(vals.stock_minimo),
          id_tienda: item.id_tienda,
        })
      }
      if (parseInt(vals.stock) !== parseInt(item.stock)) {
        await inventarioApi.actualizarStockAbsoluto(item.id_producto, {
          stock: parseInt(vals.stock),
          id_tienda: item.id_tienda,
        })
      }
      if (parseFloat(vals.precio) !== parseFloat(item.precio)) {
        await api.patch(`/productos/${item.id_producto}`, {
          precio: parseFloat(vals.precio),
        })
      }
      toast.success('Actualizado correctamente')
      setEditando(false)
      onGuardado()
    } catch (e) {
      toast.error(e.response?.data?.mensaje || 'Error al guardar')
    }
  }

  const costo   = parseFloat(vals.precio_costo_pen) || 0
  const costoSinIgv = costo > 0 ? parseFloat((costo / 1.18).toFixed(2)) : 0
  const pventa  = parseFloat(vals.precio) || 0
  const sinIgv  = pventa > 0 ? parseFloat((pventa / 1.18).toFixed(2)) : 0
  const igvUnit = pventa > 0 ? parseFloat((pventa - sinIgv).toFixed(2)) : 0
  const ganancia = parseFloat((sinIgv - costoSinIgv).toFixed(2))
  const margen   = costoSinIgv > 0 ? ((ganancia / costoSinIgv) * 100).toFixed(0) : 0
  const stockAct = parseInt(item.stock) || 0
  const minStock = parseInt(item.stock_minimo) || 0
  const isAgotadoOCritico = stockAct < minStock
  const isCercaMinimo = stockAct >= minStock && stockAct <= minStock + 5
  const tc = TIENDA_COLORES[item.id_tienda] || TIENDA_COLORES[1]

  return (
    <tr className={isAgotadoOCritico ? 'bg-red-50/40' : ''}>
      <td className="font-mono text-xs text-gray-400">{item.codigo_producto}</td>
      <td>
        <p className="text-sm font-medium text-gray-900 leading-tight">{item.producto}</p>
        {item.modelo && <p className="text-xs text-gray-400">{item.modelo}</p>}
      </td>
      <td><span className="badge-blue">{item.nombre_categoria}</span></td>

      {mostrarTienda && (
        <td>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tc.badge}`}>
            {item.nombre_tienda}
          </span>
        </td>
      )}

      {/* Costo editable */}
      <td>
        {editando ? (
          <input type="number" step="0.01" min="0" value={vals.precio_costo_pen}
            onChange={e => setVals({ ...vals, precio_costo_pen: e.target.value })}
            className="w-24 border border-blue-400 rounded px-2 py-1 text-sm focus:outline-none" />
        ) : (
          <span className={`text-sm font-medium ${costo > 0 ? 'text-red-600' : 'text-gray-300'}`}>
            {costo > 0 ? formatMoneda(costo) : '—'}
          </span>
        )}
      </td>

      {/* Precio venta editable */}
      <td>
        {editando ? (
          <input type="number" step="0.01" min="0" value={vals.precio}
            onChange={e => setVals({ ...vals, precio: e.target.value })}
            className="w-24 border border-blue-400 rounded px-2 py-1 text-sm focus:outline-none" />
        ) : (
          <span className="text-sm font-semibold text-gray-900">{formatMoneda(pventa)}</span>
        )}
      </td>

      {/* Ganancia calculada */}
      <td>
        {pventa > 0 && costo > 0 ? (
          <>
            <span className={`text-sm font-semibold ${ganancia >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatMoneda(ganancia)}
            </span>
            <span className="text-xs text-gray-400 ml-1">({margen}%)</span>
          </>
        ) : (
          <span className="text-gray-300 text-xs">Sin costo</span>
        )}
      </td>

      {/* IGV unitario */}
      <td className={`text-sm ${pventa > 0 ? 'text-amber-600' : 'text-gray-300'}`}>
        {pventa > 0 ? formatMoneda(igvUnit) : '—'}
      </td>

      {/* Stock editable */}
      <td>
        {editando ? (
          <input type="number" min="0" value={vals.stock}
            onChange={e => setVals({ ...vals, stock: e.target.value })}
            className="w-16 border border-blue-400 rounded px-2 py-1 text-sm font-bold focus:outline-none" />
        ) : (
          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
            isAgotadoOCritico ? 'bg-red-100 text-red-700' :
            isCercaMinimo     ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
          }`}>{item.stock}</span>
        )}
      </td>

      {/* Stock mínimo editable */}
      <td>
        {editando ? (
          <input type="number" min="0" value={vals.stock_minimo}
            onChange={e => setVals({ ...vals, stock_minimo: e.target.value })}
            className="w-16 border border-blue-400 rounded px-2 py-1 text-sm focus:outline-none" />
        ) : (
          <span className="text-sm text-gray-500">{item.stock_minimo}</span>
        )}
      </td>

      {/* Valor total del stock */}
      <td className="text-sm text-gray-600">{formatMoneda(pventa * item.stock)}</td>

      {/* Estado */}
      <td>
        {isAgotadoOCritico ? <span className="badge-red">Bajo / Agotado</span>
          : isCercaMinimo  ? <span className="badge-yellow">Cerca a mín.</span>
          :                  <span className="badge-green">OK</span>}
      </td>

      {/* Acciones */}
      <td>
        <div className="flex items-center gap-1 justify-center">
          {editando ? (
            <>
              <button onClick={guardar}
                className="p-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors">
                <Save size={13} />
              </button>
              <button onClick={() => setEditando(false)}
                className="p-1.5 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                <X size={13} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditando(true)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar datos">
                <Edit2 size={13} />
              </button>
              <button onClick={() => onAbrirSeries(item)}
                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Gestionar Series (S/N)">
                <Barcode size={13} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

export default function Inventario() {
  const qc = useQueryClient()
  const [buscar, setBuscar] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [tiendaFiltro, setTiendaFiltro] = useState('todas')
  const [modalSeriesOpen, setModalSeriesOpen] = useState(false)
  const [itemSeleccionado, setItemSeleccionado] = useState(null)
  const [modalAsignar, setModalAsignar] = useState(false)

  const { data: tiendas } = useQuery({
    queryKey: ['tiendas'],
    queryFn: () => api.get('/tiendas').then(r => r.data.datos),
  })

  // Fetch inventario según selección
  const esGlobal = tiendaFiltro === 'todas'
  const { data: items, isLoading } = useQuery({
    queryKey: esGlobal ? ['inventario-global'] : ['inventario', tiendaFiltro],
    queryFn: () => esGlobal
      ? inventarioApi.listarGlobal().then(r => r.data.datos)
      : inventarioApi.listar({ id_tienda: tiendaFiltro }).then(r => r.data.datos),
  })

  const filtrado = (items || []).filter(i => {
    const matchBuscar = !buscar ||
      (i.producto || '').toLowerCase().includes(buscar.toLowerCase()) ||
      (i.codigo_producto || '').toLowerCase().includes(buscar.toLowerCase())
    const matchFiltro =
      filtro === 'todos' ? true :
      filtro === 'bajo'  ? i.stock <= i.stock_minimo :
      filtro === 'cero'  ? i.stock === 0 :
      i.stock > i.stock_minimo
    return matchBuscar && matchFiltro
  })

  const sinCosto = (items || []).filter(i => !i.precio_costo_pen || i.precio_costo_pen === 0).length

  const columnas = [
    'Código', 'Producto', 'Categoría',
    ...(esGlobal ? ['Tienda'] : []),
    'Costo (S/)', 'Precio venta', 'Ganancia unit.', 'IGV unit.',
    'Stock', 'Mín.', 'Valor stock', 'Estado', 'Editar'
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="page-title">Inventario</h1>
        <div className="flex items-center gap-2">
          {sinCosto > 0 && (
            <span className="badge-yellow">
              {sinCosto} producto(s) sin costo
            </span>
          )}
          <button onClick={() => setModalAsignar(true)}
            className="btn-secondary text-xs">
            <Settings2 size={14} /> Asignar a tiendas
          </button>
        </div>
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <SearchBar placeholder="Buscar producto..." onSearch={setBuscar} className="flex-1 min-w-48" />

        {/* Selector de tienda */}
        <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2 py-1">
          <Store size={14} className="text-gray-500" />
          <select className="bg-transparent text-xs font-medium text-gray-700 focus:outline-none cursor-pointer pr-1"
            value={tiendaFiltro} onChange={e => setTiendaFiltro(e.target.value)}>
            <option value="todas">Todas las tiendas</option>
            {tiendas?.map(t => (
              <option key={t.id_tienda} value={t.id_tienda}>{t.nombre_tienda}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-1">
          {[['todos','Todos'],['bajo','Stock bajo'],['cero','Agotados'],['ok','OK']].map(([v,l]) => (
            <button key={v} onClick={() => setFiltro(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filtro === v ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="card">
        {isLoading ? <PageLoader /> : (
          <div className="overflow-x-auto">
            <table className="table-auto w-full text-left">
              <thead>
                <tr>
                  {columnas.map(c => (
                    <th key={c} className={c === 'Editar' ? 'text-center' : ''}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrado.map(i => (
                  <FilaInventario
                    key={`${i.id_inventario}-${i.id_tienda}`}
                    item={i}
                    mostrarTienda={esGlobal}
                    onGuardado={() => qc.invalidateQueries(esGlobal ? ['inventario-global'] : ['inventario'])}
                    onAbrirSeries={(item) => {
                      setItemSeleccionado(item);
                      setModalSeriesOpen(true);
                    }}
                  />
                ))}
                {filtrado.length === 0 && (
                  <tr>
                    <td colSpan={columnas.length} className="text-center py-10 text-gray-400 text-sm">Sin resultados</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Haz clic en el ícono de lápiz para editar costo, precio de venta, stock y stock mínimo directamente en la tabla.<br/>
        Haz clic en el ícono de código de barras para gestionar Números de Serie de forma independiente.
      </p>

      <ModalSeries 
        open={modalSeriesOpen} 
        onClose={() => setModalSeriesOpen(false)} 
        item={itemSeleccionado}
        onGuardado={() => qc.invalidateQueries(esGlobal ? ['inventario-global'] : ['inventario'])}
      />

      <ModalAsignar
        open={modalAsignar}
        onClose={() => setModalAsignar(false)}
      />
    </div>
  )
}