const pool = require('../config/db');
const { ok, error } = require('../utils/helpers');
const { hoy, mesActual } = require('../utils/formatFecha');

const dashboard = async (req, res, next) => {
  try {
    const id_tienda = parseInt(req.query.id_tienda || req.usuario.id_tienda);
    const fechaHoy  = hoy();
    const mes       = mesActual();

    // 1. Resumen de HOY: Aseguramos COALESCE para evitar que el null ponga todo en 0
    const [[ventaHoy]] = await pool.query(
      `SELECT 
        COUNT(*) AS cantidad, 
        COALESCE(SUM(total), 0) AS total,
        COALESCE(SUM(igv), 0) AS igv,
        COALESCE(SUM(costo_total), 0) AS costo,
        COALESCE(SUM(utilidad), 0) AS utilidad
       FROM ventas 
       WHERE DATE(fecha) = ? AND id_tienda = ?`,
      [fechaHoy, id_tienda]
    );

    // 2. Resumen del MES
    const [[ventaMes]] = await pool.query(
      `SELECT 
        COUNT(*) AS cantidad, 
        COALESCE(SUM(total), 0) AS total,
        COALESCE(SUM(igv), 0) AS igv,
        COALESCE(SUM(costo_total), 0) AS costo,
        COALESCE(SUM(utilidad), 0) AS utilidad
       FROM ventas 
       WHERE DATE(fecha) BETWEEN ? AND ? AND id_tienda = ?`,
      [mes.inicio, mes.fin, id_tienda]
    );

    // 3. Alertas de Stock Bajo (desde inventario_tienda)
    const [[{ stock_bajo }]] = await pool.query(
      `SELECT COUNT(*) AS stock_bajo FROM inventario_tienda
       WHERE stock <= stock_minimo AND id_tienda = ?`,
      [id_tienda]
    );

    // 4. Ventas de la SEMANA: Gráfico de barras (Ingresos vs Utilidad)
    const [ventasSemana] = await pool.query(
      `SELECT 
        DATE(fecha) AS dia, 
        COUNT(*) AS cantidad,
        SUM(total) AS total, 
        SUM(COALESCE(igv, 0)) AS igv,
        SUM(COALESCE(utilidad, 0)) AS utilidad
       FROM ventas
       WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND id_tienda = ?
       GROUP BY DATE(fecha) 
       ORDER BY dia ASC`,
      [id_tienda]
    );

    // 5. Top 5 Productos más vendidos
    const [topProductos] = await pool.query(
      `SELECT p.nombre AS producto,
              SUM(dv.cantidad)  AS unidades_vendidas,
              SUM(dv.subtotal)  AS total_vendido,
              SUM(COALESCE(dv.costo_unitario, 0) * dv.cantidad) AS costo_total
       FROM detalle_venta dv
       JOIN ventas     v ON v.id_venta    = dv.id_venta
       JOIN productos p ON p.id_producto = dv.id_producto
       WHERE DATE(v.fecha) BETWEEN ? AND ? AND v.id_tienda = ?
       GROUP BY p.id_producto, p.nombre
       ORDER BY unidades_vendidas DESC LIMIT 5`,
      [mes.inicio, mes.fin, id_tienda]
    );

    // 6. Ventas por Tipo de Comprobante
    const [porTipo] = await pool.query(
      `SELECT tipo_comprobante, COUNT(*) AS cantidad,
              SUM(total) AS total, SUM(COALESCE(igv,0)) AS igv
       FROM ventas WHERE DATE(fecha) BETWEEN ? AND ? AND id_tienda=?
       GROUP BY tipo_comprobante`,
      [mes.inicio, mes.fin, id_tienda]
    );

    const [[{ total_clientes }]] = await pool.query(
      `SELECT COUNT(*) AS total_clientes FROM clientes WHERE estado = 1`
    );

    return ok(res, {
      hoy: {
        fecha:    fechaHoy,
        ventas:   ventaHoy.cantidad,
        ingresos: parseFloat(ventaHoy.total),
        igv:      parseFloat(ventaHoy.igv),
        costo:    parseFloat(ventaHoy.costo),
        utilidad: parseFloat(ventaHoy.utilidad).toFixed(2),
      },
      mes: {
        periodo:  mes,
        ventas:   ventaMes.cantidad,
        ingresos: parseFloat(ventaMes.total),
        igv:      parseFloat(ventaMes.igv),
        costo:    parseFloat(ventaMes.costo),
        utilidad: parseFloat(ventaMes.utilidad).toFixed(2),
      },
      alertas: { stock_bajo },
      total_clientes,
      top_productos: topProductos,
      ventas_semana: ventasSemana,
      por_tipo_comprobante: porTipo,
    });
  } catch (err) { 
    console.error("Error en Dashboard Controller:", err);
    next(err); 
  }
};

const ventasPorCategoria = async (req, res, next) => {
  try {
    const id_tienda = parseInt(req.query.id_tienda || req.usuario.id_tienda);
    const mes = mesActual();
    const [rows] = await pool.query(
      `SELECT c.nombre_categoria,
              SUM(dv.cantidad)  AS unidades,
              SUM(dv.subtotal)  AS total,
              SUM(COALESCE(dv.costo_unitario,0) * dv.cantidad) AS costo
       FROM detalle_venta dv
       JOIN ventas     v  ON v.id_venta    = dv.id_venta
       JOIN productos  p  ON p.id_producto = dv.id_producto
       JOIN categorias c  ON c.id_categoria = p.id_categoria
       WHERE DATE(v.fecha) BETWEEN ? AND ? AND v.id_tienda=?
       GROUP BY c.id_categoria, c.nombre_categoria
       ORDER BY total DESC`,
      [mes.inicio, mes.fin, id_tienda]
    );
    return ok(res, rows);
  } catch (err) { next(err); }
};

const productosSinMovimiento = async (req, res, next) => {
  try {
    const id_tienda = parseInt(req.query.id_tienda || req.usuario.id_tienda);
    const dias = parseInt(req.query.dias) || 30;
    const [rows] = await pool.query(
      `SELECT p.id_producto, p.codigo_producto, p.nombre, p.modelo,
              it.stock, c.nombre_categoria, m.nombre_marca,
              uv.ultima_venta,
              CASE WHEN uv.ultima_venta IS NULL THEN NULL
                   ELSE DATEDIFF(NOW(), uv.ultima_venta) END AS dias_sin_venta
       FROM inventario_tienda it
       JOIN productos  p ON p.id_producto  = it.id_producto AND it.id_tienda = ?
       JOIN categorias c ON c.id_categoria = p.id_categoria
       JOIN marcas     m ON m.id_marca     = p.id_marca
       LEFT JOIN (
         SELECT dv.id_producto, MAX(v.fecha) AS ultima_venta
         FROM detalle_venta dv JOIN ventas v ON v.id_venta = dv.id_venta AND v.id_tienda = ?
         GROUP BY dv.id_producto
       ) uv ON uv.id_producto = p.id_producto
       WHERE p.estado = 1
         AND (uv.ultima_venta IS NULL OR DATEDIFF(NOW(), uv.ultima_venta) >= ?)
       ORDER BY dias_sin_venta DESC, it.stock DESC`,
      [id_tienda, id_tienda, dias]
    );
    return ok(res, rows);
  } catch (err) { next(err); }
};

module.exports = { dashboard, ventasPorCategoria, productosSinMovimiento };