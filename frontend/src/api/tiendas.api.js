import api from './axios.js'

export const tiendasApi = {
  listar:     ()      => api.get('/tiendas'),
  obtener:    (id)    => api.get(`/tiendas/${id}`),
  crear:      (datos) => api.post('/tiendas', datos),
  actualizar: (id, d) => api.put(`/tiendas/${id}`, d),
  eliminar:   (id)    => api.delete(`/tiendas/${id}`)
}

export default tiendasApi
