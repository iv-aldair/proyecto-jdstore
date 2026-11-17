const pool = require('../config/db');
const { ok, error } = require('../utils/helpers');

const listar = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM marcas ORDER BY nombre_marca');
    return ok(res, rows);
  } catch (err) { next(err); }
};

const crear = async (req, res, next) => {
  try {
    const { nombre_marca } = req.body;
    if (!nombre_marca) return error(res, 'nombre_marca requerido');
    const [r] = await pool.query('INSERT INTO marcas (nombre_marca) VALUES (?)', [nombre_marca]);
    return ok(res, { id_marca: r.insertId }, 'Marca creada', 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return error(res, 'Marca ya existe');
    next(err);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const { nombre_marca } = req.body;
    await pool.query('UPDATE marcas SET nombre_marca=? WHERE id_marca=?',
      [nombre_marca, req.params.id]);
    return ok(res, null, 'Marca actualizada');
  } catch (err) { next(err); }
};

const eliminar = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM marcas WHERE id_marca=?', [req.params.id]);
    return ok(res, null, 'Marca eliminada');
  } catch (err) { next(err); }
};

module.exports = { listar, crear, actualizar, eliminar };