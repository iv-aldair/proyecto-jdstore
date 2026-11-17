require('./config/env');

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');
const corsOptions  = require('./config/corsOptions');
require('./config/db');

const errorHandler = require('./middleware/errorHandler');

// ── Jobs ──────────────────────────────────────────────────────
const { iniciarJobStockBajo }  = require('./jobs/stockBajo.job');
const { iniciarJobEstancados } = require('./jobs/productosEstancados.job');
const { iniciarJobTipoCambio } = require('./jobs/tipoCambio.job');

let iniciarJobBackup = null;
try {
  iniciarJobBackup = require('./jobs/backup.job').iniciarJobBackup;
} catch (_) {
  console.warn('⚠️  backup.job.js no encontrado, backup automático deshabilitado');
}

// ── Rutas v1 (Estables) ───────────────────────────────────────
const authRoutes           = require('./routes/auth.routes');
const productosRoutes      = require('./routes/productos.routes');
const categoriasRoutes     = require('./routes/categorias.routes');
const marcasRoutes         = require('./routes/marcas.routes');
const inventarioRoutes     = require('./routes/inventario.routes');
const ventasRoutes         = require('./routes/ventas.routes');
const comprasRoutes        = require('./routes/compras.routes');
const clientesRoutes       = require('./routes/clientes.routes');
const tiendasRoutes        = require('./routes/tiendas.routes');
const proveedoresRoutes    = require('./routes/proveedores.routes');
const reportesRoutes       = require('./routes/reportes.routes');
const estadisticasRoutes   = require('./routes/estadisticas.routes');
const alertasRoutes        = require('./routes/alertas.routes');
const usuariosRoutes       = require('./routes/usuarios.routes');
// Movida a v1 porque ya la terminamos
const productoSeriesRoutes = require('./routes/productoSeries.routes'); 
const proformasRoutes      = require('./routes/proformas.routes');
const cajaRoutes           = require('./routes/caja.routes');
const deudasRoutes         = require('./routes/deudas.routes');
const facturacionRoutes    = require('./routes/facturacion.routes');
const serviciosTecnicosRoutes = require('./routes/serviciosTecnicos.routes');
const deudasClientesRoutes    = require('./routes/deudasClientes.routes');

// ── Rutas v2 (Módulos dinámicos/opcionales) ───────────────────
const cargarRuta = (ruta) => {
  try { return require(ruta); }
  catch (_) { return null; }
};
const tipoCambioRoutes     = cargarRuta('./routes/tipoCambio.routes');
const backupRoutes         = cargarRuta('./routes/backup.routes');
const importacionRoutes    = cargarRuta('./routes/importacion.routes');

const app  = express();
const PORT = process.env.PORT || 4000; // Generalmente usas 4000 para backend, pero 3000 está bien si así lo tienes en el .env

// ── Middlewares globales y de Seguridad ─────────────────────────

// 1. Ocultar cabeceras y proteger contra vulnerabilidades web conocidas
// Se desactivan las políticas que fuerzan HTTPS porque el servidor corre en HTTP
// y las sucursales acceden por IP de Tailscale (no es localhost)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: false,
  originAgentCluster: false,
  strictTransportSecurity: false,
}));

// 2. Limitar peticiones (Anti Fuerza Bruta / Anti DDoS)
// Permite máximo 500 peticiones por cada 15 minutos por cada IP (tienda)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 500, 
  message: { ok: false, mensaje: 'Demasiadas peticiones desde esta IP, por favor intente de nuevo en 15 minutos.' }
});
app.use(limiter);

// 3. Middlewares estándar
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    ok: true, sistema: 'JD Store API', version: '2.0.0',
    timestamp: new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' }),
    location: 'Juliaca, Puno'
  });
});

// ── Rutas montadas ────────────────────────────────────────────
const publicRoutes = require('./routes/public.routes');
app.use('/api/public',          publicRoutes);
app.use('/api/auth',            authRoutes);
app.use('/api/productos',       productosRoutes);
app.use('/api/categorias',      categoriasRoutes);
app.use('/api/marcas',          marcasRoutes);
app.use('/api/inventario',      inventarioRoutes);
app.use('/api/ventas',          ventasRoutes);
app.use('/api/compras',         comprasRoutes);
app.use('/api/clientes',        clientesRoutes);
app.use('/api/tiendas',         tiendasRoutes);
app.use('/api/proveedores',     proveedoresRoutes);
app.use('/api/reportes',        reportesRoutes);
app.use('/api/estadisticas',    estadisticasRoutes);
app.use('/api/alertas',         alertasRoutes);
app.use('/api/usuarios',        usuariosRoutes);
app.use('/api/producto-series', productoSeriesRoutes); // Montada fija
app.use('/api/proformas',       proformasRoutes);
app.use('/api/caja',            cajaRoutes);
app.use('/api/deudas',          deudasRoutes);
app.use('/api/facturacion',     facturacionRoutes);
app.use('/api/servicios-tecnicos', serviciosTecnicosRoutes);
app.use('/api/deudas-clientes',    deudasClientesRoutes);

const guiasRemisionRoutes = require('./routes/guiasRemision.routes');
app.use('/api/guias-remision',     guiasRemisionRoutes);

// Opcionales
if (tipoCambioRoutes)     app.use('/api/tipo-cambio',     tipoCambioRoutes);
if (backupRoutes)         app.use('/api/backups',         backupRoutes);
if (importacionRoutes)    app.use('/api/importacion',    importacionRoutes);

// ── Servir Frontend (Producción) ──────────────────────────────
const path = require('path');
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// Rutas de la API no encontradas (404 API)
app.use('/api/*', (req, res) => {
  res.status(404).json({ ok: false, mensaje: `Ruta de API no encontrada: ${req.method} ${req.path}` });
});

// ── Enviar interfaz gráfica de React para todas las demás rutas ──
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ── Error Handler Global ──────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║        JD STORE API - JULIACA            ║');
  console.log(`║  Servidor: http://localhost:${PORT}          ║`);
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
  
  if (process.env.NODE_ENV !== 'test') {
    iniciarJobStockBajo();
    iniciarJobEstancados();
    iniciarJobTipoCambio();
    if (iniciarJobBackup) iniciarJobBackup();
  }
});

module.exports = app;
