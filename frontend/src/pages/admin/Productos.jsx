import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productosApi } from '../../api/productos.api.js'
import { tipoCambioApi } from '../../api/tipoCambio.api.js'
import { formatMoneda } from '../../utils/formatMoneda.js'
import { Modal, Tabla, PageLoader, ConfirmModal } from '../../components/ui/index.jsx'
import SearchBar from '../../components/SearchBar.jsx'
import Pagination from '../../components/Pagination.jsx'
import { importacionApi } from '../../api/importacion.api.js'
import { Plus, Edit, Trash2, Filter, RefreshCw, DollarSign, Upload, Download } from 'lucide-react'
import toast from 'react-hot-toast'

const FORM_VACIO = {
  codigo_producto: '', nombre: '', modelo: '', descripcion: '',
  precio: '', id_categoria: '', id_marca: '', estado: 1,
  moneda_compra: 'PEN', precio_costo_usd: '', margen_porcentaje: 30,
}

export default function Productos() {
  const qc = useQueryClient()
  const [pagina, setPagina]     = useState(1)
  const [buscar, setBuscar]     = useState('')
  const [filtros, setFiltros]   = useState({ id_categoria: '', id_marca: '' })
  const [modal, setModal]       = useState(false)
  const [confirm, setConfirm]   = useState(null)
  const [editando, setEditando] = useState(null)
  const [form, setForm]         = useState(FORM_VACIO)
  
  // --- Estados de Importación ---
  const [modalImportar, setModalImportar] = useState(false)
  const [archivoExcel, setArchivoExcel]   = useState(null)
  const [importando, setImportando]       = useState(false)
  const [exportando, setExportando]       = useState(false)
  const [resumenImportacion, setResumenImportacion] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['productos', pagina, buscar, filtros],
    queryFn: () => productosApi.listar({
      pagina, limite: 15, buscar: buscar || undefined,
      id_categoria: filtros.id_categoria || undefined,
      id_marca:     filtros.id_marca || undefined,
    }).then(r => r.data.datos),
    keepPreviousData: true,
  })

  const { data: cats } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => productosApi.categorias.listar().then(r => r.data.datos),
  })
  const { data: marcas } = useQuery({
    queryKey: ['marcas'],
    queryFn: () => productosApi.marcas.listar().then(r => r.data.datos),
  })

  const guardar = useMutation({
    mutationFn: (d) => editando
      ? productosApi.actualizar(editando.id_producto, d)
      : productosApi.crear(d),
    onSuccess: () => {
      toast.success(editando ? 'Producto actualizado' : 'Producto creado')
      qc.invalidateQueries(['productos'])
      setModal(false); setEditando(null); setForm(FORM_VACIO)
    },
    onError: (e) => toast.error(e.response?.data?.mensaje || 'Error al guardar'),
  })

  const eliminar = useMutation({
    mutationFn: (id) => productosApi.eliminar(id),
    onSuccess: () => {
      toast.success('Producto desactivado')
      qc.invalidateQueries(['productos'])
      setConfirm(null)
    },
    onError: () => toast.error('Error al eliminar'),
  })

  // ---- TIPO DE CAMBIO ----
  const { data: tcVigente, refetch: refetchTc } = useQuery({
    queryKey: ['tc-vigente'],
    queryFn: () => tipoCambioApi.obtenerVigente().then(r => r.data.datos),
  })

  const syncDolar = useMutation({
    mutationFn: async () => {
      const bcrp = await tipoCambioApi.consultarBCRP().then(r => r.data.datos)
      await tipoCambioApi.actualizar({ valor_usd: bcrp.venta })
      return bcrp.venta
    },
    onSuccess: (tc) => {
      toast.success(`Dólar actualizado a S/ ${tc}. Precios recalculados.`)
      refetchTc()
      qc.invalidateQueries(['productos'])
    },
    onError: (e) => toast.error(e.response?.data?.mensaje || 'Error al sincronizar el dólar'),
  })

  const abrirEditar = (p) => {
    setEditando(p)
    setForm({
      codigo_producto: p.codigo_producto, nombre: p.nombre,
      modelo: p.modelo || '', descripcion: p.descripcion || '',
      precio: p.precio, id_categoria: p.id_categoria,
      id_marca: p.id_marca, estado: p.estado,
      moneda_compra: p.moneda_compra || 'PEN',
      precio_costo_usd: p.precio_costo_usd || '',
      margen_porcentaje: p.margen_porcentaje || 30,
    })
    setModal(true)
  }
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.codigo_producto || !form.nombre || !form.id_categoria || !form.id_marca) {
      toast.error('Completa todos los campos requeridos')
      return
    }
    if (form.moneda_compra === 'PEN' && !form.precio) {
      toast.error('Debe ingresar el precio en Soles')
      return
    }
    if (form.moneda_compra === 'USD' && !form.precio_costo_usd) {
      toast.error('Debe ingresar el costo en Dólares')
      return
    }
    guardar.mutate(form)
  }

  // ---- IMPORTACIÓN EXCEL ----
  const handleImportar = async (e) => {
    e.preventDefault()
    if (!archivoExcel) return toast.error('Selecciona un archivo Excel (.xlsx)')
    
    setImportando(true)
    setResumenImportacion(null)
    
    try {
      const res = await importacionApi.importarProductos(archivoExcel)
      toast.success(res.data.mensaje || 'Importación completada')
      setResumenImportacion(res.data.datos)
      qc.invalidateQueries(['productos'])
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'Error al importar archivo')
    } finally {
      setImportando(false)
    }
  }

  const handleExportar = async () => {
    try {
      setExportando(true)
      const res = await importacionApi.exportarProductos()
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      // El nombre lo podríamos extraer de los headers, pero ponemos uno por defecto aquí
      link.setAttribute('download', `inventario_${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Excel exportado correctamente')
    } catch (error) {
      toast.error('Error al exportar los datos')
    } finally {
      setExportando(false)
    }
  }

  const cerrarModalImportar = () => {
    setModalImportar(false)
    setArchivoExcel(null)
    setResumenImportacion(null)
  }

  const cols = [
    { label: 'Código' },
    { label: 'Producto' },
    { label: 'Categoría' },
    { label: 'Marca' },
    { label: 'Precio' },
    { label: 'Estado' },
    { label: 'Acciones' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Productos</h1>
        <div className="flex gap-2">
          <button onClick={handleExportar} disabled={exportando}
            className="btn-secondary" title="Exportar inventario a Excel">
            {exportando ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
            <span className="hidden sm:inline">Exportar Excel</span>
          </button>
          <button onClick={() => setModalImportar(true)}
            className="btn-secondary" title="Importar inventario desde Excel">
            <Upload size={16} /> <span className="hidden sm:inline">Importar Excel</span>
          </button>
          <button onClick={() => { setEditando(null); setForm(FORM_VACIO); setModal(true) }}
            className="btn-primary">
            <Plus size={16} /> <span className="hidden sm:inline">Nuevo producto</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card p-4 flex flex-wrap gap-3">
        <SearchBar placeholder="Buscar por nombre, código o modelo..." onSearch={v => { setBuscar(v); setPagina(1) }} className="flex-1 min-w-48" />
        <select className="input w-44" value={filtros.id_categoria}
          onChange={e => { setFiltros({ ...filtros, id_categoria: e.target.value }); setPagina(1) }}>
          <option value="">Todas las categorías</option>
          {cats?.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>)}
        </select>
        <select className="input w-36" value={filtros.id_marca}
          onChange={e => { setFiltros({ ...filtros, id_marca: e.target.value }); setPagina(1) }}>
          <option value="">Todas las marcas</option>
          {marcas?.map(m => <option key={m.id_marca} value={m.id_marca}>{m.nombre_marca}</option>)}
        </select>
      </div>

      {/* Widget de Dólar */}
      <div className="card p-5 flex flex-col md:flex-row items-center justify-between gap-4 border-l-4 border-l-red-500">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Cotización Dólar (Google)</p>
            <p className="text-2xl font-extrabold text-gray-900 mt-0.5">S/ {tcVigente?.valor_config || '...'}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Sincronización automática • 08:30 AM</p>
          </div>
        </div>
        <button onClick={() => syncDolar.mutate()} disabled={syncDolar.isPending} 
          className="btn-secondary gap-2">
          <RefreshCw size={14} className={syncDolar.isPending ? 'animate-spin' : ''} />
          {syncDolar.isPending ? 'Sincronizando...' : 'Actualizar ahora'}
        </button>
      </div>

      {/* Tabla */}
      <div className="card">
        {isLoading ? <PageLoader /> : (
          <>
            <Tabla columnas={cols} vacia="No se encontraron productos">
              {data?.productos?.map(p => (
                <tr key={p.id_producto}>
                  <td className="font-mono text-xs text-gray-500">{p.codigo_producto}</td>
                  <td>
                    <p className="font-semibold text-gray-900">{p.nombre}</p>
                    {p.modelo && <p className="text-xs text-gray-400">{p.modelo}</p>}
                  </td>
                  <td><span className="badge-blue">{p.nombre_categoria}</span></td>
                  <td><span className="badge-gray">{p.nombre_marca}</span></td>
                  <td className="text-right font-bold text-gray-900">{formatMoneda(p.precio)}</td>
                  <td>
                    <span className={p.estado ? 'badge-green' : 'badge-red'}>
                      {p.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => abrirEditar(p)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => setConfirm(p)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </Tabla>
            <div className="px-4">
              <Pagination paginacion={data?.paginacion} onChange={setPagina} />
            </div>
          </>
        )}
      </div>

      {/* Modal crear/editar */}
      <Modal open={modal} onClose={() => setModal(false)}
        title={editando ? 'Editar producto' : 'Nuevo producto'} maxWidth="max-w-2xl">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Código *</label>
            <input className="input" value={form.codigo_producto}
              onChange={e => setForm({ ...form, codigo_producto: e.target.value })}
              placeholder="LAP-HP-001" />
          </div>
          <div>
            <label className="label">Moneda (Cotización)</label>
            <select className="input font-semibold text-red-600" value={form.moneda_compra}
              onChange={e => setForm({ ...form, moneda_compra: e.target.value })}>
              <option value="PEN">Soles (PEN) - Precio Fijo</option>
              <option value="USD">Dólares (USD) - Automático</option>
            </select>
          </div>
          {form.moneda_compra === 'USD' ? (
            <>
              <div>
                <label className="label">Costo Original (USD) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-semibold">$</span>
                  <input className="input pl-7" type="number" step="0.01" value={form.precio_costo_usd}
                    onChange={e => setForm({ ...form, precio_costo_usd: e.target.value })} placeholder="0.00" />
                </div>
              </div>
              <div>
                <label className="label">Margen de Ganancia (%)</label>
                <input className="input" type="number" step="1" value={form.margen_porcentaje}
                  onChange={e => setForm({ ...form, margen_porcentaje: e.target.value })} />
              </div>
              <div className="col-span-2 bg-red-50 p-3 rounded-xl border border-red-200 text-xs text-red-700">
                <span className="font-bold">Cálculo Automático:</span> El precio se actualiza diariamente (8:30 AM) con Costo USD × TC × (1 + {form.margen_porcentaje}%) × 1.18 IGV.
              </div>
            </>
          ) : (
            <div>
              <label className="label">Precio Final Público (S/) *</label>
              <input className="input" type="number" step="0.01" value={form.precio}
                onChange={e => setForm({ ...form, precio: e.target.value })} />
            </div>
          )}
          <div className="col-span-2">
            <label className="label">Nombre *</label>
            <input className="input" value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Laptop HP 14 Core i5" />
          </div>
          <div>
            <label className="label">Modelo</label>
            <input className="input" value={form.modelo}
              onChange={e => setForm({ ...form, modelo: e.target.value })} />
          </div>
          <div>
            <label className="label">Estado</label>
            <select className="input" value={form.estado}
              onChange={e => setForm({ ...form, estado: parseInt(e.target.value) })}>
              <option value={1}>Activo</option>
              <option value={0}>Inactivo</option>
            </select>
          </div>
          <div>
            <label className="label">Categoría *</label>
            <select className="input" value={form.id_categoria}
              onChange={e => setForm({ ...form, id_categoria: e.target.value })}>
              <option value="">Seleccionar...</option>
              {cats?.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre_categoria}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Marca *</label>
            <select className="input" value={form.id_marca}
              onChange={e => setForm({ ...form, id_marca: e.target.value })}>
              <option value="">Seleccionar...</option>
              {marcas?.map(m => <option key={m.id_marca} value={m.id_marca}>{m.nombre_marca}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="label">Descripción</label>
            <textarea className="input" rows={3} value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div className="col-span-2 flex justify-end gap-3 pt-2 border-t border-gray-200">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={guardar.isPending} className="btn-primary">
              {guardar.isPending ? 'Guardando...' : editando ? 'Actualizar' : 'Crear producto'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Importar Excel */}
      <Modal open={modalImportar} onClose={cerrarModalImportar} title="Importar Productos (Excel)" maxWidth="max-w-xl">
        <div className="space-y-6">
          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm flex flex-col gap-2">
            <p className="font-semibold flex items-center gap-2">
              <Download size={16} /> Paso 1: Descarga la plantilla
            </p>
            <p>Descarga la plantilla con las cabeceras correctas. No modifiques la primera fila.</p>
            <a href={importacionApi.getPlantillaUrl()} target="_blank" rel="noreferrer"
               className="bg-blue-600 text-white font-medium px-4 py-2 rounded-lg w-max hover:bg-blue-700 transition-colors">
              Descargar Plantilla .xlsx
            </a>
          </div>

          <form onSubmit={handleImportar} className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors">
              <input 
                type="file" 
                accept=".xlsx" 
                id="excel-file"
                className="hidden" 
                onChange={e => setArchivoExcel(e.target.files[0])}
              />
              <label htmlFor="excel-file" className="cursor-pointer flex flex-col items-center gap-2 text-gray-600">
                <Upload size={32} className={archivoExcel ? 'text-green-500' : 'text-gray-400'} />
                {archivoExcel ? (
                  <span className="font-medium text-gray-900">{archivoExcel.name}</span>
                ) : (
                  <span>Haz clic aquí para seleccionar tu archivo Excel</span>
                )}
              </label>
            </div>
            
            {resumenImportacion && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm">
                <h4 className="font-bold text-gray-800 mb-2">Resultado de la importación:</h4>
                <ul className="space-y-1">
                  <li>Total procesados: <span className="font-bold">{resumenImportacion.total}</span></li>
                  <li className="text-green-600">Importados con éxito: <span className="font-bold">{resumenImportacion.importados}</span></li>
                  <li className="text-red-600">Errores encontrados: <span className="font-bold">{resumenImportacion.errores}</span></li>
                </ul>
                
                {resumenImportacion.detalle_errores?.length > 0 && (
                  <div className="mt-3 max-h-32 overflow-y-auto bg-white p-2 border border-red-200 rounded-lg text-xs text-red-600">
                    {resumenImportacion.detalle_errores.map((err, i) => (
                      <p key={i}>Fila {err.fila}: {err.error}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button type="button" onClick={cerrarModalImportar} className="btn-secondary">Cerrar</button>
              <button type="submit" disabled={importando || !archivoExcel} className="btn-primary gap-2">
                {importando && <RefreshCw size={14} className="animate-spin" />}
                {importando ? 'Procesando...' : 'Subir e Importar'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => eliminar.mutate(confirm?.id_producto)}
        cargando={eliminar.isPending}
        mensaje={`¿Desactivar el producto "${confirm?.nombre}"? Seguirá en el historial de ventas.`}
      />
    </div>
  )
}