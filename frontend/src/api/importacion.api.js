import api from './axios.js'

export const importacionApi = {
  /**
   * Sube un archivo Excel para importar productos
   * @param {File} archivo
   */
  importarProductos: (archivo) => {
    const formData = new FormData()
    formData.append('archivo', archivo)
    
    return api.post('/importacion/productos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 segundos porque puede demorar
    })
  },

  /**
   * Obtiene la URL para descargar la plantilla Excel
   */
  getPlantillaUrl: () => {
    return `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/importacion/plantilla`
  },

  /**
   * Descarga el inventario actual en formato Excel
   */
  exportarProductos: () => {
    return api.get('/importacion/exportar', {
      responseType: 'blob' // Importante para manejar la descarga del archivo
    })
  },
}

export default importacionApi
