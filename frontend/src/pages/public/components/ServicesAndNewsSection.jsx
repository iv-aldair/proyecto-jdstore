import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Wrench, Laptop, Printer, ChevronRight, Award, Eye, ShieldCheck,
  MapPin, Phone, Clock, X, Send
} from 'lucide-react'
import api from '../../../api/axios.js'
import toast from 'react-hot-toast'

export default function ServicesAndNewsSection({
  usuario,
  inst = {},
  publicaciones = [],
  tiendas = []
}) {
  const [codigoServicio, setCodigoServicio] = useState('')
  const [buscandoServicio, setBuscandoServicio] = useState(false)
  const [resultadoServicio, setResultadoServicio] = useState(null)
  const [noticiaModal, setNoticiaModal] = useState(null)

  const [formContacto, setFormContacto] = useState({
    nombre: '',
    dni_ruc: '',
    telefono: '',
    correo: '',
    asunto: 'Cotización de Equipos',
    mensaje: ''
  })
  const [enviandoContacto, setEnviandoContacto] = useState(false)

  const handleConsultarServicio = async (e) => {
    e.preventDefault()
    if (!codigoServicio.trim()) {
      toast.error('Ingresa tu DNI, RUC o N° de Orden')
      return
    }
    setBuscandoServicio(true)
    try {
      const { data } = await api.get(`/public/servicio-tecnico/${encodeURIComponent(codigoServicio.trim())}`)
      setResultadoServicio(data.servicios || [])
    } catch (_) {
      toast.error('No se pudo realizar la consulta')
    } finally {
      setBuscandoServicio(false)
    }
  }

  const handleEnviarContacto = async (e) => {
    e.preventDefault()
    if (!formContacto.nombre || !formContacto.telefono || !formContacto.mensaje) {
      toast.error('Completa tu nombre, teléfono y mensaje')
      return
    }
    setEnviandoContacto(true)
    try {
      const { data } = await api.post('/public/contacto', formContacto)
      toast.success(data.mensaje || '¡Consulta enviada con éxito!')
      setFormContacto({
        nombre: '',
        dni_ruc: '',
        telefono: '',
        correo: '',
        asunto: 'Cotización de Equipos',
        mensaje: ''
      })
    } catch (_) {
      toast.error('Error al enviar solicitud')
    } finally {
      setEnviandoContacto(false)
    }
  }

  return (
    <>
      {/* 1. Servicios Técnicos y Rastreo de Orden */}
      <section id="servicios" className="py-14 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="inline-block text-xs font-extrabold uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full">
              Servicio Técnico Especializado
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Laboratorio de Reparación y Repotenciación
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Especialistas en mantenimiento preventivo y correctivo de laptops, instalación de unidades SSD NVMe y memoria RAM, limpieza ultrasónica de cabezales Epson/Canon y soporte técnico garantizado.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-1">
                  <Laptop size={18} />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Repotenciación Express</h4>
                <p className="text-slate-600">Instalación de discos sólidos SSD Kingston y ampliación de memoria RAM DDR4/DDR5 en menos de 1 hora.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-1">
                  <Printer size={18} />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Laboratorio de Impresoras</h4>
                <p className="text-slate-600">Mantenimiento de impresoras Epson EcoTank, Canon PIXMA y Brother con suministros originales.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-red-600 to-red-500 shadow-lg shadow-red-600/25">
                <Wrench size={20} />
              </div>
              <div>
                <h3 className="font-black text-base">Rastreo de Servicio Técnico</h3>
                <p className="text-xs text-slate-400">Consulta el estado de tu equipo con tu DNI o N° de Orden</p>
              </div>
            </div>

            <form onSubmit={handleConsultarServicio} className="flex gap-2">
              <input
                type="text"
                value={codigoServicio}
                onChange={(e) => setCodigoServicio(e.target.value)}
                placeholder="Ingresa DNI, RUC o N° de orden..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500"
              />
              <button
                type="submit"
                disabled={buscandoServicio}
                className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-red-600/20 transition-all"
              >
                {buscandoServicio ? 'Buscando...' : 'Consultar'}
              </button>
            </form>

            {resultadoServicio && (
              <div className="space-y-2 text-xs">
                {resultadoServicio.length === 0 ? (
                  <p className="bg-slate-800/80 p-3.5 rounded-xl text-slate-300 border border-slate-700">
                    No se encontraron órdenes activas con ese documento.
                  </p>
                ) : (
                  resultadoServicio.map((s) => (
                    <div key={s.id_servicio} className="bg-slate-800 p-3.5 rounded-xl border border-slate-700">
                      <div className="flex justify-between font-bold text-red-400">
                        <span>Orden #{s.id_servicio} — {s.equipo}</span>
                        <span className="text-emerald-400">{s.estado}</span>
                      </div>
                      <p className="text-slate-300 mt-1">{s.problema_reportado}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Novedades, Promociones y Comunicados (CMS) */}
      <section id="noticias" className="py-14 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-red-600">
                Actualidad & Promociones
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-0.5">Novedades y Campañas JD Store</h2>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full">
              Comunicados y Promociones Oficiales
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {publicaciones.map((pub) => (
              <article
                key={pub.id_publicacion}
                onClick={() => setNoticiaModal(pub)}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {pub.imagen_url && (
                    <div className="h-40 overflow-hidden">
                      <img
                        src={pub.imagen_url}
                        alt={pub.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full">
                      {pub.categoria}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {pub.titulo}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{pub.resumen}</p>
                  </div>
                </div>
                <div className="px-4 pb-3.5 pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-red-600 font-bold">
                  <span>Ver publicación</span>
                  <ChevronRight size={14} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Sobre Nosotros y Nuestras Sucursales */}
      <section id="nosotros" className="py-14 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full">
              Sobre Nosotros
            </span>
            <h2 className="text-3xl font-black text-slate-900">
              {inst.nombre_institucion || 'JD STORE S.C.R.L.'} — RUC {inst.ruc || '20600698479'}
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {inst.descripcion ||
                'Somos una empresa peruana líder en venta de computadoras, laptops, monitores, impresoras y accesorios en Juliaca y Puno.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <Award size={22} />
              </div>
              <h3 className="font-bold text-base text-slate-900">Nuestra Misión</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{inst.mision}</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <Eye size={22} />
              </div>
              <h3 className="font-bold text-base text-slate-900">Nuestra Visión</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{inst.vision}</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>
              <h3 className="font-bold text-base text-slate-900">Facturación Electrónica SUNAT</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Emitimos Boletas, Facturas Electrónicas y Proformas inmediatas con control por Número de Serie (S/N) para cada equipo.
              </p>
            </div>
          </div>

          {/* Sucursales */}
          <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-900 text-center">Nuestras Tiendas en Juliaca y Puno</h3>
            <div className="grid md:grid-cols-3 gap-5">
              {tiendas.map((t) => (
                <div key={t.id_tienda} className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-base text-slate-900">{t.nombre_tienda}</span>
                    <span className="text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full">
                      Operativa
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 flex items-center gap-2">
                    <MapPin size={14} className="text-red-500" /> {t.direccion}
                  </p>
                  <p className="text-xs text-slate-600 flex items-center gap-2">
                    <Phone size={14} className="text-slate-700" /> {t.telefono}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Contacto y Cotizaciones */}
      <section id="contacto" className="py-14 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-wider text-red-400">
              Atención Comercial y Corporativa
            </span>
            <h2 className="text-3xl font-black">¿Necesitas una Cotización o Asesoría?</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Escríbenos para compras personales, ventas al por mayor o abastecimiento de colegios, universidades, municipalidades y empresas.
            </p>
            <div className="space-y-2.5 text-xs text-slate-300 pt-2">
              <p className="flex items-center gap-2.5"><MapPin size={16} className="text-red-500" /> {inst.direccion_principal}</p>
              <p className="flex items-center gap-2.5"><Phone size={16} className="text-emerald-400" /> WhatsApp Ventas: {inst.telefono_central || '951 234 567'}</p>
              <p className="flex items-center gap-2.5"><Clock size={16} className="text-red-400" /> {inst.horario_atencion}</p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form onSubmit={handleEnviarContacto} className="bg-white text-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
              <h3 className="font-black text-base text-slate-900">Envíanos tu consulta o pedido</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={formContacto.nombre}
                  onChange={(e) => setFormContacto({ ...formContacto, nombre: e.target.value })}
                  placeholder="Nombre completo o Empresa *"
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-red-500 focus:outline-none text-xs"
                />
                <input
                  type="text"
                  value={formContacto.dni_ruc}
                  onChange={(e) => setFormContacto({ ...formContacto, dni_ruc: e.target.value })}
                  placeholder="DNI o RUC"
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-red-500 focus:outline-none text-xs"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={formContacto.telefono}
                  onChange={(e) => setFormContacto({ ...formContacto, telefono: e.target.value })}
                  placeholder="Celular / WhatsApp *"
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-red-500 focus:outline-none text-xs"
                />
                <input
                  type="email"
                  value={formContacto.correo}
                  onChange={(e) => setFormContacto({ ...formContacto, correo: e.target.value })}
                  placeholder="Correo electrónico"
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-red-500 focus:outline-none text-xs"
                />
              </div>
              <textarea
                rows={3}
                required
                value={formContacto.mensaje}
                onChange={(e) => setFormContacto({ ...formContacto, mensaje: e.target.value })}
                placeholder="¿Qué equipo o servicio estás buscando? *"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-red-500 focus:outline-none text-xs"
              />
              <button
                type="submit"
                disabled={enviandoContacto}
                className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 transition-all"
              >
                <Send size={15} />
                <span>{enviandoContacto ? 'Enviando...' : 'Enviar Solicitud'}</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Modal de Noticia CMS */}
      {noticiaModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl">
            {noticiaModal.imagen_url && (
              <img src={noticiaModal.imagen_url} alt={noticiaModal.titulo} className="w-full h-52 object-cover" />
            )}
            <div className="p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold uppercase text-red-600 bg-red-50 px-3 py-1 rounded-full">
                  {noticiaModal.categoria}
                </span>
                <button onClick={() => setNoticiaModal(null)} className="text-slate-400 hover:text-slate-700">
                  <X size={20} />
                </button>
              </div>
              <h3 className="text-xl font-black text-slate-900">{noticiaModal.titulo}</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{noticiaModal.contenido}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
