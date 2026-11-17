const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/caja.controller');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);

router.get('/estado', ctrl.obtenerEstadoCaja);
router.post('/abrir', ctrl.abrirCaja);
router.post('/cerrar', ctrl.cerrarCaja);

router.get('/resumen', ctrl.obtenerResumenDia);
router.get('/movimientos', ctrl.listarMovimientos);
router.post('/movimientos', ctrl.crearMovimiento);
router.delete('/movimientos/:id', ctrl.eliminarMovimiento);

module.exports = router;
