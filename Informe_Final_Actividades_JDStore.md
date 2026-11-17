# INFORME FINAL DE ACTIVIDADES REALIZADAS
## Sistema de Gestión de Ventas e Inventario — JD Store S.C.R.L.

---

**Empresa:** JD Store S.C.R.L.  
**Ubicación:** Juliaca, Puno — Perú  
**Versión del Sistema:** 2.0.0  
**Fecha del Informe:** Octubre 2026

---

## 3.3. Actividades Programadas y Ejecutadas

---

### Actividad 1: Integración de módulos del sistema de gestión de ventas e inventario

#### Descripción
En esta actividad se realizó la integración de los distintos módulos del sistema de gestión de ventas de JD Store S.C.R.L., estableciendo la correcta comunicación entre las áreas de inventario, ventas y facturación electrónica. Se garantizó que las operaciones realizadas en el sistema, como la selección de productos y el registro de ventas, se encuentren correctamente conectadas entre sí, permitiendo un flujo de trabajo continuo y eficiente. Asimismo, se implementó la validación de datos en cada proceso para asegurar la consistencia de la información antes de su procesamiento. Esta actividad permite que el sistema funcione de manera unificada, evitando errores y redundancias en la gestión de la información.

#### Desarrollo Técnico Realizado

**Arquitectura del sistema implementado:**

El sistema fue desarrollado con una arquitectura cliente-servidor compuesta por:

- **Backend (API REST):** Desarrollado con **Node.js + Express v4.18**, con 25 módulos de rutas interconectados y 25 controladores que gestionan toda la lógica de negocio.
- **Frontend (SPA):** Desarrollado con **React 18 + Vite 5**, utilizando React Router para la navegación y TanStack React Query para la gestión del estado del servidor.
- **Base de datos:** **MySQL** con pool de conexiones configurado a 10 conexiones simultáneas para optimizar el rendimiento.

**Módulos integrados:**

El servidor principal ([app.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/app.js)) monta y conecta los siguientes módulos en rutas API unificadas:

| Módulo | Ruta API | Archivo de Rutas |
|--------|----------|-------------------|
| Autenticación | `/api/auth` | [auth.routes.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/routes/auth.routes.js) |
| Productos | `/api/productos` | [productos.routes.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/routes/productos.routes.js) |
| Categorías | `/api/categorias` | [categorias.routes.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/routes/categorias.routes.js) |
| Marcas | `/api/marcas` | [marcas.routes.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/routes/marcas.routes.js) |
| Inventario | `/api/inventario` | [inventario.routes.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/routes/inventario.routes.js) |
| Ventas | `/api/ventas` | [ventas.routes.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/routes/ventas.routes.js) |
| Compras | `/api/compras` | [compras.routes.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/routes/compras.routes.js) |
| Clientes | `/api/clientes` | [clientes.routes.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/routes/clientes.routes.js) |
| Tiendas | `/api/tiendas` | [tiendas.routes.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/routes/tiendas.routes.js) |
| Proveedores | `/api/proveedores` | [proveedores.routes.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/routes/proveedores.routes.js) |
| Reportes | `/api/reportes` | [reportes.routes.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/routes/reportes.routes.js) |
| Estadísticas | `/api/estadisticas` | [estadisticas.routes.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/routes/estadisticas.routes.js) |
| Facturación | `/api/facturacion` | [facturacion.routes.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/routes/facturacion.routes.js) |
| Alertas | `/api/alertas` | [alertas.routes.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/routes/alertas.routes.js) |
| Usuarios | `/api/usuarios` | [usuarios.routes.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/routes/usuarios.routes.js) |
| Series de Producto | `/api/producto-series` | [productoSeries.routes.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/routes/productoSeries.routes.js) |
| Proformas | `/api/proformas` | [proformas.routes.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/routes/proformas.routes.js) |
| Caja | `/api/caja` | [caja.routes.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/routes/caja.routes.js) |
| Deudas Externas | `/api/deudas` | [deudas.routes.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/routes/deudas.routes.js) |
| Deudas de Clientes | `/api/deudas-clientes` | [deudasClientes.routes.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/routes/deudasClientes.routes.js) |
| Servicios Técnicos | `/api/servicios-tecnicos` | [serviciosTecnicos.routes.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/routes/serviciosTecnicos.routes.js) |
| Guías de Remisión | `/api/guias-remision` | [guiasRemision.routes.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/routes/guiasRemision.routes.js) |
| Tipo de Cambio | `/api/tipo-cambio` | [tipoCambio.routes.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/routes/tipoCambio.routes.js) |
| Backups | `/api/backups` | [backup.routes.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/routes/backup.routes.js) |
| Importación | `/api/importacion` | [importacion.routes.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/routes/importacion.routes.js) |

