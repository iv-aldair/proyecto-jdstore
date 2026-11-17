const pool = require('../config/db');
const { ok, error } = require('../utils/helpers');

// Obtener guias de remision
const listar = async (req, res, next) => {
  try {
    const id_tienda = req.usuario.id_tienda;
    const [rows] = await pool.query(
      `SELECT g.*, u.nombre as creado_por 
       FROM guias_remision g
       JOIN usuarios u ON g.id_usuario = u.id_usuario
       WHERE g.id_tienda = ? 
       ORDER BY g.fecha_creacion DESC LIMIT 100`,
      [id_tienda]
    );
    return ok(res, rows);
  } catch (err) { next(err); }
};

const obtener = async (req, res, next) => {
  try {
    const [guiaRows] = await pool.query('SELECT * FROM guias_remision WHERE id_guia = ?', [req.params.id]);
    if (!guiaRows.length) return error(res, 'Guía no encontrada', 404);
    const guia = guiaRows[0];

    const [detalles] = await pool.query('SELECT * FROM guia_remision_detalles WHERE id_guia = ?', [req.params.id]);
    guia.detalles = detalles;

    return ok(res, guia);
  } catch (err) { next(err); }
};

const crear = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const { cabecera, detalles } = req.body;
    
    await conn.beginTransaction();

    // 1. Crear cabecera
    const [result] = await conn.query(
      `INSERT INTO guias_remision (
        id_tienda, id_usuario, numero_guia, fecha_emision,
        partida_direccion, partida_ubigeo, partida_codigo,
        llegada_direccion, llegada_ubigeo, llegada_codigo,
        destinatario_razon_social, destinatario_identificacion, destinatario_tipo_doc, destinatario_direccion,
        motivo_traslado, peso_bruto, bultos, modalidad_traslado, fecha_inicio_traslado,
        transp_razon_social, transp_identidad, transp_placa, transp_conductor, transp_doc_identidad, transp_licencia,
        doc_rel_numero, doc_rel_tipo, doc_rel_ruc
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        req.usuario.id_tienda, req.usuario.id_usuario, cabecera.numero_guia, cabecera.fecha_emision,
        cabecera.partida_direccion, cabecera.partida_ubigeo, cabecera.partida_codigo || null,
        cabecera.llegada_direccion, cabecera.llegada_ubigeo, cabecera.llegada_codigo || null,
        cabecera.destinatario_razon_social, cabecera.destinatario_identificacion, cabecera.destinatario_tipo_doc, cabecera.destinatario_direccion || null,
        cabecera.motivo_traslado, cabecera.peso_bruto, cabecera.bultos || null, cabecera.modalidad_traslado || null, cabecera.fecha_inicio_traslado || null,
        cabecera.transp_razon_social || null, cabecera.transp_identidad || null, cabecera.transp_placa || null, cabecera.transp_conductor || null, cabecera.transp_doc_identidad || null, cabecera.transp_licencia || null,
        cabecera.doc_rel_numero || null, cabecera.doc_rel_tipo || null, cabecera.doc_rel_ruc || null
      ]
    );

    const id_guia = result.insertId;

    // 2. Insertar detalles
    if (detalles && detalles.length > 0) {
      const valores = detalles.map(d => [
        id_guia, d.id_producto, d.codigo_producto || null, d.descripcion,
        d.unidad || 'NIU', d.cantidad, d.series || null
      ]);
      await conn.query(
        `INSERT INTO guia_remision_detalles (id_guia, id_producto, codigo_producto, descripcion, unidad, cantidad, series) VALUES ?`,
        [valores]
      );
    }

    await conn.commit();
    return ok(res, { id_guia }, 'Guía de remisión creada', 201);
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

const anular = async (req, res, next) => {
  try {
    const [result] = await pool.query('UPDATE guias_remision SET estado = 0 WHERE id_guia = ?', [req.params.id]);
    if (result.affectedRows === 0) return error(res, 'Guía no encontrada', 404);
    return ok(res, null, 'Guía anulada correctamente');
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, crear, anular };
