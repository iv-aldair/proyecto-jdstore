import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children, rolRequerido }) {
  const { usuario } = useAuth()

  if (!usuario) return <Navigate to="/login" replace />

  if (rolRequerido && usuario.id_rol !== rolRequerido) {
    return <Navigate to={usuario.id_rol === 1 ? '/admin' : '/vendedor'} replace />
  }

  return children
}