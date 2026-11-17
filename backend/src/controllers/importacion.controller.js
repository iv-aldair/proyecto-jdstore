const pool   = require('../config/db');
const XLSX   = require('xlsx');
const { ok, error } = require('../utils/helpers');

/**
 * POST /api/importacion/productos
 * Body: multipart/form-data con campo "archivo" (.xlsx)
 *
 * Columnas esperadas en el Excel (fila 1 = cabecera):
 * codigo_producto | nombre | modelo | descripcion | precio |
 * precio_costo_pen | precio_costo_usd | moneda_compra |
 * margen_porcentaje | id_categoria | id_marca
 */
const importarProductos = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    if (!req.file) return error(res, 'Debes subir un archivo .xlsx');

    const wb   = XLSX.read(req.file.buffer, { type: 'buffer' });
    const ws   = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });

    if (!rows.length) return error(res, 'El archivo está vacío');

    let ok_count = 0, err_count = 0;
    const errores = [];

    await conn.beginTransaction();

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const fila = i + 2; // +2 porque fila 1 = cabecera

      // Validaciones mínimas
      if (!r.codigo_producto || !r.nombre || !r.precio) {
        errores.push({ fila, error: 'Falta codigo_producto, nombre o precio' });
        err_count++;
        continue;
      }

      try {
        await conn.query(
          `INSERT INTO productos
             (codigo_producto, nombre, modelo, descripcion, precio,
              precio_costo_pen, precio_costo_usd, moneda_compra,
              margen_porcentaje, id_categoria, id_marca, estado)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,1)
           ON DUPLICATE KEY UPDATE
             nombre            = VALUES(nombre),
             modelo            = VALUES(modelo),
             descripcion       = VALUES(descripcion),
             precio            = VALUES(precio),
             precio_costo_pen  = VALUES(precio_costo_pen),
             precio_costo_usd  = VALUES(precio_costo_usd),
             moneda_compra     = VALUES(moneda_compra),
             margen_porcentaje = VALUES(margen_porcentaje),
             id_categoria      = VALUES(id_categoria),
             id_marca          = VALUES(id_marca)`,
          [
            String(r.codigo_producto).trim(),
            String(r.nombre).trim(),
            r.modelo       || null,
            r.descripcion  || null,
            parseFloat(r.precio) || 0,
            r.precio_costo_pen ? parseFloat(r.precio_costo_pen) : null,
            r.precio_costo_usd ? parseFloat(r.precio_costo_usd) : null,
            ['USD','PEN'].includes(r.moneda_compra) ? r.moneda_compra : 'PEN',
            r.margen_porcentaje ? parseFloat(r.margen_porcentaje) : 30.00,
            parseInt(r.id_categoria) || 1,
            parseInt(r.id_marca)     || 1,
          ]
        );

        // --- Novedad: Recuperar el ID y agregar Stock y Series ---
        const [prodRows] = await conn.query('SELECT id_producto FROM productos WHERE codigo_producto = ?', [String(r.codigo_producto).trim()]);
        if (prodRows.length > 0) {
          const id_producto = prodRows[0].id_producto;
          const id_tienda = req.usuario.id_tienda;

          // 1. Agregar Stock (Sumar al existente)
          const cantidadSumar = parseInt(r.stock) || 0;
          if (cantidadSumar > 0) {
            await conn.query(
              `INSERT INTO inventario_tienda (id_tienda, id_producto, stock) 
               VALUES (?, ?, ?) 
               ON DUPLICATE KEY UPDATE stock = stock + ?`,
              [id_tienda, id_producto, cantidadSumar, cantidadSumar]
            );
          }

          // 2. Registrar Series
          if (r.numeros_serie) {
            const series = String(r.numeros_serie).split(',').map(s => s.trim()).filter(s => s !== '');
            for (const serie of series) {
               await conn.query(
                 `INSERT IGNORE INTO producto_series (id_producto, id_tienda, numero_serie, estado) 
                  VALUES (?, ?, ?, 1)`,
                 [id_producto, id_tienda, serie]
               );
            }
          }
        }
        // ---------------------------------------------------------

        ok_count++;
      } catch (e) {
        errores.push({ fila, error: e.message });
        err_count++;
      }
    }

    await conn.commit();

    // Registrar log
    await pool.query(
      `INSERT INTO importaciones_log
         (tipo, nombre_archivo, total_filas, filas_ok, filas_error,
          detalle_errores, id_usuario, id_tienda)
       VALUES ('productos', ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.file.originalname, rows.length, ok_count, err_count,
        errores.length ? JSON.stringify(errores) : null,
        req.usuario.id_usuario, req.usuario.id_tienda,
      ]
    );

    return res.json({
      ok:    true,
      mensaje: `Importación completada`,
      datos: { total: rows.length, importados: ok_count, errores: err_count, detalle_errores: errores },
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

/** GET /api/importacion/plantilla - Descargar plantilla Excel */
const descargarPlantilla = (req, res) => {
  const wb = XLSX.utils.book_new();
  const datos = [
    {
      codigo_producto:   'LAP-HP-001',
      nombre:            'Laptop HP 14 Core i5',
      modelo:            '14-dq2535la',
      descripcion:       'Descripción del producto',
      precio:            2899.00,
      precio_costo_pen:  2030.00,
      precio_costo_usd:  '',
      moneda_compra:     'PEN',
      margen_porcentaje: 30,
      id_categoria:      1,
      id_marca:          1,
      stock:             5,
      numeros_serie:     'HP-SERIE-1, HP-SERIE-2'
    },
    {
      codigo_producto:   'LAP-DELL-001',
      nombre:            'Laptop Dell Inspiron 15',
      modelo:            'i5580',
      descripcion:       'Ejemplo con precio en USD',
      precio:            3200.00,
      precio_costo_pen:  '',
      precio_costo_usd:  620.00,
      moneda_compra:     'USD',
      margen_porcentaje: 25,
      id_categoria:      1,
      id_marca:          3,
      stock:             10,
      numeros_serie:     ''
    },
  ];

  const ws = XLSX.utils.json_to_sheet(datos);
  XLSX.utils.book_append_sheet(wb, ws, 'Productos');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename="plantilla_productos_jdstore.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
};

/** GET /api/importacion/historial */
const historial = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT il.*, u.nombre AS importado_por, t.nombre_tienda
       FROM importaciones_log il
       JOIN usuarios u ON u.id_usuario = il.id_usuario
       JOIN tiendas  t ON t.id_tienda  = il.id_tienda
       ORDER BY il.fecha DESC LIMIT 30`
    );
    return ok(res, rows);
  } catch (err) { next(err); }
};

