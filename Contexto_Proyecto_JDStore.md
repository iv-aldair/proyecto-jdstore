# CONTEXTO GENERAL DEL PROYECTO
## Sistema de Gestión de Ventas e Inventario — JD Store S.C.R.L.

---

## 1. ¿Qué es JD Store?

**JD Store** es un sistema web integral de gestión de ventas, inventario y facturación electrónica desarrollado para la empresa **JD Store S.C.R.L.**, una tienda dedicada a la comercialización de productos tecnológicos (celulares, laptops, accesorios, equipos de cómputo y servicios técnicos) ubicada en la ciudad de **Juliaca, departamento de Puno, Perú**.

El sistema fue desarrollado como una aplicación web de tipo **SPA (Single Page Application)** con arquitectura **cliente-servidor**, que permite gestionar todas las operaciones comerciales del negocio desde cualquier dispositivo con navegador web, incluyendo la conexión entre múltiples sucursales a través de la red privada Tailscale.

---

## 2. ¿Qué problema resuelve?

### Problemática identificada

Antes de la implementación del sistema, JD Store S.C.R.L. enfrentaba las siguientes dificultades en su operación diaria:

- **Gestión manual del inventario:** El control de stock se realizaba de forma manual o en hojas de cálculo, lo que generaba errores frecuentes en el conteo de productos, pérdida de mercadería y desconocimiento del stock real disponible en cada sucursal.

- **Facturación manual y lenta:** La emisión de comprobantes electrónicos (Boletas y Facturas) se realizaba de forma manual a través de plataformas externas, consumiendo tiempo del vendedor en cada transacción y generando riesgos de errores en los datos enviados a la SUNAT.

- **Falta de información para la toma de decisiones:** No existía un sistema que consolidara los datos de ventas en reportes o indicadores, lo que impedía al dueño conocer la rentabilidad real del negocio, los productos más vendidos, la utilidad diaria/mensual o el desempeño de cada sucursal.

- **Descontrol en el flujo de caja:** No se llevaba un registro formal de la apertura y cierre de caja diarios, dificultando la detección de faltantes de dinero y el control del efectivo manejado por cada vendedor.

- **Falta de trazabilidad de productos con número de serie:** Los productos tecnológicos requieren control por número de serie (IMEI para celulares, S/N para laptops), y la gestión manual no permitía rastrear qué número de serie se vendió a qué cliente, lo cual es crucial para garantías y reclamos.

- **Imposibilidad de operar en múltiples tiendas de forma coordinada:** Al tener más de una sucursal, no existía un sistema que unificara el inventario, las ventas y los reportes de todas las tiendas en un solo lugar.

### Solución implementada

El sistema JD Store resuelve todas estas problemáticas mediante una plataforma web unificada que:

1. **Automatiza el proceso de venta completo:** Desde la búsqueda del producto, la selección del cliente, el cálculo del IGV, el descuento de stock, hasta la emisión automática del comprobante electrónico ante la SUNAT, todo en una sola operación.

2. **Centraliza el inventario de múltiples sucursales:** Permite gestionar el stock de cada tienda de forma independiente, con alertas automáticas de stock bajo y seguimiento de productos por número de serie.

3. **Automatiza la facturación electrónica:** Integración directa con la plataforma Nubefact para emitir Boletas, Facturas, Notas de Crédito y Comunicaciones de Baja en tiempo real, cumpliendo con las normativas de la SUNAT.

4. **Genera reportes e indicadores en tiempo real:** Dashboard operativo con KPIs (ventas del día, utilidad, IGV, alertas), gráficos interactivos y reportes exportables a CSV para cualquier periodo de tiempo.

5. **Controla el flujo de caja:** Sistema de apertura/cierre de caja con registro de movimientos (ingresos y egresos), cálculo automático de descuadres y supervisión centralizada por el administrador.

6. **Garantiza la trazabilidad completa:** Cada venta queda vinculada al cliente, vendedor, tienda, productos (con números de serie), comprobante electrónico y método de pago.

---

## 3. ¿Para quién está hecho?

El sistema fue diseñado para dos tipos de usuarios con roles diferenciados:

### Rol 1: Administrador (Dueño / Gerente)

El administrador tiene acceso completo a todos los módulos del sistema. Sus funciones principales incluyen:

