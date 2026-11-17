import { useState, Fragment, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportesApi } from '../../api/reportes.api.js'
import { tiendasApi } from '../../api/tiendas.api.js'
import { formatMoneda } from '../../utils/formatMoneda.js'
import { PageLoader } from '../../components/ui/index.jsx'
import { BarChart2, Download, ChevronDown, ChevronUp, PieChart as PieChartIcon, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Activity, AlertCircle } from 'lucide-react'
import { fechaHoy, formatFechaHora, formatFecha } from '../../utils/formatFecha.js'
import { ventasApi } from '../../api/ventas.api.js'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORES_PAGO = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b']

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

const TIPOS = ['Diario', 'Semanal', 'Mensual', 'Anual', 'Personalizado']

export default function Reportes() {
  const [tipo, setTipo]     = useState('Diario')
  const [fecha, setFecha]   = useState(fechaHoy())
  const [rango, setRango]   = useState({ inicio: fechaHoy(), fin: fechaHoy() })
  const [mes, setMes]       = useState({ anio: new Date().getFullYear(), mes: new Date().getMonth() + 1 })
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState('general')
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [mostrarGraficos, setMostrarGraficos] = useState(false)

  const { data: tiendas } = useQuery({
    queryKey: ['tiendas-lista'],
    queryFn: () => tiendasApi.listar().then(r => r.data.datos)
  })

  const toggleRow = (id) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  const exportarCSV = () => {
    if (!data?.detalleVentas) return;
    const cabeceras = ['Comprobante', 'Tipo', 'Fecha', 'Cliente', 'DNI/RUC', 'Vendedor', 'Metodo Pago', 'Subtotal', 'IGV', 'Total', 'Utilidad'];
    const filas = data.detalleVentas.map(v => [
      v.numero_comprobante,
      v.tipo_comprobante,
      formatFechaHora(v.fecha),
      `"${v.cliente}"`,
      v.dni_ruc,
      v.vendedor,
      `"${v.metodo_pago}"`,
      v.subtotal,
      v.igv,
      v.total,
      v.utilidad
    ]);
    const csvContent = [cabeceras.join(','), ...filas.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Reporte-JDStore-${tipo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const queryFn = () => {
    const params = { id_tienda: tiendaSeleccionada }
    if (tipo === 'Diario')       return reportesApi.diario({ ...params, fecha }).then(r => r.data.datos)
    if (tipo === 'Semanal')      return reportesApi.semanal(params).then(r => r.data.datos)
    if (tipo === 'Mensual')      return reportesApi.mensual({ ...params, ...mes }).then(r => r.data.datos)
    if (tipo === 'Anual')        return reportesApi.anual({ ...params, anio: mes.anio }).then(r => r.data.datos)
    return reportesApi.personalizado({ ...params, ...rango }).then(r => r.data.datos)
  }

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['reporte', tipo, fecha, rango, mes, tiendaSeleccionada],
    queryFn,
    enabled: true, // Cargar automáticamente al iniciar
  })

  // Recargar al cambiar filtros clave
  useEffect(() => {
    refetch()
  }, [tipo, fecha, mes, rango, tiendaSeleccionada])

  // Datos para gráficos
  const pagosData = data?.pagos ? Object.entries(data.pagos).map(([name, value]) => ({ name, value })) : []
  
  // Agrupar ventas por día (útil para semanal/mensual)
  const agruparVentasPorDia = () => {
    if (!data?.detalleVentas || tipo === 'Diario') return []
    const grupos = {}
    data.detalleVentas.forEach(v => {
      const dia = formatFecha(v.fecha)
      if (!grupos[dia]) grupos[dia] = { dia, ingresos: 0, utilidad: 0 }
      grupos[dia].ingresos += parseFloat(v.total)
      grupos[dia].utilidad += parseFloat(v.utilidad)
    })
    return Object.values(grupos)
  }
  const graficoVentas = agruparVentasPorDia()

  // Generar interpretación
  const generarInterpretacion = () => {
    if (!data) return null;
    const { ventas, ganancia, pagos, compras, movimientos } = data
    const totalIngresos = parseFloat(ventas?.total_ventas || 0)
    const margen = totalIngresos > 0 ? (ganancia / totalIngresos) * 100 : 0
    
    // Método de pago principal
    let metodoPrincipal = { nombre: 'N/A', monto: 0 }
    if (pagos) {
      Object.entries(pagos).forEach(([nombre, monto]) => {
        if (monto > metodoPrincipal.monto) metodoPrincipal = { nombre, monto }
      })
    }

    const ingresosExtra = movimientos?.filter(m => m.tipo_movimiento === 'INGRESO').reduce((s, m) => s + parseFloat(m.monto), 0) || 0
    const egresosExtra = movimientos?.filter(m => m.tipo_movimiento === 'EGRESO').reduce((s, m) => s + parseFloat(m.monto), 0) || 0

    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Activity size={80} />
        </div>
        <h3 className="text-blue-800 font-bold mb-3 flex items-center gap-2">
          <AlertCircle size={18} />
          Interpretación del Reporte ({tipo})
        </h3>
        <ul className="space-y-2 text-sm text-blue-900 relative z-10">
          <li>
            <span className="font-semibold">Resumen de Ventas:</span> Se generaron <b>{ventas?.cantidad_ventas || 0} ventas</b>, logrando ingresos totales por <b>{formatMoneda(totalIngresos)}</b>.
          </li>
          <li>
            <span className="font-semibold">Rentabilidad:</span> La utilidad neta fue de <b>{formatMoneda(ganancia)}</b>, lo que representa un margen de ganancia del <b>{margen.toFixed(1)}%</b> sobre los ingresos.
          </li>
          {metodoPrincipal.monto > 0 && (
            <li>
              <span className="font-semibold">Preferencia de Pago:</span> El método de pago más utilizado fue <b>{metodoPrincipal.nombre}</b> con {formatMoneda(metodoPrincipal.monto)} 
              ({((metodoPrincipal.monto / totalIngresos) * 100).toFixed(1)}% del total).
            </li>
          )}
          {(ingresosExtra > 0 || egresosExtra > 0) && (
            <li>
              <span className="font-semibold">Flujo de Caja Extra:</span> Se registraron ingresos extras por <b>{formatMoneda(ingresosExtra)}</b> y salidas/gastos por <b>{formatMoneda(egresosExtra)}</b>.
            </li>
          )}
          {parseFloat(compras?.total_compras || 0) > 0 && (
             <li>
               <span className="font-semibold">Inversión:</span> Se registraron compras de inventario por <b>{formatMoneda(compras.total_compras)}</b>.
             </li>
          )}
        </ul>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="page-title">Reportes Estadísticos</h1>
        <p className="text-gray-500 text-sm mt-1">Analiza el rendimiento de la tienda, visualiza KPIs y descarga informes.</p>
      </div>

      {/* Selector tipo y filtros */}
      <div className="card p-5 bg-white shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-5 lg:items-center">
          <div className="flex gap-2 flex-wrap bg-gray-50 p-1 rounded-lg border border-gray-200">
            {TIPOS.map(t => (
              <button key={t} onClick={() => setTipo(t)}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                  tipo === t ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'
                }`}>
                {t}
              </button>
            ))}
          </div>
          
          <div className="flex-1 max-w-sm">
            <select 
              className="input w-full bg-gray-50 border-gray-200 font-medium" 
              value={tiendaSeleccionada} 
              onChange={e => setTiendaSeleccionada(e.target.value)}
            >
              <option value="general">🏢 Todas las tiendas (Global)</option>
              {tiendas?.map(t => (
                <option key={t.id_tienda} value={t.id_tienda}>🏪 {t.nombre_tienda}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex gap-4 items-center flex-wrap">
          {tipo === 'Diario' && (
            <input type="date" className="input w-48 font-medium" value={fecha}
              onChange={e => setFecha(e.target.value)} />
          )}
          {tipo === 'Mensual' && (
            <div className="flex gap-3">
              <input type="number" className="input w-28 text-center font-medium" placeholder="Año" value={mes.anio}
                onChange={e => setMes({ ...mes, anio: e.target.value })} />
              <select className="input w-48 font-medium" value={mes.mes}
                onChange={e => setMes({ ...mes, mes: e.target.value })}>
                {['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
                  .map((m, i) => <option key={i} value={i+1}>{m}</option>)}
              </select>
            </div>
          )}
          {tipo === 'Anual' && (
            <input type="number" className="input w-32 font-medium text-center" placeholder="Año" value={mes.anio}
              onChange={e => setMes({ ...mes, anio: e.target.value })} />
          )}
          {tipo === 'Personalizado' && (
            <div className="flex gap-3 items-center bg-gray-50 p-1.5 rounded-lg border border-gray-200">
              <input type="date" className="input w-40 font-medium border-none bg-transparent" value={rango.inicio}
                onChange={e => setRango({ ...rango, inicio: e.target.value })} />
              <span className="text-gray-400 font-bold">→</span>
              <input type="date" className="input w-40 font-medium border-none bg-transparent" value={rango.fin}
                onChange={e => setRango({ ...rango, fin: e.target.value })} />
            </div>
          )}

          <div className="flex gap-3 ml-auto">
            <button onClick={() => refetch()} className="btn-primary px-6 shadow-md hover:shadow-lg transition-shadow">
              <BarChart2 size={18} /> Actualizar
            </button>
            {data?.detalleVentas?.length > 0 && (
              <button onClick={exportarCSV} className="btn-secondary text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100 font-semibold shadow-sm">
                <Download size={18} /> CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resultados */}
      {isLoading && <PageLoader />}
      {data && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Interpretación Automática */}
          {generarInterpretacion()}

          {/* Tarjetas KPI Premium */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><ShoppingCart size={60} /></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Ventas</p>
              <h4 className="text-2xl font-black text-gray-800">{data.ventas?.cantidad_ventas || 0}</h4>
              <p className="text-xs text-gray-500 mt-2">Comprobantes emitidos</p>
            </div>
            
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><DollarSign size={60} /></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ingresos Brutos</p>
              <h4 className="text-2xl font-black text-blue-600">{formatMoneda(data.ventas?.total_ventas)}</h4>
              <p className="text-xs text-gray-500 mt-2">Incluye IGV</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingUp size={60} /></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Utilidad Neta</p>
              <h4 className="text-2xl font-black text-emerald-600">{formatMoneda(data.ganancia)}</h4>
              <p className="text-xs text-gray-500 mt-2">Ganancia real libre de polvo y paja</p>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><TrendingDown size={60} /></div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Compras de Stock</p>
              <h4 className="text-2xl font-black text-rose-600">{formatMoneda(data.compras?.total_compras)}</h4>
              <p className="text-xs text-gray-500 mt-2">Inversión en mercadería</p>
            </div>
          </div>

          {/* Segunda Fila KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-orange-100 shadow-sm">
               <p className="text-[11px] font-bold text-orange-600 uppercase tracking-wider mb-1">IGV Pendiente</p>
               <h4 className="text-xl font-black text-orange-700">{formatMoneda(data.ventas?.total_igv)}</h4>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-emerald-100 shadow-sm">
               <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Ingresos Extra Caja</p>
               <h4 className="text-xl font-black text-emerald-700">
                 {formatMoneda(data.movimientos?.filter(m => m.tipo_movimiento === 'INGRESO').reduce((s, m) => s + parseFloat(m.monto), 0) || 0)}
               </h4>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-rose-100 shadow-sm">
               <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-1">Egresos / Gastos Caja</p>
               <h4 className="text-xl font-black text-rose-700">
                 {formatMoneda(data.movimientos?.filter(m => m.tipo_movimiento === 'EGRESO').reduce((s, m) => s + parseFloat(m.monto), 0) || 0)}
               </h4>
            </div>
          </div>

          {/* Toggle de Gráficos */}
          <div className="flex justify-end">
            <button 
              onClick={() => setMostrarGraficos(!mostrarGraficos)} 
              className="text-xs font-bold flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <BarChart2 size={16} />
              {mostrarGraficos ? 'Ocultar Gráficos Avanzados' : 'Ver Gráficos Avanzados'}
            </button>
          </div>

          {/* Gráficos Estadísticos o Resumen en Texto */}
          {mostrarGraficos ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-300">
              {/* Gráfico de Barras: Evolución de Ventas */}
              {tipo !== 'Diario' && graficoVentas.length > 0 && (
                <div className="card p-5 lg:col-span-2 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-6 flex items-center gap-2">
                    <BarChart2 size={18} className="text-blue-500" />
                    Evolución de Ingresos vs Utilidad
                  </h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={graficoVentas} margin={{ top:5, right:5, bottom:5, left:-20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} tickFormatter={v => `S/${(v/1000).toFixed(0)}k`} />
                        <Tooltip 
                          cursor={{fill: '#f8fafc'}}
                          formatter={(val, name) => [formatMoneda(val), name === 'ingresos' ? 'Ingresos Brutos' : 'Utilidad Neta']}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="ingresos" fill="#3b82f6" radius={[4,4,0,0]} barSize={20} name="ingresos" />
                        <Bar dataKey="utilidad" fill="#10b981" radius={[4,4,0,0]} barSize={20} name="utilidad" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Gráfico de Dona: Métodos de Pago */}
              {pagosData.length > 0 && (
                <div className={`card p-5 shadow-sm border border-gray-100 ${tipo === 'Diario' || graficoVentas.length === 0 ? 'max-w-md mx-auto w-full lg:col-span-3' : ''}`}>
                  <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <PieChartIcon size={18} className="text-purple-500" />
                    Métodos de Pago
                  </h3>
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pagosData}
                          cx="50%" cy="50%"
                          innerRadius={50} outerRadius={75}
                          paddingAngle={5}
                          dataKey="value"
                          labelLine={false}
                        >
                          {pagosData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORES_PAGO[index % COLORES_PAGO.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(val) => formatMoneda(val)}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                        />
                        <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Resumen en texto puro de Métodos de Pago
            pagosData.length > 0 && (
              <div className="card p-5 shadow-sm border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <DollarSign size={18} className="text-blue-500" />
                  Resumen de Métodos de Pago
                </h3>
                <div className="flex flex-wrap gap-4">
                  {pagosData.map((p, i) => (
                    <div key={i} className="flex-1 min-w-[150px] bg-gray-50 border border-gray-100 p-4 rounded-xl">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{p.name}</p>
                      <p className="text-lg font-black text-gray-800">{formatMoneda(p.value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}

          {/* Detalle de Ventas */}
          <div className="card shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-white flex justify-between items-center">
              <h3 className="font-bold text-gray-800 text-sm">Registro Detallado de Ventas</h3>
              <span className="badge-gray text-xs">{data.detalleVentas?.length || 0} registros</span>
            </div>
            <div className="overflow-x-auto">
              <table className="table-auto w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="w-10"></th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Comprobante</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Tipo</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Cliente / Vendedor</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Método Pago</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Total</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-600">Utilidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.detalleVentas?.map((v, i) => (
                    <Fragment key={i}>
                      <tr className={`transition-colors ${expandedRows.has(v.id_venta) ? "bg-blue-50/50" : "hover:bg-gray-50"}`}>
                        <td className="text-center pl-2">
                          <button onClick={() => toggleRow(v.id_venta)} className={`p-1.5 rounded-md transition-colors ${expandedRows.has(v.id_venta) ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-200 hover:text-gray-700'}`}>
                            {expandedRows.has(v.id_venta) ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-mono text-sm font-bold text-blue-600">{v.numero_comprobante}</p>
                          <span className="text-[11px] text-gray-400 font-medium">{formatFechaHora(v.fecha)}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${v.tipo_comprobante === 'Factura' ? 'bg-indigo-100 text-indigo-700' : v.tipo_comprobante === 'Boleta' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                            {v.tipo_comprobante}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm font-semibold text-gray-800">{v.cliente}</p>
                          <p className="text-[11px] text-gray-500">Vend: {v.vendedor}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[11px] font-semibold max-w-[150px] truncate block" title={v.metodo_pago}>
                            {v.metodo_pago}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-black text-gray-900">{formatMoneda(v.total)}</td>
                        <td className="py-3 px-4 text-right font-black text-emerald-600">{formatMoneda(v.utilidad)}</td>
                      </tr>
                      {expandedRows.has(v.id_venta) && (
                        <tr>
                          <td colSpan={7} className="p-0 border-t-0">
                            <VentaDetalle id={v.id_venta} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                  {!data.detalleVentas?.length && (
                    <tr><td colSpan={7} className="text-center py-10 text-gray-400 font-medium text-sm bg-gray-50/50">No hay ventas registradas en este período</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Movimientos de Caja Extra */}
          {data.movimientos?.length > 0 && (
            <div className="card shadow-sm border border-gray-100 mt-6">
              <div className="px-5 py-4 border-b border-gray-100 bg-white">
                <h3 className="font-bold text-gray-800 text-sm">Flujo de Caja Extraordinario (Ingresos / Egresos)</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="table-auto w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Fecha/Hora</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Tipo</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Concepto</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Descripción</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">Usuario</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-600">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.movimientos.map((m, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-[11px] text-gray-500 font-medium">{formatFechaHora(m.fecha)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${m.tipo_movimiento === 'INGRESO' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {m.tipo_movimiento}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-gray-800">{m.concepto}</td>
                        <td className="py-3 px-4 text-xs text-gray-500">{m.descripcion || '-'}</td>
                        <td className="py-3 px-4 text-xs text-gray-500">{m.usuario}</td>
                        <td className={`py-3 px-4 text-right font-black ${m.tipo_movimiento === 'INGRESO' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {m.tipo_movimiento === 'INGRESO' ? '+' : '-'}{formatMoneda(m.monto)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}