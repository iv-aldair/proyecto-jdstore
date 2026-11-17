import api from './axios.js'

export const inventarioApi = {
  listar:           (params)    => api.get('/inventario', { params }),
  listarGlobal:     ()          => api.get('/inventario/global'),
  alertas:          (params)    => api.get('/inventario/alertas', { params }),
  ajustar:          (id, datos) => api.patch(`/inventario/${id}/ajustar`, datos),
  actualizarStockAbsoluto: (id, datos) => api.put(`/inventario/${id}/stock-absoluto`, datos),
  actualizarMinimo: (id, datos) => api.put(`/inventario/${id}/stock-minimo`, datos),
  asignar:          (datos)     => api.post('/inventario/asignar', datos),
  quitar:           (id_producto, id_tienda) => api.delete(`/inventario/quitar/${id_producto}/${id_tienda}`),
}

export default inventarioApi