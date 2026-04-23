import { useState } from 'react'
import Layout from '../components/layout/Layout'
import { useApp } from '../components/ui/context/AppContext'
import { Campo, SelectorGalpon, Toast, FilaVacia } from '../components/ui'
import { Plus, Save, AlertTriangle } from 'lucide-react'
import { isAdmin } from '../helpers/permissions'
import { api } from '../services/api'

const hoy = new Date().toISOString().split('T')[0]
const causas = [
  { label: 'Calor excesivo',          emoji: '🥵' },
  { label: 'Enfermedad respiratoria', emoji: '🤧' },
  { label: 'Aplastamiento',           emoji: '😵' },
  { label: 'Depredador',              emoji: '🦊' },
  { label: 'Falta de agua',           emoji: '💧' },
  { label: 'Enfermedad digestiva',    emoji: '🤒' },
  { label: 'Causa desconocida',       emoji: '❓' },
  { label: 'Otra causa',              emoji: '📝' },
]
const formVacio = { id_galpon: '', fecha_muerte: hoy, causa_muerte: '', numero_aves: 1, estado_salud: 'Muerta' }

export default function Mortalidad() {
  const { state, dispatch } = useApp()
  const admin = isAdmin(state.user)
  const [form, setForm]               = useState(formVacio)
  const [errores, setErrores]         = useState({})
  const [toast, setToast]             = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [guardando, setGuardando]     = useState(false)

  function mostrarToast(tipo, mensaje) {
    setToast({ tipo, mensaje })
    setTimeout(() => setToast(null), 3000)
  }

  function validar() {
    const e = {}
    if (!form.id_galpon)                              e.id_galpon    = 'Selecciona un galpón'
    if (!form.causa_muerte)                           e.causa_muerte = 'Selecciona la causa'
    if (!form.numero_aves || form.numero_aves < 1)    e.numero_aves  = 'Ingresa al menos 1'
    return e
  }

  async function guardar(e) {
    e.preventDefault()
    const e2 = validar()
    setErrores(e2)
    if (Object.keys(e2).length > 0) return
    setGuardando(true)
    try {
      const guardado = await api.post(`/mortalidad?idGalpon=${form.id_galpon}`, {
        estado_salud: form.estado_salud,
        fecha_muerte: form.fecha_muerte,
        causa_muerte: form.causa_muerte,
        numero_aves:  Number(form.numero_aves),
      })
      dispatch({ type: 'ADD_MORTALIDAD', payload: guardado })
      mostrarToast('exito', '✅ Mortalidad registrada correctamente')
      setForm(formVacio)
      setMostrarForm(false)
    } catch (err) {
      mostrarToast('error', `❌ ${err.message}`)
    } finally {
      setGuardando(false)
    }
  }

  // ── Solo admin ────────────────────────────────────────────────
  async function editarRegistro(registro) {
    if (!admin) return
    const numero_aves = Number(prompt('Nuevo número de aves muertas', registro.numero_aves))
    if (!numero_aves || numero_aves < 1) return
    try {
      const actualizado = await api.put(
        `/mortalidad/${registro.id}?idGalpon=${registro.id_galpon}`,
        { ...registro, numero_aves }
      )
      dispatch({ type: 'UPDATE_MORTALIDAD', payload: actualizado })
      mostrarToast('exito', '✅ Registro actualizado')
    } catch (err) {
      mostrarToast('error', `❌ ${err.message}`)
    }
  }

  async function eliminarRegistro(id) {
    if (!admin || !confirm('¿Eliminar este registro de mortalidad?')) return
    try {
      await api.delete(`/mortalidad/${id}`)
      dispatch({ type: 'DELETE_MORTALIDAD', payload: { id } })
    } catch (err) {
      mostrarToast('error', `❌ ${err.message}`)
    }
  }

  const galponNombre = (id) => {
    const g = state.galpones.find(g => g.id === Number(id))
    return g ? `Galpón ${g.numero}` : '—'
  }
  const totalMuertes = state.mortalidad.reduce((s, m) => s + Number(m.numero_aves), 0)

  return (
    <Layout titulo="💀 Mortalidad">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
        <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={22} />
        <div>
          <p className="font-bold text-red-800 text-base">Registro de aves muertas</p>
          <p className="text-red-700 text-sm mt-0.5">
            Este registro actualiza automáticamente el número de aves en el galpón. Ingresa los datos con cuidado.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="card p-4 flex items-center gap-3 border-red-100 border-2">
          <span className="text-3xl">💀</span>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Total muertes registradas</p>
            <p className="text-3xl font-bold text-red-600">{totalMuertes}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <span className="text-3xl">📋</span>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Registros</p>
            <p className="text-3xl font-bold text-gray-800">{state.mortalidad.length}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-5">
        <p className="text-gray-500 text-sm">Registra las aves que murieron y la causa</p>
        <button onClick={() => setMostrarForm(!mostrarForm)} className="btn-danger">
          <Plus size={18} /> Registrar muerte
        </button>
      </div>

      {mostrarForm && (
        <div className="card p-6 mb-6 border-2 border-red-100">
          <h2 className="section-title mb-5">📋 Registrar mortalidad</h2>
          <form onSubmit={guardar} className="space-y-5">
            <Campo label="¿En qué galpón?" requerido error={errores.id_galpon}>
              <SelectorGalpon galpones={state.galpones} value={form.id_galpon}
                onChange={v => setForm({ ...form, id_galpon: v })} />
            </Campo>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Fecha" requerido>
                <input type="date" className="input-field" value={form.fecha_muerte}
                  onChange={e => setForm({ ...form, fecha_muerte: e.target.value })} />
              </Campo>
              <Campo label="¿Cuántas aves murieron?" requerido error={errores.numero_aves}>
                <input type="number" min="1" className="input-field text-xl font-bold text-red-600"
                  value={form.numero_aves} onChange={e => setForm({ ...form, numero_aves: e.target.value })} />
              </Campo>
            </div>
            <Campo label="¿Cuál fue la causa?" requerido error={errores.causa_muerte}
              ayuda="Toca la causa principal de muerte">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {causas.map(c => (
                  <button key={c.label} type="button"
                    onClick={() => setForm({ ...form, causa_muerte: c.label })}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all text-sm font-medium
                      ${form.causa_muerte === c.label
                        ? 'border-red-400 bg-red-50 text-red-800 ring-2 ring-red-200'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                    <span className="text-2xl">{c.emoji}</span>
                    <span className="text-xs text-center leading-tight">{c.label}</span>
                  </button>
                ))}
              </div>
            </Campo>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setMostrarForm(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" disabled={guardando}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95 flex-1 justify-center">
                <Save size={18} /> {guardando ? 'Guardando...' : 'Guardar registro'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <p className="section-title">Registros de mortalidad</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Galpón</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Causa</th>
                <th className="px-4 py-3 text-right">Aves</th>
                {admin && <th className="px-4 py-3 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.mortalidad.length === 0
                ? <FilaVacia mensaje="No hay registros de mortalidad" />
                : state.mortalidad.map(m => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-800">{galponNombre(m.id_galpon)}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(m.fecha_muerte + 'T12:00').toLocaleDateString('es-CO')}</td>
                    <td className="px-4 py-3 text-gray-700">{m.causa_muerte}</td>
                    <td className="px-4 py-3 text-right font-bold text-red-600 text-lg">{m.numero_aves}</td>
                    {admin && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button type="button" className="btn-secondary !px-3 !py-1.5"
                            onClick={() => editarRegistro(m)}>Editar</button>
                          <button type="button" className="btn-danger !px-3 !py-1.5"
                            onClick={() => eliminarRegistro(m.id)}>Eliminar</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
