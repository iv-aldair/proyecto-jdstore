import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight, Flame, CheckCircle2 } from 'lucide-react'
import { obtenerImagenesProducto } from '../utils/productMedia.js'

export default function HeroCarousel({
  productos = [],
  categorias = [],
  abrirProducto,
  seleccionarCategoria
}) {
  const [slideActual, setSlideActual] = useState(0)

  const slidesOfertas = useMemo(() => {
    const lapGamer = productos.find(p => p.codigo_producto === 'LAP-HP-002') || productos[0]
    const thinkpad = productos.find(p => p.codigo_producto === 'LAP-LEN-002') || productos[1]
    const monitorSam = productos.find(p => p.codigo_producto === 'MON-SAM-001') || productos[2]
    const impEpson = productos.find(p => p.codigo_producto === 'IMP-EP-001') || productos[3]

    return [
      {
        id: 1,
        etiqueta: 'OFERTA ESTELAR GAMER & INGENIERÍA',
        titulo: 'HP VICTUS GAMING',
        subtitulo: 'INTEL CORE i5 · GTX 1650 · 512GB SSD',
        producto: lapGamer,
        descuentoSoles: 250,
        bgClass: 'from-slate-950 via-slate-900 to-red-950',
        imagen: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=900&h=600&q=85'
      },
      {
        id: 2,
        etiqueta: 'RENDIMIENTO PROFESIONAL EXTREMO',
        titulo: 'THINKPAD SERIE E14',
        subtitulo: 'CORE i7 12VA GEN · 16GB RAM · 512GB SSD',
        producto: thinkpad,
        descuentoSoles: 300,
        bgClass: 'from-slate-950 via-zinc-900 to-slate-800',
        imagen: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=900&h=600&q=85'
      },
      {
        id: 3,
        etiqueta: 'PANTALLAS DE ALTA DEFINICIÓN',
        titulo: 'MONITORES FULL HD',
        subtitulo: 'COLORES ULTRANÍTIDOS Y FLUIDEZ 75HZ',
        producto: monitorSam,
        descuentoSoles: 80,
        bgClass: 'from-slate-950 via-slate-900 to-rose-950',
        imagen: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&h=600&q=85'
      },
      {
        id: 4,
        etiqueta: 'MULTIFUNCIONALES TINTA CONTINUA',
        titulo: 'EPSON ECOTANK WIFI',
        subtitulo: 'MÁXIMO AHORRO PARA HOGAR Y OFICINA',
        producto: impEpson,
        descuentoSoles: 100,
        bgClass: 'from-slate-950 via-neutral-900 to-slate-900',
        imagen: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=900&h=600&q=85'
      }
    ]
  }, [productos])

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideActual((prev) => (prev + 1) % slidesOfertas.length)
    }, 5500)
    return () => clearInterval(timer)
  }, [slidesOfertas.length])

  const slide = slidesOfertas[slideActual] || slidesOfertas[0]
  const prod = slide?.producto
  const precioPen = Number(prod?.precio || 3599)
  const precioAntesPen = precioPen + (slide?.descuentoSoles || 200)

  const irAnterior = () => {
    setSlideActual((slideActual - 1 + slidesOfertas.length) % slidesOfertas.length)
  }

  const irSiguiente = () => {
    setSlideActual((slideActual + 1) % slidesOfertas.length)
  }

  return (
    <section className="relative">
      {/* Banner Carrusel Principal con Altura Fija Uniforme */}
      <div className={`bg-gradient-to-r ${slide.bgClass} text-white transition-colors duration-500 relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Contenedor Principal con Padding Lateral Amplio para que las flechas NUNCA tapen el texto */}
        <div className="max-w-7xl mx-auto px-6 sm:px-16 lg:px-20 pt-8 pb-12 md:py-0 md:h-[430px] flex items-center relative z-10">
          <div className="grid md:grid-cols-12 gap-8 items-center w-full">
            {/* Izquierda: Información de la Oferta (Altura controlada) */}
            <div className="md:col-span-6 space-y-3.5">
              <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/30 px-3.5 py-1.5 rounded-full text-[11px] font-extrabold tracking-wider text-red-300 uppercase">
                <Flame size={14} className="text-red-400 flex-shrink-0" />
                <span className="truncate">{slide.etiqueta}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white line-clamp-1">
                {slide.titulo}
              </h1>

              <p className="text-sm sm:text-base lg:text-lg font-extrabold text-red-400 tracking-wide line-clamp-1">
                {slide.subtitulo}
              </p>

              {prod && (
                <div className="bg-white/10 backdrop-blur-md inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl border border-white/15">
                  <div>
                    <p className="text-xs font-bold text-white line-clamp-1">{prod.nombre}</p>
                    <p className="text-[11px] text-slate-300 flex items-center gap-1.5 mt-0.5">
                      <span>CÓDIGO: {prod.codigo_producto}</span>
                      <span>·</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 size={11} /> Stock disponible ({prod.stock_total || 5} und.)
                      </span>
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                {prod && (
                  <button
                    onClick={() => abrirProducto(prod)}
                    className="inline-flex items-center gap-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-xl shadow-red-600/30 hover:scale-105 transition-all"
                  >
                    <span>Ver Oferta y Comprar</span>
                    <ArrowRight size={17} />
                  </button>
                )}
              </div>
            </div>

            {/* Derecha: Marco de Imagen con Tamaño Exacto y Fijo en todos los slides */}
            <div className="md:col-span-6 flex items-center justify-center">
              <div
                onClick={() => prod && abrirProducto(prod)}
                className="relative w-full max-w-[460px] h-[250px] sm:h-[290px] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/15 bg-slate-900 cursor-pointer group"
              >
                <img
                  src={slide.imagen}
                  alt={slide.titulo}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />

                {/* Sombra interna sutil para legibilidad de los badges */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/20 pointer-events-none" />

                {/* Badge de Descuento dentro del marco */}
                <div className="absolute top-3.5 right-3.5 bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-1.5 rounded-2xl shadow-xl border border-red-500/40">
                  <span className="block text-[9px] font-bold uppercase text-red-400 leading-none">🔥 AHORRA HOY</span>
                  <span className="text-base font-black text-white">-S/ {slide.descuentoSoles}.00</span>
                </div>

                {/* Badge de Precio en Soles dentro del marco */}
                <div className="absolute bottom-3.5 right-3.5 bg-gradient-to-br from-red-600 to-red-500 text-white px-5 py-2.5 rounded-2xl flex flex-col items-end justify-center shadow-2xl border border-white/25">
                  <span className="text-[9px] font-bold uppercase tracking-wider opacity-95">PRECIO OFERTA</span>
                  <span className="text-xl sm:text-2xl font-black leading-none mt-0.5">S/ {precioPen.toFixed(2)}</span>
                  <span className="text-[10px] line-through opacity-80 mt-0.5">Antes: S/ {precioAntesPen.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Flechas Laterales Posicionadas en los Bordes Exteriores (Fuera del área de texto) */}
          <button
            onClick={irAnterior}
            aria-label="Anterior oferta"
            className="hidden sm:flex absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-slate-900/70 hover:bg-red-600 text-white items-center justify-center backdrop-blur-md border border-white/15 shadow-lg transition-all z-20"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={irSiguiente}
            aria-label="Siguiente oferta"
            className="hidden sm:flex absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl bg-slate-900/70 hover:bg-red-600 text-white items-center justify-center backdrop-blur-md border border-white/15 shadow-lg transition-all z-20"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Barra Inferior de Indicadores + Controles Móviles */}
        <div className="flex items-center justify-center gap-3 pb-7 relative z-10">
          <button
            onClick={irAnterior}
            className="sm:hidden w-8 h-8 rounded-xl bg-white/10 hover:bg-red-600 text-white flex items-center justify-center"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex items-center gap-2 bg-slate-950/40 backdrop-blur-sm px-3.5 py-1.5 rounded-full border border-white/10">
            {slidesOfertas.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setSlideActual(idx)}
                className={`h-2 rounded-full transition-all ${
                  slideActual === idx ? 'w-8 bg-red-500' : 'w-2 bg-white/35 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          <button
            onClick={irSiguiente}
            className="sm:hidden w-8 h-8 rounded-xl bg-white/10 hover:bg-red-600 text-white flex items-center justify-center"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Tarjetas de Categorías Principales debajo del Carrusel (Todas con Imagen de Igual Tamaño) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 relative z-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categorias.slice(0, 6).map((cat) => {
            const prodEjemplo = productos.find((p) => p.id_categoria === cat.id_categoria)
            const imgCat = obtenerImagenesProducto(prodEjemplo || { nombre_categoria: cat.nombre_categoria })[0]
            return (
              <button
                key={cat.id_categoria}
                onClick={() => seleccionarCategoria(cat.id_categoria)}
                className="bg-white rounded-2xl border border-slate-200/80 p-3.5 shadow-sm hover:shadow-xl hover:border-red-300 hover:-translate-y-1 transition-all flex flex-col items-center text-center group"
              >
                <div className="w-full h-28 overflow-hidden rounded-xl bg-slate-100 relative">
                  <img
                    src={imgCat}
                    alt={cat.nombre_categoria}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="font-extrabold text-xs text-slate-800 mt-3 group-hover:text-red-600 transition-colors line-clamp-1">
                  {cat.nombre_categoria}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
