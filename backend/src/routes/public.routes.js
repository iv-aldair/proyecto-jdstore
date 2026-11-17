const router = require('express').Router();
const ctrl = require('../controllers/public.controller');
const { verificarToken } = require('../middleware/auth');
const { soloAdmin } = require('../middleware/roles');

// ── Rutas Públicas (Página Web Institucional + n8n Chatbot + Headless Drupal 10 JSON:API) ──
router.get('/inicio',                          ctrl.obtenerDatosInicio);
router.get('/servicio-tecnico/:query',         ctrl.consultarServicioTecnico);
router.post('/contacto',                       ctrl.registrarContacto);
router.get('/n8n-context',                     ctrl.obtenerContextoN8n);
router.post('/chatbot',                        ctrl.procesarMensajeChatbot);
router.get('/drupal/jsonapi/node/article',     ctrl.obtenerJsonApiDrupal);

// ── Rutas de Gestión del CMS (Drupal 10 Headless / Panel CMS Admin) ──
router.get('/cms/datos',                       verificarToken, soloAdmin, ctrl.listarPublicacionesCMS);
router.post('/cms/publicaciones',              verificarToken, soloAdmin, ctrl.crearPublicacionCMS);
router.put('/cms/publicaciones/:id',           verificarToken, soloAdmin, ctrl.actualizarPublicacionCMS);
router.delete('/cms/publicaciones/:id',        verificarToken, soloAdmin, ctrl.eliminarPublicacionCMS);
router.put('/cms/institucional',               verificarToken, soloAdmin, ctrl.actualizarInstitucionalCMS);
router.post('/cms/drupal-sync',                verificarToken, soloAdmin, ctrl.sincronizarDrupalCMS);

module.exports = router;
