const pool = require('../config/db');
const { ok, error } = require('../utils/helpers');

/** GET /api/caja/estado - Verificar si la caja está abierta */
const obtenerEstadoCaja = async (req, res, next) => {
  try {
    const id_tienda = req.query.id_tienda || req.usuario.id_tienda;
    
    const [sesion] = await pool.query(
      `SELECT * FROM sesiones_caja 
       WHERE id_tienda = ? AND estado = 'ABIERTA' 
       ORDER BY id_sesion DESC LIMIT 1`,
      [id_tienda]
    );

    if (sesion.length > 0) {
      return ok(res, { abierta: true, sesion: sesion[0] });
    }
    return ok(res, { abierta: false, sesion: null });
  } catch (err) { next(err); }
};

/** POST /api/caja/abrir - Abrir Caja */
const abrirCaja = async (req, res, next) => {
  try {
    const { saldo_inicial } = req.body;
    const id_tienda = req.body.id_tienda || req.usuario.id_tienda;
    const id_usuario = req.usuario.id_usuario;

    // Verificar si ya hay una abierta
    const [abierta] = await pool.query(
      `SELECT id_sesion FROM sesiones_caja WHERE id_tienda = ? AND estado = 'ABIERTA'`,
      [id_tienda]
    );
    if (abierta.length > 0) {
      return error(res, 'La caja ya se encuentra abierta.', 400);
    }

    // Insertar sesion
    const [result] = await pool.query(
      `INSERT INTO sesiones_caja (id_tienda, id_usuario_apertura, fecha_apertura, saldo_inicial, estado)
       VALUES (?, ?, NOW(), ?, 'ABIERTA')`,
      [id_tienda, id_usuario, saldo_inicial || 0]
    );

    // Opcional: Registrar como movimiento de ingreso
    await pool.query(
      `INSERT INTO movimientos_caja (id_tienda, id_usuario, tipo_movimiento, concepto, monto, descripcion, fecha) 
       VALUES (?, ?, 'INGRESO', 'Apertura de Caja', ?, 'Sencillo Inicial', NOW())`,
      [id_tienda, id_usuario, saldo_inicial || 0]
    );

    return ok(res, { id_sesion: result.insertId }, 'Caja abierta correctamente', 201);
  } catch (err) { next(err); }
};

/** POST /api/caja/cerrar - Cerrar Caja */
const cerrarCaja = async (req, res, next) => {
  try {
    const { saldo_final_real } = req.body;
    const id_tienda = req.body.id_tienda || req.usuario.id_tienda;
    const id_usuario = req.usuario.id_usuario;

    // Obtener sesión activa
    const [sesion] = await pool.query(
      `SELECT * FROM sesiones_caja WHERE id_tienda = ? AND estado = 'ABIERTA' ORDER BY id_sesion DESC LIMIT 1`,
      [id_tienda]
    );

    if (sesion.length === 0) {
      return error(res, 'No hay ninguna caja abierta para cerrar.', 400);
    }

    const sesionActual = sesion[0];

    // Calcular el saldo_final_calculado (ingresos - egresos desde la fecha de apertura)
    const [ingresos] = await pool.query(
      `SELECT COALESCE(SUM(monto), 0) AS total 
       FROM movimientos_caja 
       WHERE id_tienda = ? AND fecha >= ? AND tipo_movimiento = 'INGRESO'`,
      [id_tienda, sesionActual.fecha_apertura]
    );
    const [egresos] = await pool.query(
      `SELECT COALESCE(SUM(monto), 0) AS total 
       FROM movimientos_caja 
       WHERE id_tienda = ? AND fecha >= ? AND tipo_movimiento = 'EGRESO'`,
      [id_tienda, sesionActual.fecha_apertura]
    );
    const [ventasEfectivo] = await pool.query(
      `SELECT COALESCE(SUM(total), 0) AS total
       FROM ventas
       WHERE id_tienda = ? AND fecha >= ? AND metodo_pago = 'Efectivo'`,
      [id_tienda, sesionActual.fecha_apertura]
    );

    // Si las ventas no están registradas como movimientos, las sumamos
    const totalIngresos = parseFloat(ingresos[0].total) + parseFloat(ventasEfectivo[0].total);
    const totalEgresos = parseFloat(egresos[0].total);
    const saldo_final_calculado = totalIngresos - totalEgresos;

    const saldoReal = parseFloat(saldo_final_real) || 0;
    const diferencia = saldoReal - saldo_final_calculado;

    // Actualizar sesion
    await pool.query(
      `UPDATE sesiones_caja 
       SET estado = 'CERRADA', id_usuario_cierre = ?, fecha_cierre = NOW(), 
           saldo_final_calculado = ?, saldo_final_real = ?, diferencia = ?
       WHERE id_sesion = ?`,
      [id_usuario, saldo_final_calculado, saldoReal, diferencia, sesionActual.id_sesion]
    );

    // Registrar como movimiento de egreso para cerrar caja
    await pool.query(
      `INSERT INTO movimientos_caja (id_tienda, id_usuario, tipo_movimiento, concepto, monto, descripcion, fecha) 
       VALUES (?, ?, 'EGRESO', 'Cierre de Caja', ?, 'Retiro por Cierre', NOW())`,
      [id_tienda, id_usuario, saldo_final_calculado]
    );

    return ok(res, { diferencia, saldo_final_calculado, saldo_final_real: saldoReal }, 'Caja cerrada correctamente');
  } catch (err) { next(err); }
};