/** GET /api/importacion/exportar */
const exportarProductos = async (req, res, next) => {
  try {
    const id_tienda = req.usuario?.id_tienda;
    
    // Obtener los productos con su stock en la tienda actual, categoría y marca
    const [rows] = await pool.query(
      `SELECT 
         p.codigo_producto,
         p.nombre,
         p.modelo,
         p.descripcion,
         p.precio,
         p.precio_costo_pen,
         p.precio_costo_usd,
         p.moneda_compra,
         p.margen_porcentaje,
         c.nombre_categoria AS categoria,
         m.nombre_marca AS marca,
         IFNULL(it.stock, 0) AS stock,
         CASE WHEN p.estado = 1 THEN 'ACTIVO' ELSE 'INACTIVO' END AS estado
       FROM productos p
       LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
       LEFT JOIN marcas m ON p.id_marca = m.id_marca
       LEFT JOIN inventario_tienda it ON p.id_producto = it.id_producto AND it.id_tienda = ?
       ORDER BY p.nombre ASC`,
       [id_tienda]
    );

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    const fecha = new Date().toISOString().split('T')[0];
    
    res.setHeader('Content-Disposition', `attachment; filename="inventario_${fecha}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};

module.exports = { importarProductos, descargarPlantilla, historial, exportarProductos };