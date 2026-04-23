import { CheckCircle, XCircle, AlertTriangle, X, Info } from 'lucide-react'
export { Checkbox, CheckboxGroup } from './Checkbox'

// Toast de éxito/error
export function Toast({ mensaje, tipo = 'exito', onClose }) {
  const config = {
    exito: { bg: 'bg-green-50 border-green-200', icon: <CheckCircle className="text-green-600 shrink-0" size={22} />, text: 'text-green-800' },
    error: { bg: 'bg-red-50 border-red-200', icon: <XCircle className="text-red-600 shrink-0" size={22} />, text: 'text-red-800' },
    aviso: { bg: 'bg-amber-50 border-amber-200', icon: <AlertTriangle className="text-amber-600 shrink-0" size={22} />, text: 'text-amber-800' },
  }
  const c = config[tipo]
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl border-2 shadow-lg max-w-sm ${c.bg}`}>
      {c.icon}
      <p className={`font-semibold text-base ${c.text}`}>{mensaje}</p>
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600"><X size={18} /></button>
    </div>
  )
}

// Modal de confirmación
export function ModalConfirm({ titulo, mensaje, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="text-amber-500" size={28} />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">{titulo}</h3>
        <p className="text-gray-600 text-center mb-6 text-base leading-relaxed">{mensaje}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 btn-secondary justify-center">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 bg-brand-200 text-brand-900 font-semibold py-3 px-4 rounded-xl hover:bg-brand-400 hover:text-white transition-all flex items-center justify-center gap-2">
            {loading ? <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

// Campo de formulario
export function Campo({ label, ayuda, error, children, requerido }) {
  return (
    <div>
      <label className="label">
        {label} {requerido && <span className="text-red-500">*</span>}
      </label>
      {ayuda && <p className="text-xs text-gray-400 mb-1.5">{ayuda}</p>}
      {children}
      {error && <p className="text-sm text-red-500 mt-1 flex items-center gap-1"><XCircle size={14} />{error}</p>}
    </div>
  )
}

// Badge de estado
export function Badge({ estado }) {
  const config = {
    activo: 'bg-green-100 text-green-700',
    alerta: 'bg-amber-100 text-amber-700',
    critico: 'bg-red-100 text-red-700',
  }
  const label = { activo: '✓ Activo', alerta: '⚠ Alerta', critico: '✕ Crítico' }
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${config[estado] || config.activo}`}>
      {label[estado] || estado}
    </span>
  )
}

// KPI Card
export function KpiCard({ icono, label, valor, sub, color }) {
  const colors = {
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    teal:  'bg-teal-50 border-teal-200 text-teal-700',
    red:   'bg-red-50 border-red-200 text-red-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    blue:  'bg-blue-50 border-blue-200 text-blue-700',
  }
  return (
    <div className={`rounded-2xl border-2 p-5 ${colors[color]}`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{icono}</span>
        <p className="text-sm font-semibold opacity-80 leading-tight">{label}</p>
      </div>
      <p className="text-4xl font-bold mb-1">{valor}</p>
      {sub && <p className="text-xs opacity-70 font-medium">{sub}</p>}
    </div>
  )
}

// Alerta visual grande
export function AlertaBanner({ tipo, mensaje, hora }) {
  const config = {
    peligro: { bg: 'bg-red-50 border-red-300', icono: '🚨', text: 'text-red-800' },
    aviso:   { bg: 'bg-amber-50 border-amber-300', icono: '⚠️', text: 'text-amber-800' },
    info:    { bg: 'bg-blue-50 border-blue-300', icono: 'ℹ️', text: 'text-blue-800' },
  }
  const c = config[tipo] || config.info
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border-2 ${c.bg}`}>
      <span className="text-2xl shrink-0">{c.icono}</span>
      <div>
        <p className={`font-semibold text-base ${c.text}`}>{mensaje}</p>
        {hora && <p className="text-xs text-gray-500 mt-0.5">{hora}</p>}
      </div>
    </div>
  )
}

// Selector de galpón visual
export function SelectorGalpon({ galpones, value, onChange }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
      {galpones.map(g => (
        <button
          key={g.id}
          type="button"
          onClick={() => onChange(g.id)}
          className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all
            ${Number(value) === g.id
              ? 'border-brand-200 bg-brand-50 text-brand-800'
              : 'border-gray-200 bg-white text-gray-600 hover:border-brand-100'
            }`}
        >
          <span className="text-2xl mb-1">🏠</span>
          <span className="text-xs font-bold">G {g.numero}</span>
          <span className="text-xs text-gray-400">{(g.numero_aves).toLocaleString()}</span>
        </button>
      ))}
    </div>
  )
}

// Calificador visual de calidad
export function CalidadSelector({ value, onChange }) {
  const niveles = [
    { v: 1, label: 'Muy mala', emoji: '😟', color: 'border-red-300 bg-red-50 text-red-700' },
    { v: 2, label: 'Mala',     emoji: '😕', color: 'border-orange-300 bg-orange-50 text-orange-700' },
    { v: 3, label: 'Regular',  emoji: '😐', color: 'border-yellow-300 bg-yellow-50 text-yellow-700' },
    { v: 4, label: 'Buena',    emoji: '😊', color: 'border-green-300 bg-green-50 text-green-700' },
    { v: 5, label: 'Excelente',emoji: '😄', color: 'border-teal-300 bg-teal-50 text-teal-700' },
  ]
  return (
    <div className="flex gap-2 flex-wrap">
      {niveles.map(n => (
        <button
          key={n.v}
          type="button"
          onClick={() => onChange(n.v)}
          className={`flex-1 min-w-[60px] flex flex-col items-center py-3 px-1 rounded-xl border-2 transition-all
            ${Number(value) === n.v ? n.color + ' font-bold ring-2 ring-offset-1 ring-brand-200' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'}`}
        >
          <span className="text-2xl">{n.emoji}</span>
          <span className="text-xs mt-1 font-semibold leading-tight text-center">{n.label}</span>
        </button>
      ))}
    </div>
  )
}

// Fila de tabla de datos
export function FilaVacia({ mensaje }) {
  return (
    <tr>
      <td colSpan={99} className="text-center py-12 text-gray-400">
        <div className="flex flex-col items-center gap-2">
          <span className="text-4xl">📋</span>
          <p className="text-base">{mensaje}</p>
        </div>
      </td>
    </tr>
  )
}
