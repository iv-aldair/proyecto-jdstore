import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { proformasApi } from '../../api/proformas.api.js'
import { PageLoader } from '../../components/ui/index.jsx'
import { formatMoneda } from '../../utils/formatMoneda.js'
import { Printer, ArrowLeft, Phone, MapPin, Mail, Globe, Flame } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function ProformaDetalle() {
  const { id } = useParams()
  const { usuario } = useAuth()
  const basePath = usuario?.id_rol === 1 ? '/admin' : '/vendedor'

  const { data: proforma, isLoading } = useQuery({
    queryKey: ['proforma', id],
    queryFn: () => proformasApi.obtener(id).then(r => r.data.datos),
    enabled: !!id
  })

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) return <PageLoader />
  if (!proforma) return <div className="p-10 text-center text-gray-500">Proforma no encontrada</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Botones de acción (No visibles en impresión) */}
      <div className="flex items-center justify-between print:hidden bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <Link to={`${basePath}/proformas`} className="btn-secondary">
          <ArrowLeft size={16} /> Volver
        </Link>
        <button onClick={handlePrint} className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md shadow-red-500/20 flex items-center gap-2 transition-all">
          <Printer size={18} /> Imprimir / PDF
        </button>
      </div>

      {/* DOCUMENTO PROFORMA */}
      <div className="bg-white shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden print:shadow-none print:rounded-none">
        
        {/* Header Decorativo Superior */}
        <div className="h-3 w-full bg-gradient-to-r from-red-600 via-orange-500 to-red-600"></div>

        <div className="p-8 md:p-12">
          
          {/* Cabecera */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b-2 border-gray-100 pb-8">
            {/* Logo y Empresa */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-black to-gray-800 rounded-xl flex items-center justify-center shadow-lg shadow-black/10">
                <span className="text-white font-black text-2xl tracking-tighter">JD</span>
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">JD STORE</h1>
                <p className="text-orange-600 font-semibold text-sm tracking-widest uppercase">Soluciones Tecnológicas</p>
                <div className="mt-3 space-y-1 text-xs text-gray-500">
                  <p className="flex items-center gap-1.5"><MapPin size={12} className="text-red-500"/> Jr. Moquegua 705, Juliaca</p>
                  <p className="flex items-center gap-1.5"><Phone size={12} className="text-red-500"/> 995 890 861 / 944 490 020</p>
                  <p className="flex items-center gap-1.5"><Mail size={12} className="text-red-500"/> ventas@jdstore.pe</p>
                </div>
              </div>
            </div>

            {/* Datos Documento */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 min-w-[240px]">
              <h2 className="text-xl font-bold text-gray-900 mb-1">PROFORMA</h2>
              <p className="text-2xl font-mono text-red-600 font-bold tracking-tight mb-4">{proforma.codigo_proforma}</p>
              
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Fecha:</span>
                  <span className="font-medium text-gray-900">{new Date(proforma.fecha).toLocaleDateString('es-PE')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Validez:</span>
                  <span className="font-medium text-gray-900">{proforma.validez_dias} días</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Vendedor:</span>
                  <span className="font-medium text-gray-900">{proforma.vendedor.split(' ')[0]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Datos del Cliente */}
          <div className="mt-8 bg-gray-50 rounded-xl p-5 border border-gray-100">
            <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-3">Preparado para</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Cliente / Razón Social</p>
                <p className="font-bold text-gray-900 text-lg uppercase">{proforma.cliente_nombre}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Teléfono / Contacto</p>
                <p className="font-semibold text-gray-800">{proforma.cliente_telefono || 'No registrado'}</p>
              </div>
            </div>
          </div>

          {/* Tabla de Productos */}
          <div className="mt-8">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-900 text-white text-sm">
                  <th className="py-3 px-4 rounded-tl-lg font-medium">Descripción del Producto</th>
                  <th className="py-3 px-4 font-medium text-center">Cant.</th>
                  <th className="py-3 px-4 font-medium text-right">P. Unitario</th>
                  <th className="py-3 px-4 font-medium text-right">Dscto.</th>
                  <th className="py-3 px-4 rounded-tr-lg font-medium text-right">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {proforma.detalles.map((d, i) => (
                  <tr key={i} className="group">
                    <td className="py-4 px-4 align-top">
                      <p className="font-bold text-gray-900 leading-tight">{d.producto}</p>
                      
                      {/* Mostrar descripción si existe (Ideal para specs de PC/Laptop) */}
                      {d.descripcion && (
                        <div className="mt-2 text-xs text-gray-600 whitespace-pre-line bg-gray-50 p-2 rounded border border-gray-100 border-l-2 border-l-orange-400">
                          {d.descripcion}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4 align-top text-center font-semibold text-gray-800">{d.cantidad}</td>
                    <td className="py-4 px-4 align-top text-right text-gray-600">{formatMoneda(d.precio_unitario)}</td>
                    <td className="py-4 px-4 align-top text-right text-orange-600 font-medium">
                      {d.descuento_unitario > 0 ? `- ${formatMoneda(d.descuento_unitario)}` : '-'}
                    </td>
                    <td className="py-4 px-4 align-top text-right font-bold text-gray-900">{formatMoneda(d.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales y Notas */}
          <div className="mt-8 flex flex-col md:flex-row justify-between items-start gap-8">
            {/* Notas */}
            <div className="flex-1 w-full text-sm text-gray-600 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
              <h4 className="font-bold text-orange-800 mb-2 flex items-center gap-2">
                <Flame size={16} className="text-orange-500"/> Términos y Condiciones
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-gray-600">
                <li>Los precios expresados están en Soles (S/) e incluyen IGV.</li>
                <li>Proforma válida por {proforma.validez_dias} días o hasta agotar stock.</li>
                <li>Los equipos cuentan con 1 año de garantía contra defectos de fábrica.</li>
                <li>La forma de pago es al contado, transferencia o Yape/Plin.</li>
                {proforma.notas && <li className="font-medium text-gray-800 mt-2">{proforma.notas}</li>}
              </ul>
            </div>

            {/* Resumen Total */}
            <div className="w-full md:w-80 space-y-3">
              <div className="flex justify-between items-center text-sm text-gray-600 px-4">
                <span>Subtotal:</span>
                <span className="font-medium">{formatMoneda(proforma.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-orange-600 px-4">
                <span>Descuento Total:</span>
                <span className="font-medium">- {formatMoneda(proforma.descuento_total)}</span>
              </div>
              <div className="bg-gradient-to-r from-gray-900 to-black rounded-xl p-4 text-white flex justify-between items-center shadow-lg shadow-black/20">
                <span className="font-bold">TOTAL A PAGAR:</span>
                <span className="text-2xl font-black text-red-400">{formatMoneda(proforma.total)}</span>
              </div>
            </div>
          </div>

          {/* Footer Documento */}
          <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col items-center justify-center text-center">
            <p className="font-bold text-gray-900">¡Gracias por su preferencia!</p>
            <p className="text-xs text-gray-500 mt-1">Cualquier duda sobre esta proforma, no dude en contactarnos.</p>
          </div>

        </div>
        
        {/* Footer Decorativo Inferior */}
        <div className="h-2 w-full bg-gradient-to-r from-red-600 via-orange-500 to-red-600"></div>
      </div>

      {/* Estilos para impresión */}
      <style>{`
        @media print {
          body { background-color: white !important; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:rounded-none { border-radius: 0 !important; }
          /* Ajustes para evitar que se corte a la mitad de una hoja */
          tr { page-break-inside: avoid; }
          h1, h2, h3, h4, h5 { page-break-after: avoid; }
        }
      `}</style>
    </div>
  )
}
