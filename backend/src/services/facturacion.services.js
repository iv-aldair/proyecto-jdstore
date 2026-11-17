const pool = require('../config/db');
const { enviarComprobante: enviarNubefact } = require('./nubefact.service');

/**
 * Envía un comprobante a Nubefact y guarda respuesta en BD
 * @param {number} id_venta
 */
const enviarComprobante = async (id_venta) => {
  // 1. Obtener venta completa
  const [ventaRows] = await pool.query(
    `SELECT v.*, c.nombre, c.tipo_documento, c.dni_ruc, c.direccion
     FROM ventas v JOIN clientes c ON c.id_cliente = v.id_cliente
     WHERE v.id_venta = ?`,
    [id_venta]
  );
  if (!ventaRows.length) throw new Error('Venta no encontrada');
  const venta = ventaRows[0];

  // Mapear info de cliente
  venta.cliente_tipo_doc = venta.tipo_documento;
  venta.cliente_documento = venta.dni_ruc;
  venta.cliente_nombre = venta.nombre;
  venta.cliente_direccion = venta.direccion;

  // 2. Obtener detalle
  const [detalle] = await pool.query(
    `SELECT dv.*, 
            COALESCE(p.nombre, dv.nombre_producto_externo) AS producto, 
            COALESCE(p.codigo_producto, 'EXT-001') AS codigo_producto
     FROM detalle_venta dv 
     LEFT JOIN productos p ON p.id_producto = dv.id_producto
     WHERE dv.id_venta = ?`,
    [id_venta]
  );

  // 3. Generar comprobante en Nubefact
  const data = await enviarNubefact(venta, detalle);

  // 4. Guardar respuesta en BD
  await pool.query(
    `UPDATE ventas SET
       estado_sunat    = ?,
       enlace_pdf      = ?,
       enlace_xml      = ?,
       enlace_cdr      = ?,
       hash_sunat      = ?,
       mensaje_sunat   = ?,
       api_enviado     = 1,
       fecha_envio_api = NOW()
     WHERE id_venta = ?`,
    [
      data.estado_sunat,
      data.enlace_pdf,
      data.enlace_xml,
      data.enlace_cdr,
      data.hash,
      data.mensaje_sunat,
      id_venta,
    ]
  );

  return data;
};

const enviarComprobanteDemo = async (id_venta) => {
  return enviarComprobante(id_venta);
};

module.exports = { enviarComprobante, enviarComprobanteDemo };