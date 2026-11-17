const pool = require('../config/db');
const { ok, error } = require('../utils/helpers');
 
const listar = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categorias ORDER BY nombre_categoria');
    return ok(res, rows);
  } catch (err) { next(err); }
};
 
const crear = async (req, res, next) => {
  try {
    const { nombre_categoria } = req.body;
    if (!nombre_categoria) return error(res, 'nombre_categoria requerido');
    const [r] = await pool.query('INSERT INTO categorias (nombre_categoria) VALUES (?)', [nombre_categoria]);
    return ok(res, { id_categoria: r.insertId }, 'Categoría creada', 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return error(res, 'Categoría ya existe');
    next(err);
  }
};
 
const actualizar = async (req, res, next) => {
  try {
    const { nombre_categoria } = req.body;
    await pool.query('UPDATE categorias SET nombre_categoria=? WHERE id_categoria=?',
      [nombre_categoria, req.params.id]);
    return ok(res, null, 'Categoría actualizada');
  } catch (err) { next(err); }
};
 
const eliminar = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM categorias WHERE id_categoria=?', [req.params.id]);
    return ok(res, null, 'Categoría eliminada');
  } catch (err) { next(err); }
};
 
module.exports = { listar, crear, actualizar, eliminar };