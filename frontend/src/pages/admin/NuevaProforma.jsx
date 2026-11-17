import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { productosApi } from '../../api/productos.api.js'
import { proformasApi } from '../../api/proformas.api.js'
import { formatMoneda } from '../../utils/formatMoneda.js'
import { Search, Plus, Trash2, Save, User, Phone, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext.jsx'

export default function NuevaProforma() {
  const navigate = useNavigate()
  const [buscar, setBuscar] = useState('')
  const [categoria, setCategoria] = useState('')
  const [cart, setCart] = useState([])
  const [cliente, setCliente] = useState({ nombre: '', telefono: '', notas: '' })
  const { usuario } = useAuth()
  const basePath = usuario?.id_rol === 1 ? '/admin' : '/vendedor'

  // Búsqueda de productos
  const { data: busquedaResultados, isLoading: buscando } = useQuery({
    queryKey: ['productos-buscar-proforma', buscar, categoria],
    queryFn: () => productosApi.listar({ buscar, id_categoria: categoria, limite: 15, estado: 1 }).then(r => r.data.datos.productos),
    enabled: buscar.length >= 2 || categoria !== '',
  })

  const crear = useMutation({
    mutationFn: (datos) => proformasApi.crear(datos),
    onSuccess: (res) => {
      toast.success('Proforma creada')
      navigate(`${basePath}/proformas/${res.data.datos.id_proforma}`)
    },
    onError: (e) => toast.error(e.response?.data?.mensaje || 'Error al crear')
  })

  const agregarAlCarrito = (prod) => {
    const existe = cart.find(i => i.id_producto === prod.id_producto)
    if (existe) {
      setCart(cart.map(i => i.id_producto === prod.id_producto ? { ...i, cantidad: i.cantidad + 1 } : i))
    } else {
      setCart([...cart, { 
        id_producto: prod.id_producto, 
        producto: prod.nombre, 
        modelo: prod.modelo,
        precio_unitario: parseFloat(prod.precio),
        cantidad: 1,
        descuento_unitario: 0
      }])
    }
    setBuscar('')
  }

  const actualizarItem = (id_producto, campo, valor) => {
    setCart(cart.map(i => {
      if (i.id_producto === id_producto) {
        let nValor = parseFloat(valor)
        if (isNaN(nValor)) nValor = 0
        if (nValor < 0) nValor = 0
        return { ...i, [campo]: nValor }
      }
      return i
    }))
  }

  const eliminarItem = (id_producto) => {
    setCart(cart.filter(i => i.id_producto !== id_producto))
  }

  const subtotal = cart.reduce((acc, i) => acc + (i.precio_unitario * i.cantidad), 0)
  const descuento = cart.reduce((acc, i) => acc + (i.descuento_unitario * i.cantidad), 0)
  const total = subtotal - descuento

  const handleGuardar = () => {
    if (!cliente.nombre.trim()) return toast.error('El nombre del cliente es obligatorio')
    if (cart.length === 0) return toast.error('Agrega al menos un producto')

    const payload = {
      cliente_nombre: cliente.nombre,
      cliente_telefono: cliente.telefono,
      notas: cliente.notas,
      validez_dias: 7,
      detalles: cart.map(i => ({
        id_producto: i.id_producto,
        cantidad: i.cantidad,
        precio_unitario: i.precio_unitario,
        descuento_unitario: i.descuento_unitario
      }))
    }

    crear.mutate(payload)
  }

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-full">
      {/* Panel Izquierdo: Buscador y Productos */}
      <div className="flex-1 flex flex-col gap-4">
        <h1 className="page-title">Nueva Proforma</h1>
        
        {/* Buscador y Filtros rápidos */}
        <div className="card p-4">
          <div className="flex gap-2 mb-3">
            <button onClick={() => setCategoria('')} className={`px-3 py-1 text-xs rounded-full border ${categoria === '' ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>Todos</button>
            <button onClick={() => setCategoria('2')} className={`px-3 py-1 text-xs rounded-full border ${categoria === '2' ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>PC</button>
            <button onClick={() => setCategoria('1')} className={`px-3 py-1 text-xs rounded-full border ${categoria === '1' ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>Laptops</button>
            <button onClick={() => setCategoria('3')} className={`px-3 py-1 text-xs rounded-full border ${categoria === '3' ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}>Impresoras</button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar producto por nombre, código o modelo..."
              className="input pl-10 bg-gray-50 focus:bg-white"
              value={buscar}
              onChange={e => setBuscar(e.target.value)}
            />
          </div>
          
          {/* Resultados flotantes o inline */}
          {(buscar.length >= 2 || categoria !== '') && (
            <div className="mt-2 border border-gray-100 rounded-lg max-h-60 overflow-y-auto bg-white shadow-sm">
              {buscando ? <div className="p-4 text-center text-sm text-gray-500">Buscando...</div> :
               busquedaResultados?.length === 0 ? <div className="p-4 text-center text-sm text-gray-500">No hay resultados</div> :
               busquedaResultados?.map(p => (
                 <div key={p.id_producto} 
                      className="flex items-center justify-between p-3 border-b border-gray-50 hover:bg-orange-50 cursor-pointer"
                      onClick={() => agregarAlCarrito(p)}>
                   <div>
                     <p className="font-semibold text-gray-800 text-sm">{p.nombre}</p>
                     <p className="text-xs text-gray-500">{p.codigo_producto} • {p.modelo}</p>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className="font-bold text-orange-600">{formatMoneda(p.precio)}</span>
                     <button className="p-1.5 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200">
                       <Plus size={16} />
                     </button>
                   </div>
                 </div>
               ))
              }
            </div>
          )}
        </div>

        {/* Carrito de Proforma */}
        <div className="card flex-1 flex flex-col overflow-hidden border-t-4 border-orange-500">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <FileText size={18} className="text-orange-500" />
              Detalle de Proforma
            </h2>
            <span className="badge-gray">{cart.length} items</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <FileText size={48} className="mb-4 opacity-20" />
                <p>Busca y selecciona productos</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-200">
                    <th className="pb-2">Producto</th>
                    <th className="pb-2 w-20">Cant.</th>
                    <th className="pb-2 w-24">Precio U.</th>
                    <th className="pb-2 w-24">Dscto U.</th>
                    <th className="pb-2 text-right">Subtotal</th>
                    <th className="pb-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cart.map(i => {
                    const subItem = (i.precio_unitario * i.cantidad) - (i.descuento_unitario * i.cantidad)
                    return (
                      <tr key={i.id_producto} className="group">
                        <td className="py-3">
                          <p className="font-medium text-gray-800 leading-tight">{i.producto}</p>
                          {i.modelo && <p className="text-xs text-gray-400">{i.modelo}</p>}
                        </td>
                        <td className="py-3 pr-2">
                          <input type="number" min="1" value={i.cantidad} 
                            onChange={e => actualizarItem(i.id_producto, 'cantidad', e.target.value)}
                            className="input p-1 text-center font-semibold text-gray-700 bg-gray-50 focus:bg-white" />
                        </td>
                        <td className="py-3 pr-2">
                          <input type="number" min="0" step="0.01" value={i.precio_unitario} 
                            onChange={e => actualizarItem(i.id_producto, 'precio_unitario', e.target.value)}
                            className="input p-1 text-right text-gray-700 bg-gray-50 focus:bg-white" />
                        </td>
                        <td className="py-3 pr-2">
                          <input type="number" min="0" step="0.01" value={i.descuento_unitario} 
                            onChange={e => actualizarItem(i.id_producto, 'descuento_unitario', e.target.value)}
                            className="input p-1 text-right text-orange-600 bg-orange-50 focus:bg-white border-orange-200" />
                        </td>
                        <td className="py-3 font-semibold text-gray-900 text-right">
                          {formatMoneda(subItem)}
                        </td>
                        <td className="py-3 text-right">
                          <button onClick={() => eliminarItem(i.id_producto)} 
                            className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 size={16} />
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
      </div>

      {/* Panel Derecho: Cliente y Totales */}
      <div className="w-full lg:w-80 flex flex-col gap-4">
        {/* Cliente */}
        <div className="card p-5 border-t-4 border-gray-800">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <User size={18} /> Datos del Cliente
          </h3>
          <div className="space-y-4">
            <div>
              <label className="label text-xs">Nombre o Razón Social *</label>
              <input type="text" className="input bg-gray-50 focus:bg-white border-gray-200" 
                placeholder="Ej. Juan Pérez" value={cliente.nombre} onChange={e => setCliente({...cliente, nombre: e.target.value})} />
            </div>
            <div>
              <label className="label text-xs">Teléfono / Celular</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input type="text" className="input pl-9 bg-gray-50 focus:bg-white border-gray-200" 
                  placeholder="999 888 777" value={cliente.telefono} onChange={e => setCliente({...cliente, telefono: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="label text-xs">Notas adicionales</label>
              <textarea className="input bg-gray-50 focus:bg-white border-gray-200 text-xs py-2" rows="2"
                placeholder="Ej. Válido por 5 días..." value={cliente.notas} onChange={e => setCliente({...cliente, notas: e.target.value})} />
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div className="card p-5 bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden">
          {/* Elemento decorativo Fuego */}
          <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-orange-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
          <div className="absolute -left-10 -top-10 w-24 h-24 bg-red-600 rounded-full blur-2xl opacity-20 pointer-events-none"></div>

          <h3 className="font-bold text-gray-100 mb-4">Resumen</h3>
          <div className="space-y-2 text-sm relative z-10">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span>{formatMoneda(subtotal)}</span>
            </div>
            <div className="flex justify-between text-orange-400">
              <span>Descuento</span>
              <span>- {formatMoneda(descuento)}</span>
            </div>
            <div className="pt-3 mt-3 border-t border-gray-800 flex justify-between items-center">
              <span className="text-gray-300">Total a Pagar</span>
              <span className="text-2xl font-black text-white">{formatMoneda(total)}</span>
            </div>
          </div>
          
          <button 
            onClick={handleGuardar}
            disabled={cart.length === 0 || crear.isPending}
            className="w-full mt-6 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
          >
            {crear.isPending ? 'Guardando...' : <><Save size={18} /> Generar Proforma</>}
          </button>
        </div>
      </div>
    </div>
  )
}
