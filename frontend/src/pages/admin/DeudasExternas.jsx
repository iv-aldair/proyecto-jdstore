import { useState, useEffect } from 'react'
import { CheckCircle, Building2 } from 'lucide-react'
import api from '../../api/axios'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import { Modal, Spinner, Tabla, ConfirmModal } from '../../components/ui/index.jsx'

export default function DeudasExternas() {
  const [deudas, setDeudas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modalPagar, setModalPagar] = useState(null)

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const { data } = await api.get('/deudas')
      setDeudas(data.datos)
    } catch (error) {
      toast.error('Error al cargar deudas externas')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handlePagar = async () => {
    try {
      await api.put(`/deudas/${modalPagar}/pagar`)
      toast.success('Deuda saldada')
      setModalPagar(null)
      cargarDatos()
    } catch (error) {
      toast.error('Error al pagar la deuda')
    }
  }

  const columnas = [
    { label: 'Fecha Venta', className: 'px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase' },
    { label: 'Tienda Prestamista', className: 'px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase' },
    { label: 'Producto', className: 'px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase' },
    { label: 'Costo a Pagar', className: 'px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase' },
    { label: 'Vendedor Local', className: 'px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase' },
    { label: 'Comprobante', className: 'px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase' },
    { label: 'Estado', className: 'px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase' },
    { label: 'Acción', className: 'px-4 py-3 text-right w-24' },
  ]

  const totalPendiente = deudas.filter(d => d.estado_pago === 'PENDIENTE').reduce((acc, val) => acc + parseFloat(val.monto_deuda), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Building2 className="text-amber-500" />
            Consignaciones
          </h1>
          <p className="text-gray-500 text-sm mt-1">Cuentas por pagar a otras tiendas por préstamos de productos.</p>
        </div>
        <div className="bg-red-50 px-5 py-3 rounded-xl border border-red-200 flex items-center gap-3 w-full sm:w-auto">
          <span className="text-red-800 font-medium text-sm">Deuda Total Pendiente:</span>
          <span className="text-2xl font-black text-red-600">S/ {totalPendiente.toFixed(2)}</span>
        </div>
      </div>

      <div className="card overflow-hidden">
        {cargando ? (
          <div className="py-20 flex justify-center"><Spinner size={30} /></div>
        ) : (
          <Tabla columnas={columnas} vacia="No hay deudas registradas.">
            {deudas.map(r => (
              <tr key={r.id_deuda} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 text-sm text-gray-600">{dayjs(r.fecha).format('DD/MM/YYYY HH:mm')}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg whitespace-nowrap">
                    {r.tienda_proveedor}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800">{r.producto_nombre}</td>
                <td className="px-4 py-3 text-sm font-bold text-red-600 text-right">S/ {parseFloat(r.monto_deuda).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{r.vendedor}</td>
                <td className="px-4 py-3 text-sm font-mono text-gray-500">{r.numero_comprobante || 'N/A'}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${r.estado_pago === 'PAGADO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {r.estado_pago}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {r.estado_pago === 'PENDIENTE' && (
                    <button onClick={() => setModalPagar(r.id_deuda)} className="btn-primary text-xs px-2 py-1 gap-1">
                      <CheckCircle size={14} /> Pagar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </Tabla>
        )}
      </div>

      <ConfirmModal
        open={!!modalPagar}
        onClose={() => setModalPagar(null)}
        onConfirm={handlePagar}
        mensaje="¿Marcar esta deuda como pagada? Asegúrate de haber entregado el dinero a la tienda correspondiente."
      />
    </div>
  )
}
