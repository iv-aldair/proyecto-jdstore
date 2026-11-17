import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/auth.api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario]   = useState(null)
  const [token, setToken]       = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const tokenGuardado   = localStorage.getItem('jdstore_token')
    const usuarioGuardado = localStorage.getItem('jdstore_usuario')
    if (tokenGuardado && usuarioGuardado) {
      setToken(tokenGuardado)
      setUsuario(JSON.parse(usuarioGuardado))
    }
    setCargando(false)
  }, [])

  const login = async (correo, contrasena) => {
    const res = await authApi.login({ correo, contrasena })
    const { token: tk, usuario: usr } = res.data.datos
    localStorage.setItem('jdstore_token',   tk)
    localStorage.setItem('jdstore_usuario', JSON.stringify(usr))
    setToken(tk)
    setUsuario(usr)
    return usr
  }

  const logout = () => {
    localStorage.removeItem('jdstore_token')
    localStorage.removeItem('jdstore_usuario')
    setToken(null)
    setUsuario(null)
  }

  const esAdmin    = usuario?.id_rol === 1
  const esVendedor = usuario?.id_rol === 2

  return (
    <AuthContext.Provider value={{ usuario, token, cargando, login, logout, esAdmin, esVendedor }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}