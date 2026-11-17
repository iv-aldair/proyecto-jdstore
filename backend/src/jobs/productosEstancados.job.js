const cron = require('node-cron');
const pool = require('../config/db');
const { obtenerProductosEstancados } = require('../services/inventario.service');
const { enviarAlertaEstancados }      = require('../services/email.service');

const DIAS_SIN_VENTA = 30;

/**
 * Cron: todos los lunes a las 9:00 AM (hora Perú)
 * Detecta productos sin ventas en los últimos 30 días
 */
const iniciarJobEstancados = () => {
  cron.schedule('0 9 * * 1', async () => {
    console.log('⏰ [Job] Verificando productos estancados...');
    try {
      const [tiendas] = await pool.query('SELECT id_tienda, nombre_tienda FROM tiendas WHERE estado=1');

      for (const tienda of tiendas) {
        const productos = await obtenerProductosEstancados(tienda.id_tienda, DIAS_SIN_VENTA);
        if (!productos.length) continue;

        console.log(`📦 Tienda "${tienda.nombre_tienda}": ${productos.length} productos estancados (+${DIAS_SIN_VENTA} días)`);

        const [admins] = await pool.query(
          'SELECT correo FROM usuarios WHERE id_rol=1 AND id_tienda=? AND estado=1',
          [tienda.id_tienda]
        );

        for (const admin of admins) {
          if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await enviarAlertaEstancados(admin.correo, productos, DIAS_SIN_VENTA).catch(e =>
              console.error('Error enviando email:', e.message)
            );
          }
        }
      }
    } catch (err) {
      console.error('❌ [Job Estancados]', err.message);
    }
  }, { timezone: 'America/Lima' });

  console.log('✅ Job productosEstancados.job.js iniciado (lunes 09:00 Lima)');
};

module.exports = { iniciarJobEstancados };