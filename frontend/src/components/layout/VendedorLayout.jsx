import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTienda } from '../../context/TiendaContext.jsx'
import { ShoppingCart, Receipt, Search, Users, LogOut, User, Menu, FileText, Wallet, Cloud, Wrench, CreditCard } from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/vendedor',             icon: ShoppingCart, label: 'Punto de Venta', end: true },
  { to: '/vendedor/mis-ventas',  icon: Receipt,      label: 'Mis Ventas'     },
  { to: '/vendedor/proformas',   icon: FileText,     label: 'Proformas'      },
  { to: '/vendedor/caja',        icon: Wallet,       label: 'Mi Caja'        },
  { to: '/vendedor/stock',       icon: Search,       label: 'Consultar Stock'},
  { to: '/vendedor/clientes',    icon: Users,        label: 'Clientes'       },
  { to: '/vendedor/facturacion-sunat', icon: Cloud,       label: 'Facturación SUNAT'},
  { to: '/vendedor/servicio-tecnico',  icon: Wrench,      label: 'Servicio Técnico' },
  { to: '/vendedor/cuentas-cobrar',    icon: CreditCard,  label: 'Cuentas por Cobrar' },
]

function Sidebar({ idTienda, tiendas, cambiarTienda, cargandoTiendas, usuario, handleLogout, setOpen }) {
  return (
    <aside className="flex flex-col h-full bg-slate-900 border-r border-slate-800">
      <div className="px-6 py-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/25">
            <span className="text-white font-black text-lg tracking-tighter">JD</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-black text-white text-sm tracking-tight uppercase">JD Store</p>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider truncate">VENDEDOR</p>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-800">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Mi Tienda Actual:</label>
        <select 
          className="w-full bg-slate-900 border border-slate-700 text-sm text-slate-200 rounded-lg px-2 py-1.5 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors cursor-pointer outline-none"
          value={idTienda || ''}
          onChange={(e) => cambiarTienda(e.target.value)}
        >
          {cargandoTiendas ? (
            <option value="">Cargando tiendas...</option>
          ) : (
            tiendas.map(t => (
              <option key={t.id_tienda} value={t.id_tienda}>
                {t.nombre_tienda}
              </option>
            ))
          )}
        </select>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Ventas</p>
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-slate-800">
        <NavLink to="/vendedor/perfil" onClick={() => setOpen(false)}
          className="sidebar-link group !p-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 group-hover:bg-red-600 group-hover:text-white transition-colors">
            <User size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-300 truncate">{usuario?.nombre}</p>
            <p className="text-[10px] text-slate-500 truncate">{usuario?.correo}</p>
          </div>
        </NavLink>
        <button onClick={handleLogout}
          className="sidebar-link w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
          <LogOut size={16} />
          <span className="text-xs">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}

export default function VendedorLayout() {
  const { usuario, logout } = useAuth()
  const { idTienda, tiendas, cambiarTienda, cargandoTiendas, nombreTienda } = useTienda()
  const navigate            = useNavigate()
  const [open, setOpen]     = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:flex lg:w-60 lg:flex-shrink-0">
        <Sidebar idTienda={idTienda} tiendas={tiendas} cambiarTienda={cambiarTienda} cargandoTiendas={cargandoTiendas} usuario={usuario} handleLogout={handleLogout} setOpen={setOpen} />
      </div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative w-60 h-full flex flex-col">
            <Sidebar idTienda={idTienda} tiendas={tiendas} cambiarTienda={cambiarTienda} cargandoTiendas={cargandoTiendas} usuario={usuario} handleLogout={handleLogout} setOpen={setOpen} />
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-100">
        <div className="lg:hidden flex items-center gap-3 px-5 py-3 bg-white border-b border-gray-200">
          <button onClick={() => setOpen(true)} className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">
            <Menu size={20} />
          </button>
          <span className="font-bold text-gray-800">JD Store — {nombreTienda}</span>
        </div>
        <main className="flex-1 overflow-y-auto p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}