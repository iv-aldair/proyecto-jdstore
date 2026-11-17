const router = require('express').Router();
const ctrl   = require('../controllers/tipoCambio.controller');
const { verificarToken } = require('../middleware/auth');
const { soloAdmin, adminOVendedor } = require('../middleware/roles');

router.use(verificarToken);

router.get('/vigente',            adminOVendedor, ctrl.obtenerVigente);
router.get('/historial',          soloAdmin,      ctrl.historial);
router.get('/bcrp',               soloAdmin,      ctrl.consultarBCRP);
router.post('/',                  soloAdmin,      ctrl.actualizar);
router.post('/recalcular-precios',soloAdmin,      ctrl.recalcularPrecios);

module.exports = router;