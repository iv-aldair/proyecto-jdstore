const router = require('express').Router();
const ctrl = require('../controllers/proformas.controller');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);

router.get('/', ctrl.listar);
router.get('/:id', ctrl.obtenerPorId);
router.post('/', ctrl.crear);
router.patch('/:id/anular', ctrl.anular);

module.exports = router;
