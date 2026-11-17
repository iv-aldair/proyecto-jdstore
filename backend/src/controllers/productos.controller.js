const pool = require('../config/db');
const { ok, error, paginar } = require('../utils/helpers');

/** GET /api/productos */
const listar = async (req, res, next) => {
  try {
    const { pagina, limite, offset } = paginar(req.query);
    const { buscar, id_categoria, id_marca, estado = 1 } = req.query;

    let where = 'WHERE p.estado = ?';
    const params = [parseInt(estado)];

    if (buscar) {
      where += ' AND (p.nombre LIKE ? OR p.codigo_producto LIKE ? OR p.modelo LIKE ?)';
      params.push(`%${buscar}%`, `%${buscar}%`, `%${buscar}%`);
    }
    if (id_categoria) { where += ' AND p.id_categoria = ?'; params.push(id_categoria); }
    if (id_marca)     { where += ' AND p.id_marca = ?';     params.push(id_marca); }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM productos p ${where}`, params
    );

    const [rows] = await pool.query(
      `SELECT p.*, c.nombre_categoria, m.nombre_marca
       FROM productos p
       JOIN categorias c ON c.id_categoria = p.id_categoria
       JOIN marcas     m ON m.id_marca     = p.id_marca
       ${where}
       ORDER BY p.id_producto DESC
       LIMIT ? OFFSET ?`,
      [...params, limite, offset]
    );

    return ok(res, { productos: rows, paginacion: { total, pagina, limite } });
  } catch (err) { next(err); }
};

/** GET /api/productos/:id */
const obtener = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.nombre_categoria, m.nombre_marca
       FROM productos p
       JOIN categorias c ON c.id_categoria = p.id_categoria
       JOIN marcas     m ON m.id_marca     = p.id_marca
       WHERE p.id_producto = ?`,
      [req.params.id]
    );
    if (!rows.length) return error(res, 'Producto no encontrado', 404);
    return ok(res, rows[0]);
  } catch (err) { next(err); }
};

