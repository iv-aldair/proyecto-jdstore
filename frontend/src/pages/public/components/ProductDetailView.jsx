import { useState, useRef } from 'react'
import {
  ChevronRight, ChevronLeft, Truck, Store, CreditCard,
  Plus, Minus, MessageCircle, ShoppingCart, CheckCircle2,
  ShieldCheck, Award, FileText, Cpu
} from 'lucide-react'
import { obtenerImagenesProducto, generarUrlWhatsAppProducto } from '../utils/productMedia.js'

export default function ProductDetailView({
  productoSeleccionado,
  productosSimilares = [],
  numeroWhatsapp,
  irAlInicio,
  seleccionarCategoria,
  abrirProducto,
  agregarAlCarrito
}) {
  const [imagenActivaIdx, setImagenActivaIdx] = useState(0)
  const [cantidadCompra, setCantidadCompra] = useState(1)
  const carruselSimilaresRef = useRef(null)

  if (!productoSeleccionado) return null

  const galeria = obtenerImagenesProducto(productoSeleccionado)
  const precioEfectivoPen = Number(productoSeleccionado.precio)
  const precioTarjetaPen = precioEfectivoPen * 1.05
  const urlWsp = generarUrlWhatsAppProducto(productoSeleccionado, cantidadCompra, numeroWhatsapp)
  const sedesStock = productoSeleccionado.disponibilidad_tiendas || []

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-10 animate-in fade-in duration-200">
      {/* Barra Superior de Navegación Breadcrumb */}
      <div className="bg-white rounded-2xl border border-slate-200/80 px-4 py-3 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center flex-wrap gap-2">
          <button onClick={irAlInicio} className="hover:text-red-600 font-bold text-slate-700 transition-colors">
            Inicio
          </button>
          <ChevronRight size={13} className="text-slate-400" />
          <button
            onClick={() => seleccionarCategoria(productoSeleccionado.id_categoria)}
            className="hover:text-red-600 font-bold text-slate-700 transition-colors"
          >
            {productoSeleccionado.nombre_categoria}
          </button>
          <ChevronRight size={13} className="text-slate-400" />
          <span className="text-red-600 font-extrabold truncate max-w-xs sm:max-w-md">
            {productoSeleccionado.nombre}
          </span>
        </div>

        <button
          onClick={irAlInicio}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-red-600 text-white font-bold transition-all shadow-sm"
        >
          <ChevronLeft size={15} /> Volver al catálogo
        </button>
      </div>

      {/* Contenedor Principal Estructurado (5 Columnas Galería + 7 Columnas Información y Compra) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 lg:p-8 shadow-sm grid lg:grid-cols-12 gap-8 items-start">
        {/* COLUMNA IZQUIERDA (5 Cols): Galería Proporcional + Garantías */}
        <div className="lg:col-span-5 space-y-4">
          {/* Imagen Principal con Aspect Ratio 4:3 Fijo */}
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-inner group">
            <img
              src={galeria[imagenActivaIdx] || galeria[0]}
              alt={productoSeleccionado.nombre}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />

            {/* Badges flotantes sobre la imagen */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="bg-slate-900/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                {productoSeleccionado.nombre_marca}
              </span>
            </div>

            <div className="absolute top-3 right-3">
              <span className="bg-emerald-500 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                <CheckCircle2 size={12} /> Stock: {productoSeleccionado.stock_total} und.
              </span>
            </div>
          </div>

          {/* Tira Horizontal de Miniaturas */}
          {galeria.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {galeria.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setImagenActivaIdx(idx)}
                  className={`h-20 rounded-xl border-2 overflow-hidden transition-all ${
                    imagenActivaIdx === idx
                      ? 'border-red-600 ring-2 ring-red-500/20 shadow-sm'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Sellos de Garantía Institucional JD Store */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-center">
              <ShieldCheck size={18} className="text-red-600 mx-auto mb-1" />
              <span className="block text-[10px] font-black text-slate-800 uppercase">Garantía Oficial</span>
              <span className="block text-[10px] text-slate-500">12 Meses en tienda</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-center">
              <FileText size={18} className="text-red-600 mx-auto mb-1" />
              <span className="block text-[10px] font-black text-slate-800 uppercase">SUNAT En Línea</span>
              <span className="block text-[10px] text-slate-500">Boleta o Factura</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-center">
              <Award size={18} className="text-red-600 mx-auto mb-1" />
              <span className="block text-[10px] font-black text-slate-800 uppercase">Soporte Propio</span>
              <span className="block text-[10px] text-slate-500">Juliaca y Puno</span>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA (7 Cols): Título, Precios, Botones de Compra, Stock y Especificaciones */}
        <div className="lg:col-span-7 space-y-6">
          {/* Encabezado del Producto */}
          <div className="border-b border-slate-100 pb-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full">
                {productoSeleccionado.nombre_categoria}
              </span>
              <span className="text-xs text-slate-500">
                Código SKU: <strong className="text-slate-900 font-mono">{productoSeleccionado.codigo_producto}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase leading-tight">
              {productoSeleccionado.nombre}{' '}
              <span className="text-slate-500 font-extrabold">
                ({productoSeleccionado.modelo || productoSeleccionado.codigo_producto})
              </span>
            </h1>

            <p className="text-xs text-slate-500 flex items-center gap-2">
              <span>Vendido y garantizado directamente por</span>
              <span className="font-black text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md">
                JD STORE S.C.R.L. · RUC 20600698479
              </span>
            </p>
          </div>

          {/* Bloque Central: Precios + Compra vs Stock por Sucursal */}
          <div className="grid md:grid-cols-12 gap-5 items-stretch">
            {/* Sub-columna Izquierda (7 Cols): Tarjeta de Precio y Botones de Acción */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              {/* Tarjeta de Precios Destacada (Fondo Blanco con Contorno Rojo) */}
              <div className="bg-white text-slate-900 rounded-2xl p-5 shadow-sm border-2 border-red-500 space-y-3">
                <div className="flex items-start justify-between gap-2 border-b border-red-100 pb-3">
                  <div>
                    <span className="text-[11px] font-extrabold text-red-600 uppercase tracking-wider block">
                      Precio Especial (Efectivo, Yape, Plin o Transferencia)
                    </span>
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-0.5 block">
                      S/ {precioEfectivoPen.toFixed(2)}
                    </span>
                  </div>
                  <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase shadow-sm">
                    Oferta
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600">
                  <div>
                    <span className="block text-[11px] text-slate-500 font-medium">Precio con Tarjeta de Crédito/Débito (+5%):</span>
                    <span className="text-base font-extrabold text-slate-800">S/ {precioTarjetaPen.toFixed(2)}</span>
                  </div>
                  <span className="text-[11px] bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg font-bold text-red-700">
                    Incluye IGV (18%)
                  </span>
                </div>
              </div>

              {/* Controles de Cantidad + Añadir al Carrito */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border-2 border-slate-200 bg-slate-50 rounded-2xl h-12">
                  <button
                    type="button"
                    onClick={() => setCantidadCompra(Math.max(1, cantidadCompra - 1))}
                    className="px-3.5 h-full text-slate-700 hover:text-red-600 transition-colors"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="px-3 text-sm font-black text-slate-900">{cantidadCompra}</span>
                  <button
                    type="button"
                    onClick={() => setCantidadCompra(cantidadCompra + 1)}
                    className="px-3.5 h-full text-slate-700 hover:text-red-600 transition-colors"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => agregarAlCarrito(productoSeleccionado, cantidadCompra)}
                  className="flex-1 h-12 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-black text-xs sm:text-sm uppercase rounded-2xl shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <ShoppingCart size={17} />
                  <span>Añadir al Carrito</span>
                </button>
              </div>

              {/* Botón Principal: Compra vía WhatsApp */}
              <a
                href={urlWsp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-13 py-3.5 px-5 rounded-2xl bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black text-sm flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                <MessageCircle size={20} className="fill-white/20" />
                <span>Compra vía WhatsApp (Atención Inmediata)</span>
              </a>
            </div>

            {/* Sub-columna Derecha (5 Cols): Disponibilidad por Sucursal y Entrega */}
            <div className="md:col-span-5 flex flex-col justify-between bg-slate-50 rounded-2xl border border-slate-200/80 p-4 space-y-4">
              {/* Stock en Tiempo Real por Sucursal */}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 mb-2.5">
                  <Store size={15} className="text-red-600" />
                  <span>Stock por Sucursal ({sedesStock.length || 3} sedes)</span>
                </h4>

                <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200/80">
                  {sedesStock.length > 0 ? (
                    sedesStock.map((st) => (
                      <div key={st.id_tienda} className="flex items-center justify-between text-xs py-1 border-b last:border-b-0 border-slate-100">
                        <span className="font-semibold text-slate-700 truncate pr-2">{st.nombre_tienda}</span>
                        <span
                          className={`font-black px-2 py-0.5 rounded-full text-[11px] ${
                            st.stock > 0
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {st.stock > 0 ? `${st.stock} und.` : 'Agotado'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-between text-xs py-1">
                      <span className="font-semibold text-slate-700">Sede Principal Juliaca</span>
                      <span className="font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[11px]">
                        {productoSeleccionado.stock_total} und.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Opciones de Entrega y Medios de Pago */}
              <div className="space-y-2.5 text-xs border-t border-slate-200/70 pt-3">
                <div className="flex items-start gap-2.5">
                  <Truck size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">Envío a Domicilio y Provincias</p>
                    <p className="text-emerald-600 font-bold text-[11px]">Entrega en 24h en Juliaca y Puno</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CreditCard size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900">Medios de Pago</p>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Efectivo, Yape, Plin, BCP, BBVA, Interbank y Tarjetas Visa / Mastercard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ficha Técnica y Especificaciones Estructuradas */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Cpu size={16} className="text-red-600" />
              <span>Características y Especificaciones Técnicas</span>
            </h4>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-white p-3.5 rounded-xl border border-slate-200/60">
              {productoSeleccionado.descripcion ||
                `Equipo original ${productoSeleccionado.nombre_marca} modelo ${productoSeleccionado.modelo}, ideal para alto rendimiento académico, corporativo y profesional.`}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Marca</span>
                <span className="font-black text-slate-900">{productoSeleccionado.nombre_marca}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Modelo</span>
                <span className="font-black text-slate-900">{productoSeleccionado.modelo || productoSeleccionado.codigo_producto}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Categoría</span>
                <span className="font-black text-slate-900">{productoSeleccionado.nombre_categoria}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Comprobante</span>
                <span className="font-black text-emerald-700">Boleta / Factura</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carrusel de Productos Similares */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Productos Similares que te pueden interesar
            </h2>
            <p className="text-xs text-slate-500">
              Otras alternativas disponibles en el catálogo de JD Store
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => carruselSimilaresRef.current?.scrollBy({ left: -320, behavior: 'smooth' })}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => carruselSimilaresRef.current?.scrollBy({ left: 320, behavior: 'smooth' })}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          ref={carruselSimilaresRef}
          className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth"
        >
          {productosSimilares.map((sim) => {
            const imgSim = obtenerImagenesProducto(sim)[0]
            const precioSimPen = Number(sim.precio)
            return (
              <div
                key={sim.id_producto}
                onClick={() => abrirProducto(sim)}
                className="min-w-[240px] max-w-[240px] bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-xl hover:border-red-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                    <span className="font-black uppercase text-red-600">{sim.nombre_marca}</span>
                    <span>CÓDIGO: {sim.codigo_producto}</span>
                  </div>
                  <div className="h-36 overflow-hidden rounded-xl bg-slate-100 mb-3">
                    <img
                      src={imgSim}
                      alt={sim.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 uppercase line-clamp-2 group-hover:text-red-600 transition-colors">
                    {sim.nombre}
                  </h4>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-base font-black text-slate-900">
                    S/ {precioSimPen.toFixed(2)}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Stock: {sim.stock_total}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
