const router = require('express').Router();
const ctrl   = require('../controllers/estadisticas.controller');
const { verificarToken } = require('../middleware/auth');
const { soloAdmin }      = require('../middleware/roles');

router.use(verificarToken);
router.use(soloAdmin);

router.get('/dashboard',               ctrl.dashboard);
router.get('/ventas-por-categoria',    ctrl.ventasPorCategoria);
router.get('/productos-sin-movimiento',ctrl.productosSinMovimiento);

module.exports = router;