| Módulo | Descripción |
|--------|-------------|
| **Dashboard** | Panel de control con KPIs en tiempo real: ventas del día/mes, utilidad, IGV, alertas de stock, top productos |
| **Productos** | Registro y edición de productos: nombre, modelo, categoría, marca, precios (costo en USD/PEN, venta en PEN), margen |
| **Categorías y Marcas** | Gestión del catálogo de categorías (Celulares, Laptops, Accesorios, etc.) y marcas (Samsung, Apple, Xiaomi, etc.) |
| **Inventario** | Control de stock por tienda: ajustes, stock mínimo, costos, asignación de productos a sucursales, inventario global |
| **Ventas** | Historial completo de ventas con filtros por fecha, tipo de comprobante y tienda |
| **POS** | Punto de Venta completo para realizar ventas directamente |
| **Reportes** | Reportes diarios, semanales, mensuales, anuales y personalizados con exportación a CSV |
| **Facturación SUNAT** | Gestión de comprobantes electrónicos: estado SUNAT, reenvío, Notas de Crédito, Comunicaciones de Baja |
| **Control de Cajas** | Supervisión de todas las cajas abiertas/cerradas por los vendedores en todas las sucursales |
| **Usuarios** | Gestión de cuentas de vendedores y administradores |
| **Tiendas** | Administración de sucursales (nombre, dirección, RUC) |
| **Clientes** | Base de datos de clientes con consulta automática DNI/RUC |
| **Proformas** | Cotizaciones para clientes (sin afectar inventario ni caja) |
| **Guías de Remisión** | Documentos de traslado de mercadería entre sucursales |
| **Deudas Externas** | Control de deudas con otras tiendas por productos en consignación |
| **Cuentas por Cobrar** | Gestión de créditos otorgados a clientes |
| **Servicios Técnicos** | Registro de reparaciones y servicios técnicos |
| **Alertas** | Notificaciones de stock bajo y productos estancados |
| **Backups** | Respaldos manuales y automáticos de la base de datos |
| **Configuración** | Parámetros generales del sistema |

### Rol 2: Vendedor (Cajero / Empleado)

El vendedor tiene acceso limitado a los módulos necesarios para su operación diaria:

| Módulo | Descripción |
|--------|-------------|
| **POS (Punto de Venta)** | Pantalla principal: buscar productos, armar carrito, asignar cliente, seleccionar comprobante y método de pago, cobrar |
| **Mi Caja** | Apertura/cierre de su caja personal, registro de ingresos y egresos manuales |
| **Mis Ventas** | Historial de sus propias ventas del día |
| **Consulta de Stock** | Ver disponibilidad de productos en su tienda |
| **Clientes** | Registrar y buscar clientes por DNI/RUC |
| **Proformas** | Generar cotizaciones para clientes |
| **Facturación SUNAT** | Ver estado de los comprobantes que ha emitido |
| **Servicios Técnicos** | Registrar servicios técnicos como venta |
| **Cuentas por Cobrar** | Ver créditos pendientes |

---

## 4. Módulos funcionales del sistema

### 4.1. Punto de Venta (POS)

El módulo POS es el corazón operativo del sistema. Implementado en 760 líneas de código React, permite:

- **Búsqueda inteligente de productos** por nombre, código o modelo con autocompletado.
- **Carrito de compras persistente** que se guarda en localStorage para no perder la venta si se recarga la página.
- **Control de números de serie:** Al agregar un producto con series, el vendedor selecciona el número de serie exacto que está entregando.
- **Múltiples tipos de comprobante:** Boleta (serie BBB1), Factura (serie FFF1) y Nota de Venta (serie NV01).
- **7 métodos de pago:** Efectivo, Yape, Plin, POS Visa, POS MasterCard, Transferencia bancaria y Pago Mixto (combinación de varios).
- **Descuentos por ítem y descuento global.**
- **Productos externos (consignación):** Permite vender productos de otra tienda, generando automáticamente la deuda externa correspondiente.
- **Servicios técnicos:** Permite cobrar reparaciones e instalaciones directamente desde el POS.
- **Consulta automática de DNI/RUC** mediante integración con APIs públicas peruanas.
- **Cálculo automático de IGV (18%)** para Boletas y Facturas.
- **Emisión automática del comprobante** a través de Nubefact al finalizar la venta.

### 4.2. Inventario Multi-Tienda

- Gestión de stock independiente por cada sucursal.
- Alertas automáticas cuando el stock está por debajo del mínimo configurado.
- Ajustes de stock: entradas (compras, devoluciones) y salidas (mermas, transferencias).
- Precios de costo en soles (PEN) y dólares (USD), con conversión automática usando tipo de cambio del BCRP.
- Cálculo automático de margen de ganancia.
- Asignación y desasignación de productos a tiendas específicas.
- Inventario global consolidado de todas las sucursales.

### 4.3. Facturación Electrónica (SUNAT)