**Flujo de integración Ventas ↔ Inventario ↔ Facturación:**

En el controlador de ventas ([ventas.controller.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/controllers/ventas.controller.js)), se implementó un flujo transaccional que integra los tres módulos principales de la siguiente manera:

1. **Validación de caja abierta:** Antes de registrar una venta, el sistema verifica que exista una sesión de caja abierta para la tienda correspondiente.
2. **Generación de comprobante:** Se genera automáticamente el número de comprobante con serie y correlativo (`BBB1` para Boletas, `FFF1` para Facturas, `NV01` para Notas de Venta).
3. **Cálculo de totales con IGV:** Mediante la utilidad `descomponerTotal()`, el sistema descompone automáticamente el total en subtotal, IGV (18%) y total, según las normas tributarias de la SUNAT.
4. **Descuento automático de stock:** Al registrar cada ítem, se ejecuta un `UPDATE inventario_tienda SET stock = GREATEST(0, stock - ?)` que descuenta automáticamente las unidades vendidas del inventario de la tienda.
5. **Vinculación de números de serie:** Si el producto tiene control por series, se actualiza el estado de cada número de serie a "vendido" y se vincula con la venta.
6. **Cálculo de utilidad:** Se aplica la fórmula `utilidad = subtotalReal - costoReal`, calculando la ganancia real de cada venta.
7. **Envío automático a facturación:** Si el comprobante es Boleta o Factura, se envía automáticamente a la API de Nubefact para emisión electrónica.

Todo este proceso se ejecuta dentro de una **transacción de base de datos** (`beginTransaction` → `commit` / `rollback`), garantizando la atomicidad de los datos: si algún paso falla, todos los cambios se revierten.

**Validaciones implementadas:**

Se crearon módulos de validación dedicados para cada entidad principal del sistema:

- [ventas.validation.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/validations/ventas.validation.js) — Validación de datos de venta
- [productos.validation.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/validations/productos.validation.js) — Validación de datos de productos
- [clientes.validation.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/validations/clientes.validation.js) — Validación de datos de clientes
- [compras.validation.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/validations/compras.validation.js) — Validación de datos de compras

#### Resultado
Se logró integrar exitosamente los 25 módulos del sistema, garantizando un flujo de trabajo continuo y sin interrupciones entre inventario, ventas y facturación. El uso de transacciones de base de datos asegura la integridad referencial en todas las operaciones.

---

### Actividad 2: Integración con el servicio de facturación electrónica mediante API

#### Descripción
En esta actividad se realizó la integración del sistema de gestión de ventas con un servicio externo de facturación electrónica mediante API, específicamente con la plataforma de Nubefact, permitiendo la emisión automatizada de comprobantes electrónicos. Se implementó el envío de datos de las ventas registradas hacia el servicio de facturación, incluyendo información del cliente, productos, montos e impuestos correspondientes. Asimismo, se gestiona la recepción de respuestas del sistema, verificando el estado de los comprobantes emitidos por la SUNAT, tales como aceptado o rechazado. Esta actividad permite automatizar el proceso de facturación, reduciendo tiempos y errores en la emisión manual de comprobantes.

#### Desarrollo Técnico Realizado

**Servicio principal de integración — Nubefact:**

Se desarrolló el servicio [nubefact.service.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/services/nubefact.service.js) (296 líneas) que implementa tres funciones principales para la comunicación con la API de Nubefact:

**1. `enviarComprobante(venta, detalles)`** — Emisión de comprobantes electrónicos

