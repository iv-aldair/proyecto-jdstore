import api from './axios.js'

export const productosApi = {
  listar:     (params) => api.get('/productos', { params }),
  obtener:    (id)     => api.get(`/productos/${id}`),
  buscar:     (q)      => api.get('/productos/buscar', { params: { q } }),
  stockBajo:  (params) => api.get('/productos/stock-bajo', { params }),
  crear:      (datos)  => api.post('/productos', datos),
  actualizar: (id, d)  => api.put(`/productos/${id}`, d),
  eliminar:   (id)     => api.delete(`/productos/${id}`),
  seriesDisponibles: (id, params) => api.get(`/producto-series/disponibles/${id}`, { params }),
  series: {
    listar: (params) => api.get('/producto-series', { params }),
    crear: (datos) => api.post('/producto-series', datos),
    crearLote: (datos) => api.post('/producto-series/lote', datos),
    eliminar: (id) => api.delete(`/producto-series/${id}`),
    cambiarEstado: (id, estado) => api.patch(`/producto-series/${id}/estado`, { estado }),
  },
  categorias: {
    listar:    ()      => api.get('/categorias'),
    crear:     (datos) => api.post('/categorias', datos),
    actualizar:(id, d) => api.put(`/categorias/${id}`, d),
    eliminar:  (id)    => api.delete(`/categorias/${id}`),
  },
  marcas: {
    listar:    ()      => api.get('/marcas'),
    crear:     (datos) => api.post('/marcas', datos),
    actualizar:(id, d) => api.put(`/marcas/${id}`, d),
    eliminar:  (id)    => api.delete(`/marcas/${id}`),
  },
}

export default productosApi