import { useState, useRef, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productosApi } from '../../api/productos.api.js'
import { ventasApi } from '../../api/ventas.api.js'
import { formatMoneda } from '../../utils/formatMoneda.js'
import { Spinner, Modal } from '../../components/ui/index.jsx'
import { 
  Search, Plus, Minus, Trash2, ShoppingBag, CheckCircle, User, 
  PackageSearch, Wrench, Banknote, Smartphone, CreditCard, Shuffle, Landmark
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTienda } from '../../context/TiendaContext.jsx'
import api from '../../api/axios.js'

const TIPOS_COMPROBANTE = ['Boleta', 'Factura', 'Nota de Venta']
const LS_KEY_BASE = 'jdstore_carrito'

// Configuración de métodos de pago visual
const METODOS_PAGO_UI = [
  { id: 'Efectivo', label: 'Efectivo', icon: Banknote, color: 'text-emerald-400' },
  { id: 'Yape', label: 'Yape', icon: Smartphone, color: 'text-purple-400' },
  { id: 'Plin', label: 'Plin', icon: Smartphone, color: 'text-sky-400' },
  { id: 'POS Visa', label: 'POS Visa', icon: CreditCard, color: 'text-blue-400' },
  { id: 'POS MasterCard', label: 'MasterCard', icon: CreditCard, color: 'text-orange-400' },
  { id: 'Transferencia', label: 'Transf.', icon: Landmark, color: 'text-gray-300' },
  { id: 'Mixto', label: 'Mixto', icon: Shuffle, color: 'text-pink-400' },
]

