const pool = require('../src/config/db');

const ejecutarPatch = async () => {
  try {
    console.log('Ejecutando patch de base de datos...');

    // 1. Actualizar RUC
    await pool.query(`UPDATE config_sistema SET valor = '20600698479' WHERE clave = 'empresa_ruc'`);
    await pool.query(`UPDATE config_sistema SET valor = 'JD STORE SOCIEDAD COMERCIAL DE RESPONSABILIDAD LIMITADA' WHERE clave = 'empresa_nombre'`);
    await pool.query(`UPDATE config_sistema SET valor = 'Jr. Moquegua 705' WHERE clave = 'empresa_direccion'`);
    console.log('Datos de empresa actualizados.');

    // 2. Crear tabla movimientos_caja
    await pool.query(`
      CREATE TABLE IF NOT EXISTS movimientos_caja (
        id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
        id_tienda INT NOT NULL,
        id_usuario INT NOT NULL,
        tipo_movimiento ENUM('INGRESO', 'EGRESO') NOT NULL,
        concepto VARCHAR(100) NOT NULL,
        monto DECIMAL(10,2) NOT NULL,
        descripcion TEXT,
        id_venta INT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_tienda) REFERENCES tiendas(id_tienda),
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
        FOREIGN KEY (id_venta) REFERENCES ventas(id_venta)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Tabla movimientos_caja creada.');

    // 3. Crear tabla deudas_externas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS deudas_externas (
        id_deuda INT AUTO_INCREMENT PRIMARY KEY,
        id_tienda INT NOT NULL,
        id_usuario INT NOT NULL,
        tienda_proveedor VARCHAR(150) NOT NULL,
        producto_nombre VARCHAR(200) NOT NULL,
        monto_deuda DECIMAL(10,2) NOT NULL,
        estado_pago ENUM('PENDIENTE', 'PAGADO') DEFAULT 'PENDIENTE',
        id_venta INT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (id_tienda) REFERENCES tiendas(id_tienda),
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
        FOREIGN KEY (id_venta) REFERENCES ventas(id_venta)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('Tabla deudas_externas creada.');

    console.log('Patch completado con éxito!');
    process.exit(0);
  } catch (error) {
    console.error('Error al ejecutar el patch:', error);
    process.exit(1);
  }
};

ejecutarPatch();
