import api from './axios.js'

export const reportesApi = {
  diario:        (params) => api.get('/reportes/diario', { params }),
  semanal:       (params) => api.get('/reportes/semanal', { params }),
  mensual:       (params) => api.get('/reportes/mensual', { params }),
  anual:         (params) => api.get('/reportes/anual', { params }),
  personalizado: (params) => api.get('/reportes/personalizado', { params }),
  historial:     (params) => api.get('/reportes/historial', { params }),
  dashboard:     (params) => api.get('/estadisticas/dashboard', { params }),
  porCategoria:  (params) => api.get('/estadisticas/ventas-por-categoria', { params }),
  alertasResumen:(params) => api.get('/alertas/resumen', { params }),
  stockBajo:     (params) => api.get('/alertas/stock-bajo', { params }),
  estancados:    (params) => api.get('/alertas/productos-estancados', { params }),
}

export default reportesApi