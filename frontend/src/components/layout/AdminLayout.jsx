import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTienda } from '../../context/TiendaContext.jsx'
import {
  LayoutDashboard, Package, Warehouse, ShoppingCart,
  BarChart2, Bell, Users, Store, LogOut, ChevronRight,
  User, Menu, X, Tags, FileText, Wallet, Building2, Cloud,
  Wrench, CreditCard, Database, Settings, Truck, Layers, Globe
} from 'lucide-react'
import { useState } from 'react'

const navSections = [
  { title: 'Portal Web & IA', items: [
    { to: '/admin/cms', icon: Layers, label: 'CMS Drupal & n8n' },
    { to: '/web',       icon: Globe,  label: 'Ver Página Web' },
  ]},
  { title: 'Ventas', items: [
    { to: '/admin/pos',       icon: ShoppingCart, label: 'Punto de Venta' },
    { to: '/admin/ventas',    icon: BarChart2,    label: 'Historial Ventas' },
    { to: '/admin/proformas', icon: FileText,     label: 'Proformas' },
    { to: '/admin/caja',      icon: Wallet,       label: 'Mi Caja' },
  ]},
  { title: 'Gestión', items: [
    { to: '/admin',                    icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/productos',          icon: Package,         label: 'Productos' },
    { to: '/admin/categorias-marcas',  icon: Tags,            label: 'Categorías/Marcas' },
    { to: '/admin/inventario',         icon: Warehouse,       label: 'Inventario' },
    { to: '/admin/guias-remision',     icon: Truck,           label: 'Guías Remisión' },
  ]},
  { title: 'Finanzas', items: [
    { to: '/admin/reportes',           icon: BarChart2,   label: 'Reportes' },
    { to: '/admin/control-cajas',      icon: Wallet,      label: 'Cajas y Gastos' },
    { to: '/admin/deudas-externas',    icon: Building2,   label: 'Consignaciones' },
    { to: '/admin/cuentas-cobrar',     icon: CreditCard,  label: 'Cuentas por Cobrar' },
    { to: '/admin/facturacion-sunat',  icon: Cloud,       label: 'Facturación SUNAT' },
  ]},
  { title: 'Servicios', items: [
    { to: '/admin/servicio-tecnico',   icon: Wrench,      label: 'Servicio Técnico' },
  ]},
  { title: 'Sistema', items: [
    { to: '/admin/alertas',       icon: Bell,     label: 'Alertas' },
    { to: '/admin/usuarios',      icon: Users,    label: 'Usuarios' },
    { to: '/admin/tiendas',       icon: Store,    label: 'Tiendas' },
    { to: '/admin/backups',       icon: Database, label: 'Backups' },
    { to: '/admin/configuracion', icon: Settings, label: 'Configuración' },
  ]},
]

function Sidebar({ idTienda, tiendas, cambiarTienda, cargandoTiendas, usuario, handleLogout, setOpen }) {
  return (
    <aside className="flex flex-col h-full bg-slate-900 border-r border-slate-800">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/25">
            <span className="text-white font-black text-lg tracking-tighter">JD</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-black text-white text-sm tracking-tight uppercase">JD Store</p>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider truncate">ADMINISTRADOR</p>
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

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {navSections.map(section => (
          <div key={section.title}>
            <p className="px-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-2">{section.title}</p>
            <div className="space-y-0.5">
              {section.items.map(({ to, icon: Icon, label, end }) => (
                <NavLink
                  key={to} to={to} end={end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-slate-800">
        <NavLink to="/admin/perfil" onClick={() => setOpen(false)}
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

export default function AdminLayout() {
  const { usuario, logout } = useAuth()
  const { idTienda, tiendas, cambiarTienda, cargandoTiendas, nombreTienda } = useTienda()
  const navigate            = useNavigate()
  const [open, setOpen]     = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen overflow-hidden print:block">
      {/* Sidebar desktop */}
      <div className="hidden lg:flex lg:w-60 lg:flex-shrink-0 print:!hidden">
        <Sidebar idTienda={idTienda} tiendas={tiendas} cambiarTienda={cambiarTienda} cargandoTiendas={cargandoTiendas} usuario={usuario} handleLogout={handleLogout} setOpen={setOpen} />
      </div>

      {/* Sidebar mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative w-60 h-full flex flex-col">
            <Sidebar idTienda={idTienda} tiendas={tiendas} cambiarTienda={cambiarTienda} cargandoTiendas={cargandoTiendas} usuario={usuario} handleLogout={handleLogout} setOpen={setOpen} />
          </div>
        </div>
      )}

      {/* Main content — fondo claro */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-100 print:!block print:!overflow-visible">
        {/* Topbar mobile */}
        <div className="lg:hidden flex items-center gap-3 px-5 py-3 bg-white border-b border-gray-200 print:!hidden">
          <button onClick={() => setOpen(true)} className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200">
            <Menu size={20} />
          </button>
          <span className="font-bold text-gray-800">JD Store — {nombreTienda}</span>
        </div>

        <main className="flex-1 overflow-y-auto p-5 lg:p-8 print:!p-0 print:!overflow-visible">
          <Outlet />
        </main>
      </div>
    </div>
  )
}