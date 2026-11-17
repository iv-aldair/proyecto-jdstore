const axios = require('axios');

/**
 * Consulta DNI o RUC en la API pública (apiperu.dev).
 */
const consultarDocumento = async (tipo, documento) => {
  try {
    const token = process.env.APIS_PERU_TOKEN || '';
    
    if (!token) {
      throw new Error('Falta el token de API PERU en el .env');
    }

    // --- INTEGRACIÓN CON APIPERU.DEV ---
    const endpoint = tipo === 'dni' 
      ? `https://apiperu.dev/api/dni/${documento}`
      : `https://apiperu.dev/api/ruc/${documento}`;

    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const response = await axios.get(endpoint, config);
    
    // apiperu.dev retorna success en boolean
    if (!response.data || !response.data.success) {
      throw new Error('No se encontró el documento o hubo un error en la API.');
    }

    const data = response.data.data;

    if (tipo === 'dni') {
      return {
        nombre: data.nombre_completo,
        tipo_documento: 'DNI',
        dni_ruc: data.numero
      };
    } else {
      return {
        nombre: data.nombre_o_razon_social,
        direccion: data.direccion_completa || data.direccion || '',
        tipo_documento: 'RUC',
        dni_ruc: data.ruc
      };
    }
  } catch (error) {
    console.error('Error consultando apiperu.dev:', error.response?.data || error.message);
    throw new Error('No se pudo consultar el documento externamente. Verifique el token o inténtelo de nuevo.');
  }
};

module.exports = {
  consultarDocumento
};
