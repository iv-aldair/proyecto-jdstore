const pool = require('../config/db');
const { ok, error } = require('../utils/helpers');
const { emitirNotaCredito, emitirComunicacionBaja } = require('../services/nubefact.service');

const facturacionController = {};

// Obtener comprobantes emitidos
facturacionController.listarComprobantes = async (req, res) => {
  try {
    const id_tienda = req.query.id_tienda || req.usuario.id_tienda;
    const esAdmin = req.usuario.id_rol === 1;

    // Si es administrador puede ver todos, si es vendedor solo los de su tienda
    const queryTienda = esAdmin ? '' : 'AND v.id_tienda = ?';
    const queryParams = esAdmin ? [] : [id_tienda];

    const [comprobantes] = await pool.query(
      `SELECT v.id_venta, v.tipo_comprobante, 
              CONCAT(v.serie, '-', v.correlativo) AS serie_correlativo,
              v.serie, v.correlativo,
              v.fecha AS fecha_venta, v.total, v.subtotal, v.igv,
              v.estado_sunat, v.enlace_pdf, v.enlace_xml, v.enlace_cdr,
              v.hash_sunat, v.mensaje_sunat, v.api_enviado,
              c.nombre as cliente, c.tipo_documento, c.dni_ruc, c.direccion,
              t.nombre_tienda
       FROM ventas v
       LEFT JOIN clientes c ON v.id_cliente = c.id_cliente
       LEFT JOIN tiendas t ON v.id_tienda = t.id_tienda
       WHERE v.tipo_comprobante IN ('Boleta', 'Factura')
       ${queryTienda}
       ORDER BY v.fecha DESC LIMIT 200`,
      queryParams
    );

    return ok(res, comprobantes, 'Comprobantes obtenidos');
  } catch (err) {
    console.error('❌ Error listarComprobantes:', err);
    return error(res, 'Error al obtener comprobantes', 500);
  }
};

// Reenviar comprobante a Nubefact (para los que fallaron o quedaron pendientes)
facturacionController.reenviarComprobante = async (req, res) => {
  const { id_venta } = req.body;
  if (!id_venta) return error(res, 'Falta id_venta', 400);

  try {
    const { enviarComprobante: enviarNubefact } = require('../services/facturacion.services');
    const result = await enviarNubefact(id_venta);
    return ok(res, result, 'Comprobante reenviado a Nubefact');
  } catch (err) {
    // Extraer mensaje detallado de errores de Nubefact
    const nubefactError = err.response?.data?.errors || err.response?.data || null;
    const errorMsg = nubefactError 
      ? (typeof nubefactError === 'string' ? nubefactError : JSON.stringify(nubefactError))
      : err.message;
    console.error('❌ Error reenviarComprobante:', errorMsg);
    return error(res, `Error Nubefact: ${errorMsg}`, 500);
  }
};

// Emitir Nota de Crédito
facturacionController.emitirNotaCredito = async (req, res) => {
  const { id_venta, motivo } = req.body;
  if (!id_venta || !motivo) return error(res, 'Faltan datos (id_venta, motivo)', 400);

  try {
    // 1. Validar que la venta exista y sea Boleta/Factura
    const [[venta]] = await pool.query(
      `SELECT v.*, c.nombre, c.tipo_documento, c.dni_ruc, c.direccion
       FROM ventas v 
       LEFT JOIN clientes c ON c.id_cliente = v.id_cliente
       WHERE v.id_venta = ?`,
      [id_venta]
    );
    if (!venta) return error(res, 'Venta no encontrada', 404);
    if (venta.tipo_comprobante === 'Nota de Venta') {
      return error(res, 'Las Notas de Venta no requieren Nota de Crédito', 400);
    }
    if (venta.estado_sunat && venta.estado_sunat.includes('ANULADO')) {
      return error(res, 'Este comprobante ya fue anulado previamente', 400);
    }

    // 2. Intentar enviar a Nubefact
    let estadoFinal = 'ANULADO_NC';
    let mensajeExtra = '';

    try {
      const nubefactResult = await emitirNotaCredito(venta, motivo);
      if (nubefactResult.simulado) {
        estadoFinal = 'PENDIENTE';
        mensajeExtra = ' — Simulado';
      } else {
        estadoFinal = nubefactResult.aceptada_por_sunat ? 'ACEPTADO' : (nubefactResult.sunat_description || 'PENDIENTE');
        mensajeExtra = ` — ${nubefactResult.sunat_note || nubefactResult.sunat_description || 'Anulado vía Nubefact'}`;
      }
    } catch (err) {
      console.error('⚠️ Error enviando NC a Nubefact (se marca localmente):', err.message);
      mensajeExtra = ` (Error Nubefact: ${err.message})`;
    }

    // 3. Marcar como anulado localmente
    await pool.query(
      'UPDATE ventas SET estado_sunat = ?, notas_internas = CONCAT(COALESCE(notas_internas,""), ?) WHERE id_venta = ?',
      [estadoFinal, `\n[NC] ${motivo} - ${new Date().toLocaleString('es-PE')}`, id_venta]
    );

    return ok(res, { 
      id_venta, 
      estado_sunat: estadoFinal
    }, `Nota de Crédito emitida${mensajeExtra}`);
  } catch (err) {
    console.error('❌ Error emitirNotaCredito:', err);
    return error(res, 'Error al emitir Nota de Crédito', 500);
  }
};

