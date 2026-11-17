const pool = require('../config/db');
const { ok, error } = require('../utils/helpers');

/** GET /api/inventario */
const listar = async (req, res, next) => {
  try {
    const id_tienda = req.query.id_tienda || req.usuario.id_tienda;
    const [rows] = await pool.query(
      `SELECT
         it.id_inventario, it.stock, it.stock_minimo, it.id_tienda,
         p.id_producto, p.codigo_producto,
         p.nombre      AS producto,
         p.modelo,
         p.precio,
         COALESCE(p.precio_costo_pen, 0)      AS precio_costo_pen,
         COALESCE(p.precio_costo_usd, 0)      AS precio_costo_usd,
         p.moneda_compra,
         p.margen_porcentaje,
         p.afecto_igv,
         c.nombre_categoria,
         m.nombre_marca,
         t.nombre_tienda,
         CASE WHEN it.stock <= it.stock_minimo THEN 'BAJO' ELSE 'OK' END AS estado_stock
       FROM inventario_tienda it
       JOIN productos  p ON p.id_producto  = it.id_producto
       JOIN categorias c ON c.id_categoria = p.id_categoria
       JOIN marcas     m ON m.id_marca     = p.id_marca
       JOIN tiendas    t ON t.id_tienda    = it.id_tienda
       WHERE it.id_tienda = ? AND p.estado = 1
       ORDER BY estado_stock DESC, p.nombre`,
      [id_tienda]
    );
    return ok(res, rows);
  } catch (err) { next(err); }
};

/** PATCH /api/inventario/:id_producto/ajustar */
const ajustar = async (req, res, next) => {
  try {
    const { cantidad, tipo, id_tienda } = req.body;
    if (!cantidad || !tipo) return error(res, 'cantidad y tipo son requeridos');
    const tienda = id_tienda || req.usuario.id_tienda;
    const delta  = tipo === 'SALIDA' ? -Math.abs(cantidad) : Math.abs(cantidad);
    const [result] = await pool.query(
      `UPDATE inventario_tienda SET stock = stock + ?
       WHERE id_producto = ? AND id_tienda = ?`,
      [delta, req.params.id_producto, tienda]
    );
    if (!result.affectedRows) return error(res, 'Registro no encontrado', 404);
    return ok(res, null, `Stock ajustado (${tipo}: ${cantidad})`);
  } catch (err) { next(err); }
};

/** PUT /api/inventario/:id_producto/stock-minimo */
const actualizarMinimo = async (req, res, next) => {
  try {
    const { stock_minimo, id_tienda } = req.body;
    const tienda = id_tienda || req.usuario.id_tienda;
    await pool.query(
      'UPDATE inventario_tienda SET stock_minimo = ? WHERE id_producto = ? AND id_tienda = ?',
      [stock_minimo, req.params.id_producto, tienda]
    );
    return ok(res, null, 'Stock mínimo actualizado');
  } catch (err) { next(err); }
};

/** PUT /api/inventario/:id_producto/stock-absoluto */
const actualizarStockAbsoluto = async (req, res, next) => {
  try {
    const { stock, id_tienda } = req.body;
    if (stock === undefined) return error(res, 'El valor de stock es requerido');
    
    const tienda = id_tienda || req.usuario.id_tienda;
    const [result] = await pool.query(
      'UPDATE inventario_tienda SET stock = ? WHERE id_producto = ? AND id_tienda = ?',
      [parseInt(stock), req.params.id_producto, tienda]
    );
    
    if (!result.affectedRows) return error(res, 'Registro no encontrado', 404);
    return ok(res, null, 'Stock actualizado correctamente');
  } catch (err) { next(err); }
};

/** PATCH /api/inventario/:id_producto/costo - Actualizar costo del producto */
const actualizarCosto = async (req, res, next) => {
  try {
    const { precio_costo_pen, precio_costo_usd, moneda_compra } = req.body;
    await pool.query(
      `UPDATE productos
       SET precio_costo_pen = ?,
           precio_costo_usd = ?,
           moneda_compra    = COALESCE(?, moneda_compra)
       WHERE id_producto = ?`,
      [
        precio_costo_pen !== undefined ? precio_costo_pen : null,
        precio_costo_usd !== undefined ? precio_costo_usd : null,
        moneda_compra || null,
        req.params.id_producto,
      ]
    );
    return ok(res, null, 'Costo actualizado');
  } catch (err) { next(err); }
};

