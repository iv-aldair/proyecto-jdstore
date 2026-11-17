import { Loader2, X } from 'lucide-react'
import { createPortal } from 'react-dom'

// ── Spinner ───────────────────────────────────────────────────
export function Spinner({ size = 20, className = '' }) {
  return <Loader2 size={size} className={`animate-spin text-red-500 ${className}`} />
}

// ── Spinner de página completa ────────────────────────────────
export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <Spinner size={32} />
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} max-h-[90vh] flex flex-col border border-gray-200 animate-fade-in`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  )
}

// ── Tabla con cabecera ────────────────────────────────────────
export function Tabla({ columnas, children, vacia = 'Sin resultados' }) {
  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full">
        <thead>
          <tr>
            {columnas.map((c, i) => (
              <th key={i} className={c.className}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children || (
            <tr><td colSpan={columnas.length} className="text-center py-20 text-gray-400 font-medium italic">{vacia}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// ── Formulario de campo ───────────────────────────────────────
export function Campo({ label, error, children }) {
  return (
    <div>
      {label && <label className="label">{label}</label>}
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

// ── Badge de estado SUNAT ─────────────────────────────────────
export function BadgeSunat({ estado }) {
  if (!estado) return <span className="badge-gray">Pendiente</span>
  if (estado === 'ACEPTADO') return <span className="badge-green">Aceptado</span>
  if (estado === 'RECHAZADO') return <span className="badge-red">Rechazado</span>
  return <span className="badge-yellow">{estado}</span>
}

// ── Card de estadística ───────────────────────────────────────
export function StatCard({ titulo, valor, subtitulo, icono: Icono, color = 'red' }) {
  const colores = {
    red:    'bg-red-50 text-red-600',
    green:  'bg-emerald-50 text-emerald-600',
    yellow: 'bg-amber-50 text-amber-600',
    blue:   'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
  }
  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{titulo}</p>
        {Icono && (
          <span className={`p-2 rounded-xl transition-transform duration-300 group-hover:scale-110 ${colores[color]}`}>
            <Icono size={18} />
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold text-gray-900 mt-1">{valor}</p>
      {subtitulo && <p className="text-[10px] text-gray-400 mt-0.5">{subtitulo}</p>}
    </div>
  )
}

// ── Confirmación de eliminación ───────────────────────────────
export function ConfirmModal({ open, onClose, onConfirm, mensaje, cargando }) {
  return (
    <Modal open={open} onClose={onClose} title="Confirmar acción" maxWidth="max-w-sm">
      <p className="text-sm text-gray-600 leading-relaxed mb-6">{mensaje}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary">Cancelar</button>
        <button onClick={onConfirm} disabled={cargando} className="btn-danger">
          {cargando ? <Spinner size={14} /> : null}
          Confirmar
        </button>
      </div>
    </Modal>
  )
}