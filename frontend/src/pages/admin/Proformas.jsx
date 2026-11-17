import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { proformasApi } from '../../api/proformas.api.js'
import { PageLoader } from '../../components/ui/index.jsx'
import SearchBar from '../../components/SearchBar.jsx'
import { formatMoneda } from '../../utils/formatMoneda.js'
import { FileText, Plus, Eye, Ban } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Proformas() {
  const qc = useQueryClient()
  const [buscar, setBuscar] = useState('')
  const { usuario } = useAuth()
  
  const basePath = usuario?.id_rol === 1 ? '/admin' : '/vendedor'

  const { data: proformas, isLoading } = useQuery({
    queryKey: ['proformas'],
    queryFn: () => proformasApi.listar().then(r => r.data.datos)
  })

  const anular = useMutation({
    mutationFn: (id) => proformasApi.anular(id),
    onSuccess: () => {
      toast.success('Proforma anulada')
      qc.invalidateQueries(['proformas'])
    },
    onError: (e) => toast.error(e.response?.data?.mensaje || 'Error al anular')
  })

  const filtradas = proformas?.filter(p => 
    !buscar || 
    p.codigo_proforma?.toLowerCase().includes(buscar.toLowerCase()) ||
    p.cliente_nombre?.toLowerCase().includes(buscar.toLowerCase())
  ) || []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="page-title">Proformas</h1>
        <Link to={`${basePath}/proformas/nueva`} className="btn-primary">
          <Plus size={16} /> Nueva Proforma
        </Link>
      </div>

      <div className="card p-4">
        <SearchBar 
          placeholder="Buscar por código o cliente..." 
          onSearch={setBuscar} 
          className="max-w-md" 
        />
      </div>

      <div className="card">
        {isLoading ? <PageLoader /> : (
          <div className="overflow-x-auto">
            <table className="table-auto w-full">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Vendedor</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map(p => (
                  <tr key={p.id_proforma} className={p.estado === 0 ? 'opacity-60' : ''}>
                    <td className="font-mono text-sm font-medium text-gray-900">{p.codigo_proforma}</td>
                    <td className="text-sm text-gray-600">
                      {new Date(p.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="text-sm font-medium text-gray-800">{p.cliente_nombre}</td>
                    <td className="text-sm text-gray-500">{p.cliente_telefono || '-'}</td>
                    <td className="text-sm text-gray-500">{p.vendedor}</td>
                    <td className="font-bold text-sm text-gray-900">{formatMoneda(p.total)}</td>
                    <td>
                      {p.estado === 1 
                        ? <span className="badge-green">Activa</span>
                        : <span className="badge-red">Anulada</span>
                      }
                    </td>
                    <td>
                      <div className="flex items-center justify-center gap-2">
                        <Link to={`${basePath}/proformas/${p.id_proforma}`} 
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver y PDF">
                          <Eye size={16} />
                        </Link>
                        {p.estado === 1 && (
                          <button 
                            onClick={() => { if(confirm('¿Anular esta proforma?')) anular.mutate(p.id_proforma) }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Anular">
                            <Ban size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtradas.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-10 text-gray-400">
                      <FileText size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No se encontraron proformas</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
