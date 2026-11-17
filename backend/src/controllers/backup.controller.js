const pool   = require('../config/db');
const fs     = require('fs');
const path   = require('path');
const { ok, error } = require('../utils/helpers');
const { generarBackup, limpiarBackupsAntiguos } = require('../jobs/backup.job');
const { subirBackupANube } = require('../services/nube.service');

/** GET /api/backups - Historial de backups */
const listar = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, u.nombre AS generado_por
       FROM backups b
       LEFT JOIN usuarios u ON u.id_usuario = b.id_usuario
       ORDER BY b.fecha DESC
       LIMIT 50`
    );
    return ok(res, rows);
  } catch (err) { next(err); }
};

/** POST /api/backups/generar - Backup manual desde el Admin */
const generarManual = async (req, res, next) => {
  try {
    console.log(`📦 [Backup] Manual solicitado por usuario ${req.usuario.id_usuario}`);
    const resultado = await generarBackup();

    // Marcar como manual y agregar usuario
    await pool.query(
      `UPDATE backups SET tipo = 'manual', id_usuario = ?
       WHERE nombre_archivo = ? ORDER BY fecha DESC LIMIT 1`,
      [req.usuario.id_usuario, resultado.archivo]
    );

    // Subir a Google Drive
    const nube = await subirBackupANube(resultado.ruta, resultado.archivo);

    return ok(res, {
      archivo:     resultado.archivo,
      tamanio_kb:  resultado.tamanio_kb,
      ruta:        resultado.ruta,
      nube:        nube.ok ? '✅ Subido a Google Drive' : '⚠️ Solo local',
    }, `Backup generado: ${resultado.archivo} (${resultado.tamanio_kb} KB)`);
  } catch (err) {
    console.error('Error backup manual:', err.message);
    return error(res, `Error al generar backup: ${err.message}`, 500);
  }
};

/** DELETE /api/backups/:id - Eliminar backup */
const eliminar = async (req, res, next) => {
  try {
    const [[backup]] = await pool.query(
      'SELECT * FROM backups WHERE id_backup = ?', [req.params.id]
    );
    if (!backup) return error(res, 'Backup no encontrado', 404);

    // Eliminar archivo si existe
    if (fs.existsSync(backup.ruta_archivo)) {
      fs.unlinkSync(backup.ruta_archivo);
    }
    await pool.query('DELETE FROM backups WHERE id_backup = ?', [req.params.id]);
    return ok(res, null, 'Backup eliminado');
  } catch (err) { next(err); }
};

/** POST /api/backups/limpiar - Limpiar backups viejos */
const limpiar = async (req, res, next) => {
  try {
    const dias = parseInt(req.body.dias) || 30;
    await limpiarBackupsAntiguos(dias);
    return ok(res, null, `Backups mayores a ${dias} días eliminados`);
  } catch (err) { next(err); }
};

/** GET /api/backups/config - Leer config de backups */
const obtenerConfig = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT clave, valor FROM config_sistema
       WHERE clave IN ('backup_hora','backup_retener_dias','tc_dolar_vigente',
                       'margen_default','igv_porcentaje','empresa_ruc',
                       'empresa_nombre','empresa_direccion')`
    );
    const config = Object.fromEntries(rows.map(r => [r.clave, r.valor]));
    return ok(res, config);
  } catch (err) { next(err); }
};

/** PUT /api/backups/config - Actualizar parámetros del sistema */
const actualizarConfig = async (req, res, next) => {
  try {
    const entries = Object.entries(req.body);
    for (const [clave, valor] of entries) {
      await pool.query(
        `UPDATE config_sistema SET valor = ? WHERE clave = ?`,
        [String(valor), clave]
      );
    }
    return ok(res, null, `${entries.length} parámetro(s) actualizados`);
  } catch (err) { next(err); }
};

module.exports = { listar, generarManual, eliminar, limpiar, obtenerConfig, actualizarConfig };