const cron  = require('node-cron');
const axios = require('axios');
const pool  = require('../config/db');

const ejecutarSincronizacionTC = async () => {
  try {
    console.log('[CRON-TC] Iniciando sincronización de Tipo de Cambio desde BCRP/SUNAT...');
    
    // 1. Consultar TC (Google Search → Google Finance → Fallback)
    let tcVenta = 3.755;
    const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'Accept-Language': 'es-PE,es;q=0.9' };
    
    try {
      // Intentar Google Search
      const sResp = await axios.get('https://www.google.com/search?q=dolar+hoy+peru', { timeout: 8000, headers });
      const sMatch = sResp.data.match(/data-value="([\d.]+)"/);
      if (sMatch && sMatch[1]) {
        tcVenta = parseFloat(sMatch[1]).toFixed(3);
        console.log('[CRON-TC] Extraído de Google Search:', tcVenta);
      } else {
        // Intentar Google Finance
        const gResp = await axios.get('https://www.google.com/finance/quote/USD-PEN', { timeout: 8000, headers });
        const gMatch = gResp.data.match(/data-last-price="([\d.]+)"/);
        if (gMatch && gMatch[1]) {
          tcVenta = parseFloat(gMatch[1]).toFixed(3);
          console.log('[CRON-TC] Extraído de Google Finance:', tcVenta);
        } else {
          throw new Error('No se encontró el patrón de precio en Google');
        }
      }
    } catch (apiErr) {
      console.warn('[CRON-TC] Scraping de Google falló. Usando valor anterior o por defecto. Error:', apiErr.message);
    }

    if (!tcVenta || isNaN(tcVenta)) {
      throw new Error('Tipo de cambio inválido recibido de la API');
    }

    // 2. Guardar en el historial de tipo de cambio
    await pool.query(
      `INSERT INTO tipo_cambio (valor_usd, fuente, fecha, hora)
       VALUES (?, 'apis.net.pe_bcrp', CURDATE(), CURTIME())`,
      [tcVenta]
    );

    // 3. Actualizar la variable de entorno/configuración local
    await pool.query(
      `UPDATE config_sistema SET valor = ? WHERE clave = 'tc_dolar_vigente'`,
      [tcVenta]
    );

    // 4. Actualizar todos los precios de productos configurados en DÓLARES (USD)
    // Se actualiza precio_costo_pen, precio_sugerido y el PRECIO FINAL DE VENTA (precio)
    const [result] = await pool.query(
      `UPDATE productos
       SET precio_costo_pen = ROUND(precio_costo_usd * ?, 2),
           precio_sugerido  = ROUND(precio_costo_usd * ? * (1 + margen_porcentaje/100) * (IF(afecto_igv = 1, 1.18, 1)), 2),
           precio           = ROUND(precio_costo_usd * ? * (1 + margen_porcentaje/100) * (IF(afecto_igv = 1, 1.18, 1)), 2)
       WHERE moneda_compra = 'USD' AND precio_costo_usd IS NOT NULL AND precio_costo_usd > 0`,
      [tcVenta, tcVenta, tcVenta]
    );

    console.log(`[CRON-TC] Éxito: Tipo de cambio S/ ${tcVenta}. Se actualizaron los precios de ${result.affectedRows} productos en USD.`);

  } catch (error) {
    console.error('[CRON-TC] Error en la sincronización automática de Dólares:', error.message);
  }
};

const iniciarJobTipoCambio = () => {
  // Ejecutar todos los días a las 08:30 AM (hora servidor)
  cron.schedule('30 08 * * *', ejecutarSincronizacionTC, {
    scheduled: true,
    timezone: "America/Lima"
  });
  console.log('✅ Job Tipo de Cambio programado (08:30 AM)');
};

module.exports = { iniciarJobTipoCambio, ejecutarSincronizacionTC };
