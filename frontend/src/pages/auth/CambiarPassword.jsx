import { useState } from 'react'
import { authApi } from '../../api/auth.api.js'
import toast from 'react-hot-toast'
import { Lock } from 'lucide-react'
import { Spinner } from '../../components/ui/index.jsx'

export default function CambiarPassword() {
  const [form, setForm]       = useState({ password_actual: '', password_nuevo: '', confirmar: '' })
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password_nuevo !== form.confirmar) {
      toast.error('Las contraseñas nuevas no coinciden')
      return
    }
    if (form.password_nuevo.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setCargando(true)
    try {
      await authApi.cambiarPassword({
        password_actual: form.password_actual,
        password_nuevo:  form.password_nuevo,
      })
      toast.success('Contraseña actualizada correctamente')
      setForm({ password_actual: '', password_nuevo: '', confirmar: '' })
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al cambiar contraseña')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="page-title mb-6">Mi perfil</h1>
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={18} className="text-blue-600" />
          <h2 className="font-semibold text-gray-800">Cambiar contraseña</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {['password_actual', 'password_nuevo', 'confirmar'].map((field) => (
            <div key={field}>
              <label className="label">
                {field === 'password_actual' ? 'Contraseña actual'
                  : field === 'password_nuevo' ? 'Nueva contraseña'
                  : 'Confirmar nueva contraseña'}
              </label>
              <input
                type="password"
                className="input"
                value={form[field]}
                onChange={e => setForm({ ...form, [field]: e.target.value })}
              />
            </div>
          ))}
          <button type="submit" disabled={cargando} className="btn-primary">
            {cargando && <Spinner size={14} />}
            Actualizar contraseña
          </button>
        </form>
      </div>
    </div>
  )
}