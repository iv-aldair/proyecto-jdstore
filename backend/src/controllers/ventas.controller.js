const pool = require('../config/db');
const { ok, error, paginar } = require('../utils/helpers');
const { descomponerTotal } = require('../utils/calcularIGV');
const { enviarComprobante } = require('../services/nubefact.service');

// ID del cliente "Clientes Varios" definido en tu parche SQL
const ID_CLIENTE_VARIOS = 999;

/** Genera el siguiente correlativo para una serie dada (global, no por tienda) */
const _siguienteCorrelativo = async (conn, serie) => {
  const [[ultima]] = await conn.query(
    `SELECT correlativo FROM ventas
     WHERE serie = ?
     ORDER BY CAST(correlativo AS UNSIGNED) DESC
     LIMIT 1
     FOR UPDATE`,
    [serie]
  );
  const actual = ultima ? parseInt(ultima.correlativo) : 0;
  return String(actual + 1).padStart(5, '0');
};

/** GET /api/ventas */
const listar = async (req, res, next) => {
  try {
    const { pagina, limite, offset } = paginar(req.query);
    const { fecha_inicio, fecha_fin, tipo_comprobante, id_tienda } = req.query;

    const tienda = req.usuario.id_rol === 1
      ? (id_tienda || null)
      : req.usuario.id_tienda;

    let where = tienda ? 'WHERE v.id_tienda = ?' : 'WHERE 1=1';
    const params = tienda ? [tienda] : [];

    if (fecha_inicio) { where += ' AND DATE(v.fecha) >= ?'; params.push(fecha_inicio); }
    if (fecha_fin)    { where += ' AND DATE(v.fecha) <= ?'; params.push(fecha_fin); }
    if (tipo_comprobante) { where += ' AND v.tipo_comprobante = ?'; params.push(tipo_comprobante); }

    if (req.usuario.id_rol === 2) {
      where += ' AND v.id_usuario = ?';
      params.push(req.usuario.id_usuario);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM ventas v ${where}`, params
    );
    const [rows] = await pool.query(
      `SELECT v.*, c.nombre AS cliente, c.tipo_documento, c.dni_ruc,
              u.nombre AS vendedor, t.nombre_tienda
       FROM ventas v
       JOIN clientes  c ON c.id_cliente  = v.id_cliente
       JOIN usuarios  u ON u.id_usuario  = v.id_usuario
       JOIN tiendas   t ON t.id_tienda   = v.id_tienda
       ${where}
       ORDER BY v.fecha DESC
       LIMIT ? OFFSET ?`,
      [...params, limite, offset]
    );
    return ok(res, { ventas: rows, paginacion: { total, pagina, limite } });
  } catch (err) { next(err); }
};

/** GET /api/ventas/:id */
const obtener = async (req, res, next) => {
  try {
    const [venta] = await pool.query(
      `SELECT v.*, c.nombre AS cliente, c.tipo_documento, c.dni_ruc, c.direccion AS dir_cliente,
              u.nombre AS vendedor, t.nombre_tienda
       FROM ventas v
       JOIN clientes c ON c.id_cliente = v.id_cliente
       JOIN usuarios u ON u.id_usuario = v.id_usuario
       JOIN tiendas  t ON t.id_tienda  = v.id_tienda
       WHERE v.id_venta = ?`,
      [req.params.id]
    );
    if (!venta.length) return error(res, 'Venta no encontrada', 404);
    
    const [detalle] = await pool.query(
      `SELECT dv.*, 
              COALESCE(p.nombre, dv.nombre_producto_externo) AS producto, 
              COALESCE(p.codigo_producto, 'EXT-001') AS codigo_producto, 
              p.modelo,
              (SELECT GROUP_CONCAT(numero_serie SEPARATOR ', ') 
               FROM producto_series ps 
               WHERE ps.id_venta = dv.id_venta AND ps.id_producto = dv.id_producto) AS series
       FROM detalle_venta dv
       LEFT JOIN productos p ON p.id_producto = dv.id_producto
       WHERE dv.id_venta = ?`,
      [req.params.id]
    );
    return ok(res, { ...venta[0], detalle });
  } catch (err) { next(err); }
};

/** POST /api/ventas */
const crear = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      id_cliente: id_cliente_req,
      tipo_comprobante, 
      metodo_pago,
      items,
      notas_internas,
      descuento_total = 0,
      detalles_pago,
    } = req.body;

    if (!tipo_comprobante || !items?.length)
      return error(res, 'Faltan campos: tipo_comprobante, items');

    // Si viene cliente_manual en Nota de Venta o Boleta, creamos un registro rápido
    let id_cliente = id_cliente_req || ID_CLIENTE_VARIOS;
    if (!id_cliente_req && (tipo_comprobante === 'Nota de Venta' || tipo_comprobante === 'Boleta') && req.body.cliente_manual) {
      const [resCli] = await conn.query(
        'INSERT INTO clientes (nombre, tipo_documento, dni_ruc) VALUES (?, ?, ?)',
        [req.body.cliente_manual, 'DNI', 'SD-' + Date.now().toString().slice(-8)]
      );
      id_cliente = resCli.insertId;
    }
    const id_tienda  = req.body.id_tienda || req.usuario.id_tienda;
    const id_usuario = req.usuario.id_usuario;

    // VALIDACIÓN DE CAJA ABIERTA
    const [sesionAbierta] = await conn.query(
      `SELECT id_sesion FROM sesiones_caja WHERE id_tienda = ? AND estado = 'ABIERTA'`,
      [id_tienda]
    );
    if (sesionAbierta.length === 0) {
      await conn.rollback();
      return error(res, 'Debes abrir caja para empezar a vender.', 400);
    }

    const serieMap = { Boleta: 'BBB1', Factura: 'FFF1', 'Nota de Venta': 'NV01' };
    const serie = serieMap[tipo_comprobante] || 'B001';

    const correlativo = await _siguienteCorrelativo(conn, serie);
    const numero_comprobante = `${serie}-${correlativo}`;

    // Calcular totales considerando descuento_monto por linea
    let totalBruto = 0;
    for (const item of items) {
      const lineaTotal = Math.max(0, (parseFloat(item.precio_unitario) * parseInt(item.cantidad)) - parseFloat(item.descuento_monto || 0));
      totalBruto += lineaTotal;
    }
    totalBruto -= parseFloat(descuento_total);

    let subtotal, igv, total;
    if (tipo_comprobante === 'Nota de Venta') {
      subtotal = parseFloat(totalBruto.toFixed(2));
      igv = 0;
      total = subtotal;
    } else {
      const calc = descomponerTotal(totalBruto);
      subtotal = calc.subtotal;
      igv = calc.igv;
      total = calc.total;
    }

    if (detalles_pago) {
      const sumaPagos = Object.values(detalles_pago).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
      const dif = Math.round((sumaPagos - total) * 100) / 100;
      if (Math.abs(dif) > 0) {
        return error(res, 'El monto total pagado no coincide con el total de la venta', 400);
      }
    }

    const [result] = await conn.query(
      `INSERT INTO ventas
         (numero_comprobante, serie, correlativo, tipo_comprobante,
          subtotal, igv, total, metodo_pago,
          notas_internas, descuento_total, api_enviado, 
          id_cliente, id_usuario, id_tienda)
       VALUES (?,?,?,?,?,?,?,?,?,?,0,?,?,?)`,
      [numero_comprobante, serie, correlativo, tipo_comprobante,
       subtotal, igv, total, metodo_pago || 'Efectivo',
       notas_internas || null, descuento_total, id_cliente, id_usuario, id_tienda]
    );
    const id_venta = result.insertId;

    let costoTotalAcumulado = 0;
    const detalles_insert = [];

    for (const item of items) {
      const cantidad = parseInt(item.cantidad);
      const precio_unit = parseFloat(item.precio_unitario);
      const desc_monto = parseFloat(item.descuento_monto || 0);
      const sub = Math.max(0, parseFloat(((precio_unit * cantidad) - desc_monto).toFixed(2)));

      // Obtener producto para costo y descripcion completa
      let costo_unit = 0;
      let prod_nombre = item.producto || '';
      let codigo_producto = item.codigo_producto || '000';
      let id_producto_insert = null;

      if (item.es_externo) {
        costo_unit = parseFloat(item.costo_acordado || 0);
        costoTotalAcumulado += costo_unit * cantidad;
        
        if (item.series && Array.isArray(item.series)) {
          const seriesValidas = item.series.filter(s => s && s.trim() !== '');
          if (seriesValidas.length > 0) {
            prod_nombre += ` (Series: ${seriesValidas.join(', ')})`;
          }
        }
        
        detalles_insert.push({ ...item, producto: prod_nombre, codigo_producto: codigo_producto });

        // Insert into deudas_externas
        await conn.query(
          `INSERT INTO deudas_externas 
            (id_tienda, id_usuario, tienda_proveedor, producto_nombre, monto_deuda, id_venta) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [id_tienda, id_usuario, item.tienda_origen, prod_nombre, costo_unit * cantidad, id_venta]
        );

        // Insert into detalle_venta with null id_producto
        await conn.query(
          `INSERT INTO detalle_venta
             (id_venta, id_producto, cantidad, precio_unitario,
              descuento_monto, costo_unitario, subtotal, nombre_producto_externo)
           VALUES (?,?,?,?,?,?,?,?)`,
          [id_venta, id_producto_insert, cantidad, precio_unit, desc_monto, costo_unit, sub, prod_nombre]
        );

      } else if (item.es_servicio) {
        // Los servicios no descuentan stock ni generan deudas externas, solo se registran como venta.
        costo_unit = 0;
        prod_nombre = item.producto || 'Servicio Técnico';
        codigo_producto = 'SERV-001';
        id_producto_insert = null;
        
        detalles_insert.push({ ...item, producto: prod_nombre, codigo_producto: codigo_producto });

        // Insert into detalle_venta
        await conn.query(
          `INSERT INTO detalle_venta
             (id_venta, id_producto, cantidad, precio_unitario,
              descuento_monto, costo_unitario, subtotal, nombre_producto_externo)
           VALUES (?,?,?,?,?,?,?,?)`,
          [id_venta, id_producto_insert, cantidad, precio_unit, desc_monto, costo_unit, sub, prod_nombre]
        );

      } else {
        const [[prod]] = await conn.query(
          'SELECT nombre, codigo_producto, COALESCE(precio_costo_pen, precio * 0.70) AS costo FROM productos WHERE id_producto = ?',
          [item.id_producto]
        );
        costo_unit = parseFloat(prod?.costo || 0);
        prod_nombre = prod?.nombre || item.producto;
        codigo_producto = prod?.codigo_producto || item.codigo_producto;
        id_producto_insert = item.id_producto;

        // Incluir series en el nombre del producto para Nubefact
        if (item.series && Array.isArray(item.series)) {
          const seriesValidas = item.series.filter(s => s && s.trim() !== '');
          if (seriesValidas.length > 0) {
            prod_nombre += ` (S/N: ${seriesValidas.join(', ')})`;
          }
        }

        costoTotalAcumulado += costo_unit * cantidad;
        detalles_insert.push({ ...item, producto: prod_nombre, codigo_producto: codigo_producto });

        // INSERT en detalle_venta
        await conn.query(
          `INSERT INTO detalle_venta
             (id_venta, id_producto, cantidad, precio_unitario,
              descuento_monto, costo_unitario, subtotal)
           VALUES (?,?,?,?,?,?,?)`,
          [id_venta, id_producto_insert, cantidad, precio_unit, desc_monto, costo_unit, sub]
        );

        // Descontar stock
        await conn.query(
          `UPDATE inventario_tienda SET stock = GREATEST(0, stock - ?)
           WHERE id_producto = ? AND id_tienda = ?`,
          [cantidad, id_producto_insert, id_tienda]
        );
      }

      // Si el item trae números de serie (array), los vinculamos a la venta
      if (!item.es_externo && !item.es_servicio) {
        if (item.series && Array.isArray(item.series)) {
          for (const serie of item.series) {
            if (!serie) continue;
            const serieUpper = String(serie).trim().toUpperCase();
            
            // Intentar vincular serie existente
            const [updateResult] = await conn.query(
              `UPDATE producto_series SET estado = 2, id_venta = ?
               WHERE numero_serie = ? AND id_producto = ?`,
              [id_venta, serieUpper, item.id_producto]
            );
            
            // Si la serie no existía en la tabla (fue ingresada manualmente), insertarla
            if (updateResult.affectedRows === 0) {
              await conn.query(
                `INSERT INTO producto_series (id_producto, numero_serie, estado, id_venta, id_tienda)
                 VALUES (?, ?, 2, ?, ?)`,
                [item.id_producto, serieUpper, id_venta, id_tienda]
              );
            }
          }
        } else if (item.numero_serie) {
          const serieUpper = String(item.numero_serie).trim().toUpperCase();
          const [updateResult] = await conn.query(
            `UPDATE producto_series SET estado = 2, id_venta = ?
             WHERE numero_serie = ? AND id_producto = ?`,
            [id_venta, serieUpper, item.id_producto]
          );
          
          if (updateResult.affectedRows === 0) {
            await conn.query(
              `INSERT INTO producto_series (id_producto, numero_serie, estado, id_venta, id_tienda)
               VALUES (?, ?, 2, ?, ?)`,
              [item.id_producto, serieUpper, id_venta, id_tienda]
            );
          }
        }
      }
    }

    // Actualizar utilidad usando la Fórmula Maestra
    const subtotalReal = tipo_comprobante === 'Nota de Venta' ? total : (total / 1.18);
    const costoReal = tipo_comprobante === 'Nota de Venta' ? costoTotalAcumulado : (costoTotalAcumulado / 1.18);
    const utilidad = Math.round((subtotalReal - costoReal) * 100) / 100;
    
    await conn.query(
      'UPDATE ventas SET costo_total = ?, utilidad = ? WHERE id_venta = ?',
      [parseFloat(costoTotalAcumulado.toFixed(2)), utilidad, id_venta]
    );

    // ---- ENVÍO A NUBEFACT ----
    let nb_estado = 'PENDIENTE', nb_pdf = null, nb_xml = null, nb_cdr = null;
    if (tipo_comprobante !== 'Nota de Venta') {
      try {
        const [[clienteDb]] = await conn.query('SELECT * FROM clientes WHERE id_cliente = ?', [id_cliente]);
        const ventaParaNubefact = {
          serie, correlativo, tipo_comprobante, 
          cliente_nombre: clienteDb.nombre, 
          cliente_documento: clienteDb.dni_ruc, 
          cliente_tipo_doc: clienteDb.tipo_documento,
          cliente_direccion: clienteDb.direccion,
          metodo_pago, notas_internas, subtotal, igv, total
        };
        const nbResult = await enviarComprobante(ventaParaNubefact, detalles_insert);
        
        nb_pdf = nbResult.enlace_pdf;
        nb_xml = nbResult.enlace_xml;
        nb_cdr = nbResult.enlace_cdr;
        nb_estado = nbResult.estado_sunat || 'PENDIENTE';

        // Actualizar base de datos con los datos de Nubefact
        await conn.query(
          `UPDATE ventas SET 
            api_enviado = 1, 
            enlace_pdf = ?, enlace_xml = ?, enlace_cdr = ?, 
            estado_sunat = ?,
            hash_sunat = ?,
            codigo_sunat = ?,
            mensaje_sunat = ?
           WHERE id_venta = ?`,
          [nb_pdf, nb_xml, nb_cdr, nb_estado, 
           nbResult.hash || null, nbResult.codigo_sunat || null, nbResult.mensaje_sunat || null,
           id_venta]
        );
      } catch (nubefactError) {
        console.error('⚠️ La venta se guardó localmente, pero falló el envío a Nubefact:', nubefactError.message);
        // NO hacemos rollback, la venta es válida localmente y se podrá reintentar luego
      }
    }

    await conn.commit();
    return ok(res, {
      id_venta,
      numero_comprobante,
      total,
      utilidad_bruta: utilidad,
      enlace_pdf: nb_pdf
    }, 'Venta registrada con éxito', 201);

  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

/** GET /api/ventas/diarias */
const ventasDiarias = async (req, res, next) => {
  try {
    const fecha = req.query.fecha || new Date().toISOString().split('T')[0];
    const id_tienda = req.query.id_tienda || req.usuario.id_tienda;
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS cantidad_ventas,
              COALESCE(SUM(total),0) AS total_dia,
              COALESCE(SUM(utilidad),0) AS utilidad_dia,
              tipo_comprobante
       FROM ventas
       WHERE DATE(fecha) = ? AND id_tienda = ?
       GROUP BY tipo_comprobante`,
      [fecha, id_tienda]
    );
    return ok(res, { fecha, resumen: rows });
  } catch (err) { next(err); }
};

module.exports = { listar, obtener, crear, ventasDiarias };