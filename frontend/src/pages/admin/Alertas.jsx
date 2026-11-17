import { useQuery } from '@tanstack/react-query'
import { reportesApi } from '../../api/reportes.api.js'
import { PageLoader, StatCard } from '../../components/ui/index.jsx'
import { AlertTriangle, Package, TrendingDown } from 'lucide-react'

export default function Alertas() {
  const { data: resumen } = useQuery({
    queryKey: ['alertas-resumen'],
    queryFn: () => reportesApi.alertasResumen().then(r => r.data.datos),
  })
  const { data: stockBajo, isLoading: loadSB } = useQuery({
    queryKey: ['stock-bajo'],
    queryFn: () => reportesApi.stockBajo().then(r => r.data.datos),
  })
  const { data: estancados, isLoading: loadES } = useQuery({
    queryKey: ['estancados'],
    queryFn: () => reportesApi.estancados({ dias: 30 }).then(r => r.data.datos),
  })

  return (
    <div className="space-y-6">
      <h1 className="page-title">Alertas de inventario</h1>

      <div className="grid grid-cols-3 gap-4">
        <StatCard titulo="Stock bajo" valor={resumen?.stock_bajo ?? 0}
          icono={AlertTriangle} color="red" subtitulo="bajo el mínimo" />
        <StatCard titulo="Sin stock" valor={resumen?.sin_stock ?? 0}
          icono={Package} color="red" subtitulo="agotados" />
        <StatCard titulo="Estancados (30 días)" valor={resumen?.estancados_30_dias ?? 0}
          icono={TrendingDown} color="yellow" subtitulo="sin ventas" />
      </div>

      {/* Stock bajo */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-500" />
          <h2 className="font-semibold text-gray-800">Productos con stock bajo</h2>
        </div>
        {loadSB ? <PageLoader /> : (
          <div className="overflow-x-auto">
            <table className="table-auto w-full">
              <thead>
                <tr>
                  <th>Código</th><th>Producto</th><th>Categoría</th>
                  <th>Stock actual</th><th>Stock mínimo</th><th>Faltante</th>
                </tr>
              </thead>
              <tbody>
                {stockBajo?.alertas?.length > 0 ? stockBajo.alertas.map(p => (
                  <tr key={p.id_producto}>
                    <td className="font-mono text-xs">{p.codigo_producto}</td>
                    <td className="font-medium">{p.nombre}</td>
                    <td><span className="badge-blue">{p.nombre_categoria}</span></td>
                    <td><span className={`font-bold ${p.stock === 0 ? 'text-red-600' : 'text-orange-500'}`}>{p.stock}</span></td>
                    <td className="text-gray-500">{p.stock_minimo}</td>
                    <td><span className="badge-red">{p.unidades_faltantes} und.</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400 text-sm">Sin alertas de stock</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Estancados */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <TrendingDown size={16} className="text-yellow-500" />
          <h2 className="font-semibold text-gray-800">Productos sin movimiento (+30 días)</h2>
        </div>
        {loadES ? <PageLoader /> : (
          <div className="overflow-x-auto">
            <table className="table-auto w-full">
              <thead>
                <tr><th>Código</th><th>Producto</th><th>Categoría</th><th>Stock</th><th>Días sin venta</th></tr>
              </thead>
              <tbody>
                {estancados?.productos?.length > 0 ? estancados.productos.map(p => (
                  <tr key={p.id_producto}>
                    <td className="font-mono text-xs">{p.codigo_producto}</td>
                    <td className="font-medium">{p.nombre}</td>
                    <td><span className="badge-blue">{p.nombre_categoria}</span></td>
                    <td className="font-bold text-gray-700">{p.stock}</td>
                    <td><span className="badge-yellow">{p.dias_sin_venta ?? 'Nunca vendido'}</span></td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-400 text-sm">Sin productos estancados</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}