const mysql = require('mysql2/promise');

(async () => {
  const c = await mysql.createConnection({
    host: '127.0.0.1', user: 'root', password: 'root', database: 'tienda_jdstore'
  });
  
  try {
    console.log('Creando tabla proformas...');
    await c.query(`
      CREATE TABLE IF NOT EXISTS proformas (
        id_proforma INT NOT NULL AUTO_INCREMENT,
        codigo_proforma VARCHAR(20) UNIQUE NOT NULL,
        cliente_nombre VARCHAR(100) NOT NULL,
        cliente_telefono VARCHAR(20),
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        validez_dias INT DEFAULT 7,
        subtotal DECIMAL(10,2) NOT NULL,
        descuento_total DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        id_usuario INT NOT NULL,
        id_tienda INT NOT NULL,
        notas TEXT,
        estado TINYINT(1) DEFAULT 1,
        PRIMARY KEY (id_proforma),
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
        FOREIGN KEY (id_tienda) REFERENCES tiendas(id_tienda)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    console.log('Creando tabla proforma_detalles...');
    await c.query(`
      CREATE TABLE IF NOT EXISTS proforma_detalles (
        id_proforma_detalle INT NOT NULL AUTO_INCREMENT,
        id_proforma INT NOT NULL,
        id_producto INT NOT NULL,
        cantidad INT NOT NULL,
        precio_unitario DECIMAL(10,2) NOT NULL,
        descuento_unitario DECIMAL(10,2) DEFAULT 0,
        subtotal DECIMAL(10,2) NOT NULL,
        PRIMARY KEY (id_proforma_detalle),
        FOREIGN KEY (id_proforma) REFERENCES proformas(id_proforma) ON DELETE CASCADE,
        FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    console.log('¡Tablas creadas exitosamente!');
  } catch (error) {
    console.error('Error creando tablas:', error);
  } finally {
    await c.end();
  }
})();