- Integración completa con la API de **Nubefact** para emisión de comprobantes electrónicos.
- Emisión automática de **Boletas de Venta** y **Facturas** al momento de registrar la venta.
- Emisión de **Notas de Crédito** para anular comprobantes.
- **Comunicaciones de Baja** para dar de baja comprobantes ante la SUNAT.
- Descarga de **PDF, XML y CDR** de cada comprobante.
- **Reenvío de comprobantes fallidos** (por caída de internet u otros errores).
- Estado en tiempo real de cada comprobante: Aceptado, Pendiente, Rechazado, Anulado.
- Modo de simulación para pruebas sin generar comprobantes reales.

### 4.4. Control de Caja

- **Apertura de caja** con monto inicial al comenzar el turno.
- Registro de **movimientos manuales** durante el día: ingresos (cobro de deudas, dinero extra) y egresos (pago de servicios, compra de suministros).
- **Cierre de caja** al terminar el turno: el sistema calcula el monto esperado y compara con el monto real declarado por el vendedor, determinando si hay faltante o sobrante.
- **Control centralizado** por el administrador: puede ver todas las cajas de todas las tiendas y vendedores.

### 4.5. Reportes y Estadísticas

- **Reportes por periodo:** Diario, Semanal, Mensual, Anual y Personalizado (rango de fechas libre).
- **Indicadores incluidos:** Cantidad de ventas, total de ingresos, IGV, subtotal, utilidad neta, total de compras.
- **Desglose por método de pago:** Totales por Efectivo, Yape, Plin, POS, Transferencia y pagos mixtos.
- **Detalle de cada venta:** Expandible para ver los productos vendidos con sus series.
- **Exportación a CSV** para análisis en Excel.
- **Soporte multi-tienda:** Reportes por tienda individual o consolidado general.

### 4.6. Dashboard Operativo

- **8 tarjetas KPI:** Ventas hoy, Ingresos hoy, IGV hoy, Alertas de stock, Utilidad hoy, Ingresos del mes, Utilidad del mes, Costo del mes.
- **Gráfico de barras:** Ingresos vs Utilidad de los últimos 7 días.
- **Gráfico circular (dona):** Distribución de ventas por categoría de producto.
- **Tabla Top 5 productos:** Los más vendidos del mes con unidades, ingreso, costo, utilidad y margen.
- **Actualización automática** cada 5 minutos.

### 4.7. Proformas (Cotizaciones)

- Generación de cotizaciones para clientes sin afectar inventario ni caja.
- Misma interfaz que el POS para facilitar el uso.
- Impresión en formato ticket o PDF A4 para envío por WhatsApp.

### 4.8. Guías de Remisión

- Documentos de traslado de mercadería entre sucursales.
- Registro del transportista, vehículo, puntos de origen y destino.
- Impresión de guía en formato oficial.

### 4.9. Procesos Automatizados (Background Jobs)

- **Alertas de stock bajo:** Revisión periódica del inventario y generación de alertas.
- **Productos estancados:** Identificación de productos sin movimiento de ventas.
- **Tipo de cambio automático:** Sincronización del tipo de cambio USD/PEN desde el BCRP.
- **Backup automático:** Respaldo nocturno de la base de datos.

---

## 5. Arquitectura técnica

### Stack tecnológico

| Capa | Tecnología | Rol |
|------|-----------|-----|
| **Frontend** | React 18 + Vite 5 | Interfaz de usuario (SPA) |
| **Backend** | Node.js + Express 4.18 | API REST |
| **Base de datos** | MySQL | Almacenamiento relacional |
| **Facturación** | Nubefact API | Emisión de comprobantes SUNAT |
| **Autenticación** | JSON Web Token (JWT) | Sesiones seguras |
| **Gráficos** | Recharts 2.10 | Visualización de datos |
| **Estado servidor** | TanStack React Query 5 | Cache y sincronización de datos |
| **Estilos** | Tailwind CSS 3.4 | Diseño responsivo |
| **Iconos** | Lucide React | Iconografía moderna |
| **Rutas** | React Router DOM 6.22 | Navegación SPA |
| **Notificaciones** | react-hot-toast | Mensajes al usuario |
| **Tareas programadas** | node-cron | Jobs en segundo plano |
| **Seguridad** | Helmet + express-rate-limit | Protección web |
| **Validación** | express-validator + Joi | Validación de datos |
| **Red multi-sede** | Tailscale | Conexión entre sucursales |

### Estructura del proyecto

