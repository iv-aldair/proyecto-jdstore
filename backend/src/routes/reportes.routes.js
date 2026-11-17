const router = require('express').Router();
const ctrl   = require('../controllers/reportes.controller');
const { verificarToken } = require('../middleware/auth');
const { soloAdmin }      = require('../middleware/roles');

router.use(verificarToken);
router.use(soloAdmin);

router.get('/diario',        ctrl.diario);
router.get('/semanal',       ctrl.semanal);
router.get('/mensual',       ctrl.mensual);
router.get('/anual',         ctrl.anual);
router.get('/personalizado', ctrl.personalizado);
router.get('/historial',     ctrl.historial);

module.exports = router;