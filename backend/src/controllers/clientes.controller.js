const pool = require('../config/db');
const { ok, error, paginar } = require('../utils/helpers');
const { consultarDocumento } = require('../services/consultaDoc.service');

const listar = async (req, res, next) => {
  try {
    const { pagina, limite, offset } = paginar(req.query);
    const { buscar } = req.query;
    let where = 'WHERE estado = 1';
    const params = [];
    if (buscar) {
      where += ' AND (nombre LIKE ? OR dni_ruc LIKE ?)';
      params.push(`%${buscar}%`, `%${buscar}%`);
    }
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM clientes ${where}`, params);
    const [rows] = await pool.query(
      `SELECT * FROM clientes ${where} ORDER BY nombre LIMIT ? OFFSET ?`,
      [...params, limite, offset]
    );
    return ok(res, { clientes: rows, paginacion: { total, pagina, limite } });
  } catch (err) { next(err); }
};

const obtener = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM clientes WHERE id_cliente = ?', [req.params.id]);
    if (!rows.length) return error(res, 'Cliente no encontrado', 404);
    return ok(res, rows[0]);
  } catch (err) { next(err); }
};

const buscarPorDocumento = async (req, res, next) => {
  try {
    const { dni_ruc } = req.params;
    
    // 1. Buscar en BD local primero
    const [rows] = await pool.query('SELECT * FROM clientes WHERE dni_ruc = ?', [dni_ruc]);
    if (rows.length) return ok(res, rows[0]);
    
    // 2. Si no existe, buscar en API externa (Reniec/Sunat)
    const tipo = dni_ruc.length === 11 ? 'ruc' : 'dni';
    const datosExternos = await consultarDocumento(tipo, dni_ruc);
    
    // 3. Guardar en nuestra BD para futuras compras
    const [result] = await pool.query(
      'INSERT INTO clientes (nombre, tipo_documento, dni_ruc, direccion) VALUES (?,?,?,?)',
      [datosExternos.nombre, datosExternos.tipo_documento, datosExternos.dni_ruc, datosExternos.direccion || null]
    );
    
    datosExternos.id_cliente = result.insertId;
    
    return ok(res, datosExternos);
  } catch (err) { 
    // Si la API falla, devolver 404 para que el POS sepa que no se encontró
    return error(res, err.message || 'Cliente no encontrado local ni externamente', 404);
  }
};

const crear = async (req, res, next) => {
  try {
    const { nombre, tipo_documento, dni_ruc, telefono, direccion } = req.body;
    if (!nombre || !tipo_documento || !dni_ruc)
      return error(res, 'nombre, tipo_documento y dni_ruc son requeridos');
    const [result] = await pool.query(
      'INSERT INTO clientes (nombre, tipo_documento, dni_ruc, telefono, direccion) VALUES (?,?,?,?,?)',
      [nombre, tipo_documento, dni_ruc, telefono || null, direccion || null]
    );
    return ok(res, { id_cliente: result.insertId }, 'Cliente creado', 201);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return error(res, 'El DNI/RUC ya está registrado');
    next(err);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const { nombre, telefono, direccion } = req.body;
    await pool.query(
      'UPDATE clientes SET nombre=?, telefono=?, direccion=? WHERE id_cliente=?',
      [nombre, telefono, direccion, req.params.id]
    );
    return ok(res, null, 'Cliente actualizado');
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, buscarPorDocumento, crear, actualizar };