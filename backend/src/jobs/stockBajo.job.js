const cron = require('node-cron');
const pool = require('../config/db');
const { obtenerProductosStockBajo } = require('../services/inventario.service');
const { enviarAlertaStockBajo }      = require('../services/email.service');

/**
 * Cron: todos los días a las 8:00 AM (hora Perú)
 * Revisa stock bajo en TODAS las tiendas y notifica al admin
 */
const iniciarJobStockBajo = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ [Job] Verificando stock bajo en todas las tiendas...');
    try {
      const [tiendas] = await pool.query('SELECT id_tienda, nombre_tienda FROM tiendas WHERE estado=1');

      for (const tienda of tiendas) {
        const productos = await obtenerProductosStockBajo(tienda.id_tienda);
        if (!productos.length) continue;

        console.log(`⚠️  Tienda "${tienda.nombre_tienda}": ${productos.length} productos con stock bajo`);

        // Obtener correos de administradores de esa tienda
        const [admins] = await pool.query(
          'SELECT correo FROM usuarios WHERE id_rol=1 AND id_tienda=? AND estado=1',
          [tienda.id_tienda]
        );

        for (const admin of admins) {
          if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await enviarAlertaStockBajo(admin.correo, productos).catch(e =>
              console.error('Error enviando email:', e.message)
            );
          }
        }
      }
    } catch (err) {
      console.error('❌ [Job StockBajo]', err.message);
    }
  }, { timezone: 'America/Lima' });

  console.log('✅ Job stockBajo.job.js iniciado (diario 08:00 Lima)');
};

module.exports = { iniciarJobStockBajo };