/** GET /api/inventario/alertas */
const alertas = async (req, res, next) => {
  try {
    const id_tienda = req.query.id_tienda || req.usuario.id_tienda;
    const [rows] = await pool.query(
      `SELECT p.codigo_producto, p.nombre, it.stock, it.stock_minimo,
              (it.stock_minimo - it.stock) AS faltante, t.nombre_tienda
       FROM inventario_tienda it
       JOIN productos p ON p.id_producto = it.id_producto
       JOIN tiendas   t ON t.id_tienda   = it.id_tienda
       WHERE it.stock <= it.stock_minimo AND it.id_tienda = ? AND p.estado = 1
       ORDER BY faltante DESC`,
      [id_tienda]
    );
    return ok(res, rows);
  } catch (err) { next(err); }
};

/** GET /api/inventario/global — Inventario de TODAS las tiendas */
const listarGlobal = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         it.id_inventario, it.stock, it.stock_minimo, it.id_tienda,
         p.id_producto, p.codigo_producto,
         p.nombre      AS producto,
         p.modelo,
         p.precio,
         COALESCE(p.precio_costo_pen, 0)  AS precio_costo_pen,
         COALESCE(p.precio_costo_usd, 0)  AS precio_costo_usd,
         p.moneda_compra,
         p.margen_porcentaje,
         p.afecto_igv,
         c.nombre_categoria,
         m.nombre_marca,
         t.nombre_tienda,
         CASE WHEN it.stock <= it.stock_minimo THEN 'BAJO' ELSE 'OK' END AS estado_stock
       FROM inventario_tienda it
       JOIN productos  p ON p.id_producto  = it.id_producto
       JOIN categorias c ON c.id_categoria = p.id_categoria
       JOIN marcas     m ON m.id_marca     = p.id_marca
       JOIN tiendas    t ON t.id_tienda    = it.id_tienda
       WHERE p.estado = 1
       ORDER BY t.nombre_tienda, estado_stock DESC, p.nombre`
    );
    return ok(res, rows);
  } catch (err) { next(err); }
};

/** POST /api/inventario/asignar — Asignar producto a una tienda */
const asignarProductoTienda = async (req, res, next) => {
  try {
    const { id_producto, id_tienda } = req.body;
    if (!id_producto || !id_tienda) return error(res, 'id_producto e id_tienda son requeridos');

    // Verificar si ya existe
    const [[existe]] = await pool.query(
      'SELECT id_inventario FROM inventario_tienda WHERE id_producto = ? AND id_tienda = ?',
      [id_producto, id_tienda]
    );
    if (existe) return error(res, 'El producto ya está asignado a esta tienda');

    await pool.query(
      'INSERT INTO inventario_tienda (id_producto, id_tienda, stock, stock_minimo) VALUES (?, ?, 0, 5)',
      [id_producto, id_tienda]
    );
    return ok(res, null, 'Producto asignado a tienda', 201);
  } catch (err) { next(err); }
};

/** DELETE /api/inventario/quitar/:id_producto/:id_tienda — Quitar producto de tienda */
const quitarProductoTienda = async (req, res, next) => {
  try {
    const { id_producto, id_tienda } = req.params;

    // Verificar stock antes de quitar
    const [[registro]] = await pool.query(
      'SELECT stock FROM inventario_tienda WHERE id_producto = ? AND id_tienda = ?',
      [id_producto, id_tienda]
    );
    if (!registro) return error(res, 'Registro no encontrado', 404);
    if (registro.stock > 0) return error(res, 'No se puede quitar un producto con stock mayor a 0. Primero reduce el stock.');

    await pool.query(
      'DELETE FROM inventario_tienda WHERE id_producto = ? AND id_tienda = ?',
      [id_producto, id_tienda]
    );
    return ok(res, null, 'Producto quitado de la tienda');
  } catch (err) { next(err); }
};

module.exports = { listar, ajustar, actualizarMinimo, actualizarStockAbsoluto, actualizarCosto, alertas, listarGlobal, asignarProductoTienda, quitarProductoTienda };