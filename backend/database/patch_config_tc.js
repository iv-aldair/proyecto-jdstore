const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'tienda_jdstore'
  });

  // 1. Crear tabla config_sistema
  await conn.query(`
    CREATE TABLE IF NOT EXISTS config_sistema (
      clave VARCHAR(50) PRIMARY KEY,
      valor VARCHAR(255)
    )
  `);
  console.log('✅ Tabla config_sistema creada/verificada');

  // 2. Insertar TC vigente por defecto
  await conn.query(`
    INSERT IGNORE INTO config_sistema (clave, valor)
    VALUES ('tc_dolar_vigente', '3.75')
  `);
  console.log('✅ Valor tc_dolar_vigente insertado (S/ 3.75)');

  // 3. Crear tabla tipo_cambio (historial)
  await conn.query(`
    CREATE TABLE IF NOT EXISTS tipo_cambio (
      id_tc INT AUTO_INCREMENT PRIMARY KEY,
      valor_usd DECIMAL(10,4),
      fuente VARCHAR(50),
      fecha DATE,
      hora TIME,
      id_usuario INT NULL
    )
  `);
  console.log('✅ Tabla tipo_cambio creada/verificada');

  await conn.end();
  console.log('\n🎉 Patch completado con éxito');
}

run().catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
