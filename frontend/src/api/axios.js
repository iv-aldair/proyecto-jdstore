import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (window.location.origin + '/api'),
  timeout: 45000, // 45s — más tiempo para operaciones pesadas vía Tailscale
  headers: { 'Content-Type': 'application/json' },
})

// Añadir token JWT a cada request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jdstore_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Manejar respuestas y errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jdstore_token')
      localStorage.removeItem('jdstore_usuario')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api