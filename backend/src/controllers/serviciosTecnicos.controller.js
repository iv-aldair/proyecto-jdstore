const pool = require('../config/db');
const { ok, error } = require('../utils/helpers');

/** GET /api/servicios-tecnicos - Listar servicios técnicos */
const listar = async (req, res, next) => {
  try {
    const estado = req.query.estado;
    const { id_tienda } = req.usuario;

    let query = `
      SELECT st.*, c.nombre AS cliente_nombre, c.dni_ruc AS cliente_documento, c.telefono AS cliente_telefono,
             u.nombre AS usuario_recepcion
      FROM servicios_tecnicos st
      JOIN clientes c ON st.id_cliente = c.id_cliente
      JOIN usuarios u ON st.id_usuario_recepcion = u.id_usuario
      WHERE st.id_tienda = ?
    `;
    const params = [id_tienda];

    if (estado) {
      query += ` AND st.estado = ?`;
      params.push(estado);
    }

    query += ` ORDER BY st.fecha_ingreso DESC`;

    const [rows] = await pool.query(query, params);
    return ok(res, rows);
  } catch (err) { next(err); }
};

/** GET /api/servicios-tecnicos/:id - Obtener detalle de servicio técnico */
const obtenerPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id_tienda } = req.usuario;

    const query = `
      SELECT st.*, c.nombre AS cliente_nombre, c.dni_ruc AS cliente_documento, c.telefono AS cliente_telefono, c.direccion AS cliente_direccion,
             u.nombre AS usuario_recepcion,
             t.nombre_tienda
      FROM servicios_tecnicos st
      JOIN clientes c ON st.id_cliente = c.id_cliente
      JOIN usuarios u ON st.id_usuario_recepcion = u.id_usuario
      JOIN tiendas t ON st.id_tienda = t.id_tienda
      WHERE st.id_servicio = ? AND st.id_tienda = ?
    `;
    const [rows] = await pool.query(query, [id, id_tienda]);

    if (!rows.length) return error(res, 'Servicio técnico no encontrado', 404);

    return ok(res, rows[0]);
  } catch (err) { next(err); }
};

/** POST /api/servicios-tecnicos - Crear nuevo servicio */
const crear = async (req, res, next) => {
  try {
    const {
      id_cliente, equipo, marca_modelo, numero_serie,
      problema_reportado, condicion_recepcion, costo_estimado,
      adelanto, fecha_entrega_estimada
    } = req.body;
    
    const { id_usuario, id_tienda } = req.usuario;

    if (!id_cliente || !equipo || !problema_reportado) {
      return error(res, 'Faltan campos obligatorios', 400);
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.query(
        `INSERT INTO servicios_tecnicos (
          id_cliente, id_tienda, id_usuario_recepcion, equipo, 
          marca_modelo, numero_serie, problema_reportado, 
          condicion_recepcion, estado, costo_estimado, adelanto,
          fecha_ingreso, fecha_entrega_estimada
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'RECIBIDO', ?, ?, NOW(), ?)`,
        [
          id_cliente, id_tienda, id_usuario, equipo,
          marca_modelo || null, numero_serie || null, problema_reportado,
          condicion_recepcion || null, costo_estimado || 0, adelanto || 0,
          fecha_entrega_estimada || null
        ]
      );

      const id_servicio = result.insertId;

      // Si hay adelanto, registrar en caja
      if (adelanto > 0) {
        await conn.query(
          `INSERT INTO movimientos_caja 
            (id_tienda, id_usuario, tipo_movimiento, concepto, monto, descripcion) 
           VALUES (?, ?, 'INGRESO', 'Adelanto Servicio Técnico', ?, ?)`,
          [id_tienda, id_usuario, adelanto, `Adelanto por servicio técnico #${id_servicio} (${equipo})`]
        );
      }

      await conn.commit();
      return ok(res, { id_servicio }, 'Servicio técnico registrado correctamente', 201);
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (err) { next(err); }
};

/** PUT /api/servicios-tecnicos/:id/estado - Actualizar estado */
const actualizarEstado = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const { id_tienda } = req.usuario;

    const estadosValidos = ['RECIBIDO', 'EN_REVISION', 'ESPERANDO_REPUESTO', 'REPARADO', 'ENTREGADO', 'NO_REPARABLE'];
    if (!estadosValidos.includes(estado)) {
      return error(res, 'Estado no válido', 400);
    }

    let extraUpdate = '';
    if (estado === 'ENTREGADO') {
      extraUpdate = ', fecha_entregado = NOW()';
    }

    const [result] = await pool.query(
      `UPDATE servicios_tecnicos SET estado = ? ${extraUpdate} WHERE id_servicio = ? AND id_tienda = ?`,
      [estado, id, id_tienda]
    );

    if (result.affectedRows === 0) return error(res, 'Servicio no encontrado', 404);

    return ok(res, null, 'Estado actualizado correctamente');
  } catch (err) { next(err); }
};

module.exports = {
  listar,
  obtenerPorId,
  crear,
  actualizarEstado
};
