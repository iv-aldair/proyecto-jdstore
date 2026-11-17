const router = require('express').Router();
const ctrl   = require('../controllers/productos.controller');
const { verificarToken } = require('../middleware/auth');
const { soloAdmin }      = require('../middleware/roles');

router.use(verificarToken);

router.get('/buscar',      ctrl.buscar);
router.get('/stock-bajo',  ctrl.stockBajo);
router.get('/',            ctrl.listar);
router.get('/:id',         ctrl.obtener);
router.post('/',           soloAdmin, ctrl.crear);
router.put('/:id',         soloAdmin, ctrl.actualizar);
router.patch('/:id',       soloAdmin, ctrl.actualizarParcial);
router.delete('/:id',      soloAdmin, ctrl.eliminar);

module.exports = router;