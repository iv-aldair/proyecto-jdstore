import { Receipt } from 'lucide-react'

export default function Comprobante() {
  return (
    <div className="space-y-5">
      <h1 className="page-title">Ver comprobante</h1>
      <div className="card p-10 flex flex-col items-center text-center">
        <Receipt size={40} className="text-gray-300 mb-3" />
        <p className="text-gray-500 text-sm">
          Los comprobantes se muestran automáticamente al finalizar cada venta en el POS.
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Cuando integres Nubefact, aquí aparecerán los enlaces al PDF y XML.
        </p>
      </div>
    </div>
  )
}