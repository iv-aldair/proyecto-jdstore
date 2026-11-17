const fs = require('fs');
const path = require('path');

// Función para convertir números a letras (para la leyenda de SUNAT)
function numeroALetras(num) {
  const unidades = ['Cero', 'Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco', 'Seis', 'Siete', 'Ocho', 'Nueve'];
  const decenas = ['Diez', 'Once', 'Doce', 'Trece', 'Catorce', 'Quince', 'Dieciseis', 'Diecisiete', 'Dieciocho', 'Diecinueve'];
  const decenas2 = ['Veinte', 'Treinta', 'Cuarenta', 'Cincuenta', 'Sesenta', 'Setenta', 'Ochenta', 'Noventa'];
  const centenas = ['Cien', 'Doscientos', 'Trescientos', 'Cuatrocientos', 'Quinientos', 'Seiscientos', 'Setecientos', 'Ochocientos', 'Novecientos'];

  const convertirMenorAMil = (n) => {
    if (n === 0) return '';
    if (n < 10) return unidades[n];
    if (n < 20) return decenas[n - 10];
    if (n === 20) return 'Veinte';
    if (n < 30) return 'Veinti' + unidades[n - 20];
    if (n < 100) return decenas2[Math.floor(n / 10) - 2] + (n % 10 !== 0 ? ' y ' + unidades[n % 10] : '');
    if (n === 100) return 'Cien';
    if (n < 200) return 'Ciento ' + convertirMenorAMil(n % 100);
    return centenas[Math.floor(n / 100) - 1] + (n % 100 !== 0 ? ' ' + convertirMenorAMil(n % 100) : '');
  };

  const parteEntera = Math.floor(num);
  const parteDecimal = Math.round((num - parteEntera) * 100);
  const decimalesString = parteDecimal.toString().padStart(2, '0');

  let letras = '';
  if (parteEntera === 0) {
    letras = 'Cero';
  } else if (parteEntera < 1000) {
    letras = convertirMenorAMil(parteEntera);
  } else if (parteEntera === 1000) {
    letras = 'Mil';
  } else if (parteEntera < 1000000) {
    const miles = Math.floor(parteEntera / 1000);
    const resto = parteEntera % 1000;
    const letrasMiles = miles === 1 ? 'Mil' : convertirMenorAMil(miles) + ' Mil';
    letras = letrasMiles + (resto !== 0 ? ' ' + convertirMenorAMil(resto) : '');
  } else {
    letras = 'Número muy grande'; // Simplificado para este contexto
  }

  return `SON: ${letras.toUpperCase()} Y ${decimalesString}/100 SOLES`;
}

/**
 * Genera el archivo JSON para el SFS (Facturador SUNAT)
 */
const enviarComprobante = async (venta, detalles) => {
  try {
    const sfsPath = process.env.SFS_DATA_PATH;
    const rucEmpresa = process.env.EMPRESA_RUC;
    const razonSocial = process.env.EMPRESA_RAZON_SOCIAL;

    if (!sfsPath || !rucEmpresa) {
      throw new Error('SFS_DATA_PATH o EMPRESA_RUC no están configurados en .env');
    }

    // Asegurar que la carpeta exista
    if (!fs.existsSync(sfsPath)) {
      fs.mkdirSync(sfsPath, { recursive: true });
    }

    const tipoDocCli = venta.cliente_tipo_doc === 'RUC' ? '6' : (venta.cliente_documento === '-' ? '0' : '1');
    const tipoComprobante = venta.tipo_comprobante === 'Factura' ? '01' : '03'; // 01=Factura, 03=Boleta
    
    // Fecha y hora
    const d = new Date();
    const fechaEmision = d.toISOString().split('T')[0];
    const horaEmision = d.toTimeString().split(' ')[0]; // HH:MM:SS

    // Mapear detalle al estándar SUNAT JSON
    const detalleJson = detalles.map((item, index) => {
      const cantidad = parseFloat(item.cantidad);
      const precioUnitario = parseFloat(item.precio_unitario); // con IGV
      const valorUnitario = precioUnitario / 1.18; // sin IGV
      const valorVenta = valorUnitario * cantidad; // sin IGV
      const igv = valorVenta * 0.18;

      return {
        "unidadMedida": "NIU",
        "cantidad": cantidad,
        "codigoProducto": item.codigo_producto || `P${(index+1).toString().padStart(3,'0')}`,
        "descripcion": item.producto || 'Producto',
        "montoValorUnitario": Number(valorUnitario.toFixed(4)),
        "montoPrecioUnitario": Number(precioUnitario.toFixed(4)),
        "montoValorVenta": Number(valorVenta.toFixed(2)),
        "montoBaseIgv": Number(valorVenta.toFixed(2)),
        "porcentajeIgv": 18.00,
        "montoIgv": Number(igv.toFixed(2)),
        "montoTotalImpuestos": Number(igv.toFixed(2)),
        "tipoAfectacionIgv": "10", // Gravado Onerosa
        "codigoTributoIgv": "1000",
        "indicadorMontoPrecio": "01"
      };
    });

    const total = parseFloat(venta.total);
    const subtotal = parseFloat(venta.subtotal);
    const igvTotal = parseFloat(venta.igv);

    const sfsJson = {
      "cabecera": {
        "tipoOperacion": "0101", // Venta interna
        "fechaEmision": fechaEmision,
        "horaEmision": horaEmision,
        "fechaVencimiento": fechaEmision,
        "codigoLocalAnexo": "0000",
        "tipoDocumento": tipoComprobante,
        "serie": venta.serie,
        "correlativo": venta.correlativo,
        "tipoMoneda": "PEN",
        "montoIgv": Number(igvTotal.toFixed(2)),
        "montoTotalTributos": Number(igvTotal.toFixed(2)),
        "montoValorVenta": Number(subtotal.toFixed(2)),
        "montoPrecioVenta": Number(total.toFixed(2)),
        "montoTotalImpuestos": Number(igvTotal.toFixed(2)),
        "montoImporteTotalVenta": Number(total.toFixed(2)),
        "tipoDocumentoIdentidadAdquirente": tipoDocCli,
        "numeroDocumentoAdquirente": venta.cliente_documento || '-',
        "razonSocialAdquirente": venta.cliente_nombre || 'CLIENTES VARIOS'
      },
      "detalle": detalleJson,
      "leyendas": [
        {
          "codigoLeyenda": "1000",
          "descripcionLeyenda": numeroALetras(total)
        }
      ],
      "tributos": [
        {
          "identificadorTributo": "1000",
          "nombreTributo": "IGV",
          "codigoTipoTributo": "VAT",
          "montoBaseTributo": Number(subtotal.toFixed(2)),
          "montoTributo": Number(igvTotal.toFixed(2))
        }
      ]
    };

    // Nombre del archivo: RUC-TIPO-SERIE-CORRELATIVO.json
    const fileName = `${rucEmpresa}-${tipoComprobante}-${venta.serie}-${venta.correlativo.padStart(8, '0')}.json`;
    const filePath = path.join(sfsPath, fileName);

    // Escribir el archivo
    fs.writeFileSync(filePath, JSON.stringify(sfsJson, null, 2), 'utf8');

    console.log(`✅ Archivo SFS generado exitosamente: ${filePath}`);

    return {
      enlace_pdf: null,
      enlace_xml: null,
      enlace_cdr: null,
      sunat_ticket: fileName,
      estado_sunat: 'ENVIADO_SFS',
      hash: null,
      codigo_sunat: null,
      mensaje_sunat: 'Archivo generado para Facturador SFS'
    };

  } catch (error) {
    console.error('❌ Error generando archivo SFS:', error.message);
    throw new Error(`Error SFS: ${error.message}`);
  }
};

const emitirNotaCredito = async (ventaOriginal, motivo) => {
  try {
    const sfsPath = process.env.SFS_DATA_PATH;
    const rucEmpresa = process.env.EMPRESA_RUC;

    if (!sfsPath || !rucEmpresa) {
      throw new Error('SFS_DATA_PATH o EMPRESA_RUC no están configurados en .env');
    }

    if (!fs.existsSync(sfsPath)) {
      fs.mkdirSync(sfsPath, { recursive: true });
    }

    const tipoDocCli = ventaOriginal.tipo_documento === 'RUC' ? '6' : '1';
    const tipoComprobanteOriginal = ventaOriginal.tipo_comprobante === 'Factura' ? '01' : '03';
    const tipoNC_comprobante = '07'; // 07 = Nota de Crédito
    const serieNC = ventaOriginal.tipo_comprobante === 'Factura' ? 'F001' : 'B001'; // Adaptar según las series registradas
    const correlativoNC = String(Date.now() % 100000).padStart(8, '0'); // Simulado para NC

    const d = new Date();
    const fechaEmision = d.toISOString().split('T')[0];
    const horaEmision = d.toTimeString().split(' ')[0];

    const total = parseFloat(ventaOriginal.total);
    const subtotal = parseFloat(ventaOriginal.subtotal);
    const igvTotal = parseFloat(ventaOriginal.igv);

    let tipoNC = '01'; // Anulación de la operación
    if (motivo.includes('Error en el RUC')) tipoNC = '06';
    if (motivo.includes('Error en la descripción')) tipoNC = '07';

    const sfsJson = {
      "cabecera": {
        "tipoOperacion": "0101",
        "fechaEmision": fechaEmision,
        "horaEmision": horaEmision,
        "codigoLocalAnexo": "0000",
        "tipoDocumento": tipoNC_comprobante,
        "serie": serieNC,
        "correlativo": correlativoNC,
        "tipoMoneda": "PEN",
        "montoIgv": Number(igvTotal.toFixed(2)),
        "montoTotalTributos": Number(igvTotal.toFixed(2)),
        "montoValorVenta": Number(subtotal.toFixed(2)),
        "montoPrecioVenta": Number(total.toFixed(2)),
        "montoTotalImpuestos": Number(igvTotal.toFixed(2)),
        "montoImporteTotalVenta": Number(total.toFixed(2)),
        "tipoDocumentoIdentidadAdquirente": tipoDocCli,
        "numeroDocumentoAdquirente": ventaOriginal.dni_ruc || '-',
        "razonSocialAdquirente": ventaOriginal.nombre || 'CLIENTES VARIOS'
      },
      "documentosModificados": [
        {
          "tipoDocumento": tipoComprobanteOriginal,
          "serie": ventaOriginal.serie,
          "correlativo": ventaOriginal.correlativo,
          "codigoTipoNota": tipoNC,
          "descripcionMotivo": motivo
        }
      ],
      "detalle": [
        {
          "unidadMedida": "NIU",
          "cantidad": 1.0,
          "codigoProducto": "NC-001",
          "descripcion": `Anulación de ${ventaOriginal.tipo_comprobante} ${ventaOriginal.serie}-${ventaOriginal.correlativo}`,
          "montoValorUnitario": Number(subtotal.toFixed(4)),
          "montoPrecioUnitario": Number(total.toFixed(4)),
          "montoValorVenta": Number(subtotal.toFixed(2)),
          "montoBaseIgv": Number(subtotal.toFixed(2)),
          "porcentajeIgv": 18.00,
          "montoIgv": Number(igvTotal.toFixed(2)),
          "montoTotalImpuestos": Number(igvTotal.toFixed(2)),
          "tipoAfectacionIgv": "10",
          "codigoTributoIgv": "1000",
          "indicadorMontoPrecio": "01"
        }
      ],
      "leyendas": [
        {
          "codigoLeyenda": "1000",
          "descripcionLeyenda": numeroALetras(total)
        }
      ],
      "tributos": [
        {
          "identificadorTributo": "1000",
          "nombreTributo": "IGV",
          "codigoTipoTributo": "VAT",
          "montoBaseTributo": Number(subtotal.toFixed(2)),
          "montoTributo": Number(igvTotal.toFixed(2))
        }
      ]
    };

    const fileName = `${rucEmpresa}-${tipoNC_comprobante}-${serieNC}-${correlativoNC}.json`;
    const filePath = path.join(sfsPath, fileName);

    fs.writeFileSync(filePath, JSON.stringify(sfsJson, null, 2), 'utf8');

    return {
      estado_sunat: 'ENVIADO_SFS_NC',
      mensaje_sunat: 'Archivo de Nota de Crédito generado para SFS'
    };
  } catch (error) {
    throw new Error(`Error SFS: ${error.message}`);
  }
};

const emitirComunicacionBaja = async (ventaOriginal) => {
  try {
    const sfsPath = process.env.SFS_DATA_PATH;
    const rucEmpresa = process.env.EMPRESA_RUC;

    if (!sfsPath || !rucEmpresa) {
      throw new Error('SFS_DATA_PATH o EMPRESA_RUC no están configurados en .env');
    }

    if (!fs.existsSync(sfsPath)) {
      fs.mkdirSync(sfsPath, { recursive: true });
    }

    const d = new Date();
    const fechaEmision = d.toISOString().split('T')[0];
    const fechaGeneracion = ventaOriginal.fecha.toISOString().split('T')[0];
    const correlativoBaja = String(Date.now() % 1000).padStart(3, '0');
    const tipoComprobanteOriginal = ventaOriginal.tipo_comprobante === 'Factura' ? '01' : '03';

    // Para la Comunicación de Baja, SFS requiere un JSON especial de resumen
    const sfsJson = {
      "cabecera": {
        "fechaEmisionDocumentos": fechaGeneracion,
        "fechaComunicacion": fechaEmision,
        "correlativoComunicacion": correlativoBaja
      },
      "detalle": [
        {
          "fila": 1,
          "tipoDocumento": tipoComprobanteOriginal,
          "serie": ventaOriginal.serie,
          "correlativo": ventaOriginal.correlativo,
          "motivoBaja": "Anulación del comprobante"
        }
      ]
    };

    // RA (Resumen Anulación) o RC (Resumen Diario para Boletas)
    // SFS usa RA para facturas anuladas
    const prefijo = tipoComprobanteOriginal === '01' ? 'RA' : 'RC';
    const fileName = `${rucEmpresa}-${prefijo}-${fechaEmision.replace(/-/g, '')}-${correlativoBaja}.json`;
    const filePath = path.join(sfsPath, fileName);

    fs.writeFileSync(filePath, JSON.stringify(sfsJson, null, 2), 'utf8');

    return {
      estado_sunat: 'ENVIADO_SFS_BAJA',
      mensaje_sunat: 'Comunicación de Baja generada para SFS'
    };
  } catch (error) {
    throw new Error(`Error SFS: ${error.message}`);
  }
};

module.exports = {
  enviarComprobante,
  emitirNotaCredito,
  emitirComunicacionBaja
};
