const router = require('express').Router();
const { login, perfil, cambiarPassword } = require('../controllers/auth.controller');
const { verificarToken } = require('../middleware/auth');

router.post('/login',            login);
router.get('/perfil',            verificarToken, perfil);
router.patch('/cambiar-password',verificarToken, cambiarPassword);

module.exports = router;