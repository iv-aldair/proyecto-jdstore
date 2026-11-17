import { RotateCcw, ArrowUpRight, Flame } from 'lucide-react'
import { obtenerImagenesProducto } from '../utils/productMedia.js'

export default function CatalogSection({
  cargando,
  datos,
  productosFiltrados,
  categoriaFiltro,
  setCategoriaFiltro,
  marcaFiltro,
  setMarcaFiltro,
  busqueda,
  soloOfertas,
  irAlInicio,
  abrirProducto
}) {
  const categoriaSeleccionadaObj = datos.categorias.find(
    (c) => String(c.id_categoria) === String(categoriaFiltro)
  )

  return (
    <div className="space-y-8">
      {/* Banner de Categoría Seleccionada */}
      {categoriaSeleccionadaObj && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-red-950 text-white p-8 sm:p-10 grid md:grid-cols-12 gap-6 items-center shadow-xl border border-slate-800">
            <div className="md:col-span-7 space-y-3">
              <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
                Categoría Oficial JD Store
              </span>
              <h2 className="text-3xl sm:text-4xl font-black">{categoriaSeleccionadaObj.nombre_categoria}</h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Equipos originales con garantía certificada, soporte técnico propio y entrega inmediata en nuestras tiendas de Juliaca y Puno.
              </p>
              <button
                onClick={irAlInicio}
                className="inline-flex items-center gap-2 text-xs font-bold bg-white/10 hover:bg-red-600 text-white px-4 py-2.5 rounded-xl transition-colors"
              >
                <RotateCcw size={14} />
                <span>Ver todas las categorías</span>
              </button>
            </div>
            <div className="md:col-span-5 flex justify-center">
              <img
                src={obtenerImagenesProducto({ nombre_categoria: categoriaSeleccionadaObj.nombre_categoria })[0]}
                alt={categoriaSeleccionadaObj.nombre_categoria}
                className="h-44 sm:h-52 object-cover rounded-2xl shadow-2xl border border-white/15"
              />
            </div>
          </div>
        </section>
      )}

      {/* Catálogo de Productos */}
      <section id="seccion-catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-7">
        <div id="seccion-ofertas" className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {categoriaSeleccionadaObj
                  ? `${categoriaSeleccionadaObj.nombre_categoria}`
                  : busqueda
                  ? `Resultados para "${busqueda}"`
                  : 'Equipos y Periféricos Destacados'}
              </h2>
              <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 border border-red-100 text-xs font-extrabold px-3 py-1 rounded-full">
                <Flame size={13} /> ¡Ofertas!
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Selecciona cualquier equipo para ver sus especificaciones completas y comprar vía WhatsApp.
            </p>
          </div>

          {/* Selectores de Filtro */}
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="todas">Todas las categorías ({datos.categorias.length})</option>
              {datos.categorias.map((c) => (
                <option key={c.id_categoria} value={c.id_categoria}>
                  {c.nombre_categoria}
                </option>
              ))}
            </select>

            <select
              value={marcaFiltro}
              onChange={(e) => setMarcaFiltro(e.target.value)}
              className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm focus:outline-none focus:border-red-500 cursor-pointer"
            >
              <option value="todas">Todas las marcas ({datos.marcas.length})</option>
              {datos.marcas.map((m) => (
                <option key={m.id_marca} value={m.id_marca}>
                  {m.nombre_marca}
                </option>
              ))}
            </select>

            {(categoriaFiltro !== 'todas' || marcaFiltro !== 'todas' || busqueda || soloOfertas) && (
              <button
                onClick={irAlInicio}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-colors"
              >
                <RotateCcw size={13} />
                <span>Restablecer</span>
              </button>
            )}
          </div>
        </div>

        {/* Grilla de Tarjetas */}
        {cargando ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 h-72 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm space-y-3">
            <p className="text-slate-800 font-bold text-base">
              No se encontraron productos con esos filtros.
            </p>
            <p className="text-xs text-slate-500">
              Prueba buscando otra marca o categoría como Laptop, Monitor, Impresora, SSD o Mouse.
            </p>
            <button
              onClick={irAlInicio}
              className="mt-2 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-red-600/20"
            >
              Ver todo el catálogo ({datos.productos.length} productos)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {productosFiltrados.map((prod) => {
              const imgs = obtenerImagenesProducto(prod)
              const precioPen = Number(prod.precio)
              const ahorroSoles = precioPen > 1500 ? 120 : precioPen > 500 ? 45 : 10

              return (
                <div
                  key={prod.id_producto}
                  onClick={() => abrirProducto(prod)}
                  className="bg-white rounded-2xl border border-slate-100 p-4 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-red-200 hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
                >
                  <div>
                    {/* Cabecera de la tarjeta */}
                    <div className="flex items-center justify-between gap-1 mb-2.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 truncate">
                        {prod.nombre_marca}
                      </span>
                      <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] font-extrabold px-2 py-0.5 rounded-lg">
                        -S/ {ahorroSoles}.00
                      </span>
                    </div>

                    {/* Imagen */}
                    <div className="h-36 w-full flex items-center justify-center p-2 bg-slate-50/60 rounded-xl overflow-hidden group-hover:bg-white transition-colors">
                      <img
                        src={imgs[0]}
                        alt={prod.nombre}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Datos del producto */}
                    <p className="text-[10px] text-slate-400 font-mono mt-2.5">{prod.codigo_producto}</p>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug mt-0.5 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {prod.nombre}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                      {prod.descripcion || prod.modelo}
                    </p>
                  </div>

                  {/* Precio en Soles y Botón Moderno */}
                  <div className="pt-3 mt-3 border-t border-slate-100">
                    <div className="flex items-baseline justify-between">
                      <span className="text-lg font-black text-slate-900">
                        S/ {precioPen.toFixed(2)}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Stock: {prod.stock_total}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-900 group-hover:bg-gradient-to-r group-hover:from-red-600 group-hover:to-red-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <span>Ver Detalles</span>
                      <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
