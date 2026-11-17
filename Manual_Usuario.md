# Manual de Usuario - JD Store
**Sistema de Gestión y Punto de Venta (POS) - Juliaca**

Bienvenido al manual de usuario del sistema de gestión **JD Store**. Este documento explica paso a paso cómo utilizar las diferentes funcionalidades del sistema, diseñado para optimizar el control de ventas, inventario, facturación electrónica y gestión de cajas en tu negocio.

---

## Índice
1. [Acceso al Sistema](#1-acceso-al-sistema)
2. [Punto de Venta (POS)](#2-punto-de-venta-pos)
3. [Gestión de Inventario](#3-gestión-de-inventario)
4. [Administración de Caja](#4-administración-de-caja)
5. [Facturación Electrónica (SUNAT)](#5-facturación-electrónica-sunat)
6. [Módulo de Proformas](#6-módulo-de-proformas)
7. [Reportes y Dashboard](#7-reportes-y-dashboard)

---

## 1. Acceso al Sistema

### Iniciar Sesión
1. Ingresa a la URL del sistema.
2. En la pantalla de inicio, introduce tu **Correo electrónico** y **Contraseña**.
3. Haz clic en **Ingresar**.
4. Dependiendo de tu rol (Administrador o Vendedor), el sistema te redirigirá a tu pantalla principal correspondiente (Dashboard para Administradores o POS para Vendedores).

---

## 2. Punto de Venta (POS)
El módulo POS (Point of Sale) es el corazón de las ventas diarias.

### 2.1. Buscar y Agregar Productos
- **Buscador:** En la barra "Buscar producto", puedes escribir el nombre, código o modelo. Presiona sobre el resultado para agregarlo al carrito.
- **Servicios Técnicos:** Usa el botón morado con icono de herramienta (`Añadir Servicio Técnico`) para cobrar reparaciones o instalaciones.
- **Productos Externos:** Si vendes un producto de otra tienda (consignación), usa el botón naranja (`Añadir producto de otra tienda`) ingresando su nombre, costo y precio de venta.

### 2.2. Gestionar el Carrito
- En la lista de productos agregados, puedes modificar la **cantidad** usando los botones `+` o `-`.
- Puedes editar el **precio de venta unitario** directamente en la casilla si necesitas aplicar un descuento manual.
- Si el producto requiere control por **Número de Serie (S/N)**, aparecerá una lista desplegable debajo del producto para que selecciones el S/N exacto que estás entregando.

### 2.3. Asignar Cliente
- En el recuadro "DNI / RUC", ingresa el número de documento del cliente y presiona la lupa o `Enter`.
- El sistema buscará automáticamente (gracias a la integración con bases de datos públicas) y autocompletará el nombre/razón social.

### 2.4. Finalizar Venta
1. **Comprobante:** Selecciona si emitirás *Boleta*, *Factura* o *Nota de Venta*.
2. **Método de Pago:** Elige cómo paga el cliente (Efectivo, Yape, Plin, POS Visa, Transferencia).
3. **Pago Mixto:** Si el cliente paga una parte en efectivo y otra con Yape, selecciona "Mixto" e ingresa el monto exacto en cada método de pago.
4. Haz clic en el botón azul **Cobrar**. Se registrará la venta y aparecerá un botón para ver/imprimir el comprobante o ticket.

---

## 3. Gestión de Inventario
*Módulo disponible principalmente para Administradores.*

### 3.1. Consulta y Edición Rápida
- Ve al menú **Inventario**.
- Podrás ver una lista de todos los productos y su stock actual.
- **Edición en línea:** Haz clic en el icono de lápiz (✏️) al lado de un producto para editar rápidamente su:
  - Precio de costo
  - Precio de venta
  - Stock actual
  - Stock mínimo (para alertas)

### 3.2. Gestión de Series (S/N)
- Para artículos electrónicos o con garantía, haz clic en el icono de código de barras.
- Se abrirá un panel donde puedes escanear (pistola de código de barras) o tipear los números de serie ingresantes.
- El stock del producto se ajustará automáticamente según las series disponibles.

### 3.3. Asignación a Tiendas
- Si manejas múltiples sucursales, usa el botón "Asignar a tiendas".
- Selecciona una tienda y marca qué productos de la base de datos global estarán disponibles para venderse en esa sucursal en específico.

---

## 4. Administración de Caja
Tanto administradores como vendedores deben gestionar su caja diaria.

### 4.1. Apertura de Caja
- Al iniciar el turno, ve al menú **Caja** (o Mi Caja).
- Ingresa el "Monto Inicial" (sencillo con el que empiezas) y haz clic en "Abrir Caja".

### 4.2. Movimientos
Durante el día puedes registrar movimientos manuales que no sean ventas:
- **Ingresos:** Cobro de deudas, dinero extra.
- **Egresos:** Pago de servicios, compra de suministros (agua, papel), pago a proveedores.

### 4.3. Cierre de Caja
- Al terminar el turno, verifica que el sistema muestre el monto esperado según tus ventas y métodos de pago (Efectivo vs Yape/POS).
- Ingresa el monto real que tienes en efectivo en la gaveta y presiona "Cerrar Caja". El sistema calculará si hay descuadre (faltante o sobrante).

---

## 5. Facturación Electrónica (SUNAT)
- El sistema envía automáticamente las Boletas y Facturas a SUNAT a través de nuestro proveedor (Nubefact).
- En el menú **Facturación SUNAT**, puedes ver el estado de todos los documentos.
- Si un comprobante falla (por ejemplo, por caída de internet), aparecerá un botón rojo de **"Reenviar"**.
- También puedes emitir **Notas de Crédito** para anular ventas desde este módulo.

---

## 6. Módulo de Proformas
- Ve a **Proformas > Nueva Proforma**.
- Funciona idéntico al Punto de Venta: buscas productos, asignas cliente y generas la cotización.
- A diferencia de una venta, no mueve stock ni caja.
- Puedes imprimir la proforma en formato Ticket o PDF A4 para enviarla por WhatsApp al cliente.

---

## 7. Reportes y Dashboard
*Exclusivo para Administradores.*

- **Dashboard:** Al iniciar sesión, verás un resumen gráfico de los ingresos de hoy, el IGV a pagar, las alertas de stock bajo y la utilidad calculada.
- **Reportes:** Módulo para generar reportes detallados en fechas específicas (ej. Ventas del mes, Productos más vendidos, Utilidad neta). 
- **Control de Cajas:** Permite al administrador ver todas las cajas abiertas/cerradas por los diferentes vendedores en todas las tiendas, facilitando la cuadratura general.

---
*JD Store v1.0 - Desarrollado para el control total de tu negocio tecnológico.*
