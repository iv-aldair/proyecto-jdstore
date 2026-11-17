import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios.js'
import { PageLoader, Modal } from '../../components/ui/index.jsx'
import { Store, Edit, MapPin, Phone } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Tiendas() {
  const qc = useQueryClient()
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre_tienda: '', direccion: '', telefono: '' })

  const { data, isLoading } = useQuery({
    queryKey: ['tiendas'],
    queryFn: () => api.get('/tiendas').then(r => r.data.datos),
  })

  const guardar = useMutation({
    mutationFn: (datos) => api.put(`/tiendas/${editando.id_tienda}`, datos),
    onSuccess: () => {
      toast.success('Tienda actualizada')
      qc.invalidateQueries(['tiendas'])
      setModal(false)
      setEditando(null)
    },
    onError: (e) => toast.error(e.response?.data?.mensaje || 'Error al guardar'),
  })

  const abrirEditar = (t) => {
    setEditando(t)
    setForm({
      nombre_tienda: t.nombre_tienda,
      direccion: t.direccion || '',
      telefono: t.telefono || '',
      estado: t.estado,
    })
    setModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nombre_tienda) return toast.error('El nombre es requerido')
    guardar.mutate(form)
  }

  const COLORES = [
    { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-200' },
    { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-200' },
    { bg: 'bg-violet-50', icon: 'text-violet-600', border: 'border-violet-200' },
  ]

  return (
    <div className="space-y-5">
      <h1 className="page-title">Tiendas</h1>
      {isLoading ? <PageLoader /> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data?.map((t, idx) => {
            const c = COLORES[idx % COLORES.length]
            return (
              <div key={t.id_tienda} className={`card p-5 border ${c.border}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 ${c.bg} rounded-xl`}>
                      <Store size={20} className={c.icon} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{t.nombre_tienda}</p>
                      <span className={t.estado ? 'badge-green' : 'badge-red'}>{t.estado ? 'Activa' : 'Inactiva'}</span>
                    </div>
                  </div>
                  <button onClick={() => abrirEditar(t)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit size={14} />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{t.direccion || 'Sin dirección'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{t.telefono || 'Sin teléfono'}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal editar tienda */}
      <Modal open={modal} onClose={() => setModal(false)}
        title={`Editar: ${editando?.nombre_tienda}`} maxWidth="max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nombre de tienda</label>
            <input className="input" value={form.nombre_tienda}
              onChange={e => setForm({ ...form, nombre_tienda: e.target.value })} />
          </div>
          <div>
            <label className="label">Dirección</label>
            <input className="input" value={form.direccion}
              onChange={e => setForm({ ...form, direccion: e.target.value })}
              placeholder="Jr. Moquegua 705, Juliaca" />
          </div>
          <div>
            <label className="label">Teléfono</label>
            <input className="input" value={form.telefono}
              onChange={e => setForm({ ...form, telefono: e.target.value })}
              placeholder="995890861" />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={guardar.isPending} className="btn-primary">
              {guardar.isPending ? 'Guardando...' : 'Actualizar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}