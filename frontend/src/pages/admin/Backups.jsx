import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { backupsApi } from '../../api/backups.api.js'
import { PageLoader, ConfirmModal } from '../../components/ui/index.jsx'
import { formatFechaHora } from '../../utils/formatFecha.js'
import { formatMoneda } from '../../utils/formatMoneda.js'
import { Database, Download, Trash2, ShieldCheck, HardDrive, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Backups() {
  const qc = useQueryClient()
  const [generando, setGenerando] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { data: backups, isLoading } = useQuery({
    queryKey: ['backups'],
    queryFn: () => backupsApi.listar().then(r => r.data.datos)
  })

  const generarBackup = async () => {
    try {
      setGenerando(true)
      const res = await backupsApi.generarManual()
      toast.success(res.data.mensaje || 'Backup generado con éxito')
      qc.invalidateQueries(['backups'])
    } catch (error) {
      toast.error(error.response?.data?.mensaje || 'Error al generar backup')
    } finally {
      setGenerando(false)
    }
  }

  const eliminarBackup = useMutation({
    mutationFn: (id) => backupsApi.eliminar(id),
    onSuccess: () => {
      toast.success('Backup eliminado')
      qc.invalidateQueries(['backups'])
      setConfirmDelete(null)
    },
    onError: (err) => toast.error(err.response?.data?.mensaje || 'Error al eliminar')
  })

  if (isLoading) return <PageLoader />

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Copias de Seguridad (Backups)</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona los respaldos de la base de datos para prevenir pérdida de información.
          </p>
        </div>
        <button 
          onClick={generarBackup} 
          disabled={generando}
          className="btn-primary w-full sm:w-auto shadow-md"
        >
          {generando ? <RefreshCw size={18} className="animate-spin" /> : <Database size={18} />}
          Generar Backup Ahora
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4 flex items-center gap-4 bg-blue-50 border border-blue-100">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs text-blue-800 font-semibold uppercase tracking-wider">Backups Totales</p>
            <p className="text-2xl font-black text-blue-900">{backups?.length || 0}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-4 bg-emerald-50 border border-emerald-100">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <HardDrive size={24} />
          </div>
          <div>
            <p className="text-xs text-emerald-800 font-semibold uppercase tracking-wider">Espacio Ocupado</p>
            <p className="text-2xl font-black text-emerald-900">
              {((backups?.reduce((acc, val) => acc + (val.tamanio_kb || 0), 0) || 0) / 1024).toFixed(2)} MB
            </p>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium">
              <tr>
                <th className="px-4 py-3">Archivo</th>
                <th className="px-4 py-3">Fecha y Hora</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Tamaño</th>
                <th className="px-4 py-3">Generado por</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {backups?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No hay backups registrados en el sistema.
                  </td>
                </tr>
              ) : (
                backups?.map(b => (
                  <tr key={b.id_backup} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-blue-600">
                        {b.nombre_archivo}
                      </span>
                    </td>
                    <td className="px-4 py-3">{formatFechaHora(b.fecha)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.tipo === 'automatico' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {b.tipo}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {(b.tamanio_kb / 1024).toFixed(2)} MB
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {b.generado_por || 'Sistema (Auto)'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* La descarga real requeriría servir estáticos o un endpoint de stream, por ahora solo listar/eliminar */}
                        <button 
                          onClick={() => setConfirmDelete(b)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar backup"
                        >
                          <Trash2 size={16} />
                        </button>
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
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => eliminarBackup.mutate(confirmDelete.id_backup)}
        titulo="Eliminar Backup"
        mensaje={`¿Estás seguro de que deseas eliminar permanentemente el backup "${confirmDelete?.nombre_archivo}"? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
