const pool = require('../config/db');
const { ok, error, paginar } = require('../utils/helpers');

/** GET /api/producto-series?id_producto=&id_tienda=&estado= */
const listar = async (req, res, next) => {
  try {
    const { pagina, limite, offset } = paginar(req.query);
    const { id_producto, estado } = req.query;
    // Si no viene id_tienda en el query, usamos el del usuario (Juliaca por defecto)
    const id_tienda = req.query.id_tienda || req.usuario.id_tienda;

    let where = 'WHERE ps.id_tienda = ?';
    const params = [id_tienda];

    if (id_producto) { 
        where += ' AND ps.id_producto = ?'; 
        params.push(id_producto); 
    }
    
    if (estado !== undefined && estado !== '') { 
        where += ' AND ps.estado = ?'; 
        params.push(estado); 
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM producto_series ps ${where}`, params
    );

    const [rows] = await pool.query(
      `SELECT ps.*, 
              p.nombre AS producto, p.codigo_producto, p.modelo,
              t.nombre_tienda,
              v.numero_comprobante AS vendido_en,
              CASE ps.estado 
                WHEN 0 THEN 'Inactivo' 
                WHEN 1 THEN 'Disponible' 
                WHEN 2 THEN 'Vendido' 
                ELSE 'Desconocido' 
              END AS estado_texto
       FROM producto_series ps
       JOIN productos p ON p.id_producto = ps.id_producto
       JOIN tiendas   t ON t.id_tienda   = ps.id_tienda
       LEFT JOIN ventas v ON v.id_venta  = ps.id_venta
       ${where}
       ORDER BY ps.estado ASC, ps.created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, limite, offset]
    );

    return ok(res, { series: rows, paginacion: { total, pagina, limite } });
  } catch (err) { next(err); }
};

/** GET /api/producto-series/buscar/:numero_serie */
const buscarPorSerie = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT ps.*, 
              p.nombre AS producto, p.codigo_producto, p.modelo, p.precio,
              t.nombre_tienda,
              CASE ps.estado WHEN 1 THEN 'Disponible' WHEN 2 THEN 'Vendido' ELSE 'Inactivo' END AS estado_texto
       FROM producto_series ps
       JOIN productos p ON p.id_producto = ps.id_producto
       JOIN tiendas   t ON t.id_tienda   = ps.id_tienda
       WHERE ps.numero_serie = ?`,
      [req.params.numero_serie]
    );

    if (!rows.length) return error(res, 'Número de serie no encontrado', 404);
    return ok(res, rows[0]);
  } catch (err) { next(err); }
};

/** POST /api/producto-series - Registrar una serie individual */
const crear = async (req, res, next) => {
  try {
    const { id_producto, numero_serie, id_tienda } = req.body;
    if (!id_producto || !numero_serie)
      return error(res, 'id_producto y numero_serie son requeridos');

    const tienda = id_tienda || req.usuario.id_tienda;

    const [r] = await pool.query(
      `INSERT INTO producto_series (id_producto, numero_serie, id_tienda, estado)
       VALUES (?, ?, ?, 1)`,
      [id_producto, numero_serie.trim().toUpperCase(), tienda]
    );

    // Actualizar stock de manera atómica
    await pool.query(
      `UPDATE inventario_tienda SET stock = stock + 1
       WHERE id_producto = ? AND id_tienda = ?`,
      [id_producto, tienda]
    );

    return ok(res, { id_serie: r.insertId }, 'Serie registrada correctamente', 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return error(res, 'El número de serie ya existe en el sistema');
    next(err);
  }
};

/** POST /api/producto-series/lote - Registrar múltiples series de golpe */
const crearLote = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { id_producto, series, id_tienda } = req.body;

    if (!id_producto || !series?.length)
      return error(res, 'id_producto y lista de series[] son requeridos');

    const tienda = id_tienda || req.usuario.id_tienda;
    let insertados = 0;
    let duplicados = 0;

    for (let num of series) {
      try {
        // Usamos un insert normal dentro de un try/catch para contar duplicados
        await conn.query(
          `INSERT INTO producto_series (id_producto, numero_serie, id_tienda, estado)
           VALUES (?, ?, ?, 1)`,
          [id_producto, num.trim().toUpperCase(), tienda]
        );
        insertados++;
      } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') duplicados++;
        else throw e; // Si es otro error, lanzamos la excepción
      }
    }

    // Actualizar stock masivamente
    if (insertados > 0) {
      await conn.query(
        `UPDATE inventario_tienda SET stock = stock + ?
         WHERE id_producto = ? AND id_tienda = ?`,
        [insertados, id_producto, tienda]
      );
    }

    await conn.commit();
    return ok(res, { insertados, duplicados }, `${insertados} series registradas, ${duplicados} ya existían`, 201);
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

/** GET /api/producto-series/disponibles/:id_producto - Útil para el carrito de ventas */
const disponiblesPorProducto = async (req, res, next) => {
  try {
    const id_tienda = req.query.id_tienda || req.usuario.id_tienda;
    const [rows] = await pool.query(
      `SELECT id_serie, numero_serie 
       FROM producto_series 
       WHERE id_producto = ? AND id_tienda = ? AND estado = 1
       ORDER BY numero_serie`,
      [req.params.id_producto, id_tienda]
    );
    return ok(res, rows);
  } catch (err) { next(err); }
};

/** PATCH /api/producto-series/:id/estado */
const cambiarEstado = async (req, res, next) => {
  try {
    const { estado } = req.body; // 0=inactivo, 1=disponible, 2=vendido
    if (estado === undefined) return error(res, 'El nuevo estado es requerido');
    
    const [[serieActual]] = await pool.query('SELECT estado, id_producto, id_tienda FROM producto_series WHERE id_serie = ?', [req.params.id]);
    if (!serieActual) return error(res, 'Serie no encontrada', 404);

    await pool.query(
      'UPDATE producto_series SET estado = ? WHERE id_serie = ?',
      [estado, req.params.id]
    );

    // Ajuste atómico de stock
    if (serieActual.estado === 1 && estado !== 1) {
      await pool.query('UPDATE inventario_tienda SET stock = GREATEST(0, stock - 1) WHERE id_producto = ? AND id_tienda = ?', 
        [serieActual.id_producto, serieActual.id_tienda]);
    } else if (serieActual.estado !== 1 && estado === 1) {
      await pool.query('UPDATE inventario_tienda SET stock = stock + 1 WHERE id_producto = ? AND id_tienda = ?', 
        [serieActual.id_producto, serieActual.id_tienda]);
    }

    return ok(res, null, 'Estado actualizado');
  } catch (err) { next(err); }
};

/** DELETE /api/producto-series/:id - Eliminación lógica */
const eliminar = async (req, res, next) => {
  try {
    const [[serieActual]] = await pool.query('SELECT estado, id_producto, id_tienda FROM producto_series WHERE id_serie = ?', [req.params.id]);
    if (!serieActual) return error(res, 'Serie no encontrada', 404);

    await pool.query(
      'UPDATE producto_series SET estado = 0 WHERE id_serie = ?',
      [req.params.id]
    );

    if (serieActual.estado === 1) {
      await pool.query('UPDATE inventario_tienda SET stock = GREATEST(0, stock - 1) WHERE id_producto = ? AND id_tienda = ?', 
        [serieActual.id_producto, serieActual.id_tienda]);
    }

    return ok(res, null, 'Serie desactivada correctamente');
  } catch (err) { next(err); }
};

module.exports = { 
    listar, 
    buscarPorSerie, 
    crear, 
    crearLote, 
    cambiarEstado, 
    eliminar,
    disponiblesPorProducto 
};