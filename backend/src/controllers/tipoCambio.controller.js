const pool  = require('../config/db');
const axios = require('axios');
const { ok, error } = require('../utils/helpers');

/** GET /api/tipo-cambio/vigente */
const obtenerVigente = async (req, res, next) => {
  try {
    const [[tc]] = await pool.query(
      `SELECT * FROM tipo_cambio ORDER BY fecha DESC, hora DESC LIMIT 1`
    );
    const [[cfg]] = await pool.query(
      `SELECT valor FROM config_sistema WHERE clave = 'tc_dolar_vigente'`
    );
    return ok(res, {
      ...tc,
      valor_config: parseFloat(cfg?.valor || tc?.valor_usd || 3.75),
    });
  } catch (err) { next(err); }
};

/** GET /api/tipo-cambio/historial */
const historial = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT tc.*, u.nombre AS actualizado_por
       FROM tipo_cambio tc
       LEFT JOIN usuarios u ON u.id_usuario = tc.id_usuario
       ORDER BY tc.fecha DESC, tc.hora DESC
       LIMIT 30`
    );
    return ok(res, rows);
  } catch (err) { next(err); }
};

/** POST /api/tipo-cambio - Actualizar manualmente */
const actualizar = async (req, res, next) => {
  try {
    const { valor_usd } = req.body;
    if (!valor_usd || isNaN(valor_usd) || valor_usd <= 0)
      return error(res, 'valor_usd inválido');

    const tc = parseFloat(valor_usd).toFixed(4);

    // Guardar en historial
    await pool.query(
      `INSERT INTO tipo_cambio (valor_usd, fuente, fecha, hora, id_usuario)
       VALUES (?, 'manual', CURDATE(), CURTIME(), ?)`,
      [tc, req.usuario.id_usuario]
    );

    // Actualizar config vigente
    await pool.query(
      `UPDATE config_sistema SET valor = ? WHERE clave = 'tc_dolar_vigente'`,
      [tc]
    );

    // Recalcular precio_costo_pen, precio_sugerido y precio final (para POS)
    await pool.query(
      `UPDATE productos
       SET precio_costo_pen = ROUND(precio_costo_usd * ? * (IF(afecto_igv = 1, 1.18, 1)), 2),
           precio_sugerido  = ROUND(precio_costo_usd * ? * (1 + margen_porcentaje/100) * (IF(afecto_igv = 1, 1.18, 1)), 2),
           precio           = ROUND(precio_costo_usd * ? * (1 + margen_porcentaje/100) * (IF(afecto_igv = 1, 1.18, 1)), 2)
       WHERE moneda_compra = 'USD' AND precio_costo_usd IS NOT NULL`,
      [tc, tc, tc]
    );

    const [afectados] = await pool.query(
      `SELECT COUNT(*) AS total FROM productos WHERE moneda_compra = 'USD'`
    );

    return ok(res, {
      nuevo_tc: parseFloat(tc),
      productos_recalculados: afectados[0].total,
    }, `TC actualizado a S/ ${tc} por USD`);
  } catch (err) { next(err); }
};

/** GET /api/tipo-cambio/bcrp - Consultar TC (Google Search → Google Finance → apis.net.pe → Simulador) */
const consultarBCRP = async (req, res, next) => {
  try {
    const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 'Accept-Language': 'es-PE,es;q=0.9' };

    // ── Fuente 1: Google Search (Directo desde "dolar hoy") ──
    try {
      const sResp = await axios.get(
        'https://www.google.com/search?q=dolar+hoy+peru',
        { timeout: 8000, headers }
      );
      const html = sResp.data;
      // Buscar el patrón data-value="3.46..." que usa el widget de Google
      const match = html.match(/data-value="([\d.]+)"/);
      if (match && match[1]) {
        const tc = parseFloat(match[1]);
        if (tc > 3 && tc < 5) { // Validación de rango razonable para el Sol
          return ok(res, {
            compra: parseFloat((tc - 0.01).toFixed(3)),
            venta:  parseFloat(tc.toFixed(3)),
            fecha:  new Date().toISOString().split('T')[0],
            fuente: 'Google Search (dolar hoy)',
          });
        }
      }
    } catch (sErr) {
      console.warn('[TC] Google Search falló:', sErr.message);
    }

    // ── Fuente 2: Google Finance (Respaldo 1) ──
    try {
      const gResp = await axios.get(
        'https://www.google.com/finance/quote/USD-PEN',
        { timeout: 8000, headers }
      );
      const html = gResp.data;
      const match = html.match(/data-last-price="([\d.]+)"/);
      if (match && match[1]) {
        const tc = parseFloat(match[1]);
        if (tc > 3 && tc < 5) {
          return ok(res, {
            compra: parseFloat((tc - 0.01).toFixed(3)),
            venta:  parseFloat(tc.toFixed(3)),
            fecha:  new Date().toISOString().split('T')[0],
            fuente: 'Google Finance',
          });
        }
      }
    } catch (gErr) {
      console.warn('[TC] Google Finance falló:', gErr.message);
    }

    // ── Fuente 2: apis.net.pe / BCRP (requiere token para uso intensivo) ──
    try {
      const config = { timeout: 8000, headers: { Accept: 'application/json' } };
      const token = process.env.APIS_PERU_TOKEN;
      if (token && token.length > 20) config.headers.Authorization = `Bearer ${token}`;
      const response = await axios.get('https://api.apis.net.pe/v1/tipo-cambio-sunat', config);
      const data = response.data;
      return ok(res, {
        compra:  parseFloat(data.compra),
        venta:   parseFloat(data.venta),
        fecha:   data.fecha,
        fuente:  'BCRP / apis.net.pe',
      });
    } catch (apiErr) {
      console.warn('[TC] apis.net.pe falló:', apiErr.message);
    }

    // ── Fuente 3: Simulador (si todo falla) ──
    console.warn('[TC] Todas las fuentes fallaron. Retornando TC simulado.');
    return ok(res, {
      compra: 3.740,
      venta:  3.755,
      fecha:  new Date().toISOString().split('T')[0],
      fuente: 'Modo Prueba (Simulador)',
    });

  } catch (err) {
    return error(res, 'No se pudo consultar el TC. Usa actualización manual.', 503);
  }
};

/** POST /api/tipo-cambio/recalcular-precios - Recalcula precios con margen */
const recalcularPrecios = async (req, res, next) => {
  try {
    const { id_producto, margen_porcentaje } = req.body;

    const [[tc_row]] = await pool.query(
      `SELECT valor FROM config_sistema WHERE clave = 'tc_dolar_vigente'`
    );
    const tc = parseFloat(tc_row?.valor || 3.75);

    let where = '';
    const params = [tc, tc];
    if (id_producto) { where = 'AND id_producto = ?'; params.push(id_producto); }

    if (margen_porcentaje) {
      await pool.query(
        `UPDATE productos SET margen_porcentaje = ? ${id_producto ? 'WHERE id_producto = ?' : ''}`,
        margen_porcentaje ? [margen_porcentaje, ...(id_producto ? [id_producto] : [])] : [margen_porcentaje]
      );
    }

    // Para productos en USD: recalcula costo_pen, sugerido y precio final
    let queryParams = [tc, tc, tc];
    if (id_producto) queryParams.push(id_producto);

    const [r] = await pool.query(
      `UPDATE productos
       SET precio_costo_pen = ROUND(precio_costo_usd * ? * (IF(afecto_igv = 1, 1.18, 1)), 2),
           precio_sugerido  = ROUND(precio_costo_usd * ? * (1 + margen_porcentaje/100) * (IF(afecto_igv = 1, 1.18, 1)), 2),
           precio           = ROUND(precio_costo_usd * ? * (1 + margen_porcentaje/100) * (IF(afecto_igv = 1, 1.18, 1)), 2)
       WHERE moneda_compra = 'USD' AND precio_costo_usd IS NOT NULL ${where}`,
      queryParams
    );

    return ok(res, { actualizados: r.affectedRows, tc_usado: tc });
  } catch (err) { next(err); }
};

module.exports = { obtenerVigente, historial, actualizar, consultarBCRP, recalcularPrecios };