// ── Componente Autocomplete para Nº de Serie ──────────────────
function SerieInput({ value, onChange, seriesDisponibles, placeholder }) {
  const [isFocused, setIsFocused] = useState(false)
  const [inputText, setInputText] = useState(value || '')
  const wrapperRef = useRef(null)
  const hasSeries = seriesDisponibles?.length > 0

  // Sincronizar si el valor externo cambia (ej: al limpiar carrito)
  useEffect(() => {
    setInputText(value || '')
  }, [value])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtradas = hasSeries
    ? seriesDisponibles.filter(s =>
        s.numero_serie.toLowerCase().includes(inputText.toLowerCase())
      )
    : []

  const isSelectedFromList = hasSeries && seriesDisponibles.some(s => s.numero_serie === inputText)
  const showDropdown = isFocused && hasSeries && (filtradas.length > 0 || inputText === '')

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={inputText}
        onFocus={() => setIsFocused(true)}
        onChange={e => {
          setInputText(e.target.value)
          onChange(e.target.value)
          setIsFocused(true)
        }}
        className={`text-xs border rounded-md px-2 py-1.5 w-44 transition-all focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
          isSelectedFromList
            ? 'border-emerald-400 bg-emerald-50 text-emerald-800 font-semibold'
            : inputText
              ? 'border-amber-300 bg-amber-50 text-amber-800 font-medium'
              : 'border-gray-300 bg-white text-gray-700'
        }`}
      />
      {hasSeries && (
        <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase tracking-wider pointer-events-none ${
          isSelectedFromList ? 'text-emerald-500' : 'text-gray-400'
        }`}>
          {isSelectedFromList ? '✓' : '▾'}
        </span>
      )}

      {/* Dropdown de sugerencias */}
      {showDropdown && (
        <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-40 overflow-y-auto divide-y divide-gray-50">
          {filtradas.length === 0 && inputText ? (
            <div className="px-3 py-2 text-[11px] text-gray-400 italic">Sin coincidencias — se usará como manual</div>
          ) : (
            filtradas.map(s => (
              <button
                key={s.id_serie}
                type="button"
                onMouseDown={e => {
                  e.preventDefault()
                  setInputText(s.numero_serie)
                  onChange(s.numero_serie)
                  setIsFocused(false)
                }}
                className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors hover:bg-blue-50 hover:text-blue-700 ${
                  inputText === s.numero_serie ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-700'
                }`}
              >
                {s.numero_serie}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

const calcularTotales = (carrito, tipoCom) => {
  const bruto = carrito.reduce((acc, i) => {
    const linea = Math.max(0, (i.precio_unitario * i.cantidad) - (parseFloat(i.descuento_monto) || 0))
    return acc + linea
  }, 0)
  const total    = Math.round(bruto * 100) / 100
  const esConIgv = tipoCom !== 'Nota de Venta'
  const subtotal = esConIgv ? Math.round((total / 1.18) * 100) / 100 : total
  const igv      = esConIgv ? Math.round((total - subtotal) * 100) / 100 : 0
  return { subtotal, igv, total }
}

export default function POS() {
  const { idTienda } = useTienda()
  const searchRef = useRef()
  const queryClient = useQueryClient()
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const basePath = usuario?.id_rol === 1 ? '/admin' : '/vendedor'
  const [cajaAbierta, setCajaAbierta] = useState(null) // null = loading, true/false
  const LS_KEY = `${LS_KEY_BASE}_${usuario?.id_usuario || 0}`

  const [carrito, setCarrito] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || [] } catch { return [] }
  })
  const [query, setQuery]           = useState('')
  const [cliente, setCliente]       = useState(null)
  const [dniInput, setDniInput]     = useState('')
  const [tipoCom, setTipoCom]       = useState('Nota de Venta')
  const [metodoPago, setMetodoPago] = useState('Efectivo')
  const [pagosMixtos, setPagosMixtos] = useState({ Efectivo: '', Yape: '', Plin: '', 'POS Visa': '', 'POS MasterCard': '', Transferencia: '' })
  const [notasInternas, setNotas]   = useState('')
  const [ventaOk, setVentaOk]       = useState(null)
  const [clienteManual, setClienteManual] = useState('')
  
  const [modalExterno, setModalExterno] = useState(false)
  const [externoForm, setExternoForm] = useState({ producto: '', costo: '', precio: '', tienda_origen: '', cantidad: 1 })
  const [modalServicio, setModalServicio] = useState(false)
  const [servicioForm, setServicioForm] = useState({ descripcion: '', precio: '' })

  useEffect(() => {
    const checkCaja = async () => {
      try {
        const params = idTienda ? `?id_tienda=${idTienda}` : ''
        const res = await api.get(`/caja/estado${params}`)
        setCajaAbierta(res.data.datos.abierta)
      } catch (e) {
        setCajaAbierta(false)
      }
    }
    if (idTienda) checkCaja()
  }, [idTienda])

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(carrito))
  }, [carrito])

  const { data: resultados, isFetching } = useQuery({
    queryKey: ['pos-buscar', query],
    queryFn: () => productosApi.buscar(query).then(r => r.data.datos),
    enabled: query.length >= 2,
  })

  const buscarCliente = useMutation({
    mutationFn: (doc) => ventasApi.clientes.buscarDocumento(doc).then(r => r.data.datos),
    onSuccess: (cli) => { setCliente(cli); toast.success(`Cliente: ${cli.nombre}`) },
    onError: () => toast.error('Cliente no encontrado'),
  })

  const registrarVenta = useMutation({
    mutationFn: (datos) => ventasApi.crear(datos).then(r => r.data.datos),
    onSuccess: (datos) => {
      setVentaOk(datos)
      setCarrito([])
      localStorage.removeItem(LS_KEY)
      setCliente(null)
      setClienteManual('')
      setDniInput('')
      setQuery('')
      setNotas('')
      setMetodoPago('Efectivo')
      setPagosMixtos({ Efectivo: '', Yape: '', Plin: '', 'POS Visa': '', 'POS MasterCard': '', Transferencia: '' })
      
      queryClient.invalidateQueries({ queryKey: ['ventas-admin'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['inventario'] })
      queryClient.invalidateQueries({ queryKey: ['reporte'] })
    },
    onError: (e) => toast.error(e.response?.data?.mensaje || 'Error al registrar venta'),
  })

  const agregarProducto = async (p) => {
    let seriesDisponibles = []
    try {
      const res = await productosApi.seriesDisponibles(p.id_producto, { id_tienda: idTienda })
      seriesDisponibles = res.data.datos || []
    } catch (e) { console.error('Error fetching series', e) }

    setCarrito(prev => {
      const existe = prev.find(i => i.id_producto === p.id_producto)
      if (existe) {
        return prev.map(i => i.id_producto === p.id_producto ? { ...i, cantidad: i.cantidad + 1, seriesDisponibles } : i)
      } else {
        return [...prev, { ...p, cantidad: 1, precio_unitario: parseFloat(p.precio), descuento_monto: 0, series: [], seriesDisponibles }]
      }
    })
    setQuery('')
    searchRef.current?.focus()
  }

  const handleAgregarExterno = (e) => {
    e.preventDefault()
    if (!externoForm.producto || !externoForm.precio || !externoForm.costo || !externoForm.tienda_origen) return toast.error('Completa los campos')
    
    const nuevo = {
      id_producto: 'EXT-' + Date.now(),
      codigo_producto: 'EXTERNO',
      nombre: externoForm.producto,
      precio: parseFloat(externoForm.precio),
      precio_unitario: parseFloat(externoForm.precio),
      cantidad: parseInt(externoForm.cantidad) || 1,
      descuento_monto: 0,
      es_externo: true,
      tienda_origen: externoForm.tienda_origen,
      costo_acordado: parseFloat(externoForm.costo),
      stock: 999
    }
    setCarrito(prev => [...prev, nuevo])
    setModalExterno(false)
    setExternoForm({ producto: '', costo: '', precio: '', tienda_origen: '', cantidad: 1 })
  }

  const handleAgregarServicio = (e) => {
    e.preventDefault()
    if (!servicioForm.descripcion || !servicioForm.precio) return toast.error('Completa los campos')
    
    const nuevo = {
      id_producto: 'SERV-' + Date.now(),
      codigo_producto: 'SERVICIO',
      nombre: servicioForm.descripcion + ' (Servicio Técnico)',
      precio: parseFloat(servicioForm.precio),
      precio_unitario: parseFloat(servicioForm.precio),
      cantidad: 1,
      descuento_monto: 0,
      es_servicio: true,
      stock: 999
    }
    setCarrito(prev => [...prev, nuevo])
    setModalServicio(false)
    setServicioForm({ descripcion: '', precio: '' })
  }

  const cambiarSerieDropdown = (id, index, serie) => {
    setCarrito(prev => prev.map(i => {
      if (i.id_producto === id) {
        const newSeries = [...(i.series || [])]
        newSeries[index] = serie
        return { ...i, series: newSeries }
      }
      return i
    }))
  }

  const cambiarSerieManual = (id, index, valor) => {
    setCarrito(prev => prev.map(i => {
      if (i.id_producto === id) {
        const newSeries = [...(i.series || [])]
        newSeries[index] = valor
        return { ...i, series: newSeries }
      }
      return i
    }))
  }

  const cambiarCantidad = (id, delta) => {
    setCarrito(prev => prev
      .map(i => i.id_producto === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i)
    )
  }

  const cambiarPrecio = (id, precio) => {
    const v = Math.max(0, parseFloat(precio) || 0)
    setCarrito(prev => prev.map(i => i.id_producto === id ? { ...i, precio_unitario: v } : i))
  }

  const quitarItem = (id) => setCarrito(prev => prev.filter(i => i.id_producto !== id))

  const { subtotal, igv, total } = calcularTotales(carrito, tipoCom)
  const sumaPagosMixtos = Object.values(pagosMixtos).reduce((acc, val) => acc + (parseFloat(val) || 0), 0)
  const diferencia = Math.round((total - sumaPagosMixtos) * 100) / 100

  const handleVenta = () => {
    // Reglas de validación por comprobante
    if (tipoCom === 'Factura') {
      if (!cliente && !clienteManual) {
        return toast.error('Para Factura es obligatorio ingresar un cliente (RUC o Razón Social)');
      }
    } else if (tipoCom === 'Boleta') {
      if (total >= 700) {
        if (!cliente && !clienteManual) {
          return toast.error('Para Boletas a partir de S/ 700 es obligatorio ingresar DNI o Nombre del cliente');
        }
      }
      // Si es menor a 700, no es obligatorio.
    }
    if (!carrito.length) return toast.error('Agrega productos al carrito')

    let detalles_pago = null;
    let metodoFinal = metodoPago;
    if (metodoPago === 'Mixto') {
      const partes = Object.entries(pagosMixtos).filter(([k, v]) => parseFloat(v) > 0);
      if (partes.length === 0) return toast.error('Ingresa los montos para el pago mixto');
      if (Math.abs(diferencia) > 0) return toast.error('El monto total pagado no coincide con el total de la venta');
      metodoFinal = `Mixto (${partes.map(([k, v]) => `${k}: ${parseFloat(v).toFixed(2)}`).join(', ')})`;
      detalles_pago = pagosMixtos;
    }

    registrarVenta.mutate({
      id_tienda:        idTienda,
      id_cliente:       cliente?.id_cliente,
      cliente_manual:   clienteManual || dniInput || null,
      tipo_comprobante: tipoCom,
      metodo_pago:      metodoFinal,
      detalles_pago,
      notas_internas:   notasInternas || null,
      items: carrito.map(i => ({
        id_producto:     i.es_externo || i.es_servicio ? null : i.id_producto,
        cantidad:        i.cantidad,
        precio_unitario: i.precio_unitario,
        descuento_monto: parseFloat(i.descuento_monto || 0),
        series:          (i.series || []).filter(s => s && s !== '__manual__'),
        es_externo:      i.es_externo || false,
        es_servicio:     i.es_servicio || false,
        tienda_origen:   i.tienda_origen || null,
        costo_acordado:  i.costo_acordado || null,
        producto:        i.producto || i.nombre,
        codigo_producto: i.codigo_producto
      })),
    })
  }

  if (cajaAbierta === null) {
    return <div className="h-full flex items-center justify-center"><Spinner size={40} /></div>
  }

  if (cajaAbierta === false) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-200 p-10 animate-fade-in">
        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <Banknote className="text-red-500 w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black text-gray-800 mb-2">Caja Cerrada</h2>
        <p className="text-gray-500 text-center max-w-md mb-8">
          No puedes realizar ventas porque tu turno no ha iniciado o la caja está cerrada. 
          Por favor, ve a la sección de "Mi Caja" y ábrela con tu sencillo inicial.
        </p>
        <button onClick={() => navigate(`${basePath}/caja`)} className="btn-primary text-lg py-4 px-8 shadow-lg shadow-blue-500/30">
          Ir a Mi Caja para Abrir Turno
        </button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col lg:flex-row gap-0 overflow-hidden rounded-2xl shadow-xl bg-gray-50 border border-gray-200">
      {/* PANEL IZQUIERDO: PRODUCTOS Y CARRITO */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* Cabecera y Buscador */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Caja Registradora</h1>
            {carrito.length > 0 && (
              <button onClick={() => { setCarrito([]); localStorage.removeItem(LS_KEY) }}
                className="flex items-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
                <Trash2 size={16} /> Vaciar carrito
              </button>
            )}
          </div>

          <div className="flex gap-3 relative">
            <div className="relative flex-1">
              <Search size={24} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input ref={searchRef} className="w-full pl-12 pr-10 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all font-medium placeholder:font-normal" value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Escanea el código de barras o busca el producto..." autoFocus />
              {isFetching && <Spinner size={20} className="absolute right-4 top-1/2 -translate-y-1/2" />}
            </div>
            
            <button onClick={() => setModalExterno(true)} 
              className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl font-medium text-amber-700 bg-amber-100 border border-amber-200 hover:bg-amber-200 transition-colors"
              title="Añadir producto de otra tienda (consignación)">
              <PackageSearch size={20} />
              <span className="hidden xl:inline">Consignación</span>
            </button>
            <button onClick={() => setModalServicio(true)} 
              className="flex items-center justify-center gap-2 px-4 py-4 rounded-xl font-medium text-indigo-700 bg-indigo-100 border border-indigo-200 hover:bg-indigo-200 transition-colors"
              title="Añadir Servicio Técnico">
              <Wrench size={20} />
              <span className="hidden xl:inline">Servicio</span>
            </button>

            {/* Resultados de Búsqueda Flotantes */}
            {query.length >= 2 && resultados && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 divide-y divide-gray-100 max-h-80 overflow-y-auto">
                {resultados.length === 0
                  ? <p className="text-gray-400 px-5 py-6 text-center text-lg">No se encontró ningún producto.</p>
                  : resultados.map(p => (
                  <button key={p.id_producto} onClick={() => agregarProducto(p)}
                    className="w-full text-left px-5 py-4 hover:bg-blue-50 flex items-center justify-between group transition-colors">
                    <div>
                      <p className="text-lg font-bold text-gray-900 group-hover:text-blue-700">{p.nombre}</p>
                      <p className="text-sm text-gray-500 font-medium">{p.codigo_producto} • {p.nombre_categoria}</p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <p className="text-xl font-black text-gray-900">{formatMoneda(p.precio)}</p>
                      <p className="text-xs text-green-600 font-semibold mt-1">Stock: {p.stock}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabla del Carrito */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          {carrito.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300">
              <ShoppingBag size={80} strokeWidth={1} className="mb-4" />
              <p className="text-xl font-medium text-gray-400">Escanea o busca productos para empezar</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="sticky top-0 bg-gray-100/90 backdrop-blur-sm text-gray-600 font-semibold text-xs uppercase tracking-wider shadow-sm z-10">
                <tr>
                  <th className="px-5 py-3 rounded-tl-lg">Producto</th>
                  <th className="px-5 py-3 text-center">Cantidad</th>
                  <th className="px-5 py-3 text-right">P. Unitario</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3 text-center rounded-tr-lg"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {carrito.map(item => {
                  const lineaTotal = Math.max(0, (item.precio_unitario * item.cantidad) - (item.descuento_monto || 0))
                  return (
                    <tr key={item.id_producto} className="bg-white hover:bg-blue-50/30 transition-colors group">
                      <td className="px-5 py-4 whitespace-normal">
                        <p className="font-bold text-gray-900 text-base leading-tight">
                          {item.nombre}
                          {item.es_externo && <span className="ml-2 inline-flex items-center text-[10px] uppercase font-bold tracking-wider bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Consignación</span>}
                          {item.es_servicio && <span className="ml-2 inline-flex items-center text-[10px] uppercase font-bold tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Servicio</span>}
                        </p>
                        
                        {/* Selector de series integrado - Autocomplete/Buscador */}
                        {!item.es_servicio && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {Array.from({ length: item.cantidad }).map((_, idx) => (
                              <SerieInput
                                key={idx}
                                value={item.series?.[idx] || ''}
                                onChange={val => cambiarSerieManual(item.id_producto, idx, val)}
                                seriesDisponibles={item.es_externo ? null : item.seriesDisponibles}
                                placeholder={`Nº Serie ${idx + 1}`}
                              />
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1 bg-gray-100 rounded-lg p-1 w-max mx-auto border border-gray-200">
                          <button onClick={() => cambiarCantidad(item.id_producto, -1)}
                            className="w-8 h-8 rounded-md bg-white text-gray-600 hover:text-blue-600 hover:bg-blue-50 shadow-sm flex items-center justify-center transition-all">
                            <Minus size={16} />
                          </button>
                          <span className="w-10 text-center font-bold text-base">{item.cantidad}</span>
                          <button onClick={() => cambiarCantidad(item.id_producto, 1)}
                            className="w-8 h-8 rounded-md bg-white text-gray-600 hover:text-blue-600 hover:bg-blue-50 shadow-sm flex items-center justify-center transition-all">
                            <Plus size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-gray-400 font-medium">S/</span>
                          <input 
                            type="number" step="0.01" min="0"
                            value={item.precio_unitario}
                            onChange={e => cambiarPrecio(item.id_producto, e.target.value)}
                            className="w-24 text-base font-bold text-right border border-transparent rounded px-2 py-1 focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-all hover:bg-gray-100"
                          />
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-lg font-black text-gray-900">{formatMoneda(lineaTotal)}</span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button onClick={() => quitarItem(item.id_producto)}
                          className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* PANEL DERECHO: CHECKOUT OSCURO */}
      <div className="w-full lg:w-[26rem] flex-shrink-0 bg-slate-900 text-white flex flex-col shadow-2xl relative z-10 border-l border-slate-800">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          
          {/* Cliente */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cliente</h3>
            <div className="relative">
              <input className="w-full bg-slate-800 border-2 border-slate-700 text-white rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:border-blue-500 font-medium placeholder:text-slate-500 transition-colors" 
                value={dniInput} maxLength={tipoCom === 'Nota de Venta' ? 100 : 11}
                placeholder="Ingresar DNI, RUC o Nombre..."
                disabled={buscarCliente.isPending || (tipoCom === 'Nota de Venta' && clienteManual.length > 0)}
                onChange={e => setDniInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && dniInput && buscarCliente.mutate(dniInput)} />
              <button onClick={() => dniInput && buscarCliente.mutate(dniInput)}
                disabled={!dniInput || buscarCliente.isPending || (tipoCom === 'Nota de Venta' && clienteManual.length > 0)}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50">
                {buscarCliente.isPending ? <Spinner size={18} /> : <Search size={18} />}
              </button>
            </div>
            
            {/* Input Manual para Notas de Venta y Boletas */}
            {(tipoCom === 'Nota de Venta' || tipoCom === 'Boleta') && !cliente && (
              <div className="animate-in fade-in slide-in-from-top-2 mt-2">
                <p className="text-[10px] text-slate-400 mb-1 uppercase font-bold">O ingresar nombre manual (Institución/Persona)</p>
                <input className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium placeholder:text-slate-600 transition-colors" 
                  value={clienteManual}
                  placeholder={tipoCom === 'Boleta' ? "Ej: I.E.S.P. Juliaca (Opcional < S/ 700)" : "Ej: I.E.S.P. Juliaca (Opcional)"}
                  disabled={!!cliente}
                  onChange={e => setClienteManual(e.target.value)} />
              </div>
            )}

            {cliente && (
              <div className="bg-gradient-to-r from-blue-900/50 to-slate-800 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400 flex-shrink-0">
                  <User size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold text-white truncate">{cliente.nombre}</p>
                  <p className="text-sm text-blue-300 font-medium">{cliente.tipo_documento}: {cliente.dni_ruc}</p>
                </div>
              </div>
            )}
          </div>

          {/* Tipo de Comprobante */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Comprobante</h3>
            <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700">
              {TIPOS_COMPROBANTE.map(t => (
                <button key={t} onClick={() => {
                    setTipoCom(t);
                    if (t === 'Factura') setClienteManual('');
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                    tipoCom === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Método de Pago */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Método de Pago</h3>
            <div className="grid grid-cols-3 gap-2">
              {METODOS_PAGO_UI.map(m => {
                const Icon = m.icon
                const isActive = metodoPago === m.id
                return (
                  <button key={m.id} onClick={() => setMetodoPago(m.id)}
                    className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 ${
                      isActive ? 'border-blue-500 bg-slate-800 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600'
                    }`}>
                    <Icon size={24} className={isActive ? m.color : 'text-slate-400'} strokeWidth={isActive ? 2.5 : 2} />
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-400'}`}>
                      {m.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {metodoPago === 'Mixto' && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 grid grid-cols-2 gap-3 mt-3 animate-in fade-in">
                {METODOS_PAGO_UI.filter(m => m.id !== 'Mixto').map(m => (
                  <div key={m.id} className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">S/</span>
                    <input type="number" min="0" step="0.1" placeholder="0.00"
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-pink-500 font-bold"
                      value={pagosMixtos[m.id] || ''} onChange={e => setPagosMixtos({...pagosMixtos, [m.id]: e.target.value})} />
                    <p className="text-[10px] text-slate-400 mt-1 uppercase text-center font-semibold">{m.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Totales y Botón de Cobro - Anclado abajo */}
        <div className="p-6 bg-slate-950/80 backdrop-blur-md border-t border-slate-800 mt-auto">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-slate-400 font-medium">
              <span>Subtotal</span>
              <span>{formatMoneda(subtotal)}</span>
            </div>
            {tipoCom !== 'Nota de Venta' && (
              <div className="flex justify-between text-slate-400 font-medium">
                <span>IGV (18%)</span>
                <span>{formatMoneda(igv)}</span>
              </div>
            )}
            <div className="flex justify-between items-end pt-3 border-t border-slate-800">
              <span className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Total a Pagar</span>
              <span className="text-4xl font-black text-emerald-400 tracking-tight">{formatMoneda(total)}</span>
            </div>
            
            {metodoPago === 'Mixto' && Math.abs(diferencia) > 0 && (
              <div className="flex justify-between items-center text-xs font-bold bg-red-900/30 text-red-400 p-2 rounded-lg mt-2 border border-red-900/50">
                <span>Diferencia pendiente:</span>
                <span>{formatMoneda(diferencia)}</span>
              </div>
            )}
          </div>

          <button onClick={handleVenta}
            disabled={
              !carrito.length || 
              (!cliente && !clienteManual && (tipoCom === 'Factura' || (tipoCom === 'Boleta' && total >= 700))) || 
              registrarVenta.isPending || 
              (metodoPago === 'Mixto' && Math.abs(diferencia) > 0)
            }
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-900 font-black text-xl py-5 rounded-2xl shadow-[0_0_20px_rgba(52,211,153,0.4)] disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2">
            {registrarVenta.isPending ? (
              <><Spinner size={24} className="border-slate-900 border-t-transparent" /> Procesando Venta...</>
            ) : (
              <>COBRAR {formatMoneda(total)}</>
            )}
          </button>
        </div>
      </div>

      {/* MODALES */}
      <Modal open={!!ventaOk} onClose={() => setVentaOk(null)} title="Venta registrada" maxWidth="max-w-sm">
        <div className="text-center py-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={44} className="text-green-500" />
          </div>
          <p className="font-bold text-gray-800 text-xl">{ventaOk?.numero_comprobante}</p>
          <p className="text-3xl font-black text-green-600 mt-2">{formatMoneda(ventaOk?.total)}</p>
        </div>
        <div className="flex flex-col gap-3 mt-6">
          <button 
            onClick={() => {
              const url = `${window.location.origin}${basePath}/comprobante/${ventaOk?.id_venta}`;
              const texto = `¡Hola! Aquí tienes tu comprobante electrónico de JD Store: ${url} 🍃 Gracias por contribuir al cuidado del medio ambiente solicitando tu ticket digital.`;
              window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, '_blank');
            }}
            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
          >
            {/* Ícono de WhatsApp simple o texto */}
            <span className="text-lg">📱 Compartir Ticket por WhatsApp</span>
          </button>
          
          <Link to={`${basePath}/comprobante/${ventaOk?.id_venta}`} className="btn-secondary w-full justify-center py-3 text-base">Imprimir / Ver Comprobante</Link>
          <button onClick={() => setVentaOk(null)} className="btn-primary w-full justify-center py-3 text-base font-bold shadow-lg">Nueva Venta</button>
        </div>
      </Modal>

      <Modal open={modalExterno} onClose={() => setModalExterno(false)} title="Producto en Consignación" maxWidth="max-w-md">
        <form onSubmit={handleAgregarExterno} className="space-y-5 pt-2">
          <div>
            <label className="label">Nombre del Producto</label>
            <input required autoFocus className="input" placeholder="Ej: Laptop Lenovo Thinkpad..." value={externoForm.producto} onChange={e => setExternoForm({...externoForm, producto: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="label text-amber-700">Costo (Acordado)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">S/</span>
                <input required type="number" step="0.01" className="input pl-8" value={externoForm.costo} onChange={e => setExternoForm({...externoForm, costo: e.target.value})} />
              </div>
             </div>
             <div>
              <label className="label text-blue-700">Precio Venta (Público)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">S/</span>
                <input required type="number" step="0.01" className="input pl-8" value={externoForm.precio} onChange={e => setExternoForm({...externoForm, precio: e.target.value})} />
              </div>
             </div>
          </div>
          <div>
            <label className="label">Tienda Origen (De dónde vino)</label>
            <input required className="input" placeholder="Ej: Tienda Principal" value={externoForm.tienda_origen} onChange={e => setExternoForm({...externoForm, tienda_origen: e.target.value})} />
          </div>
          <div className="pt-4 border-t border-gray-100">
            <button type="submit" className="btn-primary w-full justify-center py-3">Agregar al carrito</button>
          </div>
        </form>
      </Modal>

      <Modal open={modalServicio} onClose={() => setModalServicio(false)} title="Servicio Técnico / Extra">
        <form onSubmit={handleAgregarServicio} className="space-y-5 pt-2">
          <div>
            <label className="label">Descripción del Servicio</label>
            <input required autoFocus className="input" placeholder="Ej: Instalación de Windows 11"
              value={servicioForm.descripcion} onChange={e => setServicioForm({...servicioForm, descripcion: e.target.value})} />
          </div>
          <div>
            <label className="label">Precio a Cobrar</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">S/</span>
              <input required type="number" step="0.01" min="0" className="input pl-8" placeholder="50.00"
                value={servicioForm.precio} onChange={e => setServicioForm({...servicioForm, precio: e.target.value})} />
            </div>
          </div>
          <div className="pt-4 border-t border-gray-100">
            <button type="submit" className="btn-primary w-full justify-center py-3">Añadir Servicio</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
