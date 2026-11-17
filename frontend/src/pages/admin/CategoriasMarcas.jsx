import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productosApi } from '../../api/productos.api.js'
import { Modal, PageLoader, ConfirmModal } from '../../components/ui/index.jsx'
import { Plus, Edit, Trash2, Tag, Layers, Package } from 'lucide-react'
import toast from 'react-hot-toast'

/* ── Sección genérica para Categorías o Marcas ─────────────────── */
function SeccionCatalogo({
  titulo, icono: Icono, color, items, isLoading,
  nombreKey, idKey, onCrear, onCreate, onEditar, onEliminar,
}) {
  const colorMap = {
    blue:   { bg: 'bg-blue-50',  text: 'text-blue-600', ring: 'ring-blue-200', badge: 'bg-blue-100 text-blue-700', btnBg: 'bg-blue-600 hover:bg-blue-700' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600', ring: 'ring-violet-200', badge: 'bg-violet-100 text-violet-700', btnBg: 'bg-violet-600 hover:bg-violet-700' },
  }
  const c = colorMap[color]

  return (
    <div className="card flex flex-col overflow-hidden">
      {/* Cabecera */}
      <div className={`px-5 py-4 ${c.bg} border-b border-gray-100 flex items-center justify-between`}>
        <div className="flex items-center gap-2.5">
          <span className={`p-2 rounded-lg bg-white shadow-sm ${c.text}`}>
            <Icono size={18} />
          </span>
          <div>
            <h2 className="font-semibold text-gray-900 text-sm">{titulo}</h2>
            <p className="text-xs text-gray-500">{items?.length ?? 0} registrados</p>
          </div>
        </div>
        <button onClick={onCrear}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white rounded-lg shadow-sm transition-colors ${c.btnBg}`}>
          <Plus size={14} /> Nuevo
        </button>
      </div>

      {/* Listado */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? <PageLoader /> : (
          items?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Package size={32} className="mb-2 opacity-40" />
              <p className="text-sm">Sin registros aún</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {items?.map((item, idx) => (
                <li key={item[idKey]}
                  className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors group"
                  style={{ animationDelay: `${idx * 40}ms` }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold ${c.badge}`}>
                      {item[nombreKey].charAt(0).toUpperCase()}
                    </span>
                    <span className="text-sm font-medium text-gray-800 truncate">{item[nombreKey]}</span>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEditar(item)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => onEliminar(item)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  )
}

