const cron   = require('node-cron');
const { exec } = require('child_process');
const path   = require('path');
const fs     = require('fs');
const pool   = require('../config/db');
const { subirBackupANube, limpiarBackupsNube } = require('../services/nube.service');

// Directorio raíz de backups
const DIR_BACKUPS = path.join(__dirname, '../../backups');

// Crear carpeta de backups si no existe al arrancar el servidor
if (!fs.existsSync(DIR_BACKUPS)) {
  fs.mkdirSync(DIR_BACKUPS, { recursive: true });
  console.log('📁 Carpeta backups creada:', DIR_BACKUPS);
}

/**
 * Genera un backup .sql usando mysqldump con manejo de errores mejorado
 * @returns {Promise<{archivo, ruta, tamanio_kb}>}
 */
const generarBackup = () => new Promise((resolve, reject) => {
  const ahora    = new Date();
  const fecha    = ahora.toISOString().slice(0, 10);
  const hora     = ahora.toTimeString().slice(0, 8).replace(/:/g, '-');
  const archivo  = `backup_jdstore_${fecha}_${hora}.sql`;
  const ruta     = path.join(DIR_BACKUPS, archivo);

  // Variables de entorno con valores por defecto
  const {
    DB_HOST = 'localhost',
    DB_PORT = 3306,
    DB_USER = 'root',
    DB_PASSWORD = '',
    DB_NAME = 'tienda_jdstore',
  } = process.env;

  /**
   * Detección dinámica de ruta de mysqldump.
   * Busca en múltiples ubicaciones comunes de Windows para que funcione
   * tanto en la laptop de desarrollo como en la laptop servidor,
   * sin importar si tiene MySQL 8.0 nativo, XAMPP, WAMP, etc.
   */
  let mysqldump = 'mysqldump'; // fallback: usar PATH del sistema
  if (process.platform === 'win32') {
    const rutasPosibles = [
      'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe',
      'C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin\\mysqldump.exe',
      'C:\\Program Files\\MySQL\\MySQL Server 9.0\\bin\\mysqldump.exe',
      'C:\\xampp\\mysql\\bin\\mysqldump.exe',
      'C:\\wamp64\\bin\\mysql\\mysql8.0.31\\bin\\mysqldump.exe',
      'C:\\laragon\\bin\\mysql\\mysql-8.0.30-winx64\\bin\\mysqldump.exe',
    ];
    const encontrada = rutasPosibles.find(r => fs.existsSync(r));
    if (encontrada) {
      mysqldump = `"${encontrada}"`;
      console.log(`📦 [Backup] mysqldump encontrado en: ${encontrada}`);
    } else {
      console.warn('⚠️ [Backup] No se encontró mysqldump en rutas conocidas, usando PATH del sistema.');
    }
  }

  // Manejo seguro de contraseña para evitar errores de sintaxis en el comando
  const passFlag = DB_PASSWORD ? `-p"${DB_PASSWORD}"` : '';

  // Comando optimizado con --single-transaction para no bloquear tablas mientras vendes
  const cmd = `${mysqldump} -h ${DB_HOST} -P ${DB_PORT} -u ${DB_USER} ${passFlag} --single-transaction --routines --triggers ${DB_NAME} > "${ruta}"`;

  exec(cmd, async (err, stdout, stderr) => {
    if (err) {
      console.error('❌ [Backup] Error crítico al ejecutar mysqldump:', err.message);
      
      // Registrar el fallo en la base de datos para auditoría
      try {
        await pool.query(
          `INSERT INTO backups (nombre_archivo, ruta_archivo, tipo, estado, mensaje_error)
           VALUES (?, ?, 'automatico', 'error', ?)`,
          [archivo, ruta, err.message]
        );
      } catch (dbErr) {
        console.error('❌ No se pudo registrar el error en la BD:', dbErr.message);
      }
      return reject(err);
    }

    // Calcular tamaño real del archivo generado
    let tamanio_kb = 0;
    try {
      const stats = fs.statSync(ruta);
      tamanio_kb = Math.round(stats.size / 1024);
    } catch (_) {}

    // Registro de éxito en la base de datos
    try {
      await pool.query(
        `INSERT INTO backups (nombre_archivo, ruta_archivo, tamanio_kb, tipo, estado)
         VALUES (?, ?, ?, 'automatico', 'ok')`,
        [archivo, ruta, tamanio_kb]
      );
    } catch (dbErr) {
      console.error('❌ Error al registrar backup exitoso en BD:', dbErr.message);
    }

    resolve({ archivo, ruta, tamanio_kb });
  });
});

/**
 * Elimina backups antiguos según la política de retención
 */
const limpiarBackupsAntiguos = async (dias = 30) => {
  try {
    const [filas] = await pool.query(
      `SELECT id_backup, nombre_archivo, ruta_archivo
       FROM backups
       WHERE tipo = 'automatico'
         AND estado = 'ok'
         AND fecha < DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [dias]
    );

    for (const b of filas) {
      try {
        if (fs.existsSync(b.ruta_archivo)) {
          fs.unlinkSync(b.ruta_archivo);
        }
        await pool.query('DELETE FROM backups WHERE id_backup = ?', [b.id_backup]);
        console.log(`🗑️  Backup antiguo eliminado para ahorrar espacio: ${b.nombre_archivo}`);
      } catch (_) {}
    }
  } catch (err) {
    console.error('❌ [Backup] Error limpiando backups antiguos:', err.message);
  }
};

/**
 * Inicia el cron job leyendo la configuración dinámica desde la BD
 */
const iniciarJobBackup = () => {
  // Consultar la hora configurada por el usuario (ej: '02:00')
  pool.query(`SELECT valor FROM config_sistema WHERE clave = 'backup_hora'`)
    .then(([[cfg]]) => {
      const horaCfg = cfg?.valor || '02:00';
      const [hh, mm] = horaCfg.split(':');
      const cronExpr = `${mm} ${hh} * * *`;

      cron.schedule(cronExpr, async () => {
        console.log(`\n⏰ [Backup] Iniciando ciclo de respaldo automático (${horaCfg})...`);
        try {
          const resultado = await generarBackup();
          console.log(`✅ [Backup] Exitoso: ${resultado.archivo} (${resultado.tamanio_kb} KB)`);

          // Subir a Google Drive automáticamente
          await subirBackupANube(resultado.ruta, resultado.archivo);

          // Consultar días de retención configurados
          const [[retener]] = await pool.query(
            `SELECT valor FROM config_sistema WHERE clave = 'backup_retener_dias'`
          );
          
          const dias = parseInt(retener?.valor || 30);
          await limpiarBackupsAntiguos(dias);
          // Limpieza en la nube con el doble de retención (más seguridad)
          await limpiarBackupsNube(dias * 2);
        } catch (err) {
          console.error('❌ [Backup] Falló el proceso automático:', err.message);
        }
      }, { timezone: 'America/Lima' });

      console.log(`✅ Job de Backup iniciado correctamente (Cada día a las ${horaCfg} Lima)`);
    })
    .catch((err) => {
      // Fallback: Si la tabla no existe o hay error, se programa a las 02:00 AM por defecto
      cron.schedule('0 2 * * *', async () => {
        try { await generarBackup(); } catch (e) {}
      }, { timezone: 'America/Lima' });
      console.log('⚠️  Job iniciado en modo Fallback (02:00 AM) por error en consulta de config.');
    });
};

module.exports = { iniciarJobBackup, generarBackup, limpiarBackupsAntiguos };