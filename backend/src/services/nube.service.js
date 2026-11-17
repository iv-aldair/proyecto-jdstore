/**
 * Servicio de Backup a la Nube (Google Drive)
 * 
 * CÓMO FUNCIONA:
 * Después de que el backup local (.sql) se genera, este servicio lo sube
 * automáticamente a Google Drive usando rclone (herramienta gratuita).
 * 
 * INSTALACIÓN ÚNICA (5 minutos):
 * 1. Descargar rclone: https://rclone.org/downloads/
 * 2. Extraer y poner rclone.exe en C:\rclone\ (o donde prefieras)
 * 3. Abrir cmd y ejecutar: C:\rclone\rclone.exe config
 * 4. Seguir el asistente:
 *    - New remote → nombre: "gdrive"
 *    - Storage: Google Drive (opción 18)
 *    - Se abrirá el navegador para autorizar tu cuenta de Google
 *    - Listo!
 * 
 * El backup se subirá a: Google Drive/JDStore_Backups/
 */

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Buscar rclone en ubicaciones comunes
const buscarRclone = () => {
  const rutasPosibles = [
    'C:\\rclone\\rclone.exe',
    'C:\\Program Files\\rclone\\rclone.exe',
    path.join(process.env.USERPROFILE || '', 'rclone', 'rclone.exe'),
    'rclone', // Usar PATH del sistema
  ];
  
  for (const ruta of rutasPosibles) {
    if (ruta === 'rclone') return ruta; // Fallback al PATH
    if (fs.existsSync(ruta)) return `"${ruta}"`;
  }
  return null;
};

/**
 * Sube un archivo de backup a Google Drive
 * @param {string} rutaArchivo - Ruta absoluta del archivo .sql a subir
 * @param {string} nombreArchivo - Nombre del archivo
 * @returns {Promise<{ok: boolean, mensaje: string}>}
 */
const subirBackupANube = (rutaArchivo, nombreArchivo) => new Promise((resolve) => {
  const rclone = buscarRclone();
  
  if (!rclone) {
    console.warn('⚠️  [Nube] rclone no encontrado. Backup solo guardado localmente.');
    console.warn('   Para activar backup en la nube, instala rclone: https://rclone.org/downloads/');
    return resolve({ ok: false, mensaje: 'rclone no instalado' });
  }

  if (!fs.existsSync(rutaArchivo)) {
    return resolve({ ok: false, mensaje: 'Archivo de backup no encontrado' });
  }

  // Subir a Google Drive en la carpeta JDStore_Backups
  const carpetaNube = 'gdrive:JDStore_Backups';
  const cmd = `${rclone} copy "${rutaArchivo}" ${carpetaNube} --progress`;

  console.log(`☁️  [Nube] Subiendo ${nombreArchivo} a Google Drive...`);

  exec(cmd, { timeout: 120000 }, (err, stdout, stderr) => {
    if (err) {
      console.error('❌ [Nube] Error al subir backup:', err.message);
      if (err.message.includes('config file') || err.message.includes('didn\'t find')) {
        console.error('   → Ejecuta "rclone config" primero para configurar Google Drive.');
      }
      return resolve({ ok: false, mensaje: err.message });
    }

    console.log(`✅ [Nube] Backup subido exitosamente a Google Drive: ${nombreArchivo}`);
    return resolve({ ok: true, mensaje: `Subido a ${carpetaNube}/${nombreArchivo}` });
  });
});

/**
 * Limpia backups antiguos en la nube (mantiene los últimos N días)
 * @param {number} dias - Días de retención
 */
const limpiarBackupsNube = (dias = 60) => new Promise((resolve) => {
  const rclone = buscarRclone();
  if (!rclone) return resolve({ ok: false });

  const cmd = `${rclone} delete gdrive:JDStore_Backups --min-age ${dias}d`;
  
  exec(cmd, { timeout: 60000 }, (err) => {
    if (err) {
      console.error('❌ [Nube] Error limpiando backups antiguos en la nube:', err.message);
      return resolve({ ok: false });
    }
    console.log(`🗑️  [Nube] Backups mayores a ${dias} días eliminados de Google Drive`);
    return resolve({ ok: true });
  });
});

module.exports = { subirBackupANube, limpiarBackupsNube };
