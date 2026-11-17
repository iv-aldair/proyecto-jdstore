import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../api/axios.js'
import toast from 'react-hot-toast'

// Módulos independientes de la Página Web Pública (Arquitectura Modular y Auditable)
import PublicHeader from './components/PublicHeader.jsx'
import HeroCarousel from './components/HeroCarousel.jsx'
import CatalogSection from './components/CatalogSection.jsx'
import ProductDetailView from './components/ProductDetailView.jsx'
import ServicesAndNewsSection from './components/ServicesAndNewsSection.jsx'
import CartDrawer from './components/CartDrawer.jsx'
import ChatbotWidget from '../../components/shared/ChatbotWidget.jsx'

export default function HomeInstitucional() {
  const { usuario } = useAuth()
  const [cargando, setCargando] = useState(true)
  const [datos, setDatos] = useState({
    institucional: {},
    productos: [],
    categorias: [],
    marcas: [],
    tiendas: [],
    publicaciones: []
  })

  // Estados de navegación y filtros
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [megaMenuAbierto, setMegaMenuAbierto] = useState(false)
  const [catActivaMega, setCatActivaMega] = useState(null)
  const [menuMarcasAbierto, setMenuMarcasAbierto] = useState(false)

  const [busqueda, setBusqueda] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas')
  const [marcaFiltro, setMarcaFiltro] = useState('todas')
  const [soloOfertas, setSoloOfertas] = useState(false)

  // Carrito de compras
  const [carritoAbierto, setCarritoAbierto] = useState(false)
  const [carrito, setCarrito] = useState([])

  useEffect(() => {
    cargarDatosTienda()
  }, [])

  const cargarDatosTienda = async () => {
    setCargando(true)
    try {
      const { data } = await api.get('/public/inicio')
      if (data.ok) {
        setDatos(data)
        if (data.categorias?.length > 0) {
          setCatActivaMega(data.categorias[0])
        }
      }
    } catch (err) {
      console.error('Error cargando catálogo:', err)
    } finally {
      setCargando(false)
    }
  }

  const inst = datos.institucional || {}
  const numeroWhatsapp = inst.whatsapp || '51951234567'

  // Productos filtrados según búsqueda, categoría y marca
  const productosFiltrados = useMemo(() => {
    return (datos.productos || []).filter((p) => {
      const texto = `${p.nombre} ${p.modelo || ''} ${p.codigo_producto} ${p.nombre_marca} ${p.nombre_categoria} ${p.descripcion || ''}`.toLowerCase()
      const matchBusqueda = !busqueda.trim() || texto.includes(busqueda.trim().toLowerCase())
      const matchCategoria = categoriaFiltro === 'todas' || String(p.id_categoria) === String(categoriaFiltro)
      const matchMarca = marcaFiltro === 'todas' || String(p.id_marca) === String(marcaFiltro)
      const matchOferta = !soloOfertas || Number(p.precio) >= 45
      return matchBusqueda && matchCategoria && matchMarca && matchOferta
    })
  }, [datos.productos, busqueda, categoriaFiltro, marcaFiltro, soloOfertas])

  // Productos similares para el carrusel de detalle
  const productosSimilares = useMemo(() => {
    if (!productoSeleccionado) return []
    const mismosCat = (datos.productos || []).filter(
      (p) =>
        p.id_producto !== productoSeleccionado.id_producto &&
        (p.id_categoria === productoSeleccionado.id_categoria || p.id_marca === productoSeleccionado.id_marca)
    )
    if (mismosCat.length >= 4) return mismosCat
    const otros = (datos.productos || []).filter((p) => p.id_producto !== productoSeleccionado.id_producto)
    return [...new Set([...mismosCat, ...otros])].slice(0, 10)
  }, [datos.productos, productoSeleccionado])

  // Acciones de navegación
  const irAlInicio = () => {
    setProductoSeleccionado(null)
    setCategoriaFiltro('todas')
    setMarcaFiltro('todas')
    setSoloOfertas(false)
    setBusqueda('')
    setMegaMenuAbierto(false)
    setMenuMarcasAbierto(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const abrirProducto = (prod) => {
    if (!prod) return
    setProductoSeleccionado(prod)
    setMegaMenuAbierto(false)
    setMenuMarcasAbierto(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const seleccionarCategoria = (idCat) => {
    setProductoSeleccionado(null)
    setCategoriaFiltro(String(idCat))
    setMarcaFiltro('todas')
    setMegaMenuAbierto(false)
    setTimeout(() => {
      document.getElementById('seccion-catalogo')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const seleccionarMarca = (idMarca, idCatOpcional = 'todas') => {
    setProductoSeleccionado(null)
    setMarcaFiltro(String(idMarca))
    setCategoriaFiltro(String(idCatOpcional))
    setMenuMarcasAbierto(false)
    setMegaMenuAbierto(false)
    setTimeout(() => {
      document.getElementById('seccion-catalogo')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const activarSoloOfertas = () => {
    setProductoSeleccionado(null)
    setSoloOfertas(true)
    setCategoriaFiltro('todas')
    setTimeout(() => {
      document.getElementById('seccion-ofertas')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const agregarAlCarrito = (prod, cant = 1) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id_producto === prod.id_producto)
      if (existe) {
        return prev.map((item) =>
          item.id_producto === prod.id_producto ? { ...item, cantidad: item.cantidad + cant } : item
        )
      }
      return [...prev, { ...prod, cantidad: cant }]
    })
    toast.success(`"${prod.nombre}" añadido al carrito`)
    setCarritoAbierto(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* 1. Header con Mega-Menú de Categorías y Paleta JD Store */}
      <PublicHeader
        usuario={usuario}
        datos={datos}
        busqueda={busqueda}
        setBusqueda={(val) => {
          setBusqueda(val)
          if (productoSeleccionado) setProductoSeleccionado(null)
        }}
        megaMenuAbierto={megaMenuAbierto}
        setMegaMenuAbierto={setMegaMenuAbierto}
        catActivaMega={catActivaMega}
        setCatActivaMega={setCatActivaMega}
        menuMarcasAbierto={menuMarcasAbierto}
        setMenuMarcasAbierto={setMenuMarcasAbierto}
        carrito={carrito}
        setCarritoAbierto={setCarritoAbierto}
        irAlInicio={irAlInicio}
        abrirProducto={abrirProducto}
        seleccionarCategoria={seleccionarCategoria}
        seleccionarMarca={seleccionarMarca}
        activarSoloOfertas={activarSoloOfertas}
      />

      {/* 2. Contenido Principal: Vista de Detalle de Producto o Portal Principal */}
      {productoSeleccionado ? (
        <ProductDetailView
          productoSeleccionado={productoSeleccionado}
          productosSimilares={productosSimilares}
          numeroWhatsapp={numeroWhatsapp}
          irAlInicio={irAlInicio}
          seleccionarCategoria={seleccionarCategoria}
          abrirProducto={abrirProducto}
          agregarAlCarrito={agregarAlCarrito}
        />
      ) : (
        <main className="flex-1">
          {!busqueda && categoriaFiltro === 'todas' && marcaFiltro === 'todas' && (
            <HeroCarousel
              productos={datos.productos}
              categorias={datos.categorias}
              abrirProducto={abrirProducto}
              seleccionarCategoria={seleccionarCategoria}
            />
          )}

          <CatalogSection
            cargando={cargando}
            datos={datos}
            productosFiltrados={productosFiltrados}
            categoriaFiltro={categoriaFiltro}
            setCategoriaFiltro={setCategoriaFiltro}
            marcaFiltro={marcaFiltro}
            setMarcaFiltro={setMarcaFiltro}
            busqueda={busqueda}
            soloOfertas={soloOfertas}
            irAlInicio={irAlInicio}
            abrirProducto={abrirProducto}
          />

          <ServicesAndNewsSection
            usuario={usuario}
            inst={inst}
            publicaciones={datos.publicaciones}
            tiendas={datos.tiendas}
          />
        </main>
      )}

      {/* 3. Drawer Lateral del Carrito */}
      <CartDrawer
        carritoAbierto={carritoAbierto}
        setCarritoAbierto={setCarritoAbierto}
        carrito={carrito}
        setCarrito={setCarrito}
        numeroWhatsapp={numeroWhatsapp}
      />

      {/* 4. Footer Institucional */}
      <footer className="bg-slate-950 text-slate-400 py-8 border-t border-slate-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={irAlInicio}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-500 text-white font-black flex items-center justify-center shadow-md shadow-red-600/20"
            >
              JD
            </button>
            <div>
              <p className="font-bold text-white">
                © {new Date().getFullYear()} {inst.nombre_institucion || 'JD STORE S.C.R.L.'} — RUC {inst.ruc || '20600698479'}
              </p>
              <p>Especialistas en Laptops, Computadoras, Monitores, Impresoras y Soporte Técnico en Juliaca y Puno.</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <button onClick={irAlInicio} className="hover:text-white font-semibold transition-colors">
              Inicio
            </button>
            <Link to="/login" className="hover:text-red-400 font-semibold underline transition-colors">
              Acceso Personal / ERP
            </Link>
          </div>
        </div>
      </footer>

      {/* 5. Chatbot Flotante en la Esquina Inferior Izquierda */}
      <ChatbotWidget institucional={inst} />
    </div>
  )
}
