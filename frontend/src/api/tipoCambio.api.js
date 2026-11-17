import axios from './axios.js'

export const tipoCambioApi = {
  obtenerVigente: () => axios.get('/tipo-cambio/vigente'),
  consultarBCRP: () => axios.get('/tipo-cambio/bcrp'),
  actualizar: (datos) => axios.post('/tipo-cambio', datos),
  recalcularPrecios: (datos) => axios.post('/tipo-cambio/recalcular-precios', datos),
}
