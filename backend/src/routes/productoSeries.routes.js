const router = require('express').Router();
const ctrl   = require('../controllers/productoSeries.controller');
const { verificarToken } = require('../middleware/auth');
const { soloAdmin, adminOVendedor } = require('../middleware/roles');

// Todos los accesos a series requieren login
router.use(verificarToken);

// --- RUTAS DE CONSULTA (Admin y Vendedor) ---

// Listar todas las series (con filtros de producto o estado)
router.get('/', adminOVendedor, ctrl.listar);

// Buscar una serie específica (para garantías o devoluciones)
router.get('/buscar/:numero_serie', adminOVendedor, ctrl.buscarPorSerie);

// NUEVA: Obtener series en stock para un producto (usada en el carrito/POS)
router.get('/disponibles/:id_producto', adminOVendedor, ctrl.disponiblesPorProducto);


// --- RUTAS DE GESTIÓN (Solo Admin) ---

// Registrar una sola serie
router.post('/', soloAdmin, ctrl.crear);

// Registrar series masivamente (Lote)
router.post('/lote', soloAdmin, ctrl.crearLote);

// Cambiar estado manualmente (0=Inactivo, 1=Disponible, 2=Vendido)
router.patch('/:id/estado', soloAdmin, ctrl.cambiarEstado);

// Eliminación lógica (desactivar serie)
router.delete('/:id', soloAdmin, ctrl.eliminar);

module.exports = router;