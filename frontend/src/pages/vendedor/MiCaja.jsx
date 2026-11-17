import { useState, useEffect } from 'react'
import { Wallet, Plus, Trash2, Lock, Unlock, CheckCircle } from 'lucide-react'
import api from '../../api/axios'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { useTienda } from '../../context/TiendaContext'
import { Modal, Spinner, Tabla, ConfirmModal } from '../../components/ui/index.jsx'

export default function MiCaja() {
  const { usuario } = useAuth()
  const { idTienda, nombreTienda } = useTienda()
  const [resumen, setResumen] = useState(null)
  const [movimientos, setMovimientos] = useState([])
  const [cargando, setCargando] = useState(true)
  
  // Estados de Caja
  const [estadoCaja, setEstadoCaja] = useState(null) // 'ABIERTA' o 'CERRADA'
  const [sesion, setSesion] = useState(null)
  const [saldoInicial, setSaldoInicial] = useState('')
  const [saldoFinalReal, setSaldoFinalReal] = useState('')
  const [modalCerrar, setModalCerrar] = useState(false)

  const [modalVisible, setModalVisible] = useState(false)
  const [formDatos, setFormDatos] = useState({ tipo_movimiento: 'EGRESO', concepto: 'Gasto Envío', monto: '', descripcion: '' })

  const [modalEliminar, setModalEliminar] = useState(null)

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const params = idTienda ? `?id_tienda=${idTienda}` : '';
      const resEstado = await api.get(`/caja/estado${params}`);
      
      const abierta = resEstado.data.datos.abierta;
      setEstadoCaja(abierta ? 'ABIERTA' : 'CERRADA');
      setSesion(resEstado.data.datos.sesion);

      if (abierta) {
        const [resResumen, resMov] = await Promise.all([
          api.get(`/caja/resumen${params}`),
          api.get(`/caja/movimientos${params}`)
        ]);
        setResumen(resResumen.data.datos);
        setMovimientos(resMov.data.datos);
      }
    } catch (error) {
      toast.error('Error al cargar datos de caja')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (idTienda) cargarDatos()
  }, [idTienda])

  const handleAbrirCaja = async (e) => {
    e.preventDefault();
    if (saldoInicial === '' || saldoInicial < 0) return toast.error('Ingresa un monto válido');
    try {
      await api.post('/caja/abrir', { saldo_inicial: parseFloat(saldoInicial), id_tienda: idTienda });
      toast.success('Caja Abierta Exitosamente');
      setSaldoInicial('');
      cargarDatos();
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'Error al abrir caja');
    }
  }

  const handleCerrarCaja = async (e) => {
    e.preventDefault();
    if (saldoFinalReal === '' || saldoFinalReal < 0) return toast.error('Ingresa el dinero físico actual');
    try {
      const res = await api.post('/caja/cerrar', { saldo_final_real: parseFloat(saldoFinalReal), id_tienda: idTienda });
      const { diferencia } = res.data.datos;
      if (diferencia === 0) {
        toast.success('Caja Cuadrada Perfectamente. Caja Cerrada.');
      } else if (diferencia > 0) {
        toast.success(`Caja Cerrada con SOBRANTE de S/ ${diferencia.toFixed(2)}`);
      } else {
        toast.error(`Caja Cerrada con FALTANTE de S/ ${Math.abs(diferencia).toFixed(2)}`);
      }
      
      // Recordatorio Ambiental (ISO 14001)
      setTimeout(() => {
        toast('Recordatorio Ambiental (ISO 14001): Por favor, apaga esta PC y las luces de tu área antes de retirarte para ahorrar energía. 🌍', {
          icon: '🌱',
          duration: 10000,
          style: {
            background: '#064e3b',
            color: '#fff',
          }
        });
      }, 1500);

      setModalCerrar(false);
      setSaldoFinalReal('');
      setResumen(null);
      setMovimientos([]);
      cargarDatos();
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'Error al cerrar caja');
    }
  }

  const handleCrearMovimiento = async (e) => {
    e.preventDefault();
    try {
      await api.post('/caja/movimientos', { ...formDatos, id_tienda: idTienda });
      toast.success('Movimiento registrado')
      setModalVisible(false)
      setFormDatos({ tipo_movimiento: 'EGRESO', concepto: 'Gasto Envío', monto: '', descripcion: '' })
      cargarDatos()
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'Error al registrar')
    }
  }

  const handleEliminar = async () => {
    try {
      await api.delete(`/caja/movimientos/${modalEliminar.id_movimiento}`)
      toast.success('Movimiento eliminado')
      setModalEliminar(null)
      cargarDatos()
    } catch (error) {
      toast.error('Error al eliminar')
    }
  }

  const columnas = [
    { label: 'Hora', className: 'px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase w-20' },
    { label: 'Tipo', className: 'px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase' },
    { label: 'Concepto', className: 'px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase' },
    { label: 'Descripción', className: 'px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase' },
    { label: 'Monto', className: 'px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase' },
    { label: '', className: 'px-4 py-3 text-right w-16' },
  ]

  if (cargando && estadoCaja === null) {
    return <div className="py-20 flex justify-center"><Spinner size={40} /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Wallet className="text-blue-500" />
            Mi Caja — {nombreTienda}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {estadoCaja === 'ABIERTA' 
              ? `Sesión iniciada el ${dayjs(sesion?.fecha_apertura).format('DD/MM/YYYY a las HH:mm')}`
              : `Registra tu inicio de turno para empezar a vender.`
            }
          </p>
        </div>
        {estadoCaja === 'ABIERTA' && (
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => setModalVisible(true)} className="btn-primary flex-1 sm:flex-none">
              <Plus size={16} className="mr-2" /> Gasto
            </button>
            <button onClick={() => setModalCerrar(true)} className="btn-secondary bg-red-50 text-red-600 border-red-200 hover:bg-red-100 flex-1 sm:flex-none">
              <Lock size={16} className="mr-2" /> Cerrar Caja
            </button>
          </div>
        )}
      </div>

      {estadoCaja === 'CERRADA' ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 flex flex-col items-center max-w-md mx-auto mt-10 shadow-sm">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <Unlock className="text-blue-500 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Abrir Caja</h2>
          <p className="text-gray-500 text-center text-sm mb-6">
            Para empezar tu turno y realizar ventas, necesitas abrir la caja indicando con cuánto sencillo cuentas físicamente.
          </p>
          <form onSubmit={handleAbrirCaja} className="w-full space-y-4">
            <div>
              <label className="label text-center">Sencillo Inicial (S/)</label>
              <input 
                type="number" step="0.10" min="0" required 
                className="input text-center text-3xl font-black text-blue-600 py-3"
                value={saldoInicial} 
                onChange={e => setSaldoInicial(e.target.value)}
                autoFocus
              />
            </div>
            <button type="submit" className="btn-primary w-full py-3 text-lg mt-4" disabled={cargando}>
              Abrir Caja y Empezar Turno
            </button>
          </form>
        </div>
      ) : (
        <>
          {resumen && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card p-5 border-l-4 border-green-500">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Ingresos / Sencillo</p>
                <p className="text-2xl font-black text-green-600 mt-1">S/ {parseFloat(resumen.total_ingresos).toFixed(2)}</p>
              </div>
              <div className="card p-5 border-l-4 border-green-500">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Ventas Efectivo</p>
                <p className="text-2xl font-black text-green-600 mt-1">S/ {parseFloat(resumen.ventas_efectivo).toFixed(2)}</p>
              </div>
              <div className="card p-5 border-l-4 border-red-500">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Gastos Registrados</p>
                <p className="text-2xl font-black text-red-600 mt-1">S/ {parseFloat(resumen.total_egresos).toFixed(2)}</p>
              </div>
              <div className="card p-5 bg-blue-50 border border-blue-200 shadow-md">
                <p className="text-xs font-bold text-blue-800 uppercase tracking-wide">Sistema Calcula (Efectivo)</p>
                <p className="text-3xl font-black text-blue-700 mt-1">S/ {parseFloat(resumen.saldo_final).toFixed(2)}</p>
              </div>
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="font-bold text-gray-800">Movimientos de la Sesión</h2>
            </div>
            
            {cargando ? (
              <div className="py-20 flex justify-center"><Spinner size={30} /></div>
            ) : (
              <Tabla columnas={columnas} vacia="No hay movimientos aún en esta sesión.">
                {movimientos.map(r => (
                  <tr key={r.id_movimiento} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3 text-sm text-gray-500">{dayjs(r.fecha).format('HH:mm')}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${r.tipo_movimiento === 'INGRESO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {r.tipo_movimiento}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{r.concepto}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{r.descripcion}</td>
                    <td className={`px-4 py-3 text-sm font-bold text-right ${r.tipo_movimiento === 'INGRESO' ? 'text-green-600' : 'text-red-600'}`}>
                      {r.tipo_movimiento === 'INGRESO' ? '+' : '-'}S/ {parseFloat(r.monto).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.id_usuario === usuario.id_usuario && (
                        <button onClick={() => setModalEliminar(r)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </Tabla>
            )}
          </div>
        </>
      )}

      {/* Modal Crear Movimiento */}
      <Modal open={modalVisible} onClose={() => setModalVisible(false)} title="Registrar Gasto o Ingreso">
        <form onSubmit={handleCrearMovimiento} className="space-y-4">
          <div>
            <label className="label">Tipo de Movimiento</label>
            <select 
              className="input" required
              value={formDatos.tipo_movimiento} 
              onChange={e => setFormDatos({...formDatos, tipo_movimiento: e.target.value})}
            >
              <option value="EGRESO">EGRESO (Saqué dinero de caja)</option>
              <option value="INGRESO">INGRESO (Metí dinero extra a caja)</option>
            </select>
          </div>
          <div>
            <label className="label">Concepto</label>
            <select 
              className="input" required
              value={formDatos.concepto} 
              onChange={e => setFormDatos({...formDatos, concepto: e.target.value})}
            >
              <option value="Gasto Envío">Gasto Envío</option>
              <option value="Compra Insumo">Compra Insumo (Limpieza, etc)</option>
              <option value="Otro Gasto Tienda">Otro Gasto de Tienda</option>
              <option value="Retiro Jefe">Retiro Jefe (Le di dinero al admin)</option>
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
            <button type="submit" className="btn-primary flex-1 justify-center">Guardar</button>
          </div>
        </form>
      </Modal>

      {/* Modal Cerrar Caja */}
      <Modal open={modalCerrar} onClose={() => setModalCerrar(false)} title="Cerrar Caja (Fin de Turno)">
        <form onSubmit={handleCerrarCaja} className="space-y-5">
          <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm border border-yellow-200">
            <h4 className="font-bold flex items-center gap-1 mb-1"><CheckCircle size={16} /> Instrucciones:</h4>
            <p>Cuenta el dinero en efectivo que tienes físicamente en la caja e ingrésalo abajo. El sistema calculará si te sobra o te falta dinero comparado con lo registrado.</p>
          </div>
          
          <div className="text-center">
            <p className="text-gray-500 font-medium mb-2">Según el sistema deberías tener:</p>
            <p className="text-4xl font-black text-gray-800">S/ {resumen ? parseFloat(resumen.saldo_final).toFixed(2) : '0.00'}</p>
          </div>

          <div className="border-t border-gray-200 pt-5">
            <label className="label text-center text-lg">¿Cuánto Efectivo Físico Tienes?</label>
            <input 
              type="number" step="0.10" min="0" required 
              className="input text-center text-3xl font-black text-blue-600 py-3"
              value={saldoFinalReal} 
              onChange={e => setSaldoFinalReal(e.target.value)}
              autoFocus
            />
          </div>
          <div className="pt-2 flex gap-3">
            <button type="button" onClick={() => setModalCerrar(false)} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button type="submit" className="btn-primary bg-red-600 hover:bg-red-700 flex-1 justify-center border-red-600 text-white" disabled={cargando}>
              Cerrar Caja
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!modalEliminar}
        onClose={() => setModalEliminar(null)}
        onConfirm={handleEliminar}
        mensaje={`¿Estás seguro de eliminar este movimiento?`}
      />
    </div>
  )
}