/** POST /api/productos */
const crear = async (req, res, next) => {
  try {
    const { codigo_producto, nombre, modelo, descripcion, precio, id_categoria, id_marca, moneda_compra = 'PEN', precio_costo_usd, margen_porcentaje = 30 } = req.body;
    let precioFinal = precio;
    let tc = 3.75;
    if (moneda_compra === 'USD') {
      const [[tc_row]] = await pool.query(`SELECT valor FROM config_sistema WHERE clave = 'tc_dolar_vigente'`);
      tc = parseFloat(tc_row?.valor || 3.75);
      
      if (precio_costo_usd) {
         precioFinal = parseFloat((parseFloat(precio_costo_usd) * tc * (1 + parseFloat(margen_porcentaje)/100) * 1.18).toFixed(2));
      }
    }

    if (!codigo_producto || !nombre || !precioFinal || !id_categoria || !id_marca)
      return error(res, 'Campos requeridos: codigo_producto, nombre, precio, id_categoria, id_marca');

    const precio_costo_pen = moneda_compra === 'USD' && precio_costo_usd ? parseFloat((parseFloat(precio_costo_usd) * tc * 1.18).toFixed(2)) : null;

    const [result] = await pool.query(
      `INSERT INTO productos 
       (codigo_producto, nombre, modelo, descripcion, precio, id_categoria, id_marca, moneda_compra, precio_costo_usd, precio_costo_pen, margen_porcentaje) 
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [codigo_producto, nombre, modelo || null, descripcion || null, precioFinal, id_categoria, id_marca, moneda_compra, precio_costo_usd || null, precio_costo_pen, margen_porcentaje]
    );

    // Registrar stock inicial automáticamente en Tienda Principal para que aparezca de inmediato en la Web y Chatbot
    const stockInicial = req.body.stock !== undefined ? parseInt(req.body.stock) : 5;
    await pool.query(
      `INSERT IGNORE INTO inventario_tienda (id_producto, id_tienda, stock, stock_minimo) VALUES (?, 1, ?, 2)`,
      [result.insertId, isNaN(stockInicial) ? 5 : stockInicial]
    );

    return ok(res, { id_producto: result.insertId }, 'Producto creado y publicado en el catálogo web', 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return error(res, 'El código de producto ya existe');
    next(err);
  }
};

/** PUT /api/productos/:id */
const actualizar = async (req, res, next) => {
  try {
    const { codigo_producto, nombre, modelo, descripcion, precio, id_categoria, id_marca, moneda_compra = 'PEN', precio_costo_usd, margen_porcentaje = 30, estado = 1 } = req.body;
    
    let precioFinal = precio;
    let tc = 3.75;
    if (moneda_compra === 'USD') {
      const [[tc_row]] = await pool.query(`SELECT valor FROM config_sistema WHERE clave = 'tc_dolar_vigente'`);
      tc = parseFloat(tc_row?.valor || 3.75);

      if (precio_costo_usd) {
         precioFinal = parseFloat((parseFloat(precio_costo_usd) * tc * (1 + parseFloat(margen_porcentaje)/100) * 1.18).toFixed(2));
      }
    }
    const precio_costo_pen = moneda_compra === 'USD' && precio_costo_usd ? parseFloat((parseFloat(precio_costo_usd) * tc * 1.18).toFixed(2)) : null;

    const [result] = await pool.query(
      `UPDATE productos 
       SET codigo_producto=?, nombre=?, modelo=?, descripcion=?, precio=?, id_categoria=?, id_marca=?, estado=?,
           moneda_compra=?, precio_costo_usd=?, precio_costo_pen=?, margen_porcentaje=?
       WHERE id_producto=?`,
      [codigo_producto, nombre, modelo, descripcion, precioFinal, id_categoria, id_marca, estado, 
       moneda_compra, precio_costo_usd || null, precio_costo_pen, margen_porcentaje, req.params.id]
    );
    if (!result.affectedRows) return error(res, 'Producto no encontrado', 404);
    return ok(res, null, 'Producto actualizado');
  } catch (err) { next(err); }
};

/** DELETE /api/productos/:id  (soft delete) */
const eliminar = async (req, res, next) => {
  try {
    const [result] = await pool.query(
      'UPDATE productos SET estado = 0 WHERE id_producto = ?',
      [req.params.id]
    );
    if (!result.affectedRows) return error(res, 'Producto no encontrado', 404);
    return ok(res, null, 'Producto desactivado');
  } catch (err) { next(err); }
};

/** GET /api/productos/stock-bajo */
const stockBajo = async (req, res, next) => {
  try {
    const id_tienda = req.query.id_tienda || req.usuario.id_tienda;
    const [rows] = await pool.query(
      `SELECT p.id_producto, p.codigo_producto, p.nombre, p.modelo,
              it.stock, it.stock_minimo, t.nombre_tienda,
              (it.stock_minimo - it.stock) AS faltante
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

/** GET /api/productos/buscar?q=epson */
const buscar = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    const [rows] = await pool.query(
      `SELECT p.id_producto, p.codigo_producto, p.nombre, p.modelo, p.precio,
              c.nombre_categoria, m.nombre_marca
       FROM productos p
       JOIN categorias c ON c.id_categoria = p.id_categoria
       JOIN marcas     m ON m.id_marca     = p.id_marca
       WHERE p.estado = 1 AND (p.nombre LIKE ? OR p.codigo_producto LIKE ? OR p.modelo LIKE ?)
       LIMIT 20`,
      [`%${q}%`, `%${q}%`, `%${q}%`]
    );
    return ok(res, rows);
  } catch (err) { next(err); }
};

/** PATCH /api/productos/:id — Actualización parcial (solo los campos enviados) */
const actualizarParcial = async (req, res, next) => {
  try {
    const campos = {};
    const permitidos = [
      'precio', 'precio_costo_pen', 'precio_costo_usd',
      'margen_porcentaje', 'moneda_compra', 'nombre', 'modelo',
      'descripcion', 'codigo_producto', 'id_categoria', 'id_marca', 'estado',
      'afecto_igv'
    ];

    for (const key of permitidos) {
      if (req.body[key] !== undefined) {
        campos[key] = req.body[key];
      }
    }

    if (Object.keys(campos).length === 0) {
      return error(res, 'No se enviaron campos para actualizar', 400);
    }

    const sets = Object.keys(campos).map(k => `${k} = ?`).join(', ');
    const values = Object.values(campos);
    values.push(req.params.id);

    const [result] = await pool.query(
      `UPDATE productos SET ${sets} WHERE id_producto = ?`,
      values
    );
    if (!result.affectedRows) return error(res, 'Producto no encontrado', 404);
    return ok(res, null, 'Producto actualizado');
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, crear, actualizar, actualizarParcial, eliminar, stockBajo, buscar };

