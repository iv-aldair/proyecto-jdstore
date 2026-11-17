import api from './axios.js'

export const backupsApi = {
  listar: () => api.get('/backups'),
  generarManual: () => api.post('/backups/generar'),
  eliminar: (id) => api.delete(`/backups/${id}`),
  limpiar: (dias) => api.post('/backups/limpiar', { dias }),
  obtenerConfig: () => api.get('/backups/config'),
  actualizarConfig: (datos) => api.put('/backups/config', datos),
}

export default backupsApi
