const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/deudas.controller');
const { verificarToken } = require('../middleware/auth');
const { soloAdmin } = require('../middleware/roles');

router.use(verificarToken);
router.use(soloAdmin); // Solo admins pueden ver y pagar deudas externas

router.get('/', ctrl.listar);
router.put('/:id/pagar', ctrl.marcarPagada);

module.exports = router;
