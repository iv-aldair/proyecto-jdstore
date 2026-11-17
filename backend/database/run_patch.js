require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runPatch() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'tienda_jdstore',
    multipleStatements: true
  });

  const sqlPath = path.join(__dirname, 'patch_nubefact.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    await connection.query(sql);
    console.log('Patch aplicado correctamente');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('El parche ya habia sido aplicado (campos existen)');
    } else {
      console.error('Error aplicando parche:', err);
    }
  } finally {
    await connection.end();
  }
}

runPatch();
