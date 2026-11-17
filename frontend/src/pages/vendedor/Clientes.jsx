import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ventasApi } from '../../api/ventas.api.js'
import { PageLoader, Modal } from '../../components/ui/index.jsx'
import SearchBar from '../../components/SearchBar.jsx'
import Pagination from '../../components/Pagination.jsx'
import { Plus, User } from 'lucide-react'
import toast from 'react-hot-toast'

const FORM_VACIO = { nombre: '', tipo_documento: 'DNI', dni_ruc: '', telefono: '', direccion: '' }

export default function Clientes() {
  const qc = useQueryClient()
  const [pagina, setPagina]   = useState(1)
  const [buscar, setBuscar]   = useState('')
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState(FORM_VACIO)

  const { data, isLoading } = useQuery({
    queryKey: ['clientes', pagina, buscar],
    queryFn: () => ventasApi.clientes.listar({ pagina, limite: 15, buscar: buscar || undefined })
      .then(r => r.data.datos),
    keepPreviousData: true,
  })

  const crear = useMutation({
    mutationFn: (d) => ventasApi.clientes.crear(d),
    onSuccess: () => {
      toast.success('Cliente registrado')
      qc.invalidateQueries(['clientes'])
      setModal(false)
      setForm(FORM_VACIO)
    },
    onError: (e) => toast.error(e.response?.data?.mensaje || 'Error al registrar'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nombre || !form.dni_ruc) {
      toast.error('Nombre y DNI/RUC son requeridos')
      return
    }
    crear.mutate(form)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Clientes</h1>
        <button onClick={() => setModal(true)} className="btn-primary">
          <Plus size={16} /> Nuevo cliente
        </button>
      </div>

      <div className="card p-4">
        <SearchBar
          placeholder="Buscar por nombre o DNI/RUC..."
          onSearch={v => { setBuscar(v); setPagina(1) }}
        />
      </div>

      <div className="card">
        {isLoading ? <PageLoader /> : (
          <>
            <div className="overflow-x-auto">
              <table className="table-auto w-full">
                <thead>
                  <tr>
                    <th>Documento</th>
                    <th>Nombre / Razón social</th>
                    <th>Teléfono</th>
                    <th>Dirección</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.clientes?.map(c => (
                    <tr key={c.id_cliente}>
                      <td>
                        <span className={c.tipo_documento === 'RUC' ? 'badge-blue' : 'badge-gray'}>
                          {c.tipo_documento}
                        </span>
                        <p className="font-mono text-xs mt-0.5 text-gray-600">{c.dni_ruc}</p>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <User size={12} className="text-blue-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-800">{c.nombre}</span>
                        </div>
                      </td>
                      <td className="text-sm text-gray-500">{c.telefono || '—'}</td>
                      <td className="text-sm text-gray-500 max-w-xs truncate">{c.direccion || '—'}</td>
                      <td>
                        <span className={c.estado ? 'badge-green' : 'badge-red'}>
                          {c.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!data?.clientes?.length && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-gray-400 text-sm">
                        No se encontraron clientes
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-4">
              <Pagination paginacion={data?.paginacion} onChange={setPagina} />
            </div>
          </>
        )}
      </div>

      {/* Modal nuevo cliente */}
      <Modal open={modal} onClose={() => setModal(false)} title="Registrar cliente">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Tipo de documento *</label>
            <div className="flex gap-2">
              {['DNI', 'RUC'].map(t => (
                <button key={t} type="button"
                  onClick={() => setForm({ ...form, tipo_documento: t })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    form.tipo_documento === t
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}>{t}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">
              {form.tipo_documento === 'DNI' ? 'DNI (8 dígitos)' : 'RUC (11 dígitos)'} *
            </label>
            <input
              className="input"
              value={form.dni_ruc}
              maxLength={form.tipo_documento === 'DNI' ? 8 : 11}
              onChange={e => setForm({ ...form, dni_ruc: e.target.value.replace(/\D/g, '') })}
              placeholder={form.tipo_documento === 'DNI' ? '45123678' : '20601234567'}
            />
          </div>

          <div>
            <label className="label">
              {form.tipo_documento === 'DNI' ? 'Nombres y apellidos' : 'Razón social'} *
            </label>
            <input
              className="input"
              value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder={form.tipo_documento === 'DNI' ? 'Juan Pérez López' : 'Empresa SAC'}
            />
          </div>

          <div>
            <label className="label">Teléfono</label>
            <input
              className="input"
              value={form.telefono}
              onChange={e => setForm({ ...form, telefono: e.target.value })}
              placeholder="987654321"
            />
          </div>

          <div>
            <label className="label">Dirección</label>
            <input
              className="input"
              value={form.direccion}
              onChange={e => setForm({ ...form, direccion: e.target.value })}
              placeholder="Jr. Lima 123, Juliaca"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={() => setModal(false)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={crear.isPending} className="btn-primary">
              {crear.isPending ? 'Guardando...' : 'Registrar cliente'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}