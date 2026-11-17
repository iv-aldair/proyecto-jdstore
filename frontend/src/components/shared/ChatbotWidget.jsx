import { useState, useRef, useEffect } from 'react'
import { X, Send, Bot, User, CheckCircle2, MessageCircle, RotateCcw } from 'lucide-react'
import api from '../../api/axios.js'

const SUGERENCIAS_RAPIDAS = [
  '🎮 ¿Qué laptops para gaming me recomiendas?',
  '🖨️ ¿Qué impresoras me recomiendas?',
  '🛒 ¿Cómo puedo realizar la compra?',
  '💻 Laptops a partir de 3 mil soles',
  '🖥️ ¿Qué monitores me recomiendas?',
  '📍 Locales y horarios en Juliaca y Puno'
]

export default function ChatbotWidget({ institucional }) {
  const [abierto, setAbierto] = useState(false)
  const [input, setInput] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [sesionId, setSesionId] = useState(() => `jdstore-sess-${Math.random().toString(36).slice(2, 9)}`)

  const mensajeInicial = {
    id: 1,
    emisor: 'bot',
    texto: `¡Hola! 👋 Bienvenido a **${institucional?.nombre_institucion || 'JD STORE'}**.\n\nSoy tu asesor virtual. ¿Qué equipo estás buscando hoy? Puedo recomendarte laptops, impresoras o monitores, indicarte precios y ayudarte paso a paso con tu compra.`,
    hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  }

  const [mensajes, setMensajes] = useState([mensajeInicial])
  const chatEndRef = useRef(null)

  useEffect(() => {
    if (abierto) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [mensajes, abierto])

  const reiniciarConversacion = () => {
    const nuevaSesion = `jdstore-sess-${Math.random().toString(36).slice(2, 9)}`
    setSesionId(nuevaSesion)
    setMensajes([
      {
        ...mensajeInicial,
        id: Date.now(),
        hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
      }
    ])
  }

  // Formatear negritas (**texto**) y enlaces de WhatsApp ([Texto](https://wa.me/...))
  const formatearLinea = (linea, idx) => {
    const matchLink = linea.match(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/)
    if (matchLink) {
      const [fullMatch, textoBoton, urlLink] = matchLink
      const antes = linea.slice(0, linea.indexOf(fullMatch))
      return (
        <div key={idx} className="my-1.5">
          {antes && <p className="mb-1">{antes}</p>}
          <a
            href={urlLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-extrabold text-[11px] px-3.5 py-2 rounded-xl shadow-sm transition-all"
          >
            <MessageCircle size={14} />
            <span>{textoBoton}</span>
          </a>
        </div>
      )
    }

    const partes = linea.split(/(\*\*.*?\*\*)/g)
    return (
      <p key={idx} className={`${linea.trim() === '' ? 'h-2' : 'mb-1 leading-relaxed'}`}>
        {partes.map((parte, i) => {
          if (parte.startsWith('**') && parte.endsWith('**')) {
            return (
              <strong key={i} className="font-bold text-slate-900">
                {parte.slice(2, -2)}
              </strong>
            )
          }
          return parte
        })}
      </p>
    )
  }

  const formatearTexto = (texto) => {
    if (!texto) return null
    return texto.split('\n').map((linea, idx) => formatearLinea(linea, idx))
  }

  const enviarMensaje = async (textoManual) => {
    const textoEnviar = (textoManual ?? input).trim()
    if (!textoEnviar || enviando) return

    const nuevoMsgUsuario = {
      id: Date.now(),
      emisor: 'user',
      texto: textoEnviar,
      hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    }

    setMensajes((prev) => [...prev, nuevoMsgUsuario])
    if (!textoManual) setInput('')
    setEnviando(true)

    try {
      const { data } = await api.post('/public/chatbot', {
        mensaje: textoEnviar,
        sesion_id: sesionId
      })

      setMensajes((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          emisor: 'bot',
          texto: data.respuesta,
          hora: data.timestamp || new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
        }
      ])
    } catch (_) {
      setMensajes((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          emisor: 'bot',
          texto: 'Puedes escribirnos directamente a nuestro WhatsApp de ventas al **951 234 567** o visitarnos en **Jr. Noriega 342, Juliaca**.',
          hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
        }
      ])
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      {/* Ventana de Chat alineada a la derecha */}
      {abierto && (
        <div className="mb-3 w-[360px] sm:w-[415px] h-[550px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header del Chatbot con la paleta de JD Store */}
          <div className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-600/30">
                  <Bot size={22} className="text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-black text-sm tracking-tight">Asistente JD Store</h4>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    En línea
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-emerald-400" />
                  Asesor comercial de tecnología
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={reiniciarConversacion}
                title="Nueva conversación"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => setAbierto(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X size={19} />
              </button>
            </div>
          </div>

          {/* Lista de Mensajes */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3">
            {mensajes.map((m) => (
              <div
                key={m.id}
                className={`flex items-start gap-2.5 ${m.emisor === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${
                    m.emisor === 'user'
                      ? 'bg-slate-900 text-white'
                      : 'bg-gradient-to-br from-red-600 to-red-500 text-white'
                  }`}
                >
                  {m.emisor === 'user' ? <User size={14} /> : <Bot size={15} />}
                </div>

                <div
                  className={`max-w-[83%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm ${
                    m.emisor === 'user'
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-white text-slate-700 border border-slate-200/80 rounded-tl-none'
                  }`}
                >
                  <div className={m.emisor === 'user' ? 'text-white' : 'text-slate-700'}>
                    {m.emisor === 'user' ? m.texto : formatearTexto(m.texto)}
                  </div>
                  <div className="mt-1 flex items-center justify-end gap-1.5 text-[10px] text-slate-400">
                    <span>{m.hora}</span>
                  </div>
                </div>
              </div>
            ))}

            {enviando && (
              <div className="flex items-center gap-2 text-xs text-slate-500 pl-2">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce [animation-delay:300ms]" />
                </span>
                <span>Escribiendo...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Chips de Sugerencias Rápidas */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
            {SUGERENCIAS_RAPIDAS.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => enviarMensaje(sug)}
                disabled={enviando}
                className="flex-shrink-0 text-[11px] bg-slate-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-700 px-3 py-1 rounded-full border border-slate-200 transition-colors whitespace-nowrap font-medium"
              >
                {sug}
              </button>
            ))}
          </div>

          {/* Input de envío */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              enviarMensaje()
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu consulta aquí..."
              className="flex-1 text-xs bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:bg-white focus:border-red-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || enviando}
              className="w-9 h-9 rounded-xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-md shadow-red-600/20"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}

      {/* Botón Flotante Principal en la Esquina Inferior Derecha */}
      <button
        onClick={() => setAbierto(!abierto)}
        className="group relative flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white pl-3.5 pr-5 py-3 rounded-2xl shadow-2xl hover:-translate-y-0.5 transition-all duration-200 border border-slate-700"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-red-500 flex items-center justify-center shadow-md shadow-red-600/30">
          <Bot size={18} className="text-white" />
        </div>
        <div className="text-left">
          <span className="block font-black text-xs leading-none">Asistente JD Store</span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            En línea
          </span>
        </div>
      </button>
    </div>
  )
}