El proceso de envío sigue estos pasos:
- **Mapeo de tipos de documento:** Se convierte el tipo de documento del cliente al formato requerido por Nubefact (`1 = DNI`, `6 = RUC`, `0 = Sin documento`, `7 = Pasaporte`).
- **Mapeo de tipo de comprobante:** Se convierte a la nomenclatura de Nubefact (`1 = Factura`, `2 = Boleta`).
- **Cálculo de IGV por ítem:** Para cada producto se calcula el valor sin IGV (`precioConIGV / 1.18`), el subtotal sin IGV, el IGV del ítem y el total del ítem, cumpliendo con la estructura requerida por la SUNAT.
- **Construcción del payload JSON:** Se ensambla la estructura completa del comprobante con 30+ campos incluyendo datos del cliente, fecha de emisión (zona horaria America/Lima), moneda (Soles), porcentaje de IGV (18%), totales desglosados (gravada, IGV, total) y el detalle de ítems.
- **Autenticación:** Se utiliza el header `Authorization: Token token="TU_TOKEN"` según la documentación de Nubefact.
- **Timeout de seguridad:** Se configura un timeout de 30 segundos para evitar bloqueos en la aplicación.
- **Gestión de respuesta:** Se extraen los enlaces del PDF, XML y CDR del comprobante, así como el estado de aceptación por SUNAT y el hash del código QR.

```javascript
// Estructura JSON enviada a Nubefact (extracto)
const dataNubefact = {
  operacion: "generar_comprobante",
  tipo_de_comprobante: tipoComprobante,
  serie: venta.serie,
  numero: parseInt(venta.correlativo),
  sunat_transaction: 1, // Venta Interna
  cliente_tipo_de_documento: tipoDocCli,
  cliente_numero_de_documento: venta.cliente_documento,
  cliente_denominacion: venta.cliente_nombre,
  fecha_de_emision: fechaEmision,
  moneda: 1, // Soles
  porcentaje_de_igv: 18.00,
  total_gravada: parseFloat(venta.subtotal),
  total_igv: parseFloat(venta.igv),
  total: parseFloat(venta.total),
  enviar_automaticamente_a_la_sunat: true,
  items: itemsNubefact
};
```

**2. `emitirNotaCredito(ventaOriginal, motivo)`** — Anulación de comprobantes

Se implementó la emisión de Notas de Crédito que permite anular comprobantes previamente emitidos. El sistema:
- Identifica el tipo de Nota de Crédito según el motivo (`1 = Anulación`, `6 = Error en RUC/DNI`, `7 = Error en descripción`).
- Genera el tipo de comprobante correcto (`7 = NC Factura`, `8 = NC Boleta`).
- Referencia el documento original (serie y número del comprobante que se modifica).

**3. `emitirComunicacionBaja(ventaOriginal)`** — Comunicación de Baja a SUNAT

Se desarrolló la funcionalidad de dar de baja comprobantes ante la SUNAT mediante la operación `generar_anulacion`, cumpliendo con los requisitos normativos.

**Controlador de Facturación:**

El controlador [facturacion.controller.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/controllers/facturacion.controller.js) (186 líneas) expone los siguientes endpoints:

| Endpoint | Método | Función |
|----------|--------|---------|
| `/api/facturacion/comprobantes` | GET | Listar comprobantes emitidos con filtro por tienda y rol |
| `/api/facturacion/reenviar` | POST | Reenviar comprobantes pendientes o fallidos a Nubefact |
| `/api/facturacion/nota-credito` | POST | Emitir Nota de Crédito para anular un comprobante |
| `/api/facturacion/anular` | POST | Enviar Comunicación de Baja a SUNAT |
| `/api/facturacion/configuracion` | GET | Consultar estado de configuración de APIs |

**Interfaz de usuario — Módulo de Facturación SUNAT:**

Se desarrolló la página [FacturacionSUNAT.jsx](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/frontend/src/pages/shared/FacturacionSUNAT.jsx) (385 líneas) que permite:
- Visualizar todos los comprobantes emitidos con su estado SUNAT (Aceptado, Pendiente, Rechazado).
- Reenviar comprobantes que fallaron en el envío original.
- Emitir Notas de Crédito con ingreso de motivo.
- Enviar Comunicaciones de Baja.
- Descargar PDF, XML y CDR de los comprobantes aceptados.
- Buscar y filtrar comprobantes.

**Modo de simulación:**

Se implementó un modo de simulación (`MOCK`) que se activa automáticamente cuando no se ha configurado el token de Nubefact, permitiendo al equipo de desarrollo probar el flujo completo sin generar comprobantes reales ante la SUNAT.

#### Resultado
Se logró integrar exitosamente el sistema con la plataforma Nubefact, automatizando completamente el ciclo de facturación electrónica: emisión de Boletas y Facturas, emisión de Notas de Crédito y Comunicaciones de Baja. Los comprobantes se emiten en tiempo real al momento de registrar cada venta.

