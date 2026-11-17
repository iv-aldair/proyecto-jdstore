import { useState, Fragment } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ventasApi } from '../../api/ventas.api.js'
import { formatMoneda } from '../../utils/formatMoneda.js'
import { formatFechaHora } from '../../utils/formatFecha.js'
import { PageLoader, BadgeSunat } from '../../components/ui/index.jsx'
import Pagination from '../../components/Pagination.jsx'
import { fechaHoy } from '../../utils/formatFecha.js'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, Printer } from 'lucide-react'

function VentaDetalle({ id }) {
  const { data, isLoading } = useQuery({
    queryKey: ['venta-detalle', id],
    queryFn: () => ventasApi.obtener(id).then(r => r.data.datos)
  })

  if (isLoading) return <div className="p-4 text-center text-xs text-gray-500">Cargando detalles...</div>
  if (!data?.detalle) return null

  return (
    <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 shadow-inner">
      <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Detalle de Productos</h4>
      <table className="w-full text-left text-xs bg-white rounded-lg overflow-hidden border border-gray-200">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="px-3 py-2 font-medium">Producto</th>
            <th className="px-3 py-2 font-medium">Series</th>
            <th className="px-3 py-2 font-medium text-center">Cant.</th>
            <th className="px-3 py-2 font-medium text-right">P. Unit (con desc.)</th>
            <th className="px-3 py-2 font-medium text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.detalle.map(d => (
            <tr key={d.id_detalle}>
              <td className="px-3 py-2 text-gray-800">{d.producto}</td>
              <td className="px-3 py-2 text-gray-500 font-mono text-[10px] break-words max-w-xs">{d.series || '-'}</td>
              <td className="px-3 py-2 text-center font-medium">{d.cantidad}</td>
              <td className="px-3 py-2 text-right">{formatMoneda(d.precio_unitario - d.descuento_monto)}</td>
              <td className="px-3 py-2 text-right font-semibold text-gray-800">{formatMoneda(d.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const BADGE_TIPO = {
  'Boleta':        'badge-green',
  'Factura':       'badge-blue',
  'Nota de Venta': 'badge-yellow',
}

export default function Ventas() {
  const [pagina, setPagina] = useState(1)
  const [filtros, setFiltros] = useState({
    fecha_inicio: fechaHoy(), fecha_fin: fechaHoy(), tipo_comprobante: '',
  })
  const [expandedRows, setExpandedRows] = useState(new Set())

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  const { data, isLoading } = useQuery({
    queryKey: ['ventas-admin', pagina, filtros],
    queryFn: () => ventasApi.listar({ pagina, limite: 20, ...filtros }).then(r => r.data.datos),
    keepPreviousData: true,
  })

  // Totales del período
  const totales = data?.ventas?.reduce((acc, v) => ({
    total:    acc.total    + parseFloat(v.total    || 0),
    igv:      acc.igv      + parseFloat(v.igv      || 0),
    cantidad: acc.cantidad + 1,
  }), { total: 0, igv: 0, cantidad: 0 })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Ventas</h1>
        <Link to="/admin" className="btn-secondary text-xs">
          Ir al POS del vendedor
        </Link>
      </div>

      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-500">Desde</span>
          <input type="date" className="input w-36 text-sm" value={filtros.fecha_inicio}
            onChange={e => { setFiltros({ ...filtros, fecha_inicio: e.target.value }); setPagina(1) }} />
          <span className="text-sm text-gray-500">Hasta</span>
          <input type="date" className="input w-36 text-sm" value={filtros.fecha_fin}
            onChange={e => { setFiltros({ ...filtros, fecha_fin: e.target.value }); setPagina(1) }} />
        </div>
        <select className="input w-40" value={filtros.tipo_comprobante}
          onChange={e => { setFiltros({ ...filtros, tipo_comprobante: e.target.value }); setPagina(1) }}>
          <option value="">Todos los tipos</option>
          <option value="Boleta">Boleta</option>
          <option value="Factura">Factura</option>
          <option value="Nota de Venta">Nota de Venta</option>
        </select>
      </div>

      {/* Resumen período */}
      {totales && totales.cantidad > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-4">
            <p className="text-xs text-gray-500">Ventas en período</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{totales.cantidad}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500">Total ingresos</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{formatMoneda(totales.total)}</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-gray-500">IGV a pagar</p>
            <p className="text-xl font-bold text-amber-600 mt-1">{formatMoneda(totales.igv)}</p>
          </div>
        </div>
      )}

      <div className="card">
        {isLoading ? <PageLoader /> : (
          <>
            <div className="overflow-x-auto">
              <table className="table-auto w-full">
                <thead>
                  <tr>
                    <th className="w-8"></th>
                    <th>Comprobante</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Vendedor</th>
                    <th>Total</th>
                    <th>IGV</th>
                    <th>Pago</th>
                    <th>SUNAT</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {data?.ventas?.map(v => (
                  <Fragment key={v.id_venta}>
                    <tr className={(v.notas_internas || expandedRows.has(v.id_venta)) ? "border-b-0" : ""}>
                      <td className="text-center">
                        <button onClick={() => toggleRow(v.id_venta)} className="text-gray-400 hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors">
                          {expandedRows.has(v.id_venta) ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                        </button>
                      </td>
                      <td>
                        <p className="font-mono text-xs font-medium text-blue-600">{v.numero_comprobante}</p>
                        <span className={`${BADGE_TIPO[v.tipo_comprobante] || 'badge-gray'} text-xs`}>
                          {v.tipo_comprobante}
                        </span>
                      </td>
                      <td className="text-xs text-gray-500">{formatFechaHora(v.fecha)}</td>
                      <td>
                        <p className="text-sm font-medium">{v.cliente}</p>
                        <p className="text-xs text-gray-400">{v.dni_ruc}</p>
                      </td>
                      <td className="text-sm text-gray-600">{v.vendedor}</td>
                      <td className="font-semibold text-sm">{formatMoneda(v.total)}</td>
                      <td className="text-sm text-amber-600">
                        {v.tipo_comprobante === 'Nota de Venta'
                          ? <span className="text-gray-400 text-xs">—</span>
                          : formatMoneda(v.igv)
                        }
                      </td>
                      <td><span className="badge-gray">{v.metodo_pago}</span></td>
                      <td>
                        {v.tipo_comprobante === 'Nota de Venta'
                          ? <span className="badge-yellow">Sin SUNAT</span>
                          : <BadgeSunat estado={v.estado_sunat} />
                        }
                      </td>
                      <td className="text-center pr-2">
                        <Link to={`/admin/comprobante/${v.id_venta}`} target="_blank" className="text-gray-400 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition-colors inline-block" title="Imprimir Comprobante">
                          <Printer size={16} />
                        </Link>
                      </td>
                    </tr>
                    {v.notas_internas && (
                      <tr key={`nota-${v.id_venta}`}>
                        <td></td>
                        <td colSpan={8} className="bg-amber-50/50 py-2 border-t-0">
                          <div className="flex gap-2 items-start text-xs text-amber-800 px-2">
                            <span className="font-semibold whitespace-nowrap">Nota de venta:</span>
                            <span>{v.notas_internas}</span>
                          </div>
                        </td>
                      </tr>
                    )}
                    {expandedRows.has(v.id_venta) && (
                      <tr>
                        <td colSpan={10} className="p-0 border-t-0">
                          <VentaDetalle id={v.id_venta} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                  ))}
                  {!data?.ventas?.length && (
                    <tr>
                      <td colSpan={10} className="text-center py-10 text-gray-400 text-sm">
                        Sin ventas en el período seleccionado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4">
              <Pagination paginacion={data?.paginacion} onChange={setPagina} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}