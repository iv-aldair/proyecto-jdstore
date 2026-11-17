const pool = require('../config/db');
const { ok, error, paginar } = require('../utils/helpers');

const listar = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM proveedores ORDER BY nombre');
    return ok(res, rows);
  } catch (err) { next(err); }
};

const obtener = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM proveedores WHERE id_proveedor=?', [req.params.id]);
    if (!rows.length) return error(res, 'Proveedor no encontrado', 404);
    return ok(res, rows[0]);
  } catch (err) { next(err); }
};

const crear = async (req, res, next) => {
  try {
    const { nombre, telefono, direccion } = req.body;
    if (!nombre) return error(res, 'nombre requerido');
    const [r] = await pool.query(
      'INSERT INTO proveedores (nombre, telefono, direccion) VALUES (?,?,?)',
      [nombre, telefono || null, direccion || null]
    );
    return ok(res, { id_proveedor: r.insertId }, 'Proveedor creado', 201);
  } catch (err) { next(err); }
};

const actualizar = async (req, res, next) => {
  try {
    const { nombre, telefono, direccion } = req.body;
    await pool.query(
      'UPDATE proveedores SET nombre=?, telefono=?, direccion=? WHERE id_proveedor=?',
      [nombre, telefono, direccion, req.params.id]
    );
    return ok(res, null, 'Proveedor actualizado');
  } catch (err) { next(err); }
};

const eliminar = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM proveedores WHERE id_proveedor=?', [req.params.id]);
    return ok(res, null, 'Proveedor eliminado');
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };