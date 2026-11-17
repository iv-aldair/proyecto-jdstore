const router = require('express').Router();
const ctrl   = require('../controllers/ventas.controller');
const { verificarToken } = require('../middleware/auth');
const { adminOVendedor } = require('../middleware/roles');

router.use(verificarToken);
router.use(adminOVendedor);

router.get('/diarias', ctrl.ventasDiarias);
router.get('/',        ctrl.listar);
router.get('/:id',     ctrl.obtener);
router.post('/',       ctrl.crear);   // Admin Y Vendedor pueden crear

module.exports = router;