/* ── Página principal ──────────────────────────────────────────── */
export default function CategoriasMarcas() {
  const qc = useQueryClient()

  // ─ Estado de modales ─
  const [modalCat, setModalCat]       = useState(false)
  const [modalMarca, setModalMarca]   = useState(false)
  const [editCat, setEditCat]         = useState(null)
  const [editMarca, setEditMarca]     = useState(null)
  const [formCat, setFormCat]         = useState('')
  const [formMarca, setFormMarca]     = useState('')
  const [confirmCat, setConfirmCat]   = useState(null)
  const [confirmMarca, setConfirmMarca] = useState(null)

  // ─ Queries ─
  const { data: cats, isLoading: cargandoCats } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => productosApi.categorias.listar().then(r => r.data.datos),
  })
  const { data: marcas, isLoading: cargandoMarcas } = useQuery({
    queryKey: ['marcas'],
    queryFn: () => productosApi.marcas.listar().then(r => r.data.datos),
  })

  // ─ Mutaciones Categorías ─
  const guardarCat = useMutation({
    mutationFn: (nombre) => editCat
      ? productosApi.categorias.actualizar(editCat.id_categoria, { nombre_categoria: nombre })
      : productosApi.categorias.crear({ nombre_categoria: nombre }),
    onSuccess: () => {
      toast.success(editCat ? 'Categoría actualizada' : 'Categoría creada')
      qc.invalidateQueries(['categorias'])
      cerrarModalCat()
    },
    onError: (e) => toast.error(e.response?.data?.mensaje || 'Error al guardar categoría'),
  })

  const eliminarCat = useMutation({
    mutationFn: (id) => productosApi.categorias.eliminar(id),
    onSuccess: () => {
      toast.success('Categoría eliminada')
      qc.invalidateQueries(['categorias'])
      setConfirmCat(null)
    },
    onError: (e) => toast.error(e.response?.data?.mensaje || 'No se pudo eliminar, puede tener productos asociados'),
  })

  // ─ Mutaciones Marcas ─
  const guardarMarca = useMutation({
    mutationFn: (nombre) => editMarca
      ? productosApi.marcas.actualizar(editMarca.id_marca, { nombre_marca: nombre })
      : productosApi.marcas.crear({ nombre_marca: nombre }),
    onSuccess: () => {
      toast.success(editMarca ? 'Marca actualizada' : 'Marca creada')
      qc.invalidateQueries(['marcas'])
      cerrarModalMarca()
    },
    onError: (e) => toast.error(e.response?.data?.mensaje || 'Error al guardar marca'),
  })

  const eliminarMarca = useMutation({
    mutationFn: (id) => productosApi.marcas.eliminar(id),
    onSuccess: () => {
      toast.success('Marca eliminada')
      qc.invalidateQueries(['marcas'])
      setConfirmMarca(null)
    },
    onError: (e) => toast.error(e.response?.data?.mensaje || 'No se pudo eliminar, puede tener productos asociados'),
  })

  // ─ Helpers ─
  const cerrarModalCat   = () => { setModalCat(false);   setEditCat(null);   setFormCat('') }
  const cerrarModalMarca = () => { setModalMarca(false);  setEditMarca(null); setFormMarca('') }

  const abrirCrearCat   = () => { setEditCat(null);   setFormCat('');   setModalCat(true) }
  const abrirCrearMarca = () => { setEditMarca(null); setFormMarca(''); setModalMarca(true) }

  const abrirEditarCat = (cat) => {
    setEditCat(cat); setFormCat(cat.nombre_categoria); setModalCat(true)
  }
  const abrirEditarMarca = (m) => {
    setEditMarca(m); setFormMarca(m.nombre_marca); setModalMarca(true)
  }

  const submitCat = (e) => {
    e.preventDefault()
    const nombre = formCat.trim()
    if (!nombre) return toast.error('Escribe un nombre')
    guardarCat.mutate(nombre)
  }

  const submitMarca = (e) => {
    e.preventDefault()
    const nombre = formMarca.trim()
    if (!nombre) return toast.error('Escribe un nombre')
    guardarMarca.mutate(nombre)
  }

  return (
    <div className="space-y-5">
      {/* Título */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Ajustes de Catálogo</h1>
          <p className="text-sm text-gray-500 mt-0.5">Administra las categorías y marcas de tus productos</p>
        </div>
      </div>

      {/* Grid dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Categorías */}
        <SeccionCatalogo
          titulo="Categorías"
          icono={Layers}
          color="blue"
          items={cats}
          isLoading={cargandoCats}
          nombreKey="nombre_categoria"
          idKey="id_categoria"
          onCrear={abrirCrearCat}
          onEditar={abrirEditarCat}
          onEliminar={setConfirmCat}
        />

        {/* Marcas */}
        <SeccionCatalogo
          titulo="Marcas"
          icono={Tag}
          color="violet"
          items={marcas}
          isLoading={cargandoMarcas}
          nombreKey="nombre_marca"
          idKey="id_marca"
          onCrear={abrirCrearMarca}
          onEditar={abrirEditarMarca}
          onEliminar={setConfirmMarca}
        />
      </div>

      {/* ── Modal Categoría ──────────────────────────────────────── */}
      <Modal open={modalCat} onClose={cerrarModalCat}
        title={editCat ? 'Editar categoría' : 'Nueva categoría'} maxWidth="max-w-sm">
        <form onSubmit={submitCat} className="space-y-4">
          <div>
            <label className="label">Nombre de categoría</label>
            <input className="input" autoFocus value={formCat}
              onChange={e => setFormCat(e.target.value)}
              placeholder="Ej: Laptops, Periféricos, Redes..." />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={cerrarModalCat} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={guardarCat.isPending} className="btn-primary">
              {guardarCat.isPending ? 'Guardando...' : editCat ? 'Actualizar' : 'Crear categoría'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Modal Marca ──────────────────────────────────────────── */}
      <Modal open={modalMarca} onClose={cerrarModalMarca}
        title={editMarca ? 'Editar marca' : 'Nueva marca'} maxWidth="max-w-sm">
        <form onSubmit={submitMarca} className="space-y-4">
          <div>
            <label className="label">Nombre de marca</label>
            <input className="input" autoFocus value={formMarca}
              onChange={e => setFormMarca(e.target.value)}
              placeholder="Ej: HP, Corsair, TP-Link..." />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={cerrarModalMarca} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={guardarMarca.isPending} className="btn-primary">
              {guardarMarca.isPending ? 'Guardando...' : editMarca ? 'Actualizar' : 'Crear marca'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Confirmaciones ───────────────────────────────────────── */}
      <ConfirmModal
        open={!!confirmCat}
        onClose={() => setConfirmCat(null)}
        onConfirm={() => eliminarCat.mutate(confirmCat?.id_categoria)}
        cargando={eliminarCat.isPending}
        mensaje={`¿Eliminar la categoría "${confirmCat?.nombre_categoria}"? Los productos con esta categoría podrían verse afectados.`}
      />

      <ConfirmModal
        open={!!confirmMarca}
        onClose={() => setConfirmMarca(null)}
        onConfirm={() => eliminarMarca.mutate(confirmMarca?.id_marca)}
        cargando={eliminarMarca.isPending}
        mensaje={`¿Eliminar la marca "${confirmMarca?.nombre_marca}"? Los productos con esta marca podrían verse afectados.`}
      />
    </div>
  )
}
