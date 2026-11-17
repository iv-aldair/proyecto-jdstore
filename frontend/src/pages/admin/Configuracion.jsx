import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { backupsApi } from '../../api/backups.api.js'
import { PageLoader } from '../../components/ui/index.jsx'
import { Settings, Save, Building, Percent } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Configuracion() {
  const qc = useQueryClient()
  const [form, setForm] = useState({})

  const { data: config, isLoading } = useQuery({
    queryKey: ['configuracion'],
    queryFn: () => backupsApi.obtenerConfig().then(r => r.data.datos)
  })

  useEffect(() => {
    if (config) {
      setForm(config)
    }
  }, [config])

  const guardar = useMutation({
    mutationFn: (datos) => backupsApi.actualizarConfig(datos),
    onSuccess: () => {
      toast.success('Configuración guardada correctamente')
      qc.invalidateQueries(['configuracion'])
    },
    onError: (err) => {
      toast.error(err.response?.data?.mensaje || 'Error al guardar la configuración')
    }
  })

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    guardar.mutate(form)
  }

  if (isLoading) return <PageLoader />

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="page-title">Configuración del Sistema</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ajustes globales de la empresa, impuestos y parámetros del negocio.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Tarjeta: Datos de la Empresa */}
        <div className="card p-6 border-t-4 border-t-blue-600">
          <div className="flex items-center gap-3 mb-6">
            <Building className="text-blue-600" />
            <h2 className="text-lg font-bold text-gray-800">Datos de la Empresa</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="form-label">RUC / NIT</label>
              <input type="text" name="empresa_ruc" value={form.empresa_ruc || ''} onChange={handleChange} className="form-input" placeholder="Ej: 20123456789" />
            </div>
            <div>
              <label className="form-label">Razón Social o Nombre</label>
              <input type="text" name="empresa_nombre" value={form.empresa_nombre || ''} onChange={handleChange} className="form-input" placeholder="Nombre comercial" />
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Dirección Principal</label>
              <input type="text" name="empresa_direccion" value={form.empresa_direccion || ''} onChange={handleChange} className="form-input" placeholder="Av. Principal 123" />
            </div>
          </div>
        </div>

        {/* Tarjeta: Impuestos y Valores */}
        <div className="card p-6 border-t-4 border-t-emerald-600">
          <div className="flex items-center gap-3 mb-6">
            <Percent className="text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-800">Impuestos y Valores Default</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="form-label">Porcentaje de IGV/IVA (%)</label>
              <input type="number" step="0.01" name="igv_porcentaje" value={form.igv_porcentaje || ''} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">Margen de Ganancia Default (%)</label>
              <input type="number" step="0.01" name="margen_default" value={form.margen_default || ''} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">Tipo de Cambio USD (Vigente)</label>
              <input type="number" step="0.001" name="tc_dolar_vigente" value={form.tc_dolar_vigente || ''} onChange={handleChange} className="form-input" />
            </div>
          </div>
        </div>

        {/* Tarjeta: Backups */}
        <div className="card p-6 border-t-4 border-t-purple-600">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="text-purple-600" />
            <h2 className="text-lg font-bold text-gray-800">Parámetros de Backup</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="form-label">Hora del Backup Automático (Formato 24h)</label>
              <input type="time" name="backup_hora" value={form.backup_hora || ''} onChange={handleChange} className="form-input" />
            </div>
            <div>
              <label className="form-label">Retener backups (Días)</label>
              <input type="number" name="backup_retener_dias" value={form.backup_retener_dias || ''} onChange={handleChange} className="form-input" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={guardar.isLoading}
            className="btn-primary px-8 py-2.5 text-base shadow-lg"
          >
            {guardar.isLoading ? 'Guardando...' : (
              <>
                <Save size={20} /> Guardar Configuración
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  )
}
