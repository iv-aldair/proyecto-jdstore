import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ProtectedRoute from '../components/ProtectedRoute.jsx'

import Login           from '../pages/auth/Login.jsx'
import CambiarPassword from '../pages/auth/CambiarPassword.jsx'
import HomeInstitucional from '../pages/public/HomeInstitucional.jsx'
import GestorCMS       from '../pages/admin/GestorCMS.jsx'

// Admin
import Dashboard   from '../pages/admin/Dashboard.jsx'
import Productos   from '../pages/admin/Productos.jsx'
import Inventario  from '../pages/admin/Inventario.jsx'
import Ventas      from '../pages/admin/Ventas.jsx'
import Reportes          from '../pages/admin/Reportes.jsx'
import CategoriasMarcas  from '../pages/admin/CategoriasMarcas.jsx'
import Alertas           from '../pages/admin/Alertas.jsx'
import Usuarios    from '../pages/admin/Usuarios.jsx'
import Tiendas     from '../pages/admin/Tiendas.jsx'
import ControlCajas from '../pages/admin/ControlCajas.jsx'
import DeudasExternas from '../pages/admin/DeudasExternas.jsx'
import Backups       from '../pages/admin/Backups.jsx'
import Configuracion from '../pages/admin/Configuracion.jsx'
import GuiasRemision from '../pages/admin/GuiasRemision.jsx'
import NuevaGuiaRemision from '../pages/admin/NuevaGuiaRemision.jsx'
import GuiaImpresion from '../pages/admin/GuiaImpresion.jsx'

import Proformas     from '../pages/admin/Proformas.jsx'
import NuevaProforma from '../pages/admin/NuevaProforma.jsx'
import ProformaDetalle from '../pages/admin/ProformaDetalle.jsx'
import Comprobante     from '../pages/admin/Comprobante.jsx'

// Vendedor
import POS           from '../pages/vendedor/POS.jsx'
import MisVentas     from '../pages/vendedor/MisVentas.jsx'
import ConsultaStock from '../pages/vendedor/ConsultaStock.jsx'
import Clientes      from '../pages/vendedor/Clientes.jsx'
import MiCaja        from '../pages/vendedor/MiCaja.jsx'

// Shared
import FacturacionSUNAT from '../pages/shared/FacturacionSUNAT.jsx'
import ServicioTecnico  from '../pages/shared/ServicioTecnico.jsx'
import CuentasPorCobrar from '../pages/shared/CuentasPorCobrar.jsx'

import AdminLayout   from '../components/layout/AdminLayout.jsx'
import VendedorLayout from '../components/layout/VendedorLayout.jsx'

export default function AppRouter() {
  const { usuario, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Cargando JD Store...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Pública: Página Web Institucional con AWS, CMS Directus y Chatbot n8n */}
        <Route path="/" element={<HomeInstitucional />} />
        <Route path="/web" element={<HomeInstitucional />} />

        <Route path="/login" element={
          usuario ? <Navigate to={usuario.id_rol === 1 ? '/admin' : '/vendedor'} replace /> : <Login />
        } />

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute rolRequerido={1}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index         element={<Dashboard />} />
          <Route path="productos"          element={<Productos />} />
          <Route path="categorias-marcas"  element={<CategoriasMarcas />} />
          <Route path="inventario"         element={<Inventario />} />
          <Route path="ventas"     element={<Ventas />} />
          <Route path="reportes"   element={<Reportes />} />
          <Route path="alertas"    element={<Alertas />} />
          <Route path="usuarios"   element={<Usuarios />} />
          <Route path="tiendas"    element={<Tiendas />} />
          <Route path="backups"    element={<Backups />} />
          <Route path="configuracion" element={<Configuracion />} />
          <Route path="guias-remision" element={<GuiasRemision />} />
          <Route path="guias-remision/nueva" element={<NuevaGuiaRemision />} />
          <Route path="guias-remision/:id/imprimir" element={<GuiaImpresion />} />
          <Route path="comprobante/:id"     element={<Comprobante />} />
          <Route path="proformas"           element={<Proformas />} />
          <Route path="proformas/nueva"     element={<NuevaProforma />} />
          <Route path="proformas/:id"       element={<ProformaDetalle />} />
          <Route path="control-cajas"       element={<ControlCajas />} />
          <Route path="deudas-externas"     element={<DeudasExternas />} />
          <Route path="facturacion-sunat"   element={<FacturacionSUNAT />} />
          <Route path="pos"                 element={<POS />} />
          <Route path="caja"                element={<MiCaja />} />
          <Route path="stock"               element={<ConsultaStock />} />
          <Route path="clientes"            element={<Clientes />} />
          <Route path="servicio-tecnico"    element={<ServicioTecnico />} />
          <Route path="cuentas-cobrar"      element={<CuentasPorCobrar />} />
          <Route path="cms"                 element={<GestorCMS />} />
          <Route path="perfil"     element={<CambiarPassword />} />
        </Route>

        {/* Vendedor */}
        <Route path="/vendedor" element={
          <ProtectedRoute rolRequerido={2}>
            <VendedorLayout />
          </ProtectedRoute>
        }>
          <Route index              element={<POS />} />
          <Route path="mis-ventas"  element={<MisVentas />} />
          <Route path="stock"       element={<ConsultaStock />} />
          <Route path="clientes"    element={<Clientes />} />
          <Route path="comprobante/:id"     element={<Comprobante />} />
          <Route path="proformas"           element={<Proformas />} />
          <Route path="proformas/nueva"     element={<NuevaProforma />} />
          <Route path="proformas/:id"       element={<ProformaDetalle />} />
          <Route path="caja"                element={<MiCaja />} />
          <Route path="facturacion-sunat"   element={<FacturacionSUNAT />} />
          <Route path="servicio-tecnico"    element={<ServicioTecnico />} />
          <Route path="cuentas-cobrar"      element={<CuentasPorCobrar />} />
          <Route path="perfil"      element={<CambiarPassword />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}