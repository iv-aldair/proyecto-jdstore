import { ShoppingCart, X, Trash2, MessageCircle } from 'lucide-react'
import { obtenerImagenesProducto } from '../utils/productMedia.js'

export default function CartDrawer({
  carritoAbierto,
  setCarritoAbierto,
  carrito = [],
  setCarrito,
  numeroWhatsapp = '51951234567'
}) {
  if (!carritoAbierto) return null

  const totalCarritoSoles = carrito.reduce((acc, item) => acc + Number(item.precio) * item.cantidad, 0)

  const comprarCarritoPorWhatsApp = () => {
    if (carrito.length === 0) return
    const numLimpio = (numeroWhatsapp || '51951234567').replace(/\D/g, '')
    const lineas = carrito
      .map(
        (item, i) =>
          `${i + 1}. *${item.nombre}* (${item.codigo_producto}) x${item.cantidad} = S/ ${(
            Number(item.precio) * item.cantidad
          ).toFixed(2)}`
      )
      .join('\n')
    const texto = `¡Hola *JD STORE*! 👋 Quiero realizar el siguiente pedido desde la web:\n\n${lineas}\n\n💰 *TOTAL: S/ ${totalCarritoSoles.toFixed(
      2
    )}*\n\nQuedo atento para coordinar el pago y la entrega.`
    window.open(`https://wa.me/${numLimpio}?text=${encodeURIComponent(texto)}`, '_blank')
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center">
              <ShoppingCart size={16} />
            </div>
            <h3 className="font-black text-sm">Mi Carrito de Compras ({carrito.length})</h3>
          </div>
          <button
            onClick={() => setCarritoAbierto(false)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {carrito.length === 0 ? (
            <div className="text-center py-20 text-slate-400 text-xs">
              Tu carrito está vacío. Explora nuestro catálogo y añade tus equipos favoritos.
            </div>
          ) : (
            carrito.map((item) => (
              <div
                key={item.id_producto}
                className="flex items-center justify-between gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/50"
              >
                <img
                  src={obtenerImagenesProducto(item)[0]}
                  alt={item.nombre}
                  className="w-14 h-14 object-contain rounded-xl bg-white p-1 border border-slate-100"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-slate-900 truncate">{item.nombre}</p>
                  <p className="text-xs text-red-600 font-black mt-0.5">
                    S/ {Number(item.precio).toFixed(2)} x {item.cantidad}
                  </p>
                </div>
                <button
                  onClick={() => setCarrito(carrito.filter((c) => c.id_producto !== item.id_producto))}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-xl transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {carrito.length > 0 && (
          <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50">
            <div className="flex items-center justify-between font-black text-base text-slate-900">
              <span>Total a pagar:</span>
              <span>S/ {totalCarritoSoles.toFixed(2)}</span>
            </div>
            <button
              onClick={comprarCarritoPorWhatsApp}
              className="w-full bg-[#25D366] hover:bg-emerald-600 text-white font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <MessageCircle size={18} />
              <span>Finalizar Pedido vía WhatsApp</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
