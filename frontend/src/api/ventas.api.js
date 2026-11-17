import api from './axios.js'

export const ventasApi = {
  listar:   (params) => api.get('/ventas', { params }),
  obtener:  (id)     => api.get(`/ventas/${id}`),
  crear:    (datos)  => api.post('/ventas', datos),
  diarias:  (params) => api.get('/ventas/diarias', { params }),
  clientes: {
    listar:          (params)  => api.get('/clientes', { params }),
    buscarDocumento: (dni_ruc) => api.get(`/clientes/documento/${dni_ruc}`),
    crear:           (datos)   => api.post('/clientes', datos),
    actualizar:      (id, d)   => api.put(`/clientes/${id}`, d),
  },
}

export default ventasApi