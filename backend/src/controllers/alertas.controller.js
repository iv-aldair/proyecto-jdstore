const pool = require('../config/db');
const { ok } = require('../utils/helpers');

const stockBajo = async (req, res, next) => {
  try {
    const id_tienda = req.query.id_tienda || req.usuario.id_tienda;
    const [rows] = await pool.query(
      `SELECT p.id_producto, p.codigo_producto, p.nombre, p.modelo,
              it.stock, it.stock_minimo, t.nombre_tienda,
              (it.stock_minimo - it.stock) AS unidades_faltantes,
              c.nombre_categoria, m.nombre_marca
       FROM inventario_tienda it
       JOIN productos  p ON p.id_producto  = it.id_producto
       JOIN tiendas    t ON t.id_tienda    = it.id_tienda
       JOIN categorias c ON c.id_categoria = p.id_categoria
       JOIN marcas     m ON m.id_marca     = p.id_marca
       WHERE it.stock <= it.stock_minimo AND it.id_tienda = ? AND p.estado = 1
       ORDER BY unidades_faltantes DESC`,
      [id_tienda]
    );
    return ok(res, { total: rows.length, alertas: rows });
  } catch (err) { next(err); }
};

const sinStock = async (req, res, next) => {
  try {
    const id_tienda = req.query.id_tienda || req.usuario.id_tienda;
    const [rows] = await pool.query(
      `SELECT p.codigo_producto, p.nombre, it.stock, t.nombre_tienda
       FROM inventario_tienda it
       JOIN productos p ON p.id_producto = it.id_producto
       JOIN tiendas   t ON t.id_tienda   = it.id_tienda
       WHERE it.stock = 0 AND it.id_tienda = ? AND p.estado = 1`,
      [id_tienda]
    );
    return ok(res, { total: rows.length, productos: rows });
  } catch (err) { next(err); }
};

const productosEstancados = async (req, res, next) => {
  try {
    const id_tienda = parseInt(req.query.id_tienda || req.usuario.id_tienda);
    const dias      = parseInt(req.query.dias) || 30;
    const [rows] = await pool.query(
      `SELECT
         p.id_producto, p.codigo_producto, p.nombre, p.modelo,
         it.stock, it.stock_minimo,
         c.nombre_categoria, m.nombre_marca,
         uv.ultima_venta,
         CASE WHEN uv.ultima_venta IS NULL THEN NULL
              ELSE DATEDIFF(NOW(), uv.ultima_venta) END AS dias_sin_venta
       FROM inventario_tienda it
       JOIN productos  p ON p.id_producto  = it.id_producto
       JOIN categorias c ON c.id_categoria = p.id_categoria
       JOIN marcas     m ON m.id_marca     = p.id_marca
       LEFT JOIN (
         SELECT dv.id_producto, MAX(v.fecha) AS ultima_venta
         FROM detalle_venta dv
         JOIN ventas v ON v.id_venta = dv.id_venta AND v.id_tienda = ?
         GROUP BY dv.id_producto
       ) uv ON uv.id_producto = p.id_producto
       WHERE it.id_tienda = ? AND p.estado = 1 AND it.stock > 0
         AND (uv.ultima_venta IS NULL OR DATEDIFF(NOW(), uv.ultima_venta) >= ?)
       ORDER BY dias_sin_venta DESC, it.stock DESC`,
      [id_tienda, id_tienda, dias]
    );
    return ok(res, { total: rows.length, dias_criterio: dias, productos: rows });
  } catch (err) { next(err); }
};

const resumen = async (req, res, next) => {
  try {
    const id_tienda = parseInt(req.query.id_tienda || req.usuario.id_tienda);
    const [[{ stock_bajo }]] = await pool.query(
      `SELECT COUNT(*) AS stock_bajo FROM inventario_tienda WHERE stock <= stock_minimo AND id_tienda = ?`,
      [id_tienda]
    );
    const [[{ sin_stock }]] = await pool.query(
      `SELECT COUNT(*) AS sin_stock FROM inventario_tienda WHERE stock = 0 AND id_tienda = ?`,
      [id_tienda]
    );
    const [[{ estancados }]] = await pool.query(
      `SELECT COUNT(*) AS estancados
       FROM inventario_tienda it
       JOIN productos p ON p.id_producto = it.id_producto
       LEFT JOIN (
         SELECT dv.id_producto, MAX(v.fecha) AS ultima_venta
         FROM detalle_venta dv JOIN ventas v ON v.id_venta = dv.id_venta AND v.id_tienda = ?
         GROUP BY dv.id_producto
       ) uv ON uv.id_producto = p.id_producto
       WHERE it.id_tienda = ? AND p.estado = 1
         AND (uv.ultima_venta IS NULL OR DATEDIFF(NOW(), uv.ultima_venta) >= 30)`,
      [id_tienda, id_tienda]
    );
    return ok(res, { stock_bajo, sin_stock, estancados_30_dias: estancados });
  } catch (err) { next(err); }
};

module.exports = { stockBajo, sinStock, productosEstancados, resumen };