---

### Actividad 3: Optimización del rendimiento y validación de procesos del sistema

#### Descripción
En esta actividad se realizó la optimización del rendimiento del sistema de gestión de ventas, enfocándose en mejorar la eficiencia de las consultas a la base de datos y reducir los tiempos de respuesta en las operaciones principales. Se implementaron validaciones para garantizar la integridad de los datos, evitando inconsistencias en el registro de productos, ventas y comprobantes electrónicos. Asimismo, se supervisó el correcto funcionamiento de los procesos automatizados, asegurando que cada operación se ejecute de manera eficiente y sin errores. Esta actividad contribuye a mejorar la estabilidad y confiabilidad del sistema en el entorno de producción.

#### Desarrollo Técnico Realizado

**1. Optimización de la base de datos:**

- **Pool de conexiones MySQL:** Se configuró un pool de 10 conexiones simultáneas en [db.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/config/db.js), con `waitForConnections: true` y `queueLimit: 0`, permitiendo gestionar múltiples peticiones concurrentes sin agotar las conexiones disponibles.
- **Verificación de conexión al inicio:** Se implementó una verificación automática de la conexión a la base de datos al iniciar el servidor, alertando inmediatamente si MySQL no está disponible.
- **Consultas optimizadas con JOINs:** En los controladores principales se utilizan consultas SQL con `JOIN` para obtener datos relacionados en una sola consulta, en lugar de múltiples consultas secuenciales. Por ejemplo, en el controlador de inventario se realizan JOINs entre `inventario_tienda`, `productos`, `categorias`, `marcas` y `tiendas` en una sola consulta.
- **Uso de `COALESCE`:** Se implementó `COALESCE` en las consultas de agregación para evitar valores `NULL` que podrían causar errores de cálculo (ejemplo: `COALESCE(SUM(total), 0)`).
- **Índices y `FOR UPDATE`:** En la generación de correlativos se utiliza `FOR UPDATE` para bloquear el registro durante la transacción, evitando duplicados en entornos concurrentes.

**2. Seguridad y middlewares de protección:**

Se implementaron múltiples capas de seguridad en [app.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/app.js):

- **Helmet:** Protección contra vulnerabilidades web conocidas (XSS, clickjacking, MIME sniffing, etc.), configurado específicamente para el entorno HTTP con sucursales conectadas vía Tailscale.
- **Rate Limiting:** Límite de 500 peticiones por cada 15 minutos por IP, protegiendo contra ataques de fuerza bruta y DDoS.
- **CORS configurado:** Políticas de origen cruzado configuradas específicamente para los dominios permitidos.
- **Autenticación JWT:** Middleware de autenticación ([auth.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/middleware/auth.js)) que verifica tokens JSON Web Token en cada petición protegida.
- **Control de roles:** Middleware de roles ([roles.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/middleware/roles.js)) que restringe el acceso según el perfil del usuario (Administrador o Vendedor).
- **Manejador global de errores:** El middleware [errorHandler.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/middleware/errorHandler.js) captura y gestiona todos los errores no controlados, evitando caídas del servidor.

**3. Procesos automatizados (Jobs programados):**

Se implementaron 4 trabajos automáticos que se ejecutan en segundo plano mediante `node-cron`:

| Job | Archivo | Función |
|-----|---------|---------|
| Stock Bajo | [stockBajo.job.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/jobs/stockBajo.job.js) | Revisa periódicamente el inventario y genera alertas cuando el stock de un producto está por debajo del mínimo |
| Productos Estancados | [productosEstancados.job.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/jobs/productosEstancados.job.js) | Identifica productos sin movimiento de ventas durante un periodo determinado |
| Tipo de Cambio | [tipoCambio.job.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/jobs/tipoCambio.job.js) | Actualiza automáticamente el tipo de cambio USD/PEN |
| Backup Automático | [backup.job.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/jobs/backup.job.js) | Genera respaldos automáticos de la base de datos |

**4. Validación de datos en cada capa:**

- **Capa de validación:** Archivos dedicados con reglas de validación utilizando las librerías `express-validator` y `Joi` para ventas, productos, clientes y compras.
- **Capa de controlador:** Validaciones de negocio como verificar la existencia de registros, validar estados (caja abierta, comprobante no anulado), y consistencia de montos.
- **Capa de transacción:** Uso de transacciones SQL (`BEGIN TRANSACTION`, `COMMIT`, `ROLLBACK`) para garantizar atomicidad en operaciones complejas como el registro de ventas.

