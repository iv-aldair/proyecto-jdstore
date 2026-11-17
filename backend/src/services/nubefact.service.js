const axios = require('axios');

/**
 * Servicio para envío de comprobantes electrónicos a Nubefact
 * Documentación: https://www.nubefact.com/integracion
 * 
 * Autenticación: Header → Authorization: Token token="TU_TOKEN"
 * Método: POST a la RUTA única de tu cuenta
 */
const enviarComprobante = async (venta, detalles) => {
  try {
    const url = process.env.NUBEFACT_URL;
    const token = process.env.NUBEFACT_TOKEN;

    // Solo simulamos si NO hay token o si es el placeholder literal
    if (!token || token === 'your_nubefact_token_here') {
      console.log('⚠️  NUBEFACT MOCK: No hay token configurado, simulando envío a SUNAT.');
      return {
        enlace_pdf: null,
        enlace_xml: null,
        enlace_cdr: null,
        sunat_ticket: 'MOCK-TICKET',
        estado_sunat: 'PENDIENTE',
        hash: null,
        mensaje_sunat: 'Modo simulación — Configure NUBEFACT_TOKEN en .env'
      };
    }

    if (!url) {
      throw new Error('NUBEFACT_URL no está configurada en .env');
    }

    // --- INTEGRACIÓN REAL CON NUBEFACT ---
    console.log('📤 Enviando comprobante a Nubefact...', { serie: venta.serie, correlativo: venta.correlativo, tipo: venta.tipo_comprobante });
    
    // Convertir tipos de documento para Nubefact: 
    // 1 = DNI, 6 = RUC, 0 = Sin doc, 7 = Pasaporte
    let tipoDocCli = '1';
    if (venta.cliente_tipo_doc === 'RUC') tipoDocCli = '6';
    else if (!venta.cliente_documento || venta.cliente_documento === '-' || venta.cliente_documento.startsWith('SD-')) tipoDocCli = '0';

    // Tipo de comprobante: 1 = Factura, 2 = Boleta
    let tipoComprobante = 2; // Boleta por defecto
    if (venta.tipo_comprobante === 'Factura') tipoComprobante = 1;

    // Mapeo de productos a la estructura JSON de Nubefact
    const itemsNubefact = detalles.map((item, idx) => {
      const precioConIGV = parseFloat(item.precio_unitario);
      const cantidad = parseInt(item.cantidad);
      const valorSinIGV = parseFloat((precioConIGV / 1.18).toFixed(6));
      const subtotalSinIGV = parseFloat((valorSinIGV * cantidad).toFixed(2));
      const igvItem = parseFloat((precioConIGV * cantidad - subtotalSinIGV).toFixed(2));
      const totalItem = parseFloat((precioConIGV * cantidad).toFixed(2));

      return {
        unidad_de_medida: "NIU",
        codigo: item.codigo_producto || `PROD-${idx + 1}`,
        descripcion: item.producto || 'Producto',
        cantidad: cantidad,
        valor_unitario: valorSinIGV,
        precio_unitario: precioConIGV,
        subtotal: subtotalSinIGV,
        tipo_de_igv: 1, // 1 = Gravado - Operación Onerosa
        igv: igvItem,
        total: totalItem,
        anticipo_regularizacion: false,
      };
    });

    // Fecha formateada DD-MM-YYYY (en hora de Perú)
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/Lima',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const dateParts = formatter.format(new Date()).split('/');
    const fechaEmision = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`;

    // JSON base para la API de Nubefact
    const dataNubefact = {
      operacion: "generar_comprobante",
      tipo_de_comprobante: tipoComprobante,
      serie: venta.serie,
      numero: parseInt(venta.correlativo),
      sunat_transaction: 1, // 1 = Venta Interna
      cliente_tipo_de_documento: tipoDocCli,
      cliente_numero_de_documento: venta.cliente_documento || '-',
      cliente_denominacion: venta.cliente_nombre || 'CLIENTES VARIOS',
      cliente_direccion: venta.cliente_direccion || '',
      cliente_email: '',
      fecha_de_emision: fechaEmision,
      moneda: 1, // 1 = Soles
      porcentaje_de_igv: 18.00,
      descuento_global: "",
      total_descuento: "",
      total_anticipo: "",
      total_gravada: parseFloat(venta.subtotal),
      total_inafecta: "",
      total_exonerada: "",
      total_igv: parseFloat(venta.igv),
      total_gratuita: "",
      total_otros_cargos: "",
      total: parseFloat(venta.total),
      percepcion_tipo: "",
      percepcion_base_imponible: "",
      total_percepcion: "",
      total_incluido_percepcion: "",
      detraccion: false,
      observaciones: venta.notas_internas || "",
      documento_que_se_modifica_tipo: "",
      documento_que_se_modifica_serie: "",
      documento_que_se_modifica_numero: "",
      tipo_de_nota_de_credito: "",
      tipo_de_nota_de_debito: "",
      enviar_automaticamente_a_la_sunat: true,
      enviar_automaticamente_al_cliente: false,
      codigo_unico: "",
      condiciones_de_pago: "",
      medio_de_pago: "",
      items: itemsNubefact
    };

    // Header de autenticación correcto para Nubefact
    const config = {
      headers: {
        'Authorization': `Token token="${token}"`,
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 segundos de timeout
    };

    console.log('📋 Payload Nubefact:', JSON.stringify(dataNubefact, null, 2));

    const response = await axios.post(url, dataNubefact, config);
    const result = response.data;

    console.log('✅ Respuesta Nubefact:', JSON.stringify(result, null, 2));

    if (result.errors) {
      console.error('❌ Nubefact devolvió errores:', result.errors);
      throw new Error(typeof result.errors === 'string' ? result.errors : JSON.stringify(result.errors));
    }

    return {
      enlace_pdf: result.enlace_del_pdf || null,
      enlace_xml: result.enlace_del_xml || null,
      enlace_cdr: result.enlace_del_cdr || null,
      sunat_ticket: result.sunat_ticket_numero || null,
      estado_sunat: result.aceptada_por_sunat ? 'ACEPTADO' : (result.sunat_description || 'PENDIENTE'),
      hash: result.cadena_para_codigo_qr || result.hash || null,
      codigo_sunat: result.sunat_responsecode || null,
      mensaje_sunat: result.sunat_note || result.sunat_description || ''
    };

  } catch (error) {
    const errorMsg = error.response?.data?.errors || error.response?.data || error.message;
    console.error('❌ Error enviando a Nubefact:', errorMsg);
    throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
  }
};

/**
 * Emitir Nota de Crédito a través de Nubefact
 */
const emitirNotaCredito = async (ventaOriginal, motivo) => {
  const url = process.env.NUBEFACT_URL;
  const token = process.env.NUBEFACT_TOKEN;

  if (!token || token === 'your_nubefact_token_here') {
    return { simulado: true, mensaje: 'Modo simulación' };
  }

  // Tipo de Nota de Crédito según motivo
  let tipoNC = 1; // 1 = Anulación de la operación
  if (motivo.includes('Devolución')) tipoNC = 1;
  if (motivo.includes('Error en el RUC') || motivo.includes('Error en el DNI')) tipoNC = 6;
  if (motivo.includes('Error en la descripción')) tipoNC = 7;

  // Tipo comprobante original: 1=Factura, 2=Boleta → NC = 7 o 8
  const tipoComprobanteOriginal = ventaOriginal.tipo_comprobante === 'Factura' ? 1 : 2;
  const tipoNC_comprobante = ventaOriginal.tipo_comprobante === 'Factura' ? 7 : 8; // 7=NC Factura, 8=NC Boleta

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const dateParts = formatter.format(new Date()).split('/');
  const fechaEmision = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`;

  // Serie para NC
  const serieNC = ventaOriginal.tipo_comprobante === 'Factura' ? 'FFF1' : 'BBB1';

  const payload = {
    operacion: "generar_comprobante",
    tipo_de_comprobante: tipoNC_comprobante,
    serie: serieNC,
    numero: Date.now() % 100000, // Generar un número temporal (en producción usar correlativo real)
    sunat_transaction: 1,
    cliente_tipo_de_documento: ventaOriginal.tipo_documento === 'RUC' ? '6' : '1',
    cliente_numero_de_documento: ventaOriginal.dni_ruc || '-',
    cliente_denominacion: ventaOriginal.nombre || 'CLIENTES VARIOS',
    cliente_direccion: ventaOriginal.direccion || '',
    cliente_email: '',
    fecha_de_emision: fechaEmision,
    moneda: 1,
    porcentaje_de_igv: 18.00,
    total_gravada: parseFloat(ventaOriginal.subtotal),
    total_igv: parseFloat(ventaOriginal.igv),
    total: parseFloat(ventaOriginal.total),
    enviar_automaticamente_a_la_sunat: true,
    enviar_automaticamente_al_cliente: false,
    // Documento que modifica
    documento_que_se_modifica_tipo: tipoComprobanteOriginal,
    documento_que_se_modifica_serie: ventaOriginal.serie,
    documento_que_se_modifica_numero: parseInt(ventaOriginal.correlativo),
    tipo_de_nota_de_credito: tipoNC,
    observaciones: motivo,
    items: [{
      unidad_de_medida: "NIU",
      codigo: "NC-001",
      descripcion: `Anulación de ${ventaOriginal.tipo_comprobante} ${ventaOriginal.serie}-${ventaOriginal.correlativo}`,
      cantidad: 1,
      valor_unitario: parseFloat((parseFloat(ventaOriginal.total) / 1.18).toFixed(2)),
      precio_unitario: parseFloat(ventaOriginal.total),
      subtotal: parseFloat((parseFloat(ventaOriginal.total) / 1.18).toFixed(2)),
      tipo_de_igv: 1,
      igv: parseFloat(ventaOriginal.igv),
      total: parseFloat(ventaOriginal.total),
      anticipo_regularizacion: false,
    }]
  };

  const config = {
    headers: {
      'Authorization': `Token token="${token}"`,
      'Content-Type': 'application/json'
    },
    timeout: 30000
  };

  const response = await axios.post(url, payload, config);
  return response.data;
};

/**
 * Emitir Comunicación de Baja (Anulación) a través de Nubefact
 */
const emitirComunicacionBaja = async (ventaOriginal) => {
  const url = process.env.NUBEFACT_URL;
  const token = process.env.NUBEFACT_TOKEN;

  if (!token || token === 'your_nubefact_token_here') {
    return { simulado: true, mensaje: 'Modo simulación' };
  }

  const tipoComprobanteOriginal = ventaOriginal.tipo_comprobante === 'Factura' ? 1 : 2;

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const dateParts = formatter.format(new Date()).split('/');
  const fechaEmision = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`;

  const payload = {
    operacion: "generar_anulacion",
    tipo_de_comprobante: tipoComprobanteOriginal,
    serie: ventaOriginal.serie,
    numero: parseInt(ventaOriginal.correlativo),
    motivo: "Anulación del comprobante",
    fecha_de_emision: fechaEmision,
  };

  const config = {
    headers: {
      'Authorization': `Token token="${token}"`,
      'Content-Type': 'application/json'
    },
    timeout: 30000
  };

  const response = await axios.post(url, payload, config);
  return response.data;
};

module.exports = {
  enviarComprobante,
  emitirNotaCredito,
  emitirComunicacionBaja
};
