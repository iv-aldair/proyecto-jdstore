import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ventasApi } from '../../api/ventas.api.js'
import { formatMoneda } from '../../utils/formatMoneda.js'
import { formatFechaHora, fechaHoy } from '../../utils/formatFecha.js'
import { PageLoader, BadgeSunat } from '../../components/ui/index.jsx'
import Pagination from '../../components/Pagination.jsx'
import { Link } from 'react-router-dom'
import { Printer } from 'lucide-react'

export default function MisVentas() {
  const [pagina, setPagina] = useState(1)
  const [filtros, setFiltros] = useState({ fecha_inicio: fechaHoy(), fecha_fin: fechaHoy() })

  const { data, isLoading } = useQuery({
    queryKey: ['mis-ventas', pagina, filtros],
    queryFn: () => ventasApi.listar({ pagina, limite: 20, ...filtros }).then(r => r.data.datos),
    keepPreviousData: true,
  })

  return (
    <div className="space-y-5">
      <h1 className="page-title">Mis ventas</h1>
      <div className="card p-4 flex gap-3 items-center">
        <input type="date" className="input w-36" value={filtros.fecha_inicio}
          onChange={e => setFiltros({ ...filtros, fecha_inicio: e.target.value })} />
        <span className="text-gray-400">–</span>
        <input type="date" className="input w-36" value={filtros.fecha_fin}
          onChange={e => setFiltros({ ...filtros, fecha_fin: e.target.value })} />
      </div>
      <div className="card">
        {isLoading ? <PageLoader /> : (
          <>
            <div className="overflow-x-auto">
              <table className="table-auto w-full">
                <thead><tr><th>Comprobante</th><th>Fecha</th><th>Cliente</th><th>Total</th><th>Pago</th><th>SUNAT</th><th className="w-10"></th></tr></thead>
                <tbody>
                  {data?.ventas?.map(v => (
                    <tr key={v.id_venta}>
                      <td className="font-mono text-xs text-blue-600">{v.numero_comprobante}</td>
                      <td className="text-xs text-gray-500">{formatFechaHora(v.fecha)}</td>
                      <td className="text-sm">{v.cliente}</td>
                      <td className="font-semibold">{formatMoneda(v.total)}</td>
                      <td><span className="badge-gray">{v.metodo_pago}</span></td>
                      <td>
                        {v.tipo_comprobante === 'Nota de Venta'
                          ? <span className="badge-yellow">Sin SUNAT</span>
                          : <BadgeSunat estado={v.estado_sunat} />
                        }
                      </td>
                      <td className="text-center pr-2">
                        <Link to={`/vendedor/comprobante/${v.id_venta}`} target="_blank" className="text-gray-400 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition-colors inline-block" title="Imprimir Comprobante">
                          <Printer size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {!data?.ventas?.length && (
                    <tr><td colSpan={7} className="text-center py-10 text-gray-400 text-sm">Sin ventas en este período</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4"><Pagination paginacion={data?.paginacion} onChange={setPagina} /></div>
          </>
        )}
      </div>
    </div>
  )
}