**5. Utilidades de cálculo:**

- [calcularIGV.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/utils/calcularIGV.js) — Función `descomponerTotal()` que calcula correctamente el subtotal, IGV y total a partir del monto bruto, según la tasa del 18%.
- [formatFecha.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/utils/formatFecha.js) — Utilidades de formato de fecha con zona horaria de Lima, Perú.
- [helpers.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/utils/helpers.js) — Funciones auxiliares para respuestas estandarizadas de la API (`ok`, `error`).
- [paginacion.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/utils/paginacion.js) — Sistema de paginación reutilizable para consultas con muchos resultados.

#### Resultado
Se logró optimizar el rendimiento del sistema mediante el uso eficiente de conexiones a la base de datos, consultas SQL optimizadas con JOINs y COALESCE, y la implementación de múltiples capas de seguridad. Los procesos automatizados garantizan el monitoreo continuo del inventario y la generación de respaldos sin intervención humana.

---

### Actividad 4: Desarrollo de módulos de análisis estadístico de ventas

#### Descripción
En esta actividad se realizó el desarrollo de funcionalidades orientadas al análisis estadístico de las ventas realizadas en JD Store S.C.R.L. Se implementaron reportes que permiten visualizar el comportamiento de las ventas en distintos periodos de tiempo, tales como ventas diarias, semanales y mensuales. Asimismo, se desarrollaron indicadores clave como el total de ingresos generados y la identificación de los productos más vendidos. Esta actividad permite transformar los datos registrados en el sistema en información útil para la toma de decisiones dentro de la empresa.

#### Desarrollo Técnico Realizado

**1. Controlador de Estadísticas:**

Se desarrolló el controlador [estadisticas.controller.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/controllers/estadisticas.controller.js) (166 líneas) que provee los siguientes indicadores estadísticos:

**Indicadores del Dashboard:**

| Indicador | Consulta SQL | Descripción |
|-----------|-------------|-------------|
| Resumen del día | `SELECT COUNT(*), SUM(total), SUM(igv), SUM(costo_total), SUM(utilidad) FROM ventas WHERE DATE(fecha) = ?` | Cantidad de ventas, ingresos totales, IGV, costo y utilidad del día actual |
| Resumen del mes | Misma estructura con rango `BETWEEN inicio AND fin` | Estadísticas acumuladas del mes en curso |
| Alertas de stock | `SELECT COUNT(*) FROM inventario_tienda WHERE stock <= stock_minimo` | Cantidad de productos con stock bajo el mínimo |
| Ventas de la semana | Agrupación `GROUP BY DATE(fecha)` con intervalo de 7 días | Datos para gráfico de barras: ingresos vs utilidad por día |
| Top 5 productos | `JOIN detalle_venta, ventas, productos` con `ORDER BY unidades_vendidas DESC LIMIT 5` | Los 5 productos con mayor rotación del mes |
| Ventas por comprobante | `GROUP BY tipo_comprobante` | Desglose de ventas por Boleta, Factura y Nota de Venta |
| Total de clientes | `SELECT COUNT(*) FROM clientes WHERE estado = 1` | Cantidad total de clientes activos |

**Análisis por categoría — `ventasPorCategoria()`:**

Desarrollado para identificar qué categorías de productos generan más ingresos:
```sql
SELECT c.nombre_categoria,
       SUM(dv.cantidad) AS unidades,
       SUM(dv.subtotal) AS total,
       SUM(COALESCE(dv.costo_unitario, 0) * dv.cantidad) AS costo
FROM detalle_venta dv
JOIN ventas v ON v.id_venta = dv.id_venta
JOIN productos p ON p.id_producto = dv.id_producto
JOIN categorias c ON c.id_categoria = p.id_categoria
WHERE DATE(v.fecha) BETWEEN ? AND ? AND v.id_tienda = ?
GROUP BY c.id_categoria, c.nombre_categoria
ORDER BY total DESC
```

**Productos sin movimiento — `productosSinMovimiento()`:**

