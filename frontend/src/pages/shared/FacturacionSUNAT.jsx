import { useState, useEffect } from 'react'
import { FileText, XCircle, FileMinus, RefreshCcw, Search, Eye, ExternalLink, RotateCw, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import api from '../../api/axios'
import dayjs from 'dayjs'
import toast from 'react-hot-toast'
import { Modal, Spinner, Tabla, ConfirmModal } from '../../components/ui/index.jsx'
import { formatMoneda } from '../../utils/formatMoneda.js'
import { useAuth } from '../../context/AuthContext'

export default function FacturacionSUNAT() {
  const { usuario } = useAuth()
  const [comprobantes, setComprobantes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [reenviando, setReenviando] = useState(null)

  const [modalNotaCredito, setModalNotaCredito] = useState(null)
  const [motivoNC, setMotivoNC] = useState('')

  const [modalBaja, setModalBaja] = useState(null)
  const [modalDetalle, setModalDetalle] = useState(null)

  const cargarComprobantes = async () => {
    setCargando(true)
    try {
      const { data } = await api.get('/facturacion/comprobantes')
      setComprobantes(data.datos || [])
    } catch (error) {
      toast.error('Error al cargar comprobantes')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarComprobantes()
  }, [])

  const handleReenviar = async (id_venta) => {
    setReenviando(id_venta)
    try {
      await api.post('/facturacion/reenviar', { id_venta })
      toast.success('Comprobante reenviado a Nubefact exitosamente')
      cargarComprobantes()
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'Error al reenviar comprobante')
    } finally {
      setReenviando(null)
    }
  }

  const handleEmitirNC = async (e) => {
    e.preventDefault()
    if (!motivoNC) return toast.error('Debes ingresar un motivo')
    try {
      const { data } = await api.post('/facturacion/nota-credito', { id_venta: modalNotaCredito.id_venta, motivo: motivoNC })
      toast.success(data.mensaje || 'Nota de Crédito emitida')
      setModalNotaCredito(null)
      setMotivoNC('')
      cargarComprobantes()
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'Error al emitir NC')
    }
  }

  const handleComunicacionBaja = async () => {
    try {
      const { data } = await api.post('/facturacion/anular', { id_venta: modalBaja.id_venta })
      toast.success(data.mensaje || 'Comunicación de Baja enviada')
      setModalBaja(null)
      cargarComprobantes()
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'Error al emitir Baja')
    }
  }

  const columnas = [
    { label: 'Fecha', className: 'px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase' },
    { label: 'Comprobante', className: 'px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase' },
    { label: 'Cliente', className: 'px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase' },
    { label: 'Total', className: 'px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase' },
    { label: 'Estado SUNAT', className: 'px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase' },
    { label: 'Documentos', className: 'px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase' },
    { label: 'Acciones', className: 'px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase' },
  ]

  const filtrados = comprobantes.filter(c => 
    (c.cliente?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
    (c.serie_correlativo?.toLowerCase() || '').includes(busqueda.toLowerCase())
  )

  const getEstadoBadge = (estado, apiEnviado) => {
    if (estado === 'ACEPTADO') return { color: 'bg-emerald-100 text-emerald-700 border border-emerald-200', icon: <CheckCircle size={12} className="mr-1" />, label: 'ACEPTADO' }
    if (estado === 'RECHAZADO') return { color: 'bg-red-100 text-red-700 border border-red-200', icon: <AlertTriangle size={12} className="mr-1" />, label: 'RECHAZADO' }
    if (estado === 'ANULADO_NC') return { color: 'bg-gray-200 text-gray-600 border border-gray-300 line-through', icon: null, label: 'ANULADO (NC)' }
    if (estado === 'ANULADO_BAJA') return { color: 'bg-gray-200 text-gray-600 border border-gray-300 line-through', icon: null, label: 'ANULADO (BAJA)' }
    if (apiEnviado === 1) return { color: 'bg-amber-100 text-amber-700 border border-amber-200', icon: <Clock size={12} className="mr-1" />, label: estado || 'PROCESANDO' }
    return { color: 'bg-blue-50 text-blue-600 border border-blue-200', icon: <Clock size={12} className="mr-1" />, label: 'PENDIENTE' }
  }

  // Contar estadísticas
  const totalAceptados = comprobantes.filter(c => c.estado_sunat === 'ACEPTADO').length
  const totalPendientes = comprobantes.filter(c => !c.estado_sunat || c.estado_sunat === 'PENDIENTE').length
  const totalAnulados = comprobantes.filter(c => c.estado_sunat?.includes('ANULADO')).length

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-blue-600" />
            Facturación Electrónica (SUNAT)
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Comprobantes electrónicos integrados con Nubefact — Boletas, Facturas, Notas de Crédito y Comunicaciones de Baja.
          </p>
        </div>
      </div>

      {/* Resumen de estados */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <CheckCircle size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{totalAceptados}</p>
            <p className="text-xs text-gray-500">Aceptados por SUNAT</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <Clock size={20} className="text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{totalPendientes}</p>
            <p className="text-xs text-gray-500">Pendientes de envío</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <XCircle size={20} className="text-gray-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{totalAnulados}</p>
            <p className="text-xs text-gray-500">Anulados</p>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="relative w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por cliente o comprobante..." 
              className="input pl-9 text-sm py-1.5"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <button onClick={cargarComprobantes} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Actualizar">
            <RefreshCcw size={16} />
          </button>
        </div>
        
        {cargando ? (
          <div className="py-20 flex justify-center"><Spinner size={30} /></div>
        ) : (
          <Tabla columnas={columnas} vacia="No hay comprobantes electrónicos emitidos.">
            {filtrados.map(c => {
              const badge = getEstadoBadge(c.estado_sunat, c.api_enviado)
              return (
                <tr key={c.id_venta} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3 text-sm text-gray-500">{dayjs(c.fecha_venta).format('DD/MM/YYYY HH:mm')}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-800">{c.tipo_comprobante}</span>
                    {c.serie_correlativo && <span className="ml-2 text-xs text-gray-500">{c.serie_correlativo}</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div>{c.cliente || 'VARIOS'}</div>
                    {c.dni_ruc && c.dni_ruc !== '00000000' && (
                      <div className="text-[10px] text-gray-400">{c.tipo_documento}: {c.dni_ruc}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-right">{formatMoneda(c.total)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold ${badge.color}`}>
                      {badge.icon}
                      {badge.label}
                    </span>
                  </td>
                  {/* Documentos PDF/XML/CDR */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {c.enlace_pdf && c.enlace_pdf !== 'http://localhost/dummy-factura.pdf' && (
                        <a href={c.enlace_pdf} target="_blank" rel="noopener noreferrer" 
                           className="px-1.5 py-0.5 text-[9px] font-bold bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors border border-red-200">
                          PDF
                        </a>
                      )}
                      {c.enlace_xml && c.enlace_xml !== 'http://localhost/dummy-factura.xml' && (
                        <a href={c.enlace_xml} target="_blank" rel="noopener noreferrer" 
                           className="px-1.5 py-0.5 text-[9px] font-bold bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors border border-blue-200">
                          XML
                        </a>
                      )}
                      {c.enlace_cdr && c.enlace_cdr !== 'http://localhost/dummy-factura.cdr' && (
                        <a href={c.enlace_cdr} target="_blank" rel="noopener noreferrer" 
                           className="px-1.5 py-0.5 text-[9px] font-bold bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors border border-green-200">
                          CDR
                        </a>
                      )}
                      {(!c.enlace_pdf || c.enlace_pdf === 'http://localhost/dummy-factura.pdf') && (
                        <span className="text-[10px] text-gray-300">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => setModalDetalle(c)} 
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" 
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>
                      {/* Botón reenviar solo para pendientes */}
                      {(!c.estado_sunat || c.estado_sunat === 'PENDIENTE') && !c.estado_sunat?.includes('ANULADO') && (
                        <button 
                          onClick={() => handleReenviar(c.id_venta)} 
                          disabled={reenviando === c.id_venta}
                          className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50" 
                          title="Reenviar a Nubefact"
                        >
                          <RotateCw size={16} className={reenviando === c.id_venta ? 'animate-spin' : ''} />
                        </button>
                      )}
                      {!c.estado_sunat?.includes('ANULADO') && (
                        <>
                          <button onClick={() => setModalBaja(c)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Dar de Baja / Anular">
                            <XCircle size={16} />
                          </button>
                          <button onClick={() => setModalNotaCredito(c)} className="p-1.5 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg" title="Emitir Nota de Crédito">
                            <FileMinus size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </Tabla>
        )}
      </div>

      {/* Modal Detalle de Comprobante */}
      <Modal open={!!modalDetalle} onClose={() => setModalDetalle(null)} title="Detalle del Comprobante" maxWidth="max-w-lg">
        {modalDetalle && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Tipo</p>
                <p className="font-bold text-gray-800">{modalDetalle.tipo_comprobante}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Serie-Correlativo</p>
                <p className="font-bold text-gray-800">{modalDetalle.serie_correlativo}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Cliente</p>
                <p className="font-medium text-gray-700">{modalDetalle.cliente || 'VARIOS'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Total</p>
                <p className="font-bold text-blue-700 text-lg">{formatMoneda(modalDetalle.total)}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Fecha</p>
                <p className="text-gray-700">{dayjs(modalDetalle.fecha_venta).format('DD/MM/YYYY HH:mm')}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Tienda</p>
                <p className="text-gray-700">{modalDetalle.nombre_tienda}</p>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase">Estado SUNAT</p>
              <div className="bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Estado:</span>
                  <span className={`font-bold ${modalDetalle.estado_sunat === 'ACEPTADO' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {modalDetalle.estado_sunat || 'PENDIENTE'}
                  </span>
                </div>
                {modalDetalle.codigo_sunat && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Código:</span>
                    <span className="text-gray-700">{modalDetalle.codigo_sunat}</span>
                  </div>
                )}
                {modalDetalle.hash_sunat && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Hash:</span>
                    <span className="text-gray-700 text-xs font-mono truncate max-w-[200px]">{modalDetalle.hash_sunat}</span>
                  </div>
                )}
                {modalDetalle.mensaje_sunat && (
                  <div className="mt-1">
                    <span className="text-gray-500">Mensaje:</span>
                    <p className="text-gray-700 text-xs mt-0.5">{modalDetalle.mensaje_sunat}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Links a documentos */}
            {(modalDetalle.enlace_pdf || modalDetalle.enlace_xml || modalDetalle.enlace_cdr) && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-500 uppercase">Documentos Electrónicos</p>
                <div className="flex gap-2 flex-wrap">
                  {modalDetalle.enlace_pdf && !modalDetalle.enlace_pdf.includes('localhost') && !modalDetalle.enlace_pdf.includes('demo.nubefact') && (
                    <a href={modalDetalle.enlace_pdf} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors border border-red-200">
                      <ExternalLink size={14} /> Ver PDF
                    </a>
                  )}
                  {modalDetalle.enlace_xml && !modalDetalle.enlace_xml.includes('localhost') && !modalDetalle.enlace_xml.includes('demo.nubefact') && (
                    <a href={modalDetalle.enlace_xml} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200">
                      <ExternalLink size={14} /> Descargar XML
                    </a>
                  )}
                  {modalDetalle.enlace_cdr && !modalDetalle.enlace_cdr.includes('localhost') && !modalDetalle.enlace_cdr.includes('demo.nubefact') && (
                    <a href={modalDetalle.enlace_cdr} target="_blank" rel="noopener noreferrer"
                       className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors border border-green-200">
                      <ExternalLink size={14} /> Descargar CDR
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal open={!!modalNotaCredito} onClose={() => setModalNotaCredito(null)} title="Emitir Nota de Crédito" maxWidth="max-w-md">
        <form onSubmit={handleEmitirNC} className="space-y-4 pt-2">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-800 text-sm">
            <p className="font-bold">Comprobante a anular: {modalNotaCredito?.tipo_comprobante} {modalNotaCredito?.serie_correlativo}</p>
            <p className="text-xs mt-1">Este proceso enviará a SUNAT una Nota de Crédito para anular este comprobante. El comprobante quedará sin efecto tributario.</p>
          </div>
          <div>
            <label className="label">Motivo de Anulación / Devolución</label>
            <select required className="input" value={motivoNC} onChange={e => setMotivoNC(e.target.value)}>
              <option value="">-- Selecciona un motivo --</option>
              <option value="Anulación de la operación">Anulación de la operación</option>
              <option value="Devolución total">Devolución total</option>
              <option value="Error en el RUC/DNI">Error en el RUC/DNI</option>
              <option value="Error en la descripción">Error en la descripción</option>
            </select>
          </div>
          <div className="pt-2 flex gap-3">
            <button type="button" onClick={() => setModalNotaCredito(null)} className="btn-secondary flex-1 justify-center">Cancelar</button>
            <button type="submit" className="btn-primary bg-amber-600 hover:bg-amber-700 flex-1 justify-center">Emitir N.C. a SUNAT</button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!modalBaja}
        onClose={() => setModalBaja(null)}
        onConfirm={handleComunicacionBaja}
        mensaje={`¿Estás seguro de enviar a SUNAT la comunicación de baja para ${modalBaja?.tipo_comprobante} ${modalBaja?.serie_correlativo}? Solo permitido para comprobantes emitidos el mismo día.`}
        btnConfirm="Enviar Baja a SUNAT"
      />
    </div>
  )
}
