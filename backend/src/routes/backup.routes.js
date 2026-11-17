const router = require('express').Router();
const ctrl   = require('../controllers/backup.controller');
const { verificarToken } = require('../middleware/auth');
const { soloAdmin }      = require('../middleware/roles');

router.use(verificarToken);
router.use(soloAdmin);

router.get('/',            ctrl.listar);
router.post('/generar',    ctrl.generarManual);
router.post('/limpiar',    ctrl.limpiar);
router.delete('/:id',      ctrl.eliminar);
router.get('/config',      ctrl.obtenerConfig);
router.put('/config',      ctrl.actualizarConfig);

module.exports = router;