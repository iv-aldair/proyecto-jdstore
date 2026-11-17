import { useQuery } from '@tanstack/react-query'
import { reportesApi } from '../../api/reportes.api.js'
import { formatMoneda } from '../../utils/formatMoneda.js'
import { formatFecha } from '../../utils/formatFecha.js'
import { StatCard, PageLoader } from '../../components/ui/index.jsx'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { ShoppingCart, DollarSign, AlertTriangle, TrendingUp, TrendingDown, Package } from 'lucide-react'
import { useTienda } from '../../context/TiendaContext.jsx'

const COLORES = ['#dc2626', '#f97316', '#eab308', '#6366f1', '#8b5cf6', '#64748b']

export default function Dashboard() {
  const { idTienda } = useTienda()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', idTienda],
    queryFn: () => reportesApi.dashboard({ id_tienda: idTienda }).then(r => r.data.datos),
    refetchInterval: 1000 * 60 * 5,
    enabled: !!idTienda
  })
  
  const { data: categorias } = useQuery({
    queryKey: ['ventas-categoria', idTienda],
    queryFn: () => reportesApi.porCategoria({ id_tienda: idTienda }).then(r => r.data.datos),
    enabled: !!idTienda
  })

  if (isLoading) return <PageLoader />

  const ventasSemana = data?.ventas_semana?.map(v => ({
    dia:      formatFecha(v.dia).slice(0, 5),
    total:    parseFloat(v.total),
    utilidad: parseFloat(v.utilidad || 0),
  })) || []

  const pieData = categorias?.map(c => ({ name: c.nombre_categoria, value: parseFloat(c.total) })) || []

  const margenPct = data?.mes?.ingresos > 0
    ? ((data.mes.utilidad / data.mes.ingresos) * 100).toFixed(1)
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Dashboard Operativo</h1>
        <p className="text-xs text-gray-400 mt-1">
          {new Date().toLocaleDateString('es-PE', { weekday:'long', day:'numeric', month:'long' })}
        </p>
      </div>

      {/* KPIs fila 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard titulo="Ventas hoy" valor={data?.hoy?.ventas ?? 0}
          subtitulo="comprobantes" icono={ShoppingCart} color="red" />
        <StatCard titulo="Ingresos hoy" valor={formatMoneda(data?.hoy?.ingresos)}
          subtitulo="con IGV incluido" icono={DollarSign} color="red" />
        <StatCard titulo="IGV hoy" valor={formatMoneda(data?.hoy?.igv)}
          subtitulo="a pagar a SUNAT" icono={TrendingUp} color="yellow" />
        <StatCard titulo="Alertas stock" valor={data?.alertas?.stock_bajo ?? 0}
          subtitulo="bajo el mínimo" icono={AlertTriangle}
          color={data?.alertas?.stock_bajo > 0 ? 'red' : 'green'} />
      </div>

      {/* KPIs fila 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard titulo="Utilidad hoy" valor={formatMoneda(data?.hoy?.utilidad)}
          subtitulo="ingresos - costo - IGV" icono={TrendingUp} color="green" />
        <StatCard titulo="Ingresos del mes" valor={formatMoneda(data?.mes?.ingresos)}
          subtitulo={`${data?.mes?.ventas ?? 0} ventas`} icono={DollarSign} color="red" />
        <StatCard titulo="Utilidad del mes" valor={formatMoneda(data?.mes?.utilidad)}
          subtitulo={`Margen ${margenPct}%`} icono={TrendingUp} color="green" />
        <StatCard titulo="Costo del mes" valor={formatMoneda(data?.mes?.costo)}
          subtitulo="costo de ventas" icono={TrendingDown} color="red" />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">Ingresos vs Utilidad — últimos 7 días (S/)</h3>
          {ventasSemana.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ventasSemana} margin={{ top:5, right:10, bottom:5, left:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fontSize:11, fill:'#94a3b8', fontWeight:600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize:11, fill:'#94a3b8', fontWeight:600 }} tickFormatter={v => `S/${(v/1000).toFixed(0)}k`} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  formatter={(v, n) => [formatMoneda(v), n === 'total' ? 'Ingreso' : 'Utilidad']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)', fontSize: 12 }} 
                />
                <Bar dataKey="total"    fill="#dc2626" radius={[6,6,0,0]} barSize={18} name="total" />
                <Bar dataKey="utilidad" fill="#10b981" radius={[6,6,0,0]} barSize={18} name="utilidad" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">Sin datos esta semana</div>
          )}
        </div>

        <div className="card p-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">Por categoría (mes)</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={5}
                  label={({ percent }) => `${(percent*100).toFixed(0)}%`}
                  labelLine={false} fontSize={10} stroke="none">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
                </Pie>
                <Tooltip 
                  formatter={v => formatMoneda(v)} 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: 12 }} 
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-sm">Sin ventas</div>
          )}
        </div>
      </div>

      {/* Top productos */}
      {data?.top_productos?.length > 0 && (
        <div className="card p-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">Top 5 productos de mayor rotación</h3>
          <div className="overflow-x-auto">
            <table className="table-auto w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>Unidades</th>
                  <th>Ingreso</th>
                  <th>Costo</th>
                  <th>Utilidad</th>
                </tr>
              </thead>
              <tbody>
                {data.top_productos.map((p, i) => {
                  const utilidad = parseFloat(p.total_vendido) - parseFloat(p.costo_total || 0)
                  const margen   = p.total_vendido > 0 ? (utilidad / p.total_vendido * 100).toFixed(0) : 0
                  return (
                    <tr key={i}>
                      <td>
                        <span className="w-7 h-7 rounded-lg bg-red-50 text-red-600 text-xs font-bold flex items-center justify-center">
                          {i+1}
                        </span>
                      </td>
                      <td className="font-semibold text-gray-900">{p.producto}</td>
                      <td className="text-center font-mono text-gray-500">{p.unidades_vendidas}</td>
                      <td className="font-bold text-gray-900">{formatMoneda(p.total_vendido)}</td>
                      <td className="text-rose-600">{formatMoneda(p.costo_total || 0)}</td>
                      <td>
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-emerald-600">{formatMoneda(utilidad)}</span>
                          <span className="text-[10px] text-gray-400">({margen}%)</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}