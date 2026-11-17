import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios.js'
import toast from 'react-hot-toast'
import {
  Layers, Plus, Edit3, Trash2, Globe, Bot, Cloud,
  Building2, MessageSquare, Mail, ExternalLink, Save, CheckCircle2, RefreshCw, Code2, X
} from 'lucide-react'

export default function GestorCMS() {
  const [tab, setTab] = useState('publicaciones')
  const [cargando, setCargando] = useState(true)
  const [sincronizandoDrupal, setSincronizandoDrupal] = useState(false)
  const [jsonApiModal, setJsonApiModal] = useState(null)
  const [publicaciones, setPublicaciones] = useState([])
  const [institucional, setInstitucional] = useState({})
  const [contactos, setContactos] = useState([])
  const [logsChatbot, setLogsChatbot] = useState([])

  // Modal crear/editar publicación CMS
  const [modalPub, setModalPub] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [formPub, setFormPub] = useState({
    titulo: '',
    categoria: 'Noticia Institucional',
    resumen: '',
    contenido: '',
    imagen_url: '',
    autor: 'Dirección Institucional JD Store',
    destacado: false,
    estado: 'publicado'
  })

  useEffect(() => {
    cargarDatosCMS()
  }, [])

  const cargarDatosCMS = async () => {
    setCargando(true)
    try {
      const { data } = await api.get('/public/cms/datos')
      if (data.ok) {
        setPublicaciones(data.publicaciones || [])
        setInstitucional(data.institucional || {})
        setContactos(data.contactos || [])
        setLogsChatbot(data.logsChatbot || [])
      }
    } catch (err) {
      toast.error('Error al cargar datos del CMS')
    } finally {
      setCargando(false)
    }
  }

  const abrirNuevaPub = () => {
    setEditandoId(null)
    setFormPub({
      titulo: '',
      categoria: 'Noticia Institucional',
      resumen: '',
      contenido: '',
      imagen_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
      autor: 'Dirección Institucional JD Store',
      destacado: false,
      estado: 'publicado'
    })
    setModalPub(true)
  }

  const abrirEditarPub = (pub) => {
    setEditandoId(pub.id_publicacion)
    setFormPub({
      titulo: pub.titulo,
      categoria: pub.categoria,
      resumen: pub.resumen,
      contenido: pub.contenido,
      imagen_url: pub.imagen_url || '',
      autor: pub.autor || 'Dirección Institucional JD Store',
      destacado: Boolean(pub.destacado),
      estado: pub.estado || 'publicado'
    })
    setModalPub(true)
  }

  const guardarPublicacion = async (e) => {
    e.preventDefault()
    try {
      if (editandoId) {
        await api.put(`/public/cms/publicaciones/${editandoId}`, formPub)
        toast.success('Publicación actualizada en el CMS')
      } else {
        await api.post('/public/cms/publicaciones', formPub)
        toast.success('Nueva publicación añadida al CMS')
      }
      setModalPub(false)
      cargarDatosCMS()
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error guardando publicación')
    }
  }

  const eliminarPublicacion = async (id) => {
    if (!window.confirm('¿Eliminar esta publicación del portal web?')) return
    try {
      await api.delete(`/public/cms/publicaciones/${id}`)
      toast.success('Publicación eliminada')
      cargarDatosCMS()
    } catch (_) {
      toast.error('No se pudo eliminar')
    }
  }

  const guardarInstitucional = async (e) => {
    e.preventDefault()
    try {
      await api.put('/public/cms/institucional', institucional)
      if (institucional.n8n_webhook_url) {
        localStorage.setItem('jdstore_n8n_webhook', institucional.n8n_webhook_url)
      }
      toast.success('Configuración Institucional, Drupal 10 CMS, AWS y n8n guardada')
    } catch (_) {
      toast.error('Error al actualizar datos institucionales')
    }
  }

  const sincronizarConDrupal = async () => {
    setSincronizandoDrupal(true)
    try {
      const { data } = await api.post('/public/cms/drupal-sync', {
        drupal_url: institucional.drupal_url || institucional.directus_url || 'http://localhost:8080'
      })
      toast.success(data.mensaje || 'Sincronización con Drupal JSON:API completada')
      cargarDatosCMS()
    } catch (_) {
      toast.error('Error al sincronizar con el endpoint JSON:API de Drupal')
    } finally {
      setSincronizandoDrupal(false)
    }
  }

  const abrirVisorJsonApi = async () => {
    try {
      const { data } = await api.get('/public/drupal/jsonapi/node/article')
      setJsonApiModal(data)
    } catch (_) {
      toast.error('No se pudo obtener el feed JSON:API')
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              Drupal 10 Headless CMS (JSON:API) + n8n + AWS
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
              <CheckCircle2 size={12} /> Sincronizado con MySQL
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Gestor de Contenidos (Drupal 10 CMS) & Chatbot n8n
          </h1>
          <p className="text-sm text-slate-500">
            Administra las noticias, imágenes, información institucional mediante arquitectura Headless Drupal (JSON:API) y el asistente IA en n8n.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={institucional.drupal_url || 'http://localhost:8080'}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow"
          >
            <Layers size={16} className="text-blue-400" />
            <span>Panel Drupal 10 (:8080)</span>
            <ExternalLink size={14} />
          </a>
          <Link
            to="/web"
            target="_blank"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow"
          >
            <Globe size={16} />
            <span>Ver Página Web Institucional</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      {/* Pestañas del Gestor */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setTab('publicaciones')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${tab === 'publicaciones'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
        >
          <Layers size={16} />
          <span>Noticias y Publicaciones Drupal CMS ({publicaciones.length})</span>
        </button>

        <button
          onClick={() => setTab('institucional')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${tab === 'institucional'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
        >
          <Building2 size={16} />
          <span>Datos Institucionales, Drupal CMS & n8n</span>
        </button>

        <button
          onClick={() => setTab('contactos')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${tab === 'contactos'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
        >
          <Mail size={16} />
          <span>Solicitudes Web ({contactos.length})</span>
        </button>

        <button
          onClick={() => setTab('chatbot')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${tab === 'chatbot'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
        >
          <Bot size={16} />
          <span>Auditoría Chatbot n8n ({logsChatbot.length})</span>
        </button>
      </div>

      {/* TAB 1: PUBLICACIONES DEL CMS */}
      {tab === 'publicaciones' && (
        <div className="space-y-4">
          {/* Barra de Arquitectura Headless Drupal 10 JSON:API */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Headless Drupal 10 · JSON:API v1.0
                </span>
                <code className="text-xs text-emerald-400 bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                  GET /jsonapi/node/article
                </code>
              </div>
              <p className="text-xs text-slate-300">
                Arquitectura Desacoplada: Drupal gestiona los nodos de contenido (<code className="text-blue-300">node--article</code>) y la tienda en React los consume automáticamente vía JSON:API.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={abrirVisorJsonApi}
                className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
              >
                <Code2 size={15} className="text-blue-400" />
                <span>Ver JSON:API (node--article)</span>
              </button>
              <button
                type="button"
                onClick={sincronizarConDrupal}
                disabled={sincronizandoDrupal}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow transition-colors"
              >
                <RefreshCw size={15} className={sincronizandoDrupal ? 'animate-spin' : ''} />
                <span>{sincronizandoDrupal ? 'Sincronizando...' : 'Sincronizar con Drupal 10'}</span>
              </button>
              <button
                type="button"
                onClick={abrirNuevaPub}
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition-colors"
              >
                <Plus size={15} />
                <span>Nueva Publicación CMS</span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {publicaciones.map((pub) => (
              <div key={pub.id_publicacion} className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-4 shadow-sm">
                {pub.imagen_url && (
                  <img
                    src={pub.imagen_url}
                    alt={pub.titulo}
                    className="w-28 h-28 rounded-xl object-cover flex-shrink-0 bg-slate-100"
                  />
                )}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                        {pub.categoria}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${pub.estado === 'publicado' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                        {pub.estado}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm mt-1 truncate">{pub.titulo}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{pub.resumen}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3">
                    <button
                      onClick={() => abrirEditarPub(pub)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg"
                    >
                      <Edit3 size={14} /> Editar
                    </button>
                    <button
                      onClick={() => eliminarPublicacion(pub.id_publicacion)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg"
                    >
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CONFIGURACIÓN INSTITUCIONAL, DIRECTUS Y N8N */}
      {tab === 'institucional' && (
        <form onSubmit={guardarInstitucional} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5 shadow-sm">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Nombre de la Institución</label>
              <input
                type="text"
                className="input"
                value={institucional.nombre_institucion || ''}
                onChange={(e) => setInstitucional({ ...institucional, nombre_institucion: e.target.value })}
              />
            </div>
            <div>
              <label className="label">RUC Institucional</label>
              <input
                type="text"
                className="input"
                value={institucional.ruc || ''}
                onChange={(e) => setInstitucional({ ...institucional, ruc: e.target.value })}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Misión Institucional</label>
              <textarea
                rows={3}
                className="input"
                value={institucional.mision || ''}
                onChange={(e) => setInstitucional({ ...institucional, mision: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Visión Institucional</label>
              <textarea
                rows={3}
                className="input"
                value={institucional.vision || ''}
                onChange={(e) => setInstitucional({ ...institucional, vision: e.target.value })}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Teléfono Central</label>
              <input
                type="text"
                className="input"
                value={institucional.telefono_central || ''}
                onChange={(e) => setInstitucional({ ...institucional, telefono_central: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Dirección Principal</label>
              <input
                type="text"
                className="input"
                value={institucional.direccion_principal || ''}
                onChange={(e) => setInstitucional({ ...institucional, direccion_principal: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Horario de Atención</label>
              <input
                type="text"
                className="input"
                value={institucional.horario_atencion || ''}
                onChange={(e) => setInstitucional({ ...institucional, horario_atencion: e.target.value })}
              />
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Bot size={18} className="text-red-500" />
                <span>🧠 Entrenamiento del Chatbot IA (Prompt Maestro e Instrucciones de JD Store)</span>
              </h3>
              <span className="text-[11px] bg-red-600/20 text-red-300 border border-red-500/30 px-2.5 py-0.5 rounded-full font-bold">
                Conectado a Gemini & n8n
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Escribe aquí las instrucciones, políticas de venta, tono de voz, medios de pago, envíos y reglas comerciales que el Chatbot utilizará para responder a tus clientes.
            </p>
            <textarea
              rows={7}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 text-slate-100 p-3.5 text-xs font-mono leading-relaxed focus:outline-none focus:border-red-500"
              placeholder="Escribe aquí el prompt de entrenamiento de tu tienda..."
              value={institucional.prompt_entrenamiento || ''}
              onChange={(e) => setInstitucional({ ...institucional, prompt_entrenamiento: e.target.value })}
            />
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Cloud size={16} className="text-blue-600" />
              Integración con n8n, Headless Drupal 10 CMS y AWS
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="label">URL Webhook Chatbot n8n</label>
                <input
                  type="text"
                  className="input"
                  placeholder="http://localhost:5678/webhook/jdstore-chatbot"
                  value={institucional.n8n_webhook_url || ''}
                  onChange={(e) => setInstitucional({ ...institucional, n8n_webhook_url: e.target.value })}
                />
              </div>
              <div>
                <label className="label">URL de Drupal 10 CMS (JSON:API)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="http://localhost:8080"
                  value={institucional.drupal_url || institucional.directus_url || 'http://localhost:8080'}
                  onChange={(e) =>
                    setInstitucional({
                      ...institucional,
                      drupal_url: e.target.value,
                      directus_url: e.target.value
                    })
                  }
                />
              </div>
              <div>
                <label className="label">Infraestructura AWS</label>
                <input
                  type="text"
                  className="input"
                  value={institucional.aws_region || ''}
                  onChange={(e) => setInstitucional({ ...institucional, aws_region: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn-primary flex items-center gap-2 px-6 py-2.5">
              <Save size={16} />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: SOLICITUDES Y CONTACTOS RECIBIDOS */}
      {tab === 'contactos' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Cliente / Institución</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Asunto</th>
                <th className="px-4 py-3">Mensaje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contactos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    Aún no hay solicitudes enviadas desde el formulario web.
                  </td>
                </tr>
              ) : (
                contactos.map((c) => (
                  <tr key={c.id_contacto} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {new Date(c.created_at).toLocaleString('es-PE')}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {c.nombre} {c.dni_ruc && <span className="text-xs text-slate-400">({c.dni_ruc})</span>}
                    </td>
                    <td className="px-4 py-3">{c.telefono}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-semibold">
                        {c.asunto}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 max-w-md">{c.mensaje}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: LOGS DE CONVERSACIONES DEL CHATBOT N8N */}
      {tab === 'chatbot' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Hora</th>
                <th className="px-4 py-3">Consulta del Usuario</th>
                <th className="px-4 py-3">Respuesta del Asistente</th>
                <th className="px-4 py-3">Motor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logsChatbot.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    Sin interacciones registradas aún.
                  </td>
                </tr>
              ) : (
                logsChatbot.map((log) => (
                  <tr key={log.id_log} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('es-PE')}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">{log.mensaje_usuario}</td>
                    <td className="px-4 py-3 text-xs text-slate-600 max-w-lg line-clamp-2">{log.respuesta_bot}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-orange-50 text-orange-700 text-xs font-bold">
                        {log.origen}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL PARA CREAR / EDITAR NOTICIA DEL CMS */}
      {modalPub && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={guardarPublicacion} className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              {editandoId ? 'Editar Publicación CMS' : 'Nueva Publicación CMS'}
            </h3>

            <div>
              <label className="label">Título de la Noticia / Publicación *</label>
              <input
                type="text"
                required
                className="input"
                value={formPub.titulo}
                onChange={(e) => setFormPub({ ...formPub, titulo: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Categoría</label>
                <select
                  className="input"
                  value={formPub.categoria}
                  onChange={(e) => setFormPub({ ...formPub, categoria: e.target.value })}
                >
                  <option value="Noticia Institucional">Noticia Institucional</option>
                  <option value="Innovación Tecnológica">Innovación Tecnológica</option>
                  <option value="Promociones">Promociones</option>
                  <option value="Servicios Técnicos">Servicios Técnicos</option>
                  <option value="Comunicado Oficial">Comunicado Oficial</option>
                </select>
              </div>
              <div>
                <label className="label">Estado</label>
                <select
                  className="input"
                  value={formPub.estado}
                  onChange={(e) => setFormPub({ ...formPub, estado: e.target.value })}
                >
                  <option value="publicado">Publicado</option>
                  <option value="borrador">Borrador</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">URL de Imagen (Banner)</label>
              <input
                type="text"
                className="input"
                value={formPub.imagen_url}
                onChange={(e) => setFormPub({ ...formPub, imagen_url: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Resumen corto *</label>
              <textarea
                rows={2}
                required
                className="input"
                value={formPub.resumen}
                onChange={(e) => setFormPub({ ...formPub, resumen: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Contenido completo *</label>
              <textarea
                rows={4}
                required
                className="input"
                value={formPub.contenido}
                onChange={(e) => setFormPub({ ...formPub, contenido: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalPub(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-semibold text-slate-700"
              >
                Cancelar
              </button>
              <button type="submit" className="btn-primary px-5 py-2">
                Guardar en CMS
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL VISOR DE PAYLOAD HEADLESS DRUPAL 10 JSON:API */}
      {jsonApiModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase text-blue-400">
                  Especificación Oficial JSON:API v1.0 — Drupal 10 Headless CMS
                </span>
                <h3 className="text-base font-black text-white mt-0.5">
                  Endpoint: GET /api/public/drupal/jsonapi/node/article
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setJsonApiModal(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>
            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-emerald-300 font-mono overflow-auto max-h-96">
              {JSON.stringify(jsonApiModal, null, 2)}
            </pre>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setJsonApiModal(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white"
              >
                Cerrar Visor JSON:API
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
        </div >
      )}
    </div >
  )
}