```
PROYECTOJDSTORE/
├── backend/                    # API REST (Node.js + Express)
│   ├── src/
│   │   ├── app.js              # Servidor principal
│   │   ├── config/             # Configuración (DB, CORS, ENV)
│   │   ├── controllers/        # 25 controladores de lógica de negocio
│   │   ├── routes/             # 25 archivos de rutas API
│   │   ├── services/           # 10 servicios (Nubefact, email, reportes, etc.)
│   │   ├── middleware/         # Auth JWT, roles, manejo de errores
│   │   ├── validations/        # Validación de datos (ventas, productos, clientes)
│   │   ├── jobs/               # 4 tareas programadas automáticas
│   │   ├── models/             # Modelos de datos
│   │   └── utils/              # Utilidades (IGV, fechas, paginación)
│   └── database/               # Scripts SQL y migraciones
│
└── frontend/                   # SPA (React + Vite)
    └── src/
        ├── pages/
        │   ├── admin/          # 20 páginas del administrador
        │   ├── vendedor/       # 6 páginas del vendedor
        │   ├── shared/         # 3 páginas compartidas
        │   └── auth/           # Login y cambio de contraseña
        ├── components/         # Componentes reutilizables (UI, layout, charts)
        ├── context/            # Contextos React (Auth, Tienda)
        ├── api/                # Módulos de comunicación con la API
        ├── hooks/              # Hooks personalizados
        ├── router/             # Enrutamiento con protección por roles
        └── utils/              # Utilidades del frontend
```

---

## 6. Flujo operativo diario

El sistema soporta el siguiente flujo de trabajo diario en la tienda:

```
1. INICIO DEL DÍA
   └─ El vendedor inicia sesión → Se redirige al POS
   └─ Abre su caja con el monto inicial en efectivo

2. OPERACIÓN DURANTE EL DÍA
   └─ Busca productos → Los agrega al carrito → Asigna cliente
   └─ Selecciona tipo de comprobante (Boleta/Factura/Nota de Venta)
   └─ Selecciona método de pago (Efectivo, Yape, Mixto, etc.)
   └─ Cobra la venta
       ├─ Se descuenta automáticamente el stock
       ├─ Se vinculan los números de serie vendidos
       ├─ Se calcula la utilidad (ingreso - costo - IGV)
       ├─ Se emite el comprobante electrónico a SUNAT (Nubefact)
       └─ Se registra el movimiento en la caja
   └─ Registra movimientos manuales (egresos por servicios, ingresos extras)
   └─ Genera proformas/cotizaciones para clientes que consultan precios

3. FIN DEL DÍA
   └─ El vendedor cierra su caja → Declara monto real en gaveta
   └─ El sistema calcula el descuadre (sobrante o faltante)

4. SUPERVISIÓN (ADMINISTRADOR)
   └─ Revisa el Dashboard: KPIs, gráficos, alertas
   └─ Genera reportes del día/semana/mes
   └─ Supervisa las cajas de todos los vendedores y tiendas
   └─ Gestiona comprobantes fallidos en Facturación SUNAT
   └─ Revisa alertas de stock bajo y productos estancados
   └─ Toma decisiones basadas en datos reales
```

---

## 7. Alcance y cobertura

| Aspecto | Detalle |
|---------|---------|
| **Tipo de empresa** | Tienda de tecnología (celulares, laptops, accesorios, servicios técnicos) |
| **Ubicación** | Juliaca, Puno, Perú |
| **Razón social** | JD Store S.C.R.L. |
| **Multi-sucursal** | Sí, soporta múltiples tiendas conectadas por red Tailscale |
| **Usuarios** | Administradores (dueños/gerentes) y Vendedores (cajeros/empleados) |
| **Comprobantes** | Boleta de Venta, Factura, Nota de Venta, Nota de Crédito, Comunicación de Baja |
| **Normativa tributaria** | Cumple con SUNAT — facturación electrónica obligatoria |
| **Moneda** | Soles peruanos (PEN), con soporte de costos en USD y tipo de cambio automático |
| **IGV** | Cálculo automático al 18% según normativa peruana |
| **Control de series** | IMEI de celulares, números de serie de laptops y equipos |
| **Métodos de pago** | Efectivo, Yape, Plin, POS Visa, POS MasterCard, Transferencia, Mixto |
| **Versión del sistema** | 2.0.0 |

---

> **JD Store v2.0.0** — Sistema de gestión integral desarrollado para optimizar las operaciones comerciales de JD Store S.C.R.L., una tienda de tecnología ubicada en Juliaca, Puno, Perú. El sistema automatiza la gestión de ventas, inventario, facturación electrónica, control de caja y análisis de datos, permitiendo al negocio operar de manera eficiente, cumplir con las normativas tributarias de la SUNAT y tomar decisiones basadas en información real y actualizada.
