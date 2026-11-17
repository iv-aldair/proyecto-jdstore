import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { guiasRemisionApi } from '../../api/guiasRemision.api.js'
import { formatFechaHora } from '../../utils/formatFecha.js'
import { PageLoader, ConfirmModal } from '../../components/ui/index.jsx'
import SearchBar from '../../components/SearchBar.jsx'
import { Plus, Printer, Trash2, Eye, Truck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function GuiasRemision() {
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [buscar, setBuscar] = useState('')
  const [confirmAnular, setConfirmAnular] = useState(null)

  const { data: guias, isLoading } = useQuery({
    queryKey: ['guias_remision'],
    queryFn: () => guiasRemisionApi.listar().then(r => r.data.datos)
  })

  const anularGuia = useMutation({
    mutationFn: (id) => guiasRemisionApi.anular(id),
    onSuccess: () => {
      toast.success('Guía anulada correctamente')
      qc.invalidateQueries(['guias_remision'])
      setConfirmAnular(null)
    },
    onError: (err) => toast.error(err.response?.data?.mensaje || 'Error al anular guía')
  })

  if (isLoading) return <PageLoader />

  const filtrados = guias?.filter(g => 
    g.numero_guia.toLowerCase().includes(buscar.toLowerCase()) ||
    g.destinatario_razon_social.toLowerCase().includes(buscar.toLowerCase())
  ) || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Guías de Remisión</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestión de guías de remisión remitente electrónicas.
          </p>
        </div>
        <Link to="/admin/guias-remision/nueva" className="btn-primary w-full sm:w-auto shadow-md">
          <Plus size={18} /> Nueva Guía
        </Link>
      </div>

      <div className="card p-4">
        <div className="mb-4 max-w-md">
          <SearchBar placeholder="Buscar por número o destinatario..." onSearch={setBuscar} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium">
              <tr>
                <th className="px-4 py-3">Número</th>
                <th className="px-4 py-3">Fecha Emisión</th>
                <th className="px-4 py-3">Destinatario</th>
                <th className="px-4 py-3">Motivo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No se encontraron guías de remisión.
                  </td>
                </tr>
              ) : (
                filtrados.map(g => (
                  <tr key={g.id_guia} className={`hover:bg-gray-50/50 transition-colors ${g.estado === 0 ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 font-semibold text-gray-900">{g.numero_guia}</td>
                    <td className="px-4 py-3">{formatFechaHora(g.fecha_emision).split(' ')[0]}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 truncate max-w-[200px]" title={g.destinatario_razon_social}>
                        {g.destinatario_razon_social}
                      </p>
                      <p className="text-xs text-gray-500">{g.destinatario_identificacion}</p>
                    </td>
                    <td className="px-4 py-3 text-xs">{g.motivo_traslado}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        g.estado === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {g.estado === 1 ? 'EMITIDA' : 'ANULADA'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/guias-remision/${g.id_guia}/imprimir`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Imprimir Guía"
                        >
                          <Printer size={18} />
                        </Link>
                        {g.estado === 1 && (
                          <button 
                            onClick={() => setConfirmAnular(g)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Anular Guía"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!confirmAnular}
        onClose={() => setConfirmAnular(null)}
        onConfirm={() => anularGuia.mutate(confirmAnular.id_guia)}
        titulo="Anular Guía de Remisión"
        mensaje={`¿Estás seguro de que deseas anular la guía ${confirmAnular?.numero_guia}? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
