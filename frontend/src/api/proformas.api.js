import api from './axios.js'

export const proformasApi = {
  listar:       ()      => api.get('/proformas'),
  obtener:      (id)    => api.get(`/proformas/${id}`),
  crear:        (datos) => api.post('/proformas', datos),
  anular:       (id)    => api.patch(`/proformas/${id}/anular`)
}

export default proformasApi
