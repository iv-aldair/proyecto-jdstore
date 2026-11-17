import api from './axios.js'

export const authApi = {
  login:           (datos) => api.post('/auth/login', datos),
  perfil:          ()      => api.get('/auth/perfil'),
  cambiarPassword: (datos) => api.patch('/auth/cambiar-password', datos),
}

export default authApi