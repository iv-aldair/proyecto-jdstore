const router = require('express').Router();
const ctrl   = require('../controllers/compras.controller');
const { verificarToken } = require('../middleware/auth');
const { soloAdmin }      = require('../middleware/roles');

router.use(verificarToken);

router.get('/',        ctrl.listar);
router.get('/:id',     ctrl.obtener);
router.post('/',       soloAdmin, ctrl.crear);

module.exports = router;