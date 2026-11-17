const mysql = require("mysql2/promise");
const { env } = require("./env");

const pool = mysql.createPool({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Verificar conexión real al iniciar
(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    console.log("✅ Conectado a MySQL (JD Store) — Base de datos verificada");
  } catch (err) {
    console.error("❌ ERROR: No se pudo conectar a MySQL:", err.message);
    console.error("   Verifica que MySQL esté corriendo y que las credenciales en .env sean correctas.");
  }
})();

module.exports = pool;