const router = require('express').Router();
const ctrl   = require('../controllers/inventario.controller');
const { verificarToken } = require('../middleware/auth');
const { soloAdmin, adminOVendedor } = require('../middleware/roles');

router.use(verificarToken);

router.get('/',                              adminOVendedor, ctrl.listar);
router.get('/alertas',                       adminOVendedor, ctrl.alertas);
router.get('/global',                        soloAdmin,      ctrl.listarGlobal);
router.post('/asignar',                      soloAdmin,      ctrl.asignarProductoTienda);
router.delete('/quitar/:id_producto/:id_tienda', soloAdmin,  ctrl.quitarProductoTienda);
router.patch('/:id_producto/ajustar',        soloAdmin,      ctrl.ajustar);
router.put('/:id_producto/stock-minimo',     soloAdmin,      ctrl.actualizarMinimo);
router.put('/:id_producto/stock-absoluto',   soloAdmin,      ctrl.actualizarStockAbsoluto);
router.patch('/:id_producto/costo',          soloAdmin,      ctrl.actualizarCosto);

module.exports = router;