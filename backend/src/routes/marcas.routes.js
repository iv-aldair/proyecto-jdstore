const router = require('express').Router();
const ctrl   = require('../controllers/marcas.controller');
const { verificarToken } = require('../middleware/auth');
const { soloAdmin }      = require('../middleware/roles');

router.use(verificarToken);

router.get('/',        ctrl.listar);
router.post('/',       soloAdmin, ctrl.crear);
router.put('/:id',     soloAdmin, ctrl.actualizar);
router.delete('/:id',  soloAdmin, ctrl.eliminar);

module.exports = router;