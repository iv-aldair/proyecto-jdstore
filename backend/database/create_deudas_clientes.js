require('dotenv').config({ path: '../.env' });
const pool = require('../src/config/db');

async function migrate() {
  try {
    console.log('Creando tablas de Cuentas por Cobrar (Deudas Clientes)...');

    // Tabla deudas_clientes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS deudas_clientes (
        id_deuda INT AUTO_INCREMENT PRIMARY KEY,
        id_cliente INT NOT NULL,
        id_tienda INT NOT NULL,
        id_venta INT NULL,
        monto_total DECIMAL(10,2) NOT NULL,
        saldo_pendiente DECIMAL(10,2) NOT NULL,
        estado ENUM('PENDIENTE', 'PAGADO') DEFAULT 'PENDIENTE',
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_vencimiento DATETIME NULL,
        notas TEXT NULL,
        FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente) ON DELETE CASCADE,
        FOREIGN KEY (id_tienda) REFERENCES tiendas(id_tienda) ON DELETE CASCADE,
        FOREIGN KEY (id_venta) REFERENCES ventas(id_venta) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tabla deudas_clientes creada.');

    // Tabla abonos_clientes
    await pool.query(`
      CREATE TABLE IF NOT EXISTS abonos_clientes (
        id_abono INT AUTO_INCREMENT PRIMARY KEY,
        id_deuda INT NOT NULL,
        id_usuario INT NOT NULL,
        id_tienda INT NOT NULL,
        monto DECIMAL(10,2) NOT NULL,
        metodo_pago VARCHAR(50) NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        notas TEXT NULL,
        FOREIGN KEY (id_deuda) REFERENCES deudas_clientes(id_deuda) ON DELETE CASCADE,
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
        FOREIGN KEY (id_tienda) REFERENCES tiendas(id_tienda) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Tabla abonos_clientes creada.');

  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    process.exit();
  }
}

migrate();