/** GET /api/caja/resumen - Resumen del día por tienda (o de la sesión actual) */
const obtenerResumenDia = async (req, res, next) => {
  try {
    const id_tienda = req.query.id_tienda || req.usuario.id_tienda;
    
    // Obtener sesión activa
    const [sesion] = await pool.query(
      `SELECT * FROM sesiones_caja WHERE id_tienda = ? AND estado = 'ABIERTA' ORDER BY id_sesion DESC LIMIT 1`,
      [id_tienda]
    );

    // Solo usamos la fecha de sesión si no enviaron fecha o si la fecha enviada es la de hoy
    const hoy = new Date().toISOString().split('T')[0];
    let fecha_inicio = req.query.fecha ? `${req.query.fecha} 00:00:00` : `${hoy} 00:00:00`;
    let fecha_fin = req.query.fecha ? `${req.query.fecha} 23:59:59` : `${hoy} 23:59:59`;

    if (sesion.length > 0 && (!req.query.fecha || req.query.fecha === hoy)) {
      fecha_inicio = sesion[0].fecha_apertura;
      // Si la sesión está abierta, no limitamos el fin al día actual (podría pasar de medianoche)
      fecha_fin = '2099-12-31 23:59:59';
    }

    const [ingresos] = await pool.query(
      `SELECT COALESCE(SUM(monto), 0) AS total_ingresos 
       FROM movimientos_caja 
       WHERE id_tienda = ? AND fecha >= ? AND fecha <= ? AND tipo_movimiento = 'INGRESO'`,
      [id_tienda, fecha_inicio, fecha_fin]
    );

    const [egresos] = await pool.query(
      `SELECT COALESCE(SUM(monto), 0) AS total_egresos 
       FROM movimientos_caja 
       WHERE id_tienda = ? AND fecha >= ? AND fecha <= ? AND tipo_movimiento = 'EGRESO'`,
      [id_tienda, fecha_inicio, fecha_fin]
    );

    const [ventasEfectivo] = await pool.query(
      `SELECT COALESCE(SUM(total), 0) AS total_ventas_efectivo
       FROM ventas
       WHERE id_tienda = ? AND fecha >= ? AND fecha <= ? AND metodo_pago = 'Efectivo'`,
      [id_tienda, fecha_inicio, fecha_fin]
    );

    const totalIngresos = parseFloat(ingresos[0].total_ingresos) + parseFloat(ventasEfectivo[0].total_ventas_efectivo);
    const totalEgresos = parseFloat(egresos[0].total_egresos);
    const saldoFinal = totalIngresos - totalEgresos;

    return ok(res, {
      fecha_inicio,
      id_tienda,
      total_ingresos: totalIngresos,
      total_egresos: totalEgresos,
      ventas_efectivo: parseFloat(ventasEfectivo[0].total_ventas_efectivo),
      saldo_final: saldoFinal,
      sesion_abierta: sesion.length > 0
    });
  } catch (err) { next(err); }
};

