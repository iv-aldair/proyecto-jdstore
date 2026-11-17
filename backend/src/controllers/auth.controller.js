const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../config/db');
const { ok, error } = require('../utils/helpers');

/** POST /api/auth/login */
const login = async (req, res, next) => {
  try {
    const { correo, contrasena } = req.body;
    if (!correo || !contrasena) return error(res, 'Correo y contraseña requeridos');

    const [rows] = await pool.query(
      `SELECT u.*, r.nombre_rol, t.nombre_tienda
       FROM usuarios u
       JOIN roles   r ON r.id_rol    = u.id_rol
       JOIN tiendas t ON t.id_tienda = u.id_tienda
       WHERE u.correo = ? AND u.estado = 1`,
      [correo]
    );

    if (!rows.length) return error(res, 'Credenciales inválidas', 401);

    const usuario = rows[0];
    const valido  = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!valido) return error(res, 'Credenciales inválidas', 401);

    const payload = {
      id_usuario:   usuario.id_usuario,
      nombre:       usuario.nombre,
      correo:       usuario.correo,
      id_rol:       usuario.id_rol,
      nombre_rol:   usuario.nombre_rol,
      id_tienda:    usuario.id_tienda,
      nombre_tienda:usuario.nombre_tienda,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });

    const { contrasena: _, ...usuarioSinPass } = usuario;
    return ok(res, { token, usuario: usuarioSinPass }, 'Login exitoso');
  } catch (err) {
    next(err);
  }
};

/** GET /api/auth/perfil */
const perfil = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.correo, u.estado, u.created_at,
              r.nombre_rol, t.nombre_tienda
       FROM usuarios u
       JOIN roles   r ON r.id_rol    = u.id_rol
       JOIN tiendas t ON t.id_tienda = u.id_tienda
       WHERE u.id_usuario = ?`,
      [req.usuario.id_usuario]
    );
    if (!rows.length) return error(res, 'Usuario no encontrado', 404);
    return ok(res, rows[0]);
  } catch (err) {
    next(err);
  }
};

/** POST /api/auth/cambiar-password */
const cambiarPassword = async (req, res, next) => {
  try {
    const { password_actual, password_nuevo } = req.body;
    if (!password_actual || !password_nuevo)
      return error(res, 'Ambas contraseñas son requeridas');

    const [rows] = await pool.query(
      'SELECT contrasena FROM usuarios WHERE id_usuario = ?',
      [req.usuario.id_usuario]
    );
    const valido = await bcrypt.compare(password_actual, rows[0].contrasena);
    if (!valido) return error(res, 'Contraseña actual incorrecta', 401);

    const hash = await bcrypt.hash(password_nuevo, 10);
    await pool.query(
      'UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?',
      [hash, req.usuario.id_usuario]
    );
    return ok(res, null, 'Contraseña actualizada');
  } catch (err) {
    next(err);
  }
};

module.exports = { login, perfil, cambiarPassword };