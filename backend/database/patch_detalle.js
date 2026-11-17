const pool = require('../src/config/db');

const ejecutarPatch = async () => {
  try {
    console.log('Altering detalle_venta...');
    await pool.query('ALTER TABLE detalle_venta MODIFY id_producto INT NULL');
    await pool.query('ALTER TABLE detalle_venta ADD COLUMN nombre_producto_externo VARCHAR(200) NULL');
    console.log('Patch completado con éxito!');
    process.exit(0);
  } catch (error) {
    console.log('Error o columna ya existente', error.message);
    process.exit(0);
  }
};

ejecutarPatch();
