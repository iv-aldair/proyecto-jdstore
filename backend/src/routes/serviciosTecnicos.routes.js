const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/serviciosTecnicos.controller');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);

router.get('/', ctrl.listar);
router.post('/', ctrl.crear);
router.get('/:id', ctrl.obtenerPorId);
router.put('/:id/estado', ctrl.actualizarEstado);

module.exports = router;
