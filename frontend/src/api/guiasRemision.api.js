import api from './axios.js'

export const guiasRemisionApi = {
  listar: () => api.get('/guias-remision'),
  obtener: (id) => api.get(`/guias-remision/${id}`),
  crear: (datos) => api.post('/guias-remision', datos),
  anular: (id) => api.delete(`/guias-remision/${id}`),
}

export default guiasRemisionApi
