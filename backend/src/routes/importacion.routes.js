const router  = require('express').Router();
const multer  = require('multer');
const ctrl    = require('../controllers/importacion.controller');
const { verificarToken } = require('../middleware/auth');
const { soloAdmin }      = require('../middleware/roles');

// Multer en memoria (no guarda en disco, procesa directo)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const validos = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (validos.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Solo se aceptan archivos .xlsx o .xls'));
  },
});

// Ruta pública para descargar la plantilla vacía
router.get('/plantilla',                          ctrl.descargarPlantilla);

router.use(verificarToken);
router.use(soloAdmin);

router.get('/historial',                          ctrl.historial);
router.post('/productos', upload.single('archivo'),ctrl.importarProductos);
router.get('/exportar',                           ctrl.exportarProductos);

module.exports = router;