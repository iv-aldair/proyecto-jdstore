const router = require('express').Router();
const ctrl   = require('../controllers/alertas.controller');
const { verificarToken } = require('../middleware/auth');
const { soloAdmin }      = require('../middleware/roles');

router.use(verificarToken);
router.use(soloAdmin);

router.get('/resumen',             ctrl.resumen);
router.get('/stock-bajo',          ctrl.stockBajo);
router.get('/sin-stock',           ctrl.sinStock);
router.get('/productos-estancados',ctrl.productosEstancados);

module.exports = router;