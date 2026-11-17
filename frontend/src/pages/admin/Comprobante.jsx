import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ventasApi } from '../../api/ventas.api.js'
import { PageLoader } from '../../components/ui/index.jsx'
import { formatMoneda } from '../../utils/formatMoneda.js'
import { Printer, ArrowLeft, ExternalLink } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { QRCodeSVG } from 'qrcode.react'

// ─── Convertir número a letras (español) ────────────────────────────
const UNIDADES = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE']
const ESPECIALES = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE']
const DECENAS = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA']
const CENTENAS = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS']

function seccion(n) {
  if (n === 0) return ''
  if (n === 100) return 'CIEN'
  const c = Math.floor(n / 100)
  const r = n % 100
  let txt = CENTENAS[c]
  if (r === 0) return txt
  if (txt) txt += ' '
  if (r < 10) return txt + UNIDADES[r]
  if (r < 16) return txt + ESPECIALES[r - 10]
  if (r < 20) return txt + 'DIECI' + UNIDADES[r - 10].toLowerCase()
  const d = Math.floor(r / 10)
  const u = r % 10
  if (d === 2 && u > 0) return txt + 'VEINTI' + UNIDADES[u].toLowerCase()
  return txt + DECENAS[d] + (u ? ' Y ' + UNIDADES[u] : '')
}

function numeroALetras(n) {
  if (n === 0) return 'CERO'
  const entero = Math.floor(n)
  const centavos = Math.round((n - entero) * 100)
  
  let resultado = ''
  if (entero === 0) {
    resultado = 'CERO'
  } else if (entero < 1000) {
    resultado = seccion(entero)
  } else if (entero < 1000000) {
    const miles = Math.floor(entero / 1000)
    const resto = entero % 1000
    if (miles === 1) {
      resultado = 'MIL'
    } else {
      resultado = seccion(miles) + ' MIL'
    }
    if (resto > 0) resultado += ' ' + seccion(resto)
  } else {
    const millones = Math.floor(entero / 1000000)
    const resto = entero % 1000000
    if (millones === 1) {
      resultado = 'UN MILLON'
    } else {
      resultado = seccion(millones) + ' MILLONES'
    }
    if (resto > 0) {
      const miles = Math.floor(resto / 1000)
      const restoMil = resto % 1000
      if (miles > 0) {
        resultado += (miles === 1 ? ' MIL' : ' ' + seccion(miles) + ' MIL')
      }
      if (restoMil > 0) resultado += ' ' + seccion(restoMil)
    }
  }
  return `${resultado} Y ${String(centavos).padStart(2, '0')}/100 SOLES`
}

// ─── Datos de la empresa ─────────────────────────────────────────────
const EMPRESA = {
  razonSocial: 'JD STORE SOCIEDAD COMERCIAL DE RESPONSABILIDAD LIMITADA',
  ruc: '20600698479',
  direccion: 'JR. MOQUEGUA 757 INT. J URB. CERCADO JULIACA',
  direccion2: 'MEDIA CUADRA MERCADO TUPAC AMARU',
  ubigeo: 'JULIACA - SAN ROMAN - PUNO',
}

export default function Comprobante() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const navigate = useNavigate()

  const { data: venta, isLoading } = useQuery({
    queryKey: ['venta', id],
    queryFn: () => ventasApi.obtener(id).then(r => r.data.datos),
    enabled: !!id
  })

  if (isLoading) return <PageLoader />
  if (!venta) return <div className="p-10 text-center text-gray-500">Comprobante no encontrado</div>

  // Cambiar título de la página para que al imprimir no muestre la URL
  document.title = `${venta.numero_comprobante} - JD Store`

  const esNotaVenta = venta.tipo_comprobante === 'Nota de Venta'
  
  const total = parseFloat(venta.total)
  let opGravada = 0, igv = 0

  if (!esNotaVenta) {
    opGravada = Math.round((total / 1.18) * 100) / 100
    igv = Math.round((total - opGravada) * 100) / 100
  }

  // Texto del tipo de comprobante para la cabecera
  const tipoTexto = esNotaVenta ? 'NOTA DE VENTA' 
    : venta.tipo_comprobante === 'Factura' ? 'FACTURA ELECTRONICA' 
    : 'BOLETA DE VENTA ELECTRONICA'

  // QR de SUNAT
  const tipoDocSunat = venta.tipo_comprobante === 'Factura' ? '01' : '03'
  const tipoDocCli = venta.tipo_documento === 'RUC' ? '6' : '1'
  const fechaQR = new Date(venta.fecha).toLocaleDateString('es-PE')
  const qrString = [EMPRESA.ruc, tipoDocSunat, venta.serie || '', venta.correlativo || '', igv.toFixed(2), total.toFixed(2), fechaQR, tipoDocCli, venta.dni_ruc || '-', venta.hash_sunat || ''].join('|')

  // Fecha formateada
  const fechaEmision = new Date(venta.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20 pt-6">
      {/* Botones (No imprimibles) */}
      <div className="flex flex-col sm:flex-row items-center justify-between print:hidden bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
        <button onClick={() => navigate(-1)} className="btn-secondary w-full sm:w-auto">
          <ArrowLeft size={16} /> Volver
        </button>
        <div className="flex gap-2 w-full sm:w-auto">
          {!esNotaVenta && venta.enlace_pdf && (
            <a href={venta.enlace_pdf} target="_blank" rel="noopener noreferrer" 
               className="btn-secondary text-sm px-4 py-2 w-full sm:w-auto justify-center">
              <ExternalLink size={14} /> PDF Nubefact
            </a>
          )}
          <button onClick={() => window.print()} className="btn-primary px-6 w-full sm:w-auto justify-center">
            <Printer size={18} /> Imprimir Comprobante
          </button>
        </div>
      </div>

      {/* ═══════════════ COMPROBANTE FORMATO A4 ═══════════════ */}
      <div id="comprobante-imprimible" className="bg-white shadow-2xl print:shadow-none mx-auto font-sans text-gray-800" style={{ maxWidth: '210mm', width: '100%', padding: '10mm 12mm' }}>
        
        {/* HEADER */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 pr-4">
            <h1 className="text-lg font-black text-blue-900 tracking-tight leading-tight uppercase mb-1">
              {EMPRESA.razonSocial}
            </h1>
            <div className="text-xs text-gray-500 space-y-0">
              <p>{EMPRESA.direccion}</p>
              <p>{EMPRESA.direccion2}</p>
              <p>{EMPRESA.ubigeo}</p>
              <p className="mt-0.5 font-semibold text-gray-700">Cel/Tel: -</p>
            </div>
          </div>

          <div className="w-[250px] flex-shrink-0">
            <div className="border-2 border-blue-900 rounded-lg overflow-hidden text-center">
              <div className="bg-blue-900 text-white font-bold py-1.5 text-xs uppercase tracking-widest">
                R.U.C. {EMPRESA.ruc}
              </div>
              <div className="py-2 bg-white">
                <p className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-0.5">{tipoTexto}</p>
                <p className="text-lg font-black text-blue-600">{venta.numero_comprobante}</p>
              </div>
            </div>
          </div>
        </div>

        {/* DATOS DEL CLIENTE */}
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
            <div>
              <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider block">Señor(es)</span>
              <span className="font-bold text-gray-800 uppercase">{(venta.cliente || 'CLIENTES VARIOS')}</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider block">Fecha de Emisión</span>
              <span className="font-bold text-gray-800">{fechaEmision}</span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider block">
                {venta.dni_ruc?.startsWith('SD-') ? 'DOCUMENTO' : (venta.tipo_documento || 'DNI / RUC')}
              </span>
              <span className="font-bold text-gray-800">
                {venta.dni_ruc?.startsWith('SD-') ? 'Sin Documento' : (venta.dni_ruc || '-')}
              </span>
            </div>
            <div>
              <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider block">Moneda</span>
              <span className="font-bold text-gray-800">SOLES</span>
            </div>

            {venta.notas_internas && (
              <div className="col-span-2">
                <span className="text-gray-400 font-semibold uppercase text-[10px] tracking-wider block">Observaciones</span>
                <span className="font-bold text-gray-800">{venta.notas_internas}</span>
              </div>
            )}
          </div>
        </div>

        {/* TABLA DE PRODUCTOS */}
        <div className="mb-4">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-blue-50 text-blue-900 border-b-2 border-blue-200">
                <th className="py-2 px-3 font-bold uppercase text-[10px] tracking-wider w-[8%] text-center rounded-tl-lg">Cant.</th>
                <th className="py-2 px-3 font-bold uppercase text-[10px] tracking-wider w-[12%] text-center">UM</th>
                <th className="py-2 px-3 font-bold uppercase text-[10px] tracking-wider w-[50%]">Descripción</th>
                <th className="py-2 px-3 font-bold uppercase text-[10px] tracking-wider w-[15%] text-right">P. Unit</th>
                <th className="py-2 px-3 font-bold uppercase text-[10px] tracking-wider w-[15%] text-right rounded-tr-lg">Total</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {venta.detalle?.map((d, i) => {
                const precioUn = parseFloat(d.precio_unitario)
                const cant = parseInt(d.cantidad)
                const valorSinIGV = esNotaVenta ? precioUn : Math.round((precioUn / 1.18) * 10000) / 10000
                const importeVenta = esNotaVenta ? (precioUn * cant) : Math.round(((precioUn * cant) / 1.18) * 100) / 100

                return (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 px-3 text-center font-medium">{cant}</td>
                    <td className="py-2 px-3 text-center text-gray-500 text-[10px]">UNIDAD</td>
                    <td className="py-2 px-3">
                      <span className="font-semibold block text-gray-900">{(d.producto || '').toUpperCase()}</span>
                      {d.series && <span className="block text-[10px] text-gray-400">SN: {d.series}</span>}
                    </td>
                    <td className="py-2 px-3 text-right">S/ {valorSinIGV.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-bold text-gray-900">S/ {importeVenta.toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* RESUMEN Y TOTALES */}
        <div className="flex flex-row justify-between items-end gap-4 mb-4 border-t-2 border-gray-100 pt-3">
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-3 inline-block w-full">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Monto en letras:</p>
              <p className="font-bold text-gray-800 text-xs">{numeroALetras(total)}</p>
            </div>
          </div>

          <div className="w-[280px] bg-white flex-shrink-0">
            <div className="space-y-1 text-xs text-gray-600">
              {!esNotaVenta && (
                <>
                  <div className="flex justify-between items-center px-3">
                    <span>Op. Gravada:</span>
                    <span className="font-medium">S/ {opGravada.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center px-3">
                    <span>Op. Inafecta:</span>
                    <span className="font-medium">S/ 0.00</span>
                  </div>
                  <div className="flex justify-between items-center px-3">
                    <span>Op. Exonerada:</span>
                    <span className="font-medium">S/ 0.00</span>
                  </div>
                  <div className="flex justify-between items-center px-3">
                    <span>IGV (18%):</span>
                    <span className="font-medium">S/ {igv.toFixed(2)}</span>
                  </div>
                </>
              )}
              {esNotaVenta && (
                <div className="flex justify-between items-center px-3 text-gray-500">
                  <span>Subtotal:</span>
                  <span className="font-medium">S/ {total.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center px-3 py-2 bg-blue-50 rounded-lg mt-1 border border-blue-100">
                <span className="font-black text-blue-900 uppercase text-xs">Importe Total:</span>
                <span className="font-black text-blue-700 text-base">S/ {formatMoneda(total).replace('S/ ', '')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="pt-3 border-t border-dashed border-gray-300 flex justify-between items-end">
          <div className="flex items-center gap-3">
            {!esNotaVenta && (
              <div className="p-1 border border-gray-200 bg-white rounded-lg shadow-sm">
                <QRCodeSVG value={qrString} size={55} level="M" />
              </div>
            )}
            <div className="text-[10px] text-gray-500 max-w-md">
              {!esNotaVenta ? (
                <>
                  {venta.hash_sunat && <p className="mb-0.5"><span className="font-bold text-gray-700">Hash:</span> {venta.hash_sunat}</p>}
                  <p className="leading-snug">
                    Representación impresa de la {venta.tipo_comprobante === 'Factura' ? 'Factura' : 'Boleta de Venta'} Electrónica.
                    Consulte su validez en <span className="font-semibold text-gray-700">www.sunat.gob.pe</span>
                  </p>
                </>
              ) : (
                <div className="space-y-0.5">
                  <p className="font-bold text-gray-700">Comprobante de Control Interno</p>
                  <p>Esta es una Nota de Venta, no constituye comprobante de pago electrónico legal.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Estado SUNAT (Solo pantalla, no imprimible) */}
      {!esNotaVenta && (
        <div className={`print:hidden text-center text-sm py-3 rounded-xl font-bold shadow-sm mx-auto max-w-2xl ${
          venta.estado_sunat === 'ACEPTADO' 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
            : venta.estado_sunat === 'PENDIENTE' || !venta.estado_sunat
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          Estado SUNAT: {venta.estado_sunat || 'PENDIENTE'} 
          {venta.mensaje_sunat && ` — ${venta.mensaje_sunat}`}
        </div>
      )}

      <style>{`
        @media print {
          @page {
            margin: 8mm;
            size: A4;
          }

          body, html {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Ocultar sidebar y topbar - usar selectores muy específicos */
          aside,
          nav,
          header,
          footer,
          .print\\:hidden,
          .lg\\:w-60,
          .lg\\:flex-shrink-0,
          .lg\\:hidden {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
            overflow: hidden !important;
          }

          /* Reset del layout principal */
          .flex.h-screen,
          #root,
          #root > div {
            display: block !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* El contenedor del contenido principal */
          .flex-1.flex.flex-col,
          main,
          .max-w-4xl {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            min-height: auto !important;
            height: auto !important;
            background: white !important;
          }

          /* Botones no imprimibles */
          .print\\:hidden {
            display: none !important;
          }

          /* El comprobante */
          #comprobante-imprimible {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 5mm !important;
            box-shadow: none !important;
            border: none !important;
            min-height: auto !important;
          }

          /* Preservar colores */
          .bg-blue-50 { background-color: #eff6ff !important; }
          .bg-gray-50 { background-color: #f9fafb !important; }
          .bg-blue-900 { background-color: #1e3a8a !important; color: white !important; }

          /* Tabla */
          table { width: 100% !important; table-layout: fixed !important; }
          td, th { word-wrap: break-word !important; overflow-wrap: break-word !important; }

          /* Evitar cortes entre secciones */
          .rounded-xl, .rounded-lg { break-inside: avoid !important; }
        }
      `}</style>
    </div>
  )
}
