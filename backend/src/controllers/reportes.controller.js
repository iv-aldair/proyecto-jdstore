const pool = require('../config/db');
const { ok, error } = require('../utils/helpers');
const { hoy, semanaActual, mesActual } = require('../utils/formatFecha');

const _queryReporte = async (inicio, fin, id_tienda) => {
  const isGeneral = id_tienda === 'general' || String(id_tienda) === '0';
  const condTienda = isGeneral ? '' : ' AND id_tienda=?';
  const condVTienda = isGeneral ? '' : ' AND v.id_tienda=?';
  const condMTienda = isGeneral ? '' : ' AND m.id_tienda=?';
  const params = isGeneral ? [inicio, fin] : [inicio, fin, id_tienda];

  const [[ventas]] = await pool.query(
    `SELECT COUNT(*) AS cantidad_ventas, COALESCE(SUM(total),0) AS total_ventas,
            COALESCE(SUM(igv),0) AS total_igv, COALESCE(SUM(subtotal),0) AS total_subtotal,
            COALESCE(SUM(utilidad),0) AS total_utilidad
     FROM ventas WHERE DATE(fecha) BETWEEN ? AND ?${condTienda}`,
    params
  );
  const [[compras]] = await pool.query(
    `SELECT COUNT(*) AS cantidad_compras, COALESCE(SUM(total),0) AS total_compras
     FROM compras WHERE DATE(fecha) BETWEEN ? AND ?${condTienda}`,
    params
  );
  const [detalleVentas] = await pool.query(
    `SELECT v.id_venta, v.numero_comprobante, v.tipo_comprobante, v.fecha,
            v.subtotal, v.igv, v.total, v.metodo_pago, v.estado_sunat, v.utilidad,
            c.nombre AS cliente, c.dni_ruc, u.nombre AS vendedor
     FROM ventas v
     JOIN clientes c ON c.id_cliente=v.id_cliente
     JOIN usuarios u ON u.id_usuario=v.id_usuario
     WHERE DATE(DATE_SUB(v.fecha, INTERVAL 5 HOUR)) BETWEEN ? AND ?${condVTienda}
     ORDER BY v.fecha`,
    params
  );
  
  const [movimientos] = await pool.query(
    `SELECT m.id_movimiento, m.fecha, m.tipo_movimiento, m.concepto, m.descripcion, m.monto, u.nombre as usuario
     FROM movimientos_caja m
     JOIN usuarios u ON m.id_usuario = u.id_usuario
     WHERE DATE(DATE_SUB(m.fecha, INTERVAL 5 HOUR)) BETWEEN ? AND ?${condMTienda}
     ORDER BY m.fecha DESC`,
    params
  );
  const ganancia = parseFloat(ventas.total_utilidad);

  // Calcular desglose de pagos
  const pagos = {};
  detalleVentas.forEach(v => {
    if (v.metodo_pago && v.metodo_pago.startsWith('Mixto')) {
      // Extraer "Mixto (Efectivo: 10.00, Yape: 5.00)"
      const match = v.metodo_pago.match(/\(([^)]+)\)/);
      if (match) {
        const partes = match[1].split(', ');
        partes.forEach(p => {
          const [metodo, monto] = p.split(': ');
          if (metodo && monto) {
            pagos[metodo] = (pagos[metodo] || 0) + parseFloat(monto);
          }
        });
      }
    } else {
      const metodo = v.metodo_pago || 'Efectivo';
      pagos[metodo] = (pagos[metodo] || 0) + parseFloat(v.total);
    }
  });

  return { ventas, compras, ganancia: ganancia.toFixed(2), detalleVentas, pagos, movimientos };
};

/** GET /api/reportes/diario?fecha=2025-03-25 */
const diario = async (req, res, next) => {
  try {
    const fecha     = req.query.fecha || hoy();
    const id_tienda = req.query.id_tienda || req.usuario.id_tienda;
    const datos     = await _queryReporte(fecha, fecha, id_tienda);
    return ok(res, { tipo: 'Diario', fecha, id_tienda, ...datos });
  } catch (err) { next(err); }
};

/** GET /api/reportes/semanal */
const semanal = async (req, res, next) => {
  try {
    const id_tienda = req.query.id_tienda || req.usuario.id_tienda;
    const { inicio, fin } = semanaActual();
    const datos = await _queryReporte(inicio, fin, id_tienda);
    return ok(res, { tipo: 'Semanal', inicio, fin, id_tienda, ...datos });
  } catch (err) { next(err); }
};

/** GET /api/reportes/mensual?anio=2025&mes=3 */
const mensual = async (req, res, next) => {
  try {
    const id_tienda = req.query.id_tienda || req.usuario.id_tienda;
    const anio = req.query.anio || new Date().getFullYear();
    const mes  = req.query.mes  || (new Date().getMonth() + 1);
    const inicio = `${anio}-${String(mes).padStart(2,'0')}-01`;
    const fin    = new Date(anio, mes, 0).toISOString().split('T')[0];
    const datos  = await _queryReporte(inicio, fin, id_tienda);
    return ok(res, { tipo: 'Mensual', inicio, fin, id_tienda, ...datos });
  } catch (err) { next(err); }
};

/** GET /api/reportes/personalizado?inicio=2025-01-01&fin=2025-03-31 */
const personalizado = async (req, res, next) => {
  try {
    const { inicio, fin } = req.query;
    const id_tienda = req.query.id_tienda || req.usuario.id_tienda;
    if (!inicio || !fin) return error(res, 'inicio y fin son requeridos');
    const datos = await _queryReporte(inicio, fin, id_tienda);
    return ok(res, { tipo: 'Personalizado', inicio, fin, id_tienda, ...datos });
  } catch (err) { next(err); }
};

/** GET /api/reportes/anual?anio=2025 */
const anual = async (req, res, next) => {
  try {
    const id_tienda = req.query.id_tienda || req.usuario.id_tienda;
    const anio = req.query.anio || new Date().getFullYear();
    const inicio = `${anio}-01-01`;
    const fin = `${anio}-12-31`;
    const datos = await _queryReporte(inicio, fin, id_tienda);
    return ok(res, { tipo: 'Anual', inicio, fin, id_tienda, ...datos });
  } catch (err) { next(err); }
};

/** GET /api/reportes/historial */
const historial = async (req, res, next) => {
  try {
    const id_tienda = req.query.id_tienda || req.usuario.id_tienda;
    const [rows] = await pool.query(
      `SELECT r.*, u.nombre AS generado_por, t.nombre_tienda
       FROM reportes r
       JOIN usuarios u ON u.id_usuario=r.id_usuario
       JOIN tiendas  t ON t.id_tienda=r.id_tienda
       WHERE r.id_tienda=? ORDER BY r.fecha_generacion DESC`,
      [id_tienda]
    );
    return ok(res, rows);
  } catch (err) { next(err); }
};

module.exports = { diario, semanal, mensual, anual, personalizado, historial };