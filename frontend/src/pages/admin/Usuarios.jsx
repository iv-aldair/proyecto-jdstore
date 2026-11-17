import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios.js'
import { Modal, PageLoader, ConfirmModal, Spinner } from '../../components/ui/index.jsx'
import { Plus, Edit, Trash2, KeyRound, UserCheck, UserX } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatFechaHora } from '../../utils/formatFecha.js'

const FORM_VACIO = { nombre: '', correo: '', contrasena: '', id_rol: 2, id_tienda: 1, estado: 1 }

export default function Usuarios() {
  const qc = useQueryClient()
  const [modal, setModal]         = useState(false)
  const [modalPass, setModalPass] = useState(null)
  const [confirm, setConfirm]     = useState(null)
  const [editando, setEditando]   = useState(null)
  const [form, setForm]           = useState(FORM_VACIO)
  const [nuevaPass, setNuevaPass] = useState('')

  const { data: usuarios, isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => api.get('/usuarios').then(r => r.data.datos),
  })
  const { data: tiendas } = useQuery({
    queryKey: ['tiendas'],
    queryFn: () => api.get('/tiendas').then(r => r.data.datos),
  })

  const guardar = useMutation({
    mutationFn: (d) => editando
      ? api.put(`/usuarios/${editando.id_usuario}`, d)
      : api.post('/usuarios', d),
    onSuccess: () => {
      toast.success(editando ? 'Usuario actualizado' : 'Usuario creado')
      qc.invalidateQueries(['usuarios'])
      setModal(false); setEditando(null); setForm(FORM_VACIO)
    },
    onError: (e) => toast.error(e.response?.data?.mensaje || 'Error al guardar'),
  })

  const eliminar = useMutation({
    mutationFn: (id) => api.delete(`/usuarios/${id}`),
    onSuccess: () => {
      toast.success('Usuario desactivado')
      qc.invalidateQueries(['usuarios'])
      setConfirm(null)
    },
    onError: (e) => toast.error(e.response?.data?.mensaje || 'Error'),
  })

  const resetPass = useMutation({
    mutationFn: ({ id, pass }) => api.patch(`/usuarios/${id}/reset-password`, { nueva_contrasena: pass }),
    onSuccess: () => {
      toast.success('Contraseña reseteada')
      setModalPass(null); setNuevaPass('')
    },
    onError: (e) => toast.error(e.response?.data?.mensaje || 'Error'),
  })

  const reactivar = useMutation({
    mutationFn: (u) => api.put(`/usuarios/${u.id_usuario}`, { ...u, estado: 1 }),
    onSuccess: () => { toast.success('Usuario reactivado'); qc.invalidateQueries(['usuarios']) },
    onError: () => toast.error('Error al reactivar'),
  })

  const abrirEditar = (u) => {
    setEditando(u)
    setForm({ nombre: u.nombre, correo: u.correo, contrasena: '', id_rol: u.id_rol, id_tienda: u.id_tienda, estado: u.estado })
    setModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nombre || !form.correo) { toast.error('Nombre y correo son requeridos'); return }
    if (!editando && !form.contrasena) { toast.error('La contraseña es requerida'); return }
    const payload = { ...form }
    if (editando && !payload.contrasena) delete payload.contrasena
    guardar.mutate(payload)
  }

  const admins    = (usuarios || []).filter(u => u.id_rol === 1)
  const vendedores = (usuarios || []).filter(u => u.id_rol === 2)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Usuarios</h1>
        <button onClick={() => { setEditando(null); setForm(FORM_VACIO); setModal(true) }}
          className="btn-primary">
          <Plus size={16} /> Nuevo usuario
        </button>
      </div>

      {isLoading ? <PageLoader /> : (
        <>
          {/* Administradores */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Administradores ({admins.length})
              </h2>
            </div>
            <TablaUsuarios
              usuarios={admins} tiendas={tiendas}
              onEditar={abrirEditar}
              onEliminar={setConfirm}
              onResetPass={setModalPass}
              onReactivar={u => reactivar.mutate(u)}
            />
          </div>

          {/* Vendedores */}
          <div className="card">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                Vendedores ({vendedores.length})
              </h2>
            </div>
            <TablaUsuarios
              usuarios={vendedores} tiendas={tiendas}
              onEditar={abrirEditar}
              onEliminar={setConfirm}
              onResetPass={setModalPass}
              onReactivar={u => reactivar.mutate(u)}
            />
          </div>
        </>
      )}

      {/* Modal crear/editar */}
      <Modal open={modal} onClose={() => setModal(false)}
        title={editando ? 'Editar usuario' : 'Nuevo usuario'} maxWidth="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nombre completo *</label>
            <input className="input" value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Nombre Apellido" />
          </div>
          <div>
            <label className="label">Correo electrónico *</label>
            <input className="input" type="email" value={form.correo}
              onChange={e => setForm({ ...form, correo: e.target.value })}
              placeholder="correo@jdstore.pe" />
          </div>
          <div>
            <label className="label">
              {editando ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
            </label>
            <input className="input" type="password" value={form.contrasena}
              onChange={e => setForm({ ...form, contrasena: e.target.value })}
              placeholder={editando ? 'Dejar vacío para conservar' : 'Mínimo 6 caracteres'} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Rol *</label>
              <select className="input" value={form.id_rol}
                onChange={e => setForm({ ...form, id_rol: parseInt(e.target.value) })}>
                <option value={1}>Administrador</option>
                <option value={2}>Vendedor</option>
              </select>
            </div>
            <div>
              <label className="label">Tienda *</label>
              <select className="input" value={form.id_tienda}
                onChange={e => setForm({ ...form, id_tienda: parseInt(e.target.value) })}>
                {(tiendas || []).map(t => (
                  <option key={t.id_tienda} value={t.id_tienda}>{t.nombre_tienda}</option>
                ))}
              </select>
            </div>
          </div>
          {editando && (
            <div>
              <label className="label">Estado</label>
              <select className="input" value={form.estado}
                onChange={e => setForm({ ...form, estado: parseInt(e.target.value) })}>
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={guardar.isPending} className="btn-primary">
              {guardar.isPending && <Spinner size={14} />}
              {editando ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal reset contraseña */}
      <Modal open={!!modalPass} onClose={() => setModalPass(null)}
        title="Resetear contraseña" maxWidth="max-w-sm">
        <p className="text-sm text-gray-500 mb-3">
          Usuario: <strong>{modalPass?.nombre}</strong>
        </p>
        <div>
          <label className="label">Nueva contraseña *</label>
          <input className="input" type="password" value={nuevaPass}
            onChange={e => setNuevaPass(e.target.value)}
            placeholder="Mínimo 6 caracteres" />
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={() => setModalPass(null)} className="btn-secondary">Cancelar</button>
          <button onClick={() => resetPass.mutate({ id: modalPass.id_usuario, pass: nuevaPass })}
            disabled={nuevaPass.length < 6 || resetPass.isPending}
            className="btn-primary">
            {resetPass.isPending && <Spinner size={14} />}
            Resetear
          </button>
        </div>
      </Modal>

      {/* Confirm eliminar */}
      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => eliminar.mutate(confirm?.id_usuario)}
        cargando={eliminar.isPending}
        mensaje={`¿Desactivar al usuario "${confirm?.nombre}"? Podrás reactivarlo después.`}
      />
    </div>
  )
}

function TablaUsuarios({ usuarios, tiendas, onEditar, onEliminar, onResetPass, onReactivar }) {
  if (!usuarios.length) return (
    <p className="text-sm text-gray-400 text-center py-6">Sin usuarios en este grupo</p>
  )
  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full">
        <thead>
          <tr>
            <th>Nombre</th><th>Correo</th><th>Tienda</th>
            <th>Estado</th><th>Creado</th><th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.id_usuario} className={!u.estado ? 'opacity-50' : ''}>
              <td className="font-medium text-sm">{u.nombre}</td>
              <td className="text-sm text-gray-500">{u.correo}</td>
              <td className="text-sm text-gray-500">{u.nombre_tienda}</td>
              <td>
                <span className={u.estado ? 'badge-green' : 'badge-red'}>
                  {u.estado ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="text-xs text-gray-400">{formatFechaHora(u.created_at)}</td>
              <td>
                <div className="flex items-center justify-center gap-1">
                  <button onClick={() => onEditar(u)} title="Editar"
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit size={13} />
                  </button>
                  <button onClick={() => onResetPass(u)} title="Resetear contraseña"
                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                    <KeyRound size={13} />
                  </button>
                  {u.estado ? (
                    <button onClick={() => onEliminar(u)} title="Desactivar"
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <UserX size={13} />
                    </button>
                  ) : (
                    <button onClick={() => onReactivar(u)} title="Reactivar"
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <UserCheck size={13} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}