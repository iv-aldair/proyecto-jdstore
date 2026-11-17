const ExcelJS = require('exceljs');

/**
 * Genera un archivo Excel de ventas y lo devuelve como buffer
 * @param {object} datos  – resultado de reportes.controller _queryReporte
 * @param {string} titulo – "Reporte Diario | Semanal | Mensual"
 */
const generarExcelVentas = async (datos, titulo) => {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'JD Store Sistema';

  const ws = wb.addWorksheet('Ventas');

  // Título
  ws.mergeCells('A1:J1');
  ws.getCell('A1').value = `JD Store – ${titulo}`;
  ws.getCell('A1').font  = { bold: true, size: 14 };
  ws.getCell('A1').alignment = { horizontal: 'center' };

  // Resumen
  ws.addRow([]);
  ws.addRow(['Total ventas',   datos.ventas.cantidad_ventas]);
  ws.addRow(['Ingresos (S/)', parseFloat(datos.ventas.total_ventas).toFixed(2)]);
  ws.addRow(['IGV (S/)',      parseFloat(datos.ventas.total_igv).toFixed(2)]);
  ws.addRow(['Subtotal (S/)', parseFloat(datos.ventas.total_subtotal).toFixed(2)]);
  ws.addRow(['Compras (S/)',  parseFloat(datos.compras.total_compras).toFixed(2)]);
  ws.addRow(['Ganancia (S/)', parseFloat(datos.ganancia).toFixed(2)]);
  ws.addRow([]);

  // Cabecera de detalle
  const headers = [
    'Comprobante','Tipo','Fecha','Cliente','DNI/RUC',
    'Vendedor','Subtotal','IGV','Total','Método Pago',
  ];
  const headerRow = ws.addRow(headers);
  headerRow.eachCell(cell => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A56A0' } };
  });

  // Filas de detalle
  for (const v of datos.detalleVentas) {
    ws.addRow([
      v.numero_comprobante,
      v.tipo_comprobante,
      new Date(v.fecha).toLocaleString('es-PE'),
      v.cliente,
      v.dni_ruc,
      v.vendedor,
      parseFloat(v.subtotal).toFixed(2),
      parseFloat(v.igv).toFixed(2),
      parseFloat(v.total).toFixed(2),
      v.metodo_pago,
    ]);
  }

  // Anchos de columna
  ws.columns.forEach(col => { col.width = 20; });

  return await wb.xlsx.writeBuffer();
};

module.exports = { generarExcelVentas };