// Emitir Comunicación de Baja
facturacionController.anularComprobante = async (req, res) => {
  const { id_venta } = req.body;
  if (!id_venta) return error(res, 'Falta id_venta', 400);

  try {
    const [[venta]] = await pool.query(
      `SELECT v.*, c.nombre, c.tipo_documento, c.dni_ruc, c.direccion
       FROM ventas v 
       LEFT JOIN clientes c ON c.id_cliente = v.id_cliente
       WHERE v.id_venta = ?`,
      [id_venta]
    );
    if (!venta) return error(res, 'Venta no encontrada', 404);
    if (venta.estado_sunat && venta.estado_sunat.includes('ANULADO')) {
      return error(res, 'Este comprobante ya fue anulado previamente', 400);
    }

    // Intentar enviar comunicación de baja a Nubefact
    let estadoFinal = 'ANULADO_BAJA';
    let mensajeExtra = '';

    try {
      const nubefactResult = await emitirComunicacionBaja(venta);
      if (nubefactResult.simulado) {
        estadoFinal = 'PENDIENTE';
        mensajeExtra = ' — Simulado';
      } else {
        estadoFinal = nubefactResult.aceptada_por_sunat ? 'ACEPTADO' : (nubefactResult.sunat_description || 'PENDIENTE');
        mensajeExtra = ` — ${nubefactResult.sunat_note || nubefactResult.sunat_description || 'Baja enviada vía Nubefact'}`;
      }
    } catch (err) {
      console.error('⚠️ Error enviando Baja a Nubefact:', err.message);
      mensajeExtra = ` (Error Nubefact: ${err.message})`;
    }

    await pool.query(
      'UPDATE ventas SET estado_sunat = ? WHERE id_venta = ?',
      [estadoFinal, id_venta]
    );

    return ok(res, { 
      id_venta, 
      estado_sunat: estadoFinal
    }, `Comunicación de Baja enviada${mensajeExtra}`);
  } catch (err) {
    console.error('❌ Error anularComprobante:', err);
    return error(res, 'Error al emitir comunicación de baja', 500);
  }
};

// Configuración de Facturación
facturacionController.guardarConfiguracion = async (req, res) => {
  return ok(res, null, 'Configuración guardada (Pendiente: crear tabla config_facturacion)');
};

facturacionController.obtenerConfiguracion = async (req, res) => {
  const tokenConfigured = !!(process.env.NUBEFACT_TOKEN && process.env.NUBEFACT_TOKEN !== 'your_nubefact_token_here');
  const apisConfigured = !!(process.env.APIS_PERU_TOKEN && !process.env.APIS_PERU_TOKEN.includes('xxxx'));
  
  return ok(res, { 
    nubefact_configurado: tokenConfigured,
    apis_peru_configurado: apisConfigured,
    nubefact_url: process.env.NUBEFACT_URL ? '***configurada***' : null,
  }, 'Estado de configuración');
};

module.exports = facturacionController;
