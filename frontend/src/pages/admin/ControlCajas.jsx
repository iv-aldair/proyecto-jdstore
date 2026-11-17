import { useState, useEffect } from 'react'
import { Wallet, Plus, Trash2 } from 'lucide-react'
import api from '../../api/axios'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import { Modal, Spinner, Tabla, ConfirmModal } from '../../components/ui/index.jsx'

export default function ControlCajas() {
  const [resumen, setResumen] = useState(null)
  const [movimientos, setMovimientos] = useState([])
  const [tiendas, setTiendas] = useState([])
  const [cargando, setCargando] = useState(true)
  
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState('')
  const [fechaSeleccionada, setFechaSeleccionada] = useState(dayjs().format('YYYY-MM-DD'))

  const [modalVisible, setModalVisible] = useState(false)
  const [formDatos, setFormDatos] = useState({ tipo_movimiento: 'INGRESO', concepto: 'Sencillo Inicial', monto: '', descripcion: '' })

  const [modalEliminar, setModalEliminar] = useState(null)

  const cargarDatos = async () => {
    if (!tiendaSeleccionada) return;
    setCargando(true)
    try {
      const [resResumen, resMov] = await Promise.all([
        api.get(`/caja/resumen?id_tienda=${tiendaSeleccionada}&fecha=${fechaSeleccionada}`),
        api.get(`/caja/movimientos?id_tienda=${tiendaSeleccionada}&fecha=${fechaSeleccionada}`)
      ])
      setResumen(resResumen.data.datos)
      setMovimientos(resMov.data.datos)
    } catch (error) {
      toast.error('Error al cargar datos de caja')
    } finally {
      setCargando(false)
    }
  }

  const cargarTiendas = async () => {
    try {
      const { data } = await api.get('/tiendas');
      setTiendas(data.datos);
      if (data.datos.length > 0) {
        setTiendaSeleccionada(data.datos[0].id_tienda);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    cargarTiendas();
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [tiendaSeleccionada, fechaSeleccionada])

  const handleCrearMovimiento = async (e) => {
    e.preventDefault();
    try {
      await api.post('/caja/movimientos', { ...formDatos, id_tienda: tiendaSeleccionada });
      toast.success('Movimiento registrado')
      setModalVisible(false)
      setFormDatos({ tipo_movimiento: 'INGRESO', concepto: 'Sencillo Inicial', monto: '', descripcion: '' })
      cargarDatos()
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'Error al registrar')
    }
  }

  const handleEliminar = async () => {
    try {
      await api.delete(`/caja/movimientos/${modalEliminar}`)
      toast.success('Movimiento eliminado')
      setModalEliminar(null)
      cargarDatos()
    } catch (error) {
      toast.error('Error al eliminar')
    }
  }

  const columnas = [
    { label: 'Hora', className: 'px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase w-20' },
    { label: 'Usuario', className: 'px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase' },
    { label: 'Tipo', className: 'px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase' },
    { label: 'Concepto', className: 'px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase' },
    { label: 'Descripción', className: 'px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase' },
    { label: 'Monto', className: 'px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase' },
    { label: '', className: 'px-4 py-3 text-right w-16' },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <select 
            value={tiendaSeleccionada} 
            onChange={e => setTiendaSeleccionada(e.target.value)}
            className="input w-full sm:w-48 bg-gray-50"
          >
            {tiendas.map(t => <option key={t.id_tienda} value={t.id_tienda}>{t.nombre_tienda}</option>)}
          </select>
          <input 
            type="date"
            value={fechaSeleccionada}
            onChange={e => setFechaSeleccionada(e.target.value)}
            className="input w-full sm:w-40 bg-gray-50"
          />
        </div>
        <button onClick={() => setModalVisible(true)} className="btn-primary w-full sm:w-auto">
          <Plus size={16} className="mr-2" /> Registrar Movimiento
        </button>
      </div>

      {/* Resumen */}
      {resumen && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-5 border-l-4 border-green-500">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Ventas Efectivo</p>
            <p className="text-2xl font-black text-green-600 mt-1">S/ {parseFloat(resumen.ventas_efectivo).toFixed(2)}</p>
          </div>
          <div className="card p-5 border-l-4 border-green-500">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Sencillo/Ingresos</p>
            <p className="text-2xl font-black text-green-600 mt-1">S/ {parseFloat(resumen.total_ingresos).toFixed(2)}</p>
          </div>
          <div className="card p-5 border-l-4 border-red-500">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Gastos/Retiros</p>
            <p className="text-2xl font-black text-red-600 mt-1">S/ {parseFloat(resumen.total_egresos).toFixed(2)}</p>
          </div>
          <div className="card p-5 bg-blue-50 border border-blue-200">
            <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Efectivo en Caja</p>
            <p className="text-3xl font-black text-blue-700 mt-1">S/ {parseFloat(resumen.saldo_final).toFixed(2)}</p>
          </div>
        </div>
      )}

      {/* Tabla Movimientos */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
          <Wallet size={18} className="text-blue-600" />
          <h2 className="font-bold text-gray-800">Detalle de Movimientos</h2>
        </div>
        
        {cargando ? (
          <div className="py-20 flex justify-center"><Spinner size={30} /></div>
        ) : (
          <Tabla columnas={columnas} vacia="No hay movimientos registrados este día.">
            {movimientos.map(r => (
              <tr key={r.id_movimiento} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 text-sm text-gray-500">{dayjs(r.fecha).format('HH:mm')}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{r.usuario}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${r.tipo_movimiento === 'INGRESO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {r.tipo_movimiento}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">{r.concepto}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{r.descripcion}</td>
                <td className={`px-4 py-3 text-sm font-bold text-right ${r.tipo_movimiento === 'INGRESO' ? 'text-green-600' : 'text-red-600'}`}>
                  {r.tipo_movimiento === 'INGRESO' ? '+' : '-'}S/ {parseFloat(r.monto).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setModalEliminar(r.id_movimiento)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </Tabla>
        )}
      </div>

      <Modal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Registrar Movimiento de Caja"
      >
        <form onSubmit={handleCrearMovimiento} className="space-y-4">
          <div>
            <label className="label">Tipo de Movimiento</label>
            <select 
              className="input" 
              required
              value={formDatos.tipo_movimiento} 
              onChange={e => setFormDatos({...formDatos, tipo_movimiento: e.target.value})}
            >
              <option value="INGRESO">INGRESO (Metí dinero a caja)</option>
              <option value="EGRESO">EGRESO (Saqué dinero de caja)</option>
            </select>
          </div>
          <div>
            <label className="label">Concepto</label>
            <select 
              className="input" 
              required
              value={formDatos.concepto} 
              onChange={e => setFormDatos({...formDatos, concepto: e.target.value})}
            >
              <option value="Sencillo Inicial">Sencillo Inicial</option>
              <option value="Retiro Jefe">Retiro Jefe</option>
              <option value="Préstamo a Tienda">Préstamo a Tienda</option>
              <option value="Gasto Envío">Gasto Envío</option>
              <option value="Compra Insumo">Compra Insumo (Limpieza, etc)</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="label">Monto (S/)</label>
            <input 
              type="number" step="0.01" min="0.1" required className="input text-lg font-bold text-blue-600"
              value={formDatos.monto} 
              onChange={e => setFormDatos({...formDatos, monto: e.target.value})}
            />
          </div>
          <div>
            <label className="label">Descripción / Notas</label>
            <textarea 
              rows={2} className="input" placeholder="Opcional"
              value={formDatos.descripcion} 
              onChange={e => setFormDatos({...formDatos, descripcion: e.target.value})}
            />
          </div>
          <div className="pt-2 flex gap-3">
            <button type="button" onClick={() => setModalVisible(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button type="submit" className="btn-primary flex-1 justify-center">Guardar Movimiento</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!modalEliminar}
        onClose={() => setModalEliminar(null)}
        onConfirm={handleEliminar}
        mensaje="¿Estás seguro de eliminar este movimiento de caja? Esto afectará el reporte final."
      />
    </div>
  )
}
