const pool = require('../config/db');
const { ok, error } = require('../utils/helpers');

const listar = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tiendas ORDER BY id_tienda');
    return ok(res, rows);
  } catch (err) { next(err); }
};

const obtener = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tiendas WHERE id_tienda = ?', [req.params.id]);
    if (!rows.length) return error(res, 'Tienda no encontrada', 404);
    return ok(res, rows[0]);
  } catch (err) { next(err); }
};

const crear = async (req, res, next) => {
  try {
    const { nombre_tienda, direccion, telefono } = req.body;
    if (!nombre_tienda) return error(res, 'nombre_tienda requerido');
    const [r] = await pool.query(
      'INSERT INTO tiendas (nombre_tienda, direccion, telefono) VALUES (?,?,?)',
      [nombre_tienda, direccion || null, telefono || null]
    );
    return ok(res, { id_tienda: r.insertId }, 'Tienda creada', 201);
  } catch (err) { next(err); }
};

const actualizar = async (req, res, next) => {
  try {
    const { nombre_tienda, direccion, telefono, estado } = req.body;
    await pool.query(
      'UPDATE tiendas SET nombre_tienda=?, direccion=?, telefono=?, estado=? WHERE id_tienda=?',
      [nombre_tienda, direccion, telefono, estado !== undefined ? estado : 1, req.params.id]
    );
    return ok(res, null, 'Tienda actualizada');
  } catch (err) { next(err); }
};

const eliminar = async (req, res, next) => {
  try {
    await pool.query('UPDATE tiendas SET estado=0 WHERE id_tienda=?', [req.params.id]);
    return ok(res, null, 'Tienda desactivada');
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };