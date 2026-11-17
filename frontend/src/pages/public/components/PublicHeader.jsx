import { Link } from 'react-router-dom'
import {
  Menu, Search, User, ShoppingCart, ChevronDown, ChevronRight, X, Flame,
  MapPin, Phone, ShieldCheck, Clock
} from 'lucide-react'
import { obtenerImagenesProducto, iconoPorCategoria } from '../utils/productMedia.js'

export default function PublicHeader({
  usuario,
  datos,
  busqueda,
  setBusqueda,
  megaMenuAbierto,
  setMegaMenuAbierto,
  catActivaMega,
  setCatActivaMega,
  menuMarcasAbierto,
  setMenuMarcasAbierto,
  carrito,
  setCarritoAbierto,
  irAlInicio,
  abrirProducto,
  seleccionarCategoria,
  seleccionarMarca,
  activarSoloOfertas
}) {
  const totalUnidadesCarrito = carrito.reduce((a, b) => a + b.cantidad, 0)
  const totalSolesCarrito = carrito.reduce((a, b) => a + Number(b.precio) * b.cantidad, 0)

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80">
      {/* Cinta Informativa Superior (Top Bar Institucional) */}
      <div className="bg-slate-950 text-slate-300 text-[11px] border-b border-slate-800/80 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <MapPin size={12} className="text-red-500" />
              <span>Sedes en <strong>Juliaca</strong> (Jr. Noriega 342) y <strong>Puno</strong></span>
            </span>
            <span className="hidden lg:flex items-center gap-1.5 text-slate-400">
              <Clock size={12} className="text-red-500" />
              <span>{datos?.institucional?.horario_atencion || 'Lun - Sáb: 8:30 AM - 8:00 PM'}</span>
            </span>
          </div>

          <div className="flex items-center gap-5">
            <span className="hidden md:flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck size={13} />
              <span>Garantía Oficial · RUC {datos?.institucional?.ruc || '20600698479'}</span>
            </span>
            <a
              href={`https://wa.me/${(datos?.institucional?.whatsapp || '51951234567').replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-white hover:text-red-400 font-bold transition-colors"
            >
              <Phone size={12} className="text-red-500" />
              <span>Ventas: {datos?.institucional?.telefono_central || '951 234 567'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Barra Principal del Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3 lg:gap-6">
        {/* Izquierda: Logo JD STORE + Botón Categorías */}
        <div className="flex items-center gap-3 lg:gap-5 flex-shrink-0">
          {/* Logo JD STORE (Regresa al Inicio) */}
          <button
            onClick={irAlInicio}
            className="flex items-center gap-2.5 sm:gap-3 text-left group focus:outline-none"
            title="Ir al Inicio de JD Store"
          >
            <div className="w-11 h-11 bg-gradient-to-br from-red-600 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/25 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-lg tracking-tighter">JD</span>
            </div>
            <div>
              <span className="block text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-slate-900 leading-none group-hover:text-red-600 transition-colors">
                JD STORE
              </span>
              <span className="block text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-1">
                TECNOLOGÍA & CÓMPUTO
              </span>
            </div>
          </button>

          {/* Botón Mega-Menú Categorías */}
          <button
            onClick={() => {
              setMegaMenuAbierto(!megaMenuAbierto)
              setMenuMarcasAbierto(false)
            }}
            className={`flex items-center gap-2 font-bold text-xs sm:text-sm px-3.5 sm:px-4 py-2.5 rounded-xl transition-all active:scale-95 ${
              megaMenuAbierto
                ? 'bg-slate-900 text-white shadow-lg'
                : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-md shadow-red-600/20'
            }`}
          >
            <Menu size={17} />
            <span>Categorías</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${megaMenuAbierto ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Centro: Buscador Inteligente con Botón Integrado */}
        <div className="hidden md:flex flex-1 max-w-xl">
          <div className="relative w-full flex items-center">
            <Search size={17} className="absolute left-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar laptops, monitores, impresoras, códigos o marcas..."
              className="w-full pl-11 pr-24 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/90 hover:bg-white focus:bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda('')}
                className="absolute right-20 text-slate-400 hover:text-slate-600 p-1"
                title="Limpiar búsqueda"
              >
                <X size={15} />
              </button>
            )}
            <a
              href="#catalogo"
              className="absolute right-1.5 bg-slate-900 hover:bg-red-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-colors"
            >
              Buscar
            </a>
          </div>
        </div>

        {/* Derecha: Usuario + Carrito (Alineados sin desbordar) */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          {usuario ? (
            <Link
              to={usuario.id_rol === 1 ? '/admin' : '/vendedor'}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-slate-800 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
                <User size={15} />
              </div>
              <div className="hidden lg:block text-left leading-tight">
                <span className="block text-[9px] text-red-600 uppercase font-extrabold tracking-wider">PANEL ACTIVO</span>
                <span className="font-bold text-xs text-slate-900">{usuario.nombre.split(' ')[0]}</span>
              </div>
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200 text-slate-700 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 flex-shrink-0">
                <User size={16} />
              </div>
              <div className="hidden lg:block text-left leading-tight">
                <span className="block text-[9px] text-slate-400 uppercase font-bold">SISTEMA</span>
                <span className="font-bold text-xs text-slate-900">Iniciar Sesión</span>
              </div>
            </Link>
          )}

          <button
            onClick={() => setCarritoAbierto(true)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-md transition-all active:scale-95"
          >
            <div className="relative flex items-center justify-center">
              <ShoppingCart size={18} />
              {totalUnidadesCarrito > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow">
                  {totalUnidadesCarrito}
                </span>
              )}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <span className="block text-[9px] text-slate-400 font-bold uppercase">Mi Carrito</span>
              <span className="font-black text-xs text-white">
                {totalUnidadesCarrito > 0 ? `S/ ${totalSolesCarrito.toFixed(2)}` : 'S/ 0.00'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Buscador móvil */}
      <div className="md:hidden px-4 pb-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar laptops, monitores, impresoras..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:border-red-500"
          />
        </div>
      </div>

      {/* Sub-barra de Navegación con Paleta JD Store (Slate-900 + Red-500) */}
      <div className="bg-slate-900 text-slate-200 text-xs font-semibold border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-6">
            <button
              onClick={irAlInicio}
              className="flex items-center gap-2 text-white hover:text-red-400 font-bold whitespace-nowrap transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span>Inicio</span>
            </button>

            <a
              href="#catalogo"
              onClick={() => irAlInicio()}
              className="hover:text-red-400 whitespace-nowrap transition-colors"
            >
              Catálogo Completo
            </a>

            <button
              onClick={() => {
                setMenuMarcasAbierto(!menuMarcasAbierto)
                setMegaMenuAbierto(false)
              }}
              className="flex items-center gap-1 hover:text-red-400 py-2 whitespace-nowrap transition-colors"
            >
              <span>Marcas Oficiales</span>
              <ChevronDown size={14} className={`transition-transform ${menuMarcasAbierto ? 'rotate-180 text-red-400' : ''}`} />
            </button>

            <button
              onClick={activarSoloOfertas}
              className="flex items-center gap-1 text-red-400 hover:text-red-300 font-bold whitespace-nowrap transition-colors"
            >
              <Flame size={14} />
              <span>Ofertas</span>
            </button>
          </div>

          <div className="flex items-center gap-6 whitespace-nowrap ml-6">
            <a
              href="#servicios"
              onClick={() => irAlInicio()}
              className="hover:text-red-400 transition-colors"
            >
              Servicio Técnico
            </a>

            <a
              href="#noticias"
              onClick={() => irAlInicio()}
              className="hover:text-red-400 transition-colors"
            >
              Novedades
            </a>

            <a
              href="#nosotros"
              onClick={() => irAlInicio()}
              className="hover:text-red-400 transition-colors"
            >
              Sobre Nosotros
            </a>

            <a
              href="#contacto"
              onClick={() => irAlInicio()}
              className="hover:text-red-400 transition-colors"
            >
              Sucursales y Contacto
            </a>
          </div>
        </div>
      </div>

      {/* Mega-Menú Desplegable de Categorías */}
      {megaMenuAbierto && (
        <div className="absolute left-0 right-0 top-full bg-white border-b border-slate-200 shadow-2xl z-50 animate-in fade-in duration-150">
          <div className="max-w-7xl mx-auto grid grid-cols-12 min-h-[380px]">
            {/* Lista Izquierda de Categorías */}
            <div className="col-span-12 md:col-span-3 bg-slate-50 border-r border-slate-200/80 py-3">
              {datos.categorias.map((cat) => {
                const Icono = iconoPorCategoria(cat.nombre_categoria)
                const activa = catActivaMega?.id_categoria === cat.id_categoria
                return (
                  <button
                    key={cat.id_categoria}
                    onMouseEnter={() => setCatActivaMega(cat)}
                    onClick={() => seleccionarCategoria(cat.id_categoria)}
                    className={`w-full flex items-center justify-between px-5 py-3 text-xs font-bold transition-all ${
                      activa
                        ? 'bg-white text-red-600 border-l-4 border-red-600 shadow-sm'
                        : 'text-slate-700 hover:bg-white/60'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Icono size={16} className={activa ? 'text-red-600' : 'text-slate-400'} />
                      <span>{cat.nombre_categoria}</span>
                    </span>
                    <ChevronRight size={14} className={activa ? 'text-red-600' : 'text-slate-400'} />
                  </button>
                )
              })}
            </div>

            {/* Contenido Derecho de la Categoría */}
            <div className="col-span-12 md:col-span-9 p-6 relative">
              <button
                onClick={() => setMegaMenuAbierto(false)}
                className="absolute top-4 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={18} />
              </button>

              {catActivaMega && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 pr-10">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-black text-slate-900">{catActivaMega.nombre_categoria}</h3>
                      <button
                        onClick={() => seleccionarCategoria(catActivaMega.id_categoria)}
                        className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full transition-colors"
                      >
                        Ver todos ({datos.productos.filter(p => p.id_categoria === catActivaMega.id_categoria).length}) →
                      </button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-6">
                    {/* Equipos disponibles */}
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-l-2 border-red-600 pl-2.5 mb-3">
                        MODELOS EN CATÁLOGO
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-600">
                        {datos.productos
                          .filter((p) => p.id_categoria === catActivaMega.id_categoria)
                          .map((prod) => (
                            <li key={prod.id_producto}>
                              <button
                                onClick={() => abrirProducto(prod)}
                                className="hover:text-red-600 font-medium text-left transition-colors"
                              >
                                {prod.nombre}
                              </button>
                            </li>
                          ))}
                      </ul>
                    </div>

                    {/* Marcas de esta categoría */}
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 border-l-2 border-red-600 pl-2.5 mb-3">
                        MARCAS DISPONIBLES
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          ...new Set(
                            datos.productos
                              .filter((p) => p.id_categoria === catActivaMega.id_categoria)
                              .map((p) => JSON.stringify({ id: p.id_marca, nombre: p.nombre_marca }))
                          )
                        ].map((str) => {
                          const m = JSON.parse(str)
                          return (
                            <button
                              key={m.id}
                              onClick={() => seleccionarMarca(m.id)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-600 hover:text-white text-xs font-bold text-slate-700 transition-colors"
                            >
                              {m.nombre}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Destacado visual de la categoría */}
                    <div>
                      {(() => {
                        const prodDestacado = datos.productos.find(
                          (p) => p.id_categoria === catActivaMega.id_categoria
                        )
                        if (!prodDestacado) return null
                        const imgUrl = obtenerImagenesProducto(prodDestacado)[0]
                        return (
                          <div
                            onClick={() => abrirProducto(prodDestacado)}
                            className="cursor-pointer group rounded-2xl border border-slate-200 p-3.5 bg-slate-50/60 hover:border-red-300 hover:shadow-md transition-all"
                          >
                            <img
                              src={imgUrl}
                              alt={prodDestacado.nombre}
                              className="w-full h-32 object-cover rounded-xl mb-3 group-hover:scale-[1.02] transition-transform"
                            />
                            <span className="text-[10px] font-extrabold uppercase text-red-600">
                              RECOMENDADO
                            </span>
                            <p className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">
                              {prodDestacado.nombre}
                            </p>
                            <p className="text-sm font-black text-red-600 mt-1">
                              S/ {Number(prodDestacado.precio).toFixed(2)}
                            </p>
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Desplegable de Todas las Marcas */}
      {menuMarcasAbierto && (
        <div className="absolute left-0 right-0 top-full bg-white border-b border-slate-200 shadow-xl z-50 py-5 animate-in fade-in duration-150">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                Selecciona una Marca Oficial para filtrar el catálogo
              </h4>
              <button
                onClick={() => setMenuMarcasAbierto(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {datos.marcas.map((m) => (
                <button
                  key={m.id_marca}
                  onClick={() => seleccionarMarca(m.id_marca)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:border-red-600 hover:bg-red-50 text-xs font-bold text-slate-800 hover:text-red-600 transition-all"
                >
                  {m.nombre_marca}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
