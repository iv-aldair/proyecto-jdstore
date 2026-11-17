import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const { login }    = useAuth()
  const navigate     = useNavigate()
  const [form, setForm]       = useState({ correo: '', contrasena: '' })
  const [verPass, setVerPass] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.correo || !form.contrasena) {
      setError('Ingresa correo y contraseña')
      return
    }
    setCargando(true)
    try {
      const usr = await login(form.correo, form.contrasena)
      toast.success(`¡Bienvenido, ${usr.nombre.split(' ')[0]}!`)
      navigate(usr.id_rol === 1 ? '/admin' : '/vendedor', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al iniciar sesión'
      setError(msg)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl shadow-lg mb-4">
            <span className="text-white font-black text-xl">JD</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">JD Store</h1>
          <p className="text-sm text-gray-500 mt-1">Sistema de Gestión – Juliaca</p>
        </div>

        {/* Card */}
        <div className="card p-6 shadow-md">
          <h2 className="text-base font-semibold text-gray-800 mb-5">Iniciar sesión</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-lg mb-4">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Correo electrónico</label>
              <input
                type="email"
                className="input"
                placeholder="tu@correo.com"
                value={form.correo}
                onChange={e => setForm({ ...form, correo: e.target.value })}
                autoFocus
              />
            </div>

            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <input
                  type={verPass ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  value={form.contrasena}
                  onChange={e => setForm({ ...form, contrasena: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setVerPass(!verPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {verPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="btn-primary w-full justify-center py-2.5 mt-2"
            >
              {cargando
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <LogIn size={16} />
              }
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <div className="text-center mt-5 space-y-2">
          <Link to="/" className="inline-block text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline">
            ← Volver a la Página Web Institucional JD Store
          </Link>
          <p className="text-xs text-gray-400">
            JD Store S.C.R.L. · RUC 20600698479 · Juliaca, Puno
          </p>
        </div>
      </div>
    </div>
  )
}