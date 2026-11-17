const pool = require('../config/db');

/**
 * Devuelve todos los productos con stock <= stock_minimo de una tienda
 */
const obtenerProductosStockBajo = async (id_tienda) => {
  const [rows] = await pool.query(
    `SELECT p.id_producto, p.codigo_producto, p.nombre, p.modelo,
            it.stock, it.stock_minimo,
            (it.stock_minimo - it.stock) AS faltante,
            c.nombre_categoria, m.nombre_marca, t.nombre_tienda
     FROM inventario_tienda it
     JOIN productos  p ON p.id_producto  = it.id_producto
     JOIN tiendas    t ON t.id_tienda    = it.id_tienda
     JOIN categorias c ON c.id_categoria = p.id_categoria
     JOIN marcas     m ON m.id_marca     = p.id_marca
     WHERE it.stock <= it.stock_minimo
       AND it.id_tienda = ?
       AND p.estado = 1
     ORDER BY faltante DESC`,
    [id_tienda]
  );
  return rows;
};

/**
 * Devuelve productos sin ventas en los últimos N días
 */
const obtenerProductosEstancados = async (id_tienda, dias = 30) => {
  const [rows] = await pool.query(
    `SELECT p.id_producto, p.codigo_producto, p.nombre,
            it.stock, c.nombre_categoria,
            MAX(v.fecha) AS ultima_venta,
            DATEDIFF(NOW(), MAX(v.fecha)) AS dias_sin_venta
     FROM inventario_tienda it
     JOIN productos  p ON p.id_producto  = it.id_producto AND it.id_tienda = ?
     JOIN categorias c ON c.id_categoria = p.id_categoria
     LEFT JOIN detalle_venta dv ON dv.id_producto = p.id_producto
     LEFT JOIN ventas v ON v.id_venta = dv.id_venta AND v.id_tienda = ?
     WHERE p.estado = 1 AND it.stock > 0
     GROUP BY p.id_producto
     HAVING ultima_venta IS NULL OR dias_sin_venta >= ?
     ORDER BY dias_sin_venta DESC`,
    [id_tienda, id_tienda, dias]
  );
  return rows;
};

/**
 * Registra un movimiento y actualiza el stock
 * tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE'
 */
const moverStock = async (id_producto, id_tienda, cantidad, tipo) => {
  const delta = tipo === 'SALIDA' ? -Math.abs(cantidad) : Math.abs(cantidad);
  const [result] = await pool.query(
    `UPDATE inventario_tienda
     SET stock = stock + ?
     WHERE id_producto = ? AND id_tienda = ?`,
    [delta, id_producto, id_tienda]
  );
  return result.affectedRows > 0;
};

module.exports = { obtenerProductosStockBajo, obtenerProductosEstancados, moverStock };