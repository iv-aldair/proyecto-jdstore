const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
  port:   parseInt(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Envía alerta de stock bajo por correo
 * @param {string} destinatario
 * @param {Array}  productos  – filas de obtenerProductosStockBajo()
 */
const enviarAlertaStockBajo = async (destinatario, productos) => {
  if (!productos.length) return;

  const filas = productos.map(p =>
    `<tr>
       <td>${p.codigo_producto}</td>
       <td>${p.nombre}</td>
       <td style="color:red;font-weight:bold">${p.stock}</td>
       <td>${p.stock_minimo}</td>
       <td>${p.faltante}</td>
       <td>${p.nombre_tienda}</td>
     </tr>`
  ).join('');

  const html = `
    <h2 style="color:#c0392b">⚠️ Alerta de Stock Bajo – JD Store</h2>
    <p>Los siguientes productos están por debajo del stock mínimo:</p>
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-family:Arial">
      <thead style="background:#f2f2f2">
        <tr>
          <th>Código</th><th>Producto</th><th>Stock actual</th>
          <th>Stock mínimo</th><th>Faltante</th><th>Tienda</th>
        </tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>
    <p style="color:#777;font-size:12px">Generado automáticamente – JD Store Sistema</p>
  `;

  await transporter.sendMail({
    from:    `"JD Store Sistema" <${process.env.EMAIL_USER}>`,
    to:      destinatario,
    subject: `⚠️ ${productos.length} producto(s) con stock bajo – JD Store`,
    html,
  });
};

/**
 * Envía alerta de productos estancados
 */
const enviarAlertaEstancados = async (destinatario, productos, dias) => {
  if (!productos.length) return;

  const filas = productos.map(p =>
    `<tr>
       <td>${p.codigo_producto}</td>
       <td>${p.nombre}</td>
       <td>${p.stock}</td>
       <td>${p.dias_sin_venta ?? 'Nunca vendido'}</td>
       <td>${p.nombre_categoria}</td>
     </tr>`
  ).join('');

  const html = `
    <h2 style="color:#e67e22">📦 Productos sin movimiento – JD Store</h2>
    <p>Los siguientes productos llevan más de <strong>${dias} días</strong> sin venderse:</p>
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-family:Arial">
      <thead style="background:#f2f2f2">
        <tr><th>Código</th><th>Producto</th><th>Stock</th><th>Días sin venta</th><th>Categoría</th></tr>
      </thead>
      <tbody>${filas}</tbody>
    </table>
    <p style="color:#777;font-size:12px">Generado automáticamente – JD Store Sistema</p>
  `;

  await transporter.sendMail({
    from:    `"JD Store Sistema" <${process.env.EMAIL_USER}>`,
    to:      destinatario,
    subject: `📦 ${productos.length} producto(s) estancados (${dias}+ días) – JD Store`,
    html,
  });
};

module.exports = { enviarAlertaStockBajo, enviarAlertaEstancados };