import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { guiasRemisionApi } from '../../api/guiasRemision.api.js'
import { backupsApi } from '../../api/backups.api.js' // Para obtener la configuración (RUC, Empresa)
import { PageLoader } from '../../components/ui/index.jsx'
import { ArrowLeft, Printer } from 'lucide-react'
import QRCode from 'react-qr-code'

export default function GuiaImpresion() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: guia, isLoading: loadGuia } = useQuery({
    queryKey: ['guia_remision', id],
    queryFn: () => guiasRemisionApi.obtener(id).then(r => r.data.datos)
  })

  const { data: config, isLoading: loadConfig } = useQuery({
    queryKey: ['configuracion'],
    queryFn: () => backupsApi.obtenerConfig().then(r => r.data.datos)
  })

  if (loadGuia || loadConfig) return <PageLoader />
  if (!guia) return <div className="p-8 text-center text-red-500 font-bold">Guía no encontrada</div>

  const handlePrint = () => window.print()

  // Formato de fecha dd-mm-yyyy
  const f = new Date(guia.fecha_emision)
  const fechaStr = `${String(f.getDate() + 1).padStart(2, '0')}-${String(f.getMonth() + 1).padStart(2, '0')}-${f.getFullYear()}`
  
  const qrData = `${config?.empresa_ruc || '00000000000'}|09|${guia.numero_guia.split('-')[0]}|${guia.numero_guia.split('-')[1]}|${fechaStr}|${guia.destinatario_tipo_doc}|${guia.destinatario_identificacion}`

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8 print:p-0 print:bg-white font-sans text-black">
      
      {/* Botones de control flotantes (Ocultos en impresión) */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <button onClick={() => navigate('/admin/guias-remision')} className="btn-secondary">
          <ArrowLeft size={18} /> Volver
        </button>
        <button onClick={handlePrint} className="btn-primary shadow-lg">
          <Printer size={18} /> Imprimir Guía (A4)
        </button>
      </div>

      {/* Contenedor A4 */}
      <div className="max-w-[210mm] mx-auto bg-white p-8 shadow-xl print:shadow-none print:w-[210mm] print:h-[297mm] print:p-8">
        
        {/* Cabecera */}
        <div className="flex justify-between items-start mb-6">
          <div className="w-1/2 pt-4">
            <h1 className="text-3xl font-black text-blue-900 tracking-tighter uppercase leading-none">
              {config?.empresa_nombre || 'JD STORE'}
            </h1>
            <p className="text-sm font-semibold text-red-600 mt-1 italic">Tecnología a tu alcance</p>
            <p className="text-xs font-bold mt-4 uppercase">{config?.empresa_nombre || 'JD STORE SOC.COM.RESPONS. LTDA'}</p>
          </div>
          
          <div className="w-[45%] border-2 border-blue-800 rounded-xl p-4 text-center">
            <p className="text-xl font-bold">R.U.C. N° {config?.empresa_ruc || '20600698479'}</p>
            <p className="text-lg font-bold my-2 px-4 leading-tight">
              GUÍA DE REMISIÓN REMITENTE ELECTRÓNICA
            </p>
            <p className="text-xl font-bold">N°: {guia.numero_guia}</p>
          </div>
        </div>

        <div className="text-xs font-bold mb-2">FECHA DE EMISIÓN: <span className="font-normal">{fechaStr}</span></div>

        {/* Sección de Direcciones */}
        <div className="flex gap-4 mb-4">
          <div className="w-1/2 border border-blue-800 rounded-lg p-3 text-[10px] leading-tight">
            <p className="font-bold mb-1 -mt-5 bg-white inline-block px-1">PUNTO DE PARTIDA</p>
            <p className="font-bold">DIRECCIÓN: <span className="font-normal">{guia.partida_direccion}</span></p>
            <p className="font-bold">UBIGEO: <span className="font-normal">{guia.partida_ubigeo}</span></p>
            <p className="font-bold">CÓDIGO: <span className="font-normal">{guia.partida_codigo || ''}</span></p>
          </div>
          <div className="w-1/2 border border-blue-800 rounded-lg p-3 text-[10px] leading-tight">
            <p className="font-bold mb-1 -mt-5 bg-white inline-block px-1">PUNTO DE LLEGADA</p>
            <p className="font-bold">DIRECCIÓN: <span className="font-normal">{guia.llegada_direccion}</span></p>
            <p className="font-bold">UBIGEO: <span className="font-normal">{guia.llegada_ubigeo}</span></p>
            <p className="font-bold">CÓDIGO: <span className="font-normal">{guia.llegada_codigo || ''}</span></p>
          </div>
        </div>

        {/* Destinatario y Datos de Envío */}
        <div className="flex gap-4 mb-4">
          <div className="w-1/2 border border-blue-800 rounded-lg p-3 text-[10px] leading-tight min-h-[90px]">
            <p className="font-bold mb-1 -mt-5 bg-white inline-block px-1">DESTINATARIO</p>
            <p className="font-bold">RAZÓN SOCIAL: <span className="font-normal">{guia.destinatario_razon_social}</span></p>
            <p className="font-bold">No. IDENTIFICACIÓN: <span className="font-normal">{guia.destinatario_identificacion}</span></p>
            <p className="font-bold">TIPO DOCUMENTO: <span className="font-normal">{guia.destinatario_tipo_doc}</span></p>
          </div>
          <div className="w-1/2 border border-blue-800 rounded-lg p-3 text-[10px] leading-tight min-h-[90px]">
            <p className="font-bold mb-1 -mt-5 bg-white inline-block px-1">DATOS DE ENVIO</p>
            <p className="font-bold">MOTIVO DE TRASLADO: <span className="font-normal">{guia.motivo_traslado}</span></p>
            <p className="font-bold">PESO BRUTO TOTAL CARGA: <span className="font-normal">{guia.peso_bruto} KGM</span></p>
            <p className="font-bold">No. BULTOS O PALLETS: <span className="font-normal">{guia.bultos}</span></p>
            <p className="font-bold">MODALIDAD: <span className="font-normal">{guia.modalidad_traslado}</span></p>
          </div>
        </div>

        {/* Transportista y Documentos Relacionados */}
        <div className="flex gap-4 mb-6">
          <div className="w-1/2 border border-blue-800 rounded-lg p-3 text-[10px] leading-tight">
            <p className="font-bold mb-1 -mt-5 bg-white inline-block px-1">DATOS DEL TRANSPORTISTA</p>
            <p className="font-bold">RAZÓN SOCIAL: <span className="font-normal">{guia.transp_razon_social || '-'}</span></p>
            <p className="font-bold">No. IDENTIDAD: <span className="font-normal">{guia.transp_identidad || '-'}</span></p>
            <p className="font-bold">PLACA VEHÍCULO PRINCIPAL: <span className="font-normal">{guia.transp_placa || '-'}</span></p>
          </div>
          <div className="w-1/2">
            <div className="border border-blue-800 rounded-lg p-3 text-[10px] leading-tight">
              <p className="font-bold mb-1 -mt-5 bg-white inline-block px-1">DOCUMENTOS RELACIONADOS</p>
              <div className="flex justify-between font-bold border-b border-gray-300 pb-1 mb-1">
                <span className="w-1/3 text-center">No. DE DOCUMENTO</span>
                <span className="w-1/3 text-center border-l border-gray-300">TIPO DE DOCUMENTO</span>
                <span className="w-1/3 text-center border-l border-gray-300">RUC DEL EMISOR</span>
              </div>
              <div className="flex justify-between text-center">
                <span className="w-1/3">{guia.doc_rel_numero || '-'}</span>
                <span className="w-1/3 border-l border-gray-300">{guia.doc_rel_tipo || '-'}</span>
                <span className="w-1/3 border-l border-gray-300">{guia.doc_rel_ruc || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bienes a Trasladar */}
        <p className="font-bold text-xs mb-1">BIENES A TRASLADAR</p>
        <div className="border border-blue-800 rounded-lg overflow-hidden">
          <table className="w-full text-[10px] text-left">
            <thead className="bg-gray-50 border-b border-blue-800">
              <tr>
                <th className="px-2 py-1 text-center font-bold border-r border-blue-800 w-8">N°</th>
                <th className="px-2 py-1 text-center font-bold border-r border-blue-800 w-24">CÓDIGO</th>
                <th className="px-2 py-1 text-center font-bold border-r border-blue-800">DESCRIPCIÓN</th>
                <th className="px-2 py-1 text-center font-bold border-r border-blue-800 w-16">UNIDAD</th>
                <th className="px-2 py-1 text-center font-bold w-16">CANTIDAD</th>
              </tr>
            </thead>
            <tbody>
              {guia.detalles?.map((d, index) => (
                <tr key={index} className="border-b border-blue-800 last:border-0 align-top">
                  <td className="px-2 py-1 text-center border-r border-blue-800">{index + 1}</td>
                  <td className="px-2 py-1 text-center border-r border-blue-800">{d.codigo_producto}</td>
                  <td className="px-2 py-1 border-r border-blue-800">
                    <p>{d.descripcion}</p>
                    {d.series && <p className="text-[9px] text-gray-700 mt-1">{d.series}</p>}
                  </td>
                  <td className="px-2 py-1 text-center border-r border-blue-800 font-bold">{d.unidad}</td>
                  <td className="px-2 py-1 text-center font-bold text-green-700">{d.cantidad}</td>
                </tr>
              ))}
              {/* Espacio en blanco para llenar el A4 si son pocos items */}
              {(!guia.detalles || guia.detalles.length < 5) && (
                <tr className="align-top"><td colSpan="5" className="h-32"></td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / QR / Firma */}
        <div className="mt-8 flex justify-between items-end">
          <div className="w-[60%] text-[10px] font-bold leading-tight">
            <p className="mb-2">REPRESENTACIÓN IMPRESA DE GUIA DE REMISIÓN REMITENTE ELECTRONICA.<br/>LA MERCADERÍA VIAJA POR RIESGO Y CUENTA DEL CLIENTE.</p>
            <p className="font-normal text-green-800 bg-green-50 inline-block p-1">RECOGE: {guia.destinatario_razon_social} CON {guia.destinatario_tipo_doc} {guia.destinatario_identificacion}</p>
          </div>
          <div className="w-[15%]">
            <QRCode value={qrData} size={80} level="M" />
          </div>
          <div className="w-[20%] text-center">
            <div className="h-20 border-2 border-blue-800 rounded-lg mb-1"></div>
            <p className="text-[10px] font-bold text-green-900">RECIBÍ<br/>CONFORME</p>
          </div>
        </div>

      </div>
    </div>
  )
}