Identifica productos que llevan más de N días sin venderse, calculando los `días_sin_venta` para cada producto:
```sql
SELECT p.nombre, it.stock,
       DATEDIFF(NOW(), uv.ultima_venta) AS dias_sin_venta
FROM inventario_tienda it
LEFT JOIN (
  SELECT dv.id_producto, MAX(v.fecha) AS ultima_venta
  FROM detalle_venta dv JOIN ventas v ON v.id_venta = dv.id_venta
  GROUP BY dv.id_producto
) uv ON uv.id_producto = p.id_producto
WHERE (uv.ultima_venta IS NULL OR DATEDIFF(NOW(), uv.ultima_venta) >= ?)
```

**2. Controlador de Reportes:**

El controlador [reportes.controller.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/controllers/reportes.controller.js) (142 líneas) implementa un sistema de reportes con 5 periodos:

| Reporte | Endpoint | Descripción |
|---------|----------|-------------|
| Diario | `GET /api/reportes/diario?fecha=2026-10-29` | Reporte de un día específico |
| Semanal | `GET /api/reportes/semanal` | Reporte de la semana actual (lunes a domingo) |
| Mensual | `GET /api/reportes/mensual?anio=2026&mes=10` | Reporte de un mes específico |
| Anual | `GET /api/reportes/anual?anio=2026` | Reporte del año completo |
| Personalizado | `GET /api/reportes/personalizado?inicio=...&fin=...` | Reporte con rango de fechas libre |

Cada reporte incluye:
- **Resumen de ventas:** Cantidad, total, IGV, subtotal y utilidad.
- **Resumen de compras:** Cantidad y total de compras realizadas.
- **Ganancia calculada:** Utilidad total del período.
- **Detalle de cada venta:** Con información del comprobante, cliente, vendedor y método de pago.
- **Desglose por método de pago:** Totales por Efectivo, Yape, Plin, Transferencia, y pagos mixtos.
- **Movimientos de caja:** Entradas y salidas de efectivo del período.

**Soporte para reportes multi-tienda:**

Los reportes soportan el parámetro `id_tienda = 'general'` o `id_tienda = '0'` para generar reportes consolidados de todas las tiendas, eliminando dinámicamente las condiciones de filtro por tienda en las consultas SQL.

**3. Ventas diarias — Endpoint adicional:**

Se implementó el endpoint `GET /api/ventas/diarias` en [ventas.controller.js](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/backend/src/controllers/ventas.controller.js#L394-L411) que genera un resumen rápido de ventas del día agrupado por tipo de comprobante.

#### Resultado
Se desarrollaron módulos completos de análisis estadístico que transforman los datos de ventas en indicadores clave de rendimiento (KPIs): ingresos diarios/mensuales, utilidad, top productos, ventas por categoría, productos estancados y reportes por cualquier periodo de tiempo, con soporte multi-tienda.

---

### Actividad 5: Implementación de dashboard de estadísticas y visualización de datos

#### Descripción
En esta actividad se realizó la implementación de un panel de control (dashboard) que permite la visualización gráfica de las estadísticas de ventas generadas por el sistema. Se integran gráficos de barras y líneas que representan la evolución de las ventas en el tiempo, facilitando la interpretación de la información por parte de los usuarios. El dashboard se incorpora dentro del sistema de gestión, permitiendo al administrador acceder de manera rápida a los indicadores más relevantes del negocio. Esta actividad mejora la capacidad de análisis y control de la empresa sobre sus operaciones comerciales.

#### Desarrollo Técnico Realizado

**1. Dashboard Operativo:**

Se desarrolló el componente [Dashboard.jsx](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/frontend/src/pages/admin/Dashboard.jsx) (169 líneas) que presenta un panel de control en tiempo real con las siguientes secciones:

**Tarjetas KPI (Indicadores Clave de Rendimiento):**

Se implementaron 8 tarjetas estadísticas organizadas en dos filas, utilizando el componente reutilizable `StatCard`:

*Fila 1:*
- **Ventas hoy** — Cantidad de comprobantes emitidos en el día (ícono: ShoppingCart, color: rojo).
- **Ingresos hoy** — Monto total de ventas del día con IGV incluido (ícono: DollarSign, color: rojo).
- **IGV hoy** — Monto de IGV a pagar a SUNAT del día (ícono: TrendingUp, color: amarillo).
- **Alertas stock** — Cantidad de productos con stock bajo el mínimo; cambia de color dinámicamente (verde si es 0, rojo si hay alertas) (ícono: AlertTriangle).

*Fila 2:*
- **Utilidad hoy** — Ganancia neta del día (ingresos - costo - IGV) (ícono: TrendingUp, color: verde).
- **Ingresos del mes** — Ventas acumuladas del mes con cantidad de operaciones (ícono: DollarSign, color: rojo).
- **Utilidad del mes** — Ganancia neta acumulada del mes con porcentaje de margen (ícono: TrendingUp, color: verde).
- **Costo del mes** — Costo total de las ventas del mes (ícono: TrendingDown, color: rojo).

**Gráfico de Barras — Ingresos vs Utilidad (7 días):**

Se implementó un gráfico de barras utilizando la librería **Recharts** (`BarChart`, `Bar`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer`) que muestra:
- **Barras rojas:** Ingresos totales por día.
- **Barras verdes:** Utilidad por día.
- **Eje X:** Fechas de los últimos 7 días.
- **Eje Y:** Montos en miles de soles (`S/Xk`).
- **Tooltip interactivo:** Al pasar el cursor muestra el monto exacto formateado en moneda.
- **Diseño responsivo:** Se adapta automáticamente al ancho del contenedor.

```jsx
<BarChart data={ventasSemana}>
  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
  <XAxis dataKey="dia" />
  <YAxis tickFormatter={v => `S/${(v/1000).toFixed(0)}k`} />
  <Tooltip formatter={(v, n) => [formatMoneda(v), n === 'total' ? 'Ingreso' : 'Utilidad']} />
  <Bar dataKey="total" fill="#dc2626" radius={[6,6,0,0]} barSize={18} />
  <Bar dataKey="utilidad" fill="#10b981" radius={[6,6,0,0]} barSize={18} />
</BarChart>
```

**Gráfico Circular (Pie Chart) — Ventas por Categoría:**

Se implementó un gráfico de dona (`PieChart` con `innerRadius` y `outerRadius`) que muestra la distribución de ventas por categoría de producto en el mes actual, con:
- **Paleta de colores personalizada:** 6 colores diferenciados (`#dc2626`, `#f97316`, `#eab308`, `#6366f1`, `#8b5cf6`, `#64748b`).
- **Etiquetas de porcentaje:** Cada segmento muestra su porcentaje del total.
- **Tooltip con moneda:** Muestra el monto en soles al pasar el cursor.

**Tabla de Top 5 Productos:**

Se muestra una tabla con los 5 productos de mayor rotación del mes, incluyendo para cada uno:
- Posición (#1 al #5) con badge visual.
- Nombre del producto.
- Unidades vendidas.
- Ingreso total generado.
- Costo total.
- Utilidad y porcentaje de margen.

**2. Módulo de Reportes con Visualización:**

Se desarrolló la página [Reportes.jsx](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/frontend/src/pages/admin/Reportes.jsx) (536 líneas) que proporciona:

- **Selector de tipo de reporte:** Diario, Semanal, Mensual, Anual y Personalizado.
- **Selector de tienda:** Filtro para ver reportes por tienda individual o consolidado general.
- **Tarjetas de resumen:** Cantidad de ventas, total de ventas, total de compras, IGV y ganancia del período.
- **Gráfico de barras por método de pago:** Distribución de pagos por Efectivo, Yape, Plin, Transferencia, etc.
- **Gráfico circular por tipo de comprobante:** Distribución de ventas por Boleta, Factura y Nota de Venta.
- **Tabla detallada de ventas:** Con filas expandibles que muestran los productos de cada venta, incluyendo números de serie.
- **Exportación a CSV:** Botón para descargar el reporte en formato CSV, con todas las columnas relevantes.

**Actualización automática:**

El dashboard se actualiza automáticamente cada 5 minutos (`refetchInterval: 1000 * 60 * 5`) mediante React Query, garantizando que la información mostrada esté siempre actualizada sin necesidad de refrescar la página.

**Contexto de tienda:**

Se utiliza el hook `useTienda()` del contexto [TiendaContext.jsx](file:///c:/Users/MARLON/Music/PROYECTOJDSTORE/frontend/src/context/TiendaContext.jsx) para filtrar los datos según la tienda seleccionada por el administrador.

#### Resultado
Se implementó exitosamente un dashboard operativo completo con visualización gráfica en tiempo real, incluyendo gráficos de barras (Recharts), gráficos circulares, tarjetas KPI y tablas interactivas. Los administradores pueden monitorear el rendimiento del negocio de manera visual e intuitiva, con datos que se actualizan automáticamente cada 5 minutos.

---

## 3.4. Conclusiones

- La integración de los módulos del sistema permitió establecer una comunicación eficiente entre las áreas de inventario, ventas y facturación electrónica, garantizando un flujo de trabajo continuo y sin interrupciones dentro del sistema de gestión de ventas de JD Store S.C.R.L. Se implementaron 25 módulos de rutas interconectados con transacciones de base de datos que aseguran la integridad referencial en todas las operaciones.

- La implementación de la facturación electrónica mediante API permitió automatizar la emisión de comprobantes, reduciendo significativamente el tiempo de registro manual y asegurando el cumplimiento de las normativas establecidas por la SUNAT. Se integraron tres funcionalidades principales: emisión de comprobantes (Boletas y Facturas), emisión de Notas de Crédito y Comunicaciones de Baja, todas conectadas con la plataforma Nubefact en tiempo real.

- La optimización del rendimiento del sistema contribuyó a mejorar la velocidad de respuesta en las operaciones, garantizando una experiencia de uso eficiente y estable para los usuarios del sistema. Se implementó un pool de 10 conexiones MySQL, consultas SQL optimizadas con JOINs, múltiples capas de seguridad (Helmet, Rate Limiting, JWT, Control de Roles) y 4 procesos automatizados que monitorizan el inventario, tipo de cambio y respaldos de manera continua.

- El desarrollo de módulos de análisis estadístico permitió transformar los datos de ventas en información relevante, facilitando la toma de decisiones estratégicas dentro de la empresa. Se implementaron reportes en 5 periodos (diario, semanal, mensual, anual y personalizado) con soporte multi-tienda, indicadores de utilidad, desglose por método de pago y análisis de productos sin movimiento.

- La implementación del dashboard de estadísticas proporcionó una herramienta visual que permite el monitoreo continuo del comportamiento de las ventas, fortaleciendo el control y la gestión del negocio. El panel incluye 8 tarjetas KPI, gráfico de barras de ingresos vs utilidad, gráfico circular por categoría, tabla de top productos y actualización automática cada 5 minutos.

---

## 3.5. Sugerencias

- Se recomienda continuar mejorando los módulos de análisis estadístico, incorporando nuevos indicadores que permitan una evaluación más detallada del comportamiento del negocio, como análisis de rentabilidad por cliente, estacionalidad de ventas y comparaciones interanuales.

- Se sugiere implementar funcionalidades de predicción de ventas en futuras versiones del sistema, con el objetivo de anticipar la demanda de productos, utilizando técnicas de análisis de tendencias y series temporales basadas en los datos históricos almacenados.

- Se recomienda realizar actualizaciones periódicas al sistema para mejorar el rendimiento y adaptarlo a nuevas necesidades de la empresa, incluyendo la migración a versiones más recientes de las dependencias (Express v5, React 19) y la implementación de pruebas automatizadas (Jest, Cypress).

- Se sugiere evaluar la integración con otros sistemas empresariales, como sistemas contables (CONCAR, SISCONT), para ampliar las capacidades del sistema de gestión y centralizar la información financiera de la empresa.

- Se recomienda implementar un sistema de notificaciones en tiempo real (WebSockets) para alertar a los administradores sobre eventos críticos como stock agotado, ventas de alto valor o errores en la facturación electrónica.

---

## Resumen Tecnológico del Sistema

| Componente | Tecnología | Versión |
|------------|-----------|---------|
| Backend API | Node.js + Express | v4.18 |
| Frontend SPA | React + Vite | React 18, Vite 5 |
| Base de datos | MySQL | Con pool de conexiones |
| Autenticación | JSON Web Token (JWT) | v9.0 |
| Facturación electrónica | Nubefact API | Integración completa |
| Gráficos | Recharts | v2.10 |
| Estado del servidor | TanStack React Query | v5.17 |
| Validación | Express Validator + Joi | v7.0 / v17.12 |
| Seguridad | Helmet + Rate Limit | v8.1 / v8.4 |
| Estilos | Tailwind CSS | v3.4 |
| Gestión de rutas | React Router DOM | v6.22 |
| Tareas programadas | node-cron | v3.0 |
| Notificaciones UI | react-hot-toast | v2.4 |

---

> **Sistema desarrollado para JD Store S.C.R.L. — Juliaca, Puno, Perú**  
> **Versión 2.0.0 — Octubre 2026**
