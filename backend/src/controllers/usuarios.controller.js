const pool   = require('../config/db');
const bcrypt = require('bcryptjs');
const { ok, error } = require('../utils/helpers');

const listar = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.correo, u.estado,
              u.created_at, u.updated_at,
              u.id_rol, u.id_tienda,
              r.nombre_rol, t.nombre_tienda
       FROM usuarios u
       JOIN roles   r ON r.id_rol    = u.id_rol
       JOIN tiendas t ON t.id_tienda = u.id_tienda
       ORDER BY u.id_rol, u.nombre`
    );
    return ok(res, rows);
  } catch (err) { next(err); }
};

const crear = async (req, res, next) => {
  try {
    const { nombre, correo, contrasena, id_rol, id_tienda } = req.body;
    if (!nombre || !correo || !contrasena || !id_rol || !id_tienda)
      return error(res, 'Todos los campos son requeridos');
    if (contrasena.length < 6)
      return error(res, 'La contraseña debe tener al menos 6 caracteres');
    const hash = await bcrypt.hash(contrasena, 10);
    const [r] = await pool.query(
      'INSERT INTO usuarios (nombre, correo, contrasena, id_rol, id_tienda) VALUES (?,?,?,?,?)',
      [nombre, correo.toLowerCase().trim(), hash, id_rol, id_tienda]
    );
    return ok(res, { id_usuario: r.insertId }, 'Usuario creado', 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return error(res, 'El correo ya está registrado');
    next(err);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const { nombre, correo, id_rol, id_tienda, estado } = req.body;
    // No permitir que el admin se quite su propio rol
    if (parseInt(req.params.id) === req.usuario.id_usuario && parseInt(id_rol) !== 1)
      return error(res, 'No puedes cambiar tu propio rol');
    await pool.query(
      `UPDATE usuarios
       SET nombre = ?, correo = ?, id_rol = ?, id_tienda = ?, estado = ?
       WHERE id_usuario = ?`,
      [nombre, correo?.toLowerCase().trim(), id_rol, id_tienda, estado ?? 1, req.params.id]
    );
    return ok(res, null, 'Usuario actualizado');
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return error(res, 'El correo ya está en uso');
    next(err);
  }
};

const eliminar = async (req, res, next) => {
  try {
    if (parseInt(req.params.id) === req.usuario.id_usuario)
      return error(res, 'No puedes eliminar tu propia cuenta');
    // Soft delete
    await pool.query(
      'UPDATE usuarios SET estado = 0 WHERE id_usuario = ?',
      [req.params.id]
    );
    return ok(res, null, 'Usuario desactivado');
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    const { nueva_contrasena } = req.body;
    if (!nueva_contrasena || nueva_contrasena.length < 6)
      return error(res, 'La contraseña debe tener al menos 6 caracteres');
    const hash = await bcrypt.hash(nueva_contrasena, 10);
    await pool.query(
      'UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?',
      [hash, req.params.id]
    );
    return ok(res, null, 'Contraseña reseteada correctamente');
  } catch (err) { next(err); }
};

module.exports = { listar, crear, actualizar, eliminar, resetPassword };