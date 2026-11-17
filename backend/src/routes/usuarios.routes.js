const router = require('express').Router();
const ctrl   = require('../controllers/usuarios.controller');
const { verificarToken } = require('../middleware/auth');
const { soloAdmin }      = require('../middleware/roles');

router.use(verificarToken);
router.use(soloAdmin);

router.get('/',                     ctrl.listar);
router.post('/',                    ctrl.crear);
router.put('/:id',                  ctrl.actualizar);
router.delete('/:id',               ctrl.eliminar);
router.patch('/:id/reset-password', ctrl.resetPassword);

module.exports = router;