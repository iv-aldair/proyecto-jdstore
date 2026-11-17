const pool = require('../config/db');

const kpisMes = async (id_tienda, inicio, fin) => {
  const [[ventas]] = await pool.query(
    `SELECT COUNT(*) AS cantidad, COALESCE(SUM(total),0) AS ingresos,
            COALESCE(SUM(igv),0) AS igv_total
     FROM ventas WHERE DATE(fecha) BETWEEN ? AND ? AND id_tienda=?`,
    [inicio, fin, id_tienda]
  );
  const [[compras]] = await pool.query(
    `SELECT COALESCE(SUM(total),0) AS egresos
     FROM compras WHERE DATE(fecha) BETWEEN ? AND ? AND id_tienda=?`,
    [inicio, fin, id_tienda]
  );
  const ganancia = parseFloat(ventas.ingresos) - parseFloat(compras.egresos);
  return { ...ventas, ...compras, ganancia: ganancia.toFixed(2) };
};

module.exports = { kpisMes };