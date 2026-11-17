const pool = require('../config/db');
const { ok, error } = require('../utils/helpers');

/** GET /api/deudas - Listar todas las deudas con otras tiendas */
const listar = async (req, res, next) => {
  try {
    const estado_pago = req.query.estado_pago; // PENDIENTE o PAGADO
    let query = `
      SELECT d.*, t.nombre_tienda, u.nombre AS vendedor,
             v.numero_comprobante
      FROM deudas_externas d
      JOIN tiendas t ON d.id_tienda = t.id_tienda
      JOIN usuarios u ON d.id_usuario = u.id_usuario
      LEFT JOIN ventas v ON d.id_venta = v.id_venta
      WHERE 1=1
    `;
    const params = [];

    if (estado_pago) {
      query += ` AND d.estado_pago = ?`;
      params.push(estado_pago);
    }

    query += ` ORDER BY d.fecha DESC`;

    const [rows] = await pool.query(query, params);
    return ok(res, rows);
  } catch (err) { next(err); }
};

/** PUT /api/deudas/:id/pagar - Marcar deuda como pagada */
const marcarPagada = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [deuda] = await pool.query('SELECT estado_pago, id_tienda, monto_deuda, tienda_proveedor, producto_nombre FROM deudas_externas WHERE id_deuda = ?', [id]);
    if (!deuda.length) return error(res, 'Deuda no encontrada', 404);
    if (deuda[0].estado_pago === 'PAGADO') return error(res, 'La deuda ya está pagada', 400);

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      
      await conn.query('UPDATE deudas_externas SET estado_pago = ? WHERE id_deuda = ?', ['PAGADO', id]);
      
      // Crear movimiento de caja (Egreso)
      await conn.query(
        `INSERT INTO movimientos_caja 
          (id_tienda, id_usuario, tipo_movimiento, concepto, monto, descripcion) 
         VALUES (?, ?, 'EGRESO', 'Pago Consignación', ?, ?)`,
        [deuda[0].id_tienda, req.usuario.id_usuario, deuda[0].monto_deuda, `Pago a ${deuda[0].tienda_proveedor} por ${deuda[0].producto_nombre}`]
      );
      
      await conn.commit();
      return ok(res, null, 'Deuda marcada como pagada correctamente y egreso registrado');
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (err) { next(err); }
};

module.exports = {
  listar,
  marcarPagada
};
