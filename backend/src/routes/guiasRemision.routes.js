const router = require('express').Router();
const ctrl = require('../controllers/guiasRemision.controller');
const { verificarToken } = require('../middleware/auth');
const { soloAdmin } = require('../middleware/roles');

router.use(verificarToken);
// Opcionalmente podemos permitir a vendedores crear guías, pero lo limitaremos a admin por ahora
router.use(soloAdmin);

router.get('/', ctrl.listar);
router.post('/', ctrl.crear);
router.get('/:id', ctrl.obtener);
router.delete('/:id', ctrl.anular); // usaremos DELETE HTTP para anular lógicamente

module.exports = router;
