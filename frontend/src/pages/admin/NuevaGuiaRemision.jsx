import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { guiasRemisionApi } from '../../api/guiasRemision.api.js'
import { productosApi } from '../../api/productos.api.js'
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTienda } from '../../context/TiendaContext.jsx'

export default function NuevaGuiaRemision() {
  const navigate = useNavigate()
  const { idTienda } = useTienda()
  
  const [form, setForm] = useState({
    numero_guia: '',
    fecha_emision: new Date().toISOString().split('T')[0],
    partida_direccion: '',
    partida_ubigeo: '',
    llegada_direccion: '',
    llegada_ubigeo: '',
    destinatario_razon_social: '',
    destinatario_identificacion: '',
    destinatario_tipo_doc: 'RUC',
    motivo_traslado: 'Venta',
    peso_bruto: 1,
    bultos: 1,
    modalidad_traslado: 'Transporte Público',
    fecha_inicio_traslado: new Date().toISOString().split('T')[0],
    transp_razon_social: '',
    transp_identidad: '',
    transp_placa: '',
    doc_rel_numero: '',
    doc_rel_tipo: 'Factura',
    doc_rel_ruc: ''
  })

  const [detalles, setDetalles] = useState([])
  const [busqueda, setBusqueda] = useState('')

  const { data: productos } = useQuery({
    queryKey: ['productos-buscar', busqueda, idTienda],
    queryFn: () => productosApi.buscar(busqueda, idTienda).then(r => r.data.datos),
    enabled: busqueda.length > 2
  })

  const crearGuia = useMutation({
    mutationFn: (datos) => guiasRemisionApi.crear(datos),
    onSuccess: (res) => {
      toast.success('Guía de remisión creada')
      navigate(`/admin/guias-remision/${res.data.datos.id_guia}/imprimir`)
    },
    onError: (err) => toast.error(err.response?.data?.mensaje || 'Error al crear la guía')
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const agregarProducto = (prod) => {
    if (detalles.find(d => d.id_producto === prod.id_producto)) {
      toast.error('El producto ya está en la lista')
      return
    }
    setDetalles([...detalles, {
      id_producto: prod.id_producto,
      codigo_producto: prod.codigo_producto,
      descripcion: prod.nombre,
      unidad: 'NIU',
      cantidad: 1,
      series: ''
    }])
    setBusqueda('')
  }

  const actualizarDetalle = (index, campo, valor) => {
    const nuevos = [...detalles]
    nuevos[index][campo] = valor
    setDetalles(nuevos)
  }

  const eliminarDetalle = (index) => {
    setDetalles(detalles.filter((_, i) => i !== index))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.numero_guia || !form.partida_direccion || !form.llegada_direccion || !form.destinatario_razon_social) {
      toast.error('Completa los campos obligatorios (*)')
      return
    }
    if (detalles.length === 0) {
      toast.error('Agrega al menos un producto a la guía')
      return
    }
    crearGuia.mutate({ cabecera: form, detalles })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div>
          <h1 className="page-title">Nueva Guía de Remisión</h1>
          <p className="text-sm text-gray-500">Emisión de Guía de Remisión Remitente Electrónica</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Cabecera Principal */}
        <div className="card p-6 border-t-4 border-t-blue-600">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Datos Principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="form-label">Número de Guía *</label>
              <input type="text" name="numero_guia" value={form.numero_guia} onChange={handleChange} className="form-input" placeholder="T001-000001" required />
            </div>
            <div>
              <label className="form-label">Fecha Emisión *</label>
              <input type="date" name="fecha_emision" value={form.fecha_emision} onChange={handleChange} className="form-input" required />
            </div>
            <div>
              <label className="form-label">Motivo Traslado *</label>
              <select name="motivo_traslado" value={form.motivo_traslado} onChange={handleChange} className="form-input">
                <option value="Venta">Venta</option>
                <option value="Compra">Compra</option>
                <option value="Traslado entre establecimientos">Traslado entre establecimientos de la misma empresa</option>
                <option value="Devolución">Devolución</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
            <div>
              <label className="form-label">Modalidad *</label>
              <select name="modalidad_traslado" value={form.modalidad_traslado} onChange={handleChange} className="form-input">
                <option value="Transporte Público">Transporte Público</option>
                <option value="Transporte Privado">Transporte Privado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Puntos de Partida y Llegada */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 border-t-4 border-t-gray-400">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Punto de Partida</h2>
            <div className="space-y-4">
              <div>
                <label className="form-label">Dirección Completa *</label>
                <input type="text" name="partida_direccion" value={form.partida_direccion} onChange={handleChange} className="form-input" required />
              </div>
              <div>
                <label className="form-label">Ubigeo *</label>
                <input type="text" name="partida_ubigeo" value={form.partida_ubigeo} onChange={handleChange} className="form-input" placeholder="Ej: 211101" required />
              </div>
            </div>
          </div>
          <div className="card p-6 border-t-4 border-t-gray-400">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Punto de Llegada</h2>
            <div className="space-y-4">
              <div>
                <label className="form-label">Dirección Completa *</label>
                <input type="text" name="llegada_direccion" value={form.llegada_direccion} onChange={handleChange} className="form-input" required />
              </div>
              <div>
                <label className="form-label">Ubigeo *</label>
                <input type="text" name="llegada_ubigeo" value={form.llegada_ubigeo} onChange={handleChange} className="form-input" placeholder="Ej: 211101" required />
              </div>
            </div>
          </div>
        </div>

        {/* Destinatario y Transportista */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 border-t-4 border-t-indigo-500">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Destinatario</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Tipo Doc.</label>
                  <select name="destinatario_tipo_doc" value={form.destinatario_tipo_doc} onChange={handleChange} className="form-input">
                    <option value="R.U.C.">R.U.C.</option>
                    <option value="DNI">DNI</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">N° Identificación *</label>
                  <input type="text" name="destinatario_identificacion" value={form.destinatario_identificacion} onChange={handleChange} className="form-input" required />
                </div>
              </div>
              <div>
                <label className="form-label">Razón Social o Nombre *</label>
                <input type="text" name="destinatario_razon_social" value={form.destinatario_razon_social} onChange={handleChange} className="form-input" required />
              </div>
            </div>
          </div>
          <div className="card p-6 border-t-4 border-t-orange-500">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Transportista (Público)</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">RUC Transportista</label>
                  <input type="text" name="transp_identidad" value={form.transp_identidad} onChange={handleChange} className="form-input" />
                </div>
                <div>
                  <label className="form-label">Placa Vehículo</label>
                  <input type="text" name="transp_placa" value={form.transp_placa} onChange={handleChange} className="form-input" />
                </div>
              </div>
              <div>
                <label className="form-label">Razón Social Transportista</label>
                <input type="text" name="transp_razon_social" value={form.transp_razon_social} onChange={handleChange} className="form-input" />
              </div>
            </div>
          </div>
        </div>

        {/* Bienes a trasladar */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Bienes a Trasladar</h2>
          
          <div className="mb-4 relative">
            <input 
              type="text" 
              placeholder="Buscar producto por nombre o código para añadir..." 
              className="form-input w-full md:w-1/2"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
            {productos?.length > 0 && busqueda.length > 2 && (
              <div className="absolute z-10 w-full md:w-1/2 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {productos.map(p => (
                  <button key={p.id_producto} type="button" onClick={() => agregarProducto(p)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex justify-between items-center border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{p.nombre}</p>
                      <p className="text-xs text-gray-500">Cod: {p.codigo_producto} | Stock: {p.stock}</p>
                    </div>
                    <Plus size={16} className="text-blue-600" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border border-gray-200">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="px-3 py-2 w-16">Cód.</th>
                  <th className="px-3 py-2">Descripción del Producto</th>
                  <th className="px-3 py-2 w-24">Cantidad</th>
                  <th className="px-3 py-2 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {detalles.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-6 text-gray-500">No hay productos agregados</td></tr>
                ) : (
                  detalles.map((d, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="px-3 py-2 text-xs font-mono">{d.codigo_producto}</td>
                      <td className="px-3 py-2">
                        <input type="text" value={d.descripcion} onChange={(e) => actualizarDetalle(index, 'descripcion', e.target.value)} className="w-full bg-transparent outline-none font-medium text-gray-800" />
                        <input type="text" placeholder="Ej: SN12345, SN98765" value={d.series} onChange={(e) => actualizarDetalle(index, 'series', e.target.value)} className="w-full mt-1 text-xs text-gray-500 bg-transparent outline-none border-b border-dashed border-gray-300 focus:border-blue-500" />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" min="1" value={d.cantidad} onChange={(e) => actualizarDetalle(index, 'cantidad', parseInt(e.target.value) || 1)} className="w-full form-input text-center p-1" />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button type="button" onClick={() => eliminarDetalle(index)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
             <div>
              <label className="form-label">Peso Bruto Total (KGM) *</label>
              <input type="number" step="0.01" name="peso_bruto" value={form.peso_bruto} onChange={handleChange} className="form-input" required />
            </div>
             <div>
              <label className="form-label">N° Bultos *</label>
              <input type="number" name="bultos" value={form.bultos} onChange={handleChange} className="form-input" required />
            </div>
            <div className="col-span-2">
              <label className="form-label">Documento Relacionado (Opcional)</label>
              <div className="flex gap-2">
                <select name="doc_rel_tipo" value={form.doc_rel_tipo} onChange={handleChange} className="form-input w-1/3">
                  <option value="Factura">Factura</option>
                  <option value="Boleta">Boleta</option>
                </select>
                <input type="text" name="doc_rel_numero" value={form.doc_rel_numero} onChange={handleChange} placeholder="F001-12345" className="form-input w-2/3" />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Save Button */}
        <div className="fixed bottom-0 left-0 lg:left-60 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 flex justify-end gap-3 print:hidden">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary px-6">Cancelar</button>
          <button type="submit" disabled={crearGuia.isLoading} className="btn-primary px-8 shadow-lg">
            {crearGuia.isLoading ? 'Generando...' : <><Save size={18} /> Generar Guía de Remisión</>}
          </button>
        </div>
      </form>
    </div>
  )
}
