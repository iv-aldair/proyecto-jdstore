const pool = require('../config/db');
const { ok, error, paginar } = require('../utils/helpers');

const listar = async (req, res, next) => {
  try {
    const { pagina, limite, offset } = paginar(req.query);
    const id_tienda = req.query.id_tienda || req.usuario.id_tienda;

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) AS total FROM compras WHERE id_tienda=?', [id_tienda]
    );
    const [rows] = await pool.query(
      `SELECT c.*, p.nombre AS proveedor, t.nombre_tienda
       FROM compras c
       JOIN proveedores p ON p.id_proveedor = c.id_proveedor
       JOIN tiendas    t ON t.id_tienda     = c.id_tienda
       WHERE c.id_tienda = ?
       ORDER BY c.fecha DESC LIMIT ? OFFSET ?`,
      [id_tienda, limite, offset]
    );
    return ok(res, { compras: rows, paginacion: { total, pagina, limite } });
  } catch (err) { next(err); }
};

const obtener = async (req, res, next) => {
  try {
    const [compra] = await pool.query(
      `SELECT c.*, p.nombre AS proveedor, t.nombre_tienda
       FROM compras c
       JOIN proveedores p ON p.id_proveedor = c.id_proveedor
       JOIN tiendas    t ON t.id_tienda     = c.id_tienda
       WHERE c.id_compra = ?`,
      [req.params.id]
    );
    if (!compra.length) return error(res, 'Compra no encontrada', 404);

    const [detalle] = await pool.query(
      `SELECT dc.*, p.nombre AS producto, p.codigo_producto
       FROM detalle_compra dc
       JOIN productos p ON p.id_producto = dc.id_producto
       WHERE dc.id_compra = ?`,
      [req.params.id]
    );
    return ok(res, { ...compra[0], detalle });
  } catch (err) { next(err); }
};

const crear = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { id_proveedor, items } = req.body;
    const id_tienda = req.usuario.id_tienda;

    if (!id_proveedor || !items?.length)
      return error(res, 'id_proveedor e items son requeridos');

    let total = 0;
    for (const item of items) total += item.precio_compra * item.cantidad;

    const [r] = await conn.query(
      'INSERT INTO compras (total, id_proveedor, id_tienda) VALUES (?,?,?)',
      [total.toFixed(2), id_proveedor, id_tienda]
    );
    const id_compra = r.insertId;

    for (const item of items) {
      const sub = parseFloat((item.precio_compra * item.cantidad).toFixed(2));
      await conn.query(
        `INSERT INTO detalle_compra (id_compra, id_producto, cantidad, precio_compra, subtotal)
         VALUES (?,?,?,?,?)`,
        [id_compra, item.id_producto, item.cantidad, item.precio_compra, sub]
      );
      // Sumar al inventario; si no existe la fila la crea
      await conn.query(
        `INSERT INTO inventario_tienda (id_tienda, id_producto, stock, stock_minimo)
         VALUES (?,?,?,5)
         ON DUPLICATE KEY UPDATE stock = stock + ?`,
        [id_tienda, item.id_producto, item.cantidad, item.cantidad]
      );
    }

    await conn.commit();
    return ok(res, { id_compra, total }, 'Compra registrada', 201);
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

module.exports = { listar, obtener, crear };