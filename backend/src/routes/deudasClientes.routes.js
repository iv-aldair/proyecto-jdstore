const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/deudasClientes.controller');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);

router.get('/', ctrl.listar);
router.post('/', ctrl.crear);
router.get('/:id/abonos', ctrl.listarAbonos);
router.post('/:id/abonos', ctrl.registrarAbono);

module.exports = router;
