const pool = require('../config/db');
const { ok, error } = require('../utils/helpers');

/** GET /api/deudas-clientes - Listar deudas de clientes */
const listar = async (req, res, next) => {
  try {
    const estado = req.query.estado; // PENDIENTE o PAGADO
    const { id_tienda } = req.usuario;

    let query = `
      SELECT dc.*, c.nombre AS cliente_nombre, c.dni_ruc AS cliente_documento,
             v.numero_comprobante
      FROM deudas_clientes dc
      JOIN clientes c ON dc.id_cliente = c.id_cliente
      LEFT JOIN ventas v ON dc.id_venta = v.id_venta
      WHERE dc.id_tienda = ?
    `;
    const params = [id_tienda];

    if (estado) {
      query += ` AND dc.estado = ?`;
      params.push(estado);
    }

    query += ` ORDER BY dc.fecha_creacion DESC`;

    const [rows] = await pool.query(query, params);
    return ok(res, rows);
  } catch (err) { next(err); }
};

/** GET /api/deudas-clientes/:id/abonos - Listar abonos de una deuda */
const listarAbonos = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id_tienda } = req.usuario;

    const query = `
      SELECT ac.*, u.nombre AS cajero
      FROM abonos_clientes ac
      JOIN usuarios u ON ac.id_usuario = u.id_usuario
      WHERE ac.id_deuda = ? AND ac.id_tienda = ?
      ORDER BY ac.fecha ASC
    `;
    const [rows] = await pool.query(query, [id, id_tienda]);
    
    return ok(res, rows);
  } catch (err) { next(err); }
};

/** POST /api/deudas-clientes - Crear una nueva deuda manualmente */
const crear = async (req, res, next) => {
  try {
    const { id_cliente, monto_total, id_venta, notas, fecha_vencimiento } = req.body;
    const { id_tienda } = req.usuario;

    if (!id_cliente || !monto_total) {
      return error(res, 'Faltan campos obligatorios', 400);
    }

    const [result] = await pool.query(
      `INSERT INTO deudas_clientes 
        (id_cliente, id_tienda, id_venta, monto_total, saldo_pendiente, fecha_vencimiento, notas)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_cliente, id_tienda, id_venta || null, monto_total, monto_total, fecha_vencimiento || null, notas || null]
    );

    return ok(res, { id_deuda: result.insertId }, 'Deuda creada correctamente', 201);
  } catch (err) { next(err); }
};

/** POST /api/deudas-clientes/:id/abonos - Registrar un abono a una deuda */
const registrarAbono = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { monto, metodo_pago, notas } = req.body;
    const { id_usuario, id_tienda } = req.usuario;

    if (!monto || monto <= 0 || !metodo_pago) {
      return error(res, 'Monto y método de pago son obligatorios', 400);
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Obtener la deuda
      const [deudaRows] = await conn.query('SELECT * FROM deudas_clientes WHERE id_deuda = ? AND id_tienda = ? FOR UPDATE', [id, id_tienda]);
      if (!deudaRows.length) throw { message: 'Deuda no encontrada', status: 404 };
      
      const deuda = deudaRows[0];
      if (deuda.estado === 'PAGADO') throw { message: 'La deuda ya está pagada por completo', status: 400 };
      if (monto > deuda.saldo_pendiente) throw { message: 'El abono es mayor al saldo pendiente', status: 400 };

      // 2. Registrar el abono
      const [abonoResult] = await conn.query(
        `INSERT INTO abonos_clientes (id_deuda, id_usuario, id_tienda, monto, metodo_pago, notas) VALUES (?, ?, ?, ?, ?, ?)`,
        [id, id_usuario, id_tienda, monto, metodo_pago, notas || null]
      );
      const id_abono = abonoResult.insertId;

      // 3. Actualizar la deuda
      const nuevoSaldo = deuda.saldo_pendiente - monto;
      const nuevoEstado = nuevoSaldo <= 0 ? 'PAGADO' : 'PENDIENTE';
      await conn.query(
        `UPDATE deudas_clientes SET saldo_pendiente = ?, estado = ? WHERE id_deuda = ?`,
        [nuevoSaldo, nuevoEstado, id]
      );

      // 4. Registrar en la caja como INGRESO
      // Obtenemos el nombre del cliente para la glosa
      const [clienteRows] = await conn.query('SELECT nombre FROM clientes WHERE id_cliente = ?', [deuda.id_cliente]);
      const clienteNombre = clienteRows[0]?.nombre || 'Cliente';
      
      await conn.query(
        `INSERT INTO movimientos_caja (id_tienda, id_usuario, tipo_movimiento, concepto, monto, descripcion) 
         VALUES (?, ?, 'INGRESO', 'Abono de Deuda', ?, ?)`,
        [id_tienda, id_usuario, monto, `Abono de ${clienteNombre} - Deuda #${id}`]
      );

      await conn.commit();
      return ok(res, { id_abono, nuevo_saldo: nuevoSaldo, estado: nuevoEstado }, 'Abono registrado correctamente', 201);
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
  } catch (err) { 
    if (err.status) return error(res, err.message, err.status);
    next(err); 
  }
};

module.exports = {
  listar,
  listarAbonos,
  crear,
  registrarAbono
};