/** GET /api/caja/movimientos - Historial de movimientos */
const listarMovimientos = async (req, res, next) => {
  try {
    const id_tienda = req.query.id_tienda || req.usuario.id_tienda;
    
    // Obtener sesión activa
    const [sesion] = await pool.query(
      `SELECT * FROM sesiones_caja WHERE id_tienda = ? AND estado = 'ABIERTA' ORDER BY id_sesion DESC LIMIT 1`,
      [id_tienda]
    );

    const hoy = new Date().toISOString().split('T')[0];
    let fecha_inicio = req.query.fecha ? `${req.query.fecha} 00:00:00` : `${hoy} 00:00:00`;
    let fecha_fin = req.query.fecha ? `${req.query.fecha} 23:59:59` : `${hoy} 23:59:59`;

    if (sesion.length > 0 && (!req.query.fecha || req.query.fecha === hoy)) {
      fecha_inicio = sesion[0].fecha_apertura;
      fecha_fin = '2099-12-31 23:59:59';
    }

    const [rows] = await pool.query(
      `SELECT mc.*, u.nombre AS usuario, t.nombre_tienda 
       FROM movimientos_caja mc
       JOIN usuarios u ON mc.id_usuario = u.id_usuario
       JOIN tiendas t ON mc.id_tienda = t.id_tienda
       WHERE mc.id_tienda = ? AND mc.fecha >= ? AND mc.fecha <= ?
       ORDER BY mc.fecha DESC`,
      [id_tienda, fecha_inicio, fecha_fin]
    );

    return ok(res, rows);
  } catch (err) { next(err); }
};

/** POST /api/caja/movimientos - Crear movimiento (Ingreso/Egreso) */
const crearMovimiento = async (req, res, next) => {
  try {
    const { tipo_movimiento, concepto, monto, descripcion } = req.body;
    
    if (!tipo_movimiento || !concepto || !monto) {
      return error(res, 'Faltan campos requeridos (tipo, concepto, monto)', 400);
    }

    const id_tienda = req.body.id_tienda || req.usuario.id_tienda;
    const id_usuario = req.usuario.id_usuario;

    // Solo se puede registrar si la caja está abierta
    const [sesion] = await pool.query(
      `SELECT * FROM sesiones_caja WHERE id_tienda = ? AND estado = 'ABIERTA' ORDER BY id_sesion DESC LIMIT 1`,
      [id_tienda]
    );
    if (sesion.length === 0) {
      return error(res, 'Debes abrir caja para registrar movimientos.', 400);
    }

    const [result] = await pool.query(
      `INSERT INTO movimientos_caja 
        (id_tienda, id_usuario, tipo_movimiento, concepto, monto, descripcion, fecha) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id_tienda, id_usuario, tipo_movimiento, concepto, monto, descripcion || '']
    );

    return ok(res, { id_movimiento: result.insertId }, 'Movimiento registrado correctamente', 201);
  } catch (err) { next(err); }
};

/** DELETE /api/caja/movimientos/:id - Eliminar movimiento */
const eliminarMovimiento = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [mov] = await pool.query(`SELECT id_usuario FROM movimientos_caja WHERE id_movimiento = ?`, [id]);
    if (!mov.length) return error(res, 'Movimiento no encontrado', 404);
    
    if (req.usuario.id_rol !== 1 && req.usuario.id_usuario !== mov[0].id_usuario) {
      return error(res, 'No tiene permiso para eliminar este movimiento', 403);
    }

    await pool.query(`DELETE FROM movimientos_caja WHERE id_movimiento = ?`, [id]);
    
    return ok(res, null, 'Movimiento eliminado correctamente');
  } catch (err) { next(err); }
};

module.exports = {
  obtenerEstadoCaja,
  abrirCaja,
  cerrarCaja,
  obtenerResumenDia,
  listarMovimientos,
  crearMovimiento,
  eliminarMovimiento
};
