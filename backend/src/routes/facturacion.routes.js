const express = require('express');
const router = express.Router();
const facturacionController = require('../controllers/facturacion.controller');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);

// Listar comprobantes electrónicos enviados/pendientes
router.get('/comprobantes', facturacionController.listarComprobantes);

// Reenviar comprobante pendiente a Nubefact
router.post('/reenviar', facturacionController.reenviarComprobante);

// Emitir Nota de Crédito
router.post('/nota-credito', facturacionController.emitirNotaCredito);

// Emitir Comunicación de Baja (Anulación misma fecha)
router.post('/anular', facturacionController.anularComprobante);

// Guardar/Actualizar Tokens de Nubefact y ApisPeru (Solo Admin)
const { adminOVendedor } = require('../middleware/roles');
router.post('/config', adminOVendedor, facturacionController.guardarConfiguracion);
router.get('/config', adminOVendedor, facturacionController.obtenerConfiguracion);

module.exports = router;

