const pool = require('../config/db');
const { ok, error } = require('../utils/helpers');

/** GET /api/proformas - Listar proformas de la tienda */
const listar = async (req, res, next) => {
  try {
    const id_tienda = req.usuario.id_tienda;
    const [rows] = await pool.query(
      `SELECT p.id_proforma, p.codigo_proforma, p.cliente_nombre, p.cliente_telefono, 
              p.fecha, p.validez_dias, p.total, p.estado, u.nombre as vendedor
       FROM proformas p
       JOIN usuarios u ON p.id_usuario = u.id_usuario
       WHERE p.id_tienda = ?
       ORDER BY p.id_proforma DESC`,
      [id_tienda]
    );
    return ok(res, rows);
  } catch (err) { next(err); }
};

/** GET /api/proformas/:id - Detalle de proforma */
const obtenerPorId = async (req, res, next) => {
  try {
    const [[proforma]] = await pool.query(
      `SELECT p.*, u.nombre as vendedor, t.nombre_tienda, t.direccion as tienda_direccion, t.telefono as tienda_telefono
       FROM proformas p
       JOIN usuarios u ON p.id_usuario = u.id_usuario
       JOIN tiendas t ON p.id_tienda = t.id_tienda
       WHERE p.id_proforma = ?`,
      [req.params.id]
    );

    if (!proforma) return error(res, 'Proforma no encontrada', 404);

    const [detalles] = await pool.query(
      `SELECT pd.*, pr.nombre as producto, pr.modelo, pr.descripcion, pr.codigo_producto
       FROM proforma_detalles pd
       JOIN productos pr ON pd.id_producto = pr.id_producto
       WHERE pd.id_proforma = ?`,
      [req.params.id]
    );

    return ok(res, { ...proforma, detalles });
  } catch (err) { next(err); }
};

/** POST /api/proformas - Crear proforma */
const crear = async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { cliente_nombre, cliente_telefono, validez_dias, notas, detalles } = req.body;
    const id_usuario = req.usuario.id_usuario;
    const id_tienda = req.usuario.id_tienda;

    if (!detalles || detalles.length === 0) {
      throw new Error('La proforma debe tener al menos un producto');
    }

    // Calcular totales
    let subtotal_global = 0;
    let descuento_global = 0;
    let total_global = 0;

    detalles.forEach(d => {
      const precio = parseFloat(d.precio_unitario) || 0;
      const cant = parseInt(d.cantidad) || 0;
      const desc_uni = parseFloat(d.descuento_unitario) || 0;
      
      const sub = (precio * cant) - (desc_uni * cant);
      subtotal_global += (precio * cant);
      descuento_global += (desc_uni * cant);
      total_global += sub;
    });

    // Generar código correlativo (ej: PR-0001)
    const [[last]] = await connection.query('SELECT codigo_proforma FROM proformas ORDER BY id_proforma DESC LIMIT 1 FOR UPDATE');
    let num = 1;
    if (last && last.codigo_proforma) {
      num = parseInt(last.codigo_proforma.replace('PR-', '')) + 1;
    }
    const codigo_proforma = `PR-${String(num).padStart(5, '0')}`;

    // Insertar proforma
    const [result] = await connection.query(
      `INSERT INTO proformas 
      (codigo_proforma, cliente_nombre, cliente_telefono, validez_dias, subtotal, descuento_total, total, id_usuario, id_tienda, notas) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [codigo_proforma, cliente_nombre, cliente_telefono, validez_dias || 7, subtotal_global, descuento_global, total_global, id_usuario, id_tienda, notas]
    );

    const id_proforma = result.insertId;

    // Insertar detalles
    for (const d of detalles) {
      const precio = parseFloat(d.precio_unitario) || 0;
      const cant = parseInt(d.cantidad) || 0;
      const desc_uni = parseFloat(d.descuento_unitario) || 0;
      const sub = (precio * cant) - (desc_uni * cant);

      await connection.query(
        `INSERT INTO proforma_detalles 
        (id_proforma, id_producto, cantidad, precio_unitario, descuento_unitario, subtotal) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [id_proforma, d.id_producto, cant, precio, desc_uni, sub]
      );
    }

    await connection.commit();
    return ok(res, { id_proforma, codigo_proforma }, 'Proforma creada exitosamente', 201);
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
};

/** PATCH /api/proformas/:id/anular */
const anular = async (req, res, next) => {
  try {
    const [result] = await pool.query(
      'UPDATE proformas SET estado = 0 WHERE id_proforma = ?',
      [req.params.id]
    );
    if (!result.affectedRows) return error(res, 'Proforma no encontrada', 404);
    return ok(res, null, 'Proforma anulada');
  } catch (err) { next(err); }
};

module.exports = { listar, obtenerPorId, crear, anular };
