import { useState } from 'react'
import Layout from '../components/layout/Layout'
import { useApp } from '../components/ui/context/AppContext'
import { Campo, SelectorGalpon, Toast, FilaVacia } from '../components/ui'
import { Plus, Save } from 'lucide-react'
import { isAdmin } from '../helpers/permissions'
import { api } from '../services/api'

const hoy = new Date().toISOString().split('T')[0]
const formVacio    = { id_galpon: '', fecha: hoy, temperatura: '', humedad: '', ventilacion: 'Buena', iluminacion: '16h' }
const ventilaciones = ['Muy buena', 'Buena', 'Regular', 'Deficiente', 'Mala']
const iluminaciones = ['8h', '12h', '14h', '16h', '18h', '20h']

function TempIndicador({ valor }) {
  const v = Number(valor)
  if (!v) return null
  const bad  = v > 32 || v < 15
  const warn = !bad && (v > 28 || v < 18)
  return (
    <div className={`mt-2 px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2
      ${bad ? 'bg-red-100 text-red-700' : warn ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
      {bad ? '🥵' : warn ? '⚠️' : '✅'}
      {bad ? 'Temperatura peligrosa — revisar urgente' : warn ? 'Temperatura fuera del rango ideal' : `Temperatura normal (${v}°C)`}
    </div>
  )
}

function HumedadIndicador({ valor }) {
  const v = Number(valor)
  if (!v) return null
  const bad = v > 80 || v < 40
  const ok  = v >= 50 && v <= 70
  return (
    <div className={`mt-2 px-3 py-2 rounded-xl text-sm font-semibold flex items-center gap-2
      ${bad ? 'bg-red-100 text-red-700' : ok ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
      {bad ? '💦' : ok ? '✅' : '⚠️'}
      {bad ? 'Humedad fuera de rango' : ok ? `Humedad normal (${v}%)` : `Humedad algo elevada (${v}%)`}
    </div>
  )
}

export default function Condiciones() {
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
    if (!form.id_galpon)   e.id_galpon   = 'Selecciona un galpón'
    if (!form.temperatura) e.temperatura = 'Ingresa la temperatura'
    if (!form.humedad)     e.humedad     = 'Ingresa la humedad'
    return e
  }

  async function guardar(e) {
    e.preventDefault()
    const e2 = validar()
    setErrores(e2)
    if (Object.keys(e2).length > 0) return
    setGuardando(true)
    try {
      const guardado = await api.post(`/condiciones?idGalpon=${form.id_galpon}`, {
        fecha:       form.fecha,
        temperatura: Number(form.temperatura),
        humedad:     Number(form.humedad),
        ventilacion: form.ventilacion,
        iluminacion: form.iluminacion,
      })
      dispatch({ type: 'ADD_CONDICION', payload: guardado })
      mostrarToast('exito', '✅ Condiciones ambientales guardadas')
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
    const temperatura = Number(prompt('Nueva temperatura (°C)', registro.temperatura))
    const humedad     = Number(prompt('Nueva humedad (%)', registro.humedad))
    if (!temperatura || !humedad) return
    try {
      const actualizado = await api.put(
        `/condiciones/${registro.id}?idGalpon=${registro.id_galpon}`,
        { ...registro, temperatura, humedad }
      )
      dispatch({ type: 'UPDATE_CONDICION', payload: actualizado })
      mostrarToast('exito', '✅ Registro actualizado')
    } catch (err) {
      mostrarToast('error', `❌ ${err.message}`)
    }
  }

  async function eliminarRegistro(id) {
    if (!admin || !confirm('¿Eliminar este registro ambiental?')) return
    try {
      await api.delete(`/condiciones/${id}`)
      dispatch({ type: 'DELETE_CONDICION', payload: { id } })
    } catch (err) {
      mostrarToast('error', `❌ ${err.message}`)
    }
  }

  const galponNombre = (id) => {
    const g = state.galpones.find(g => g.id === Number(id))
    return g ? `Galpón ${g.numero}` : '—'
  }

  return (
    <Layout titulo="🌡️ Clima y Ambiente">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-center">
          <span className="text-2xl block mb-1">🌡️</span>
          <p className="text-xs text-blue-700 font-semibold">Temperatura ideal</p>
          <p className="text-lg font-bold text-blue-800">18°C – 28°C</p>
        </div>
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 text-center">
          <span className="text-2xl block mb-1">💧</span>
          <p className="text-xs text-teal-700 font-semibold">Humedad ideal</p>
          <p className="text-lg font-bold text-teal-800">50% – 70%</p>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
          <span className="text-2xl block mb-1">💡</span>
          <p className="text-xs text-amber-700 font-semibold">Luz recomendada</p>
          <p className="text-lg font-bold text-amber-800">14h – 16h</p>
        </div>
      </div>

      <div className="flex justify-between items-center mb-5">
        <p className="text-gray-500 text-sm">Registra las condiciones del galpón cada día</p>
        <button onClick={() => setMostrarForm(!mostrarForm)} className="btn-primary">
          <Plus size={18} /> Nuevo registro
        </button>
      </div>

      {mostrarForm && (
        <div className="card p-6 mb-6 border-2 border-blue-100">
          <h2 className="section-title mb-5">📋 Registrar condiciones</h2>
          <form onSubmit={guardar} className="space-y-5">
            <Campo label="¿Qué galpón?" requerido error={errores.id_galpon}>
              <SelectorGalpon galpones={state.galpones} value={form.id_galpon}
                onChange={v => setForm({ ...form, id_galpon: v })} />
            </Campo>
            <Campo label="Fecha" requerido>
              <input type="date" className="input-field" value={form.fecha}
                onChange={e => setForm({ ...form, fecha: e.target.value })} />
            </Campo>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="🌡️ Temperatura (°C)" requerido error={errores.temperatura}
                ayuda="Temperatura dentro del galpón">
                <input type="number" step="0.1" placeholder="Ej: 24.5" className="input-field text-xl font-bold"
                  value={form.temperatura} onChange={e => setForm({ ...form, temperatura: e.target.value })} />
                <TempIndicador valor={form.temperatura} />
              </Campo>
              <Campo label="💧 Humedad (%)" requerido error={errores.humedad}
                ayuda="Porcentaje de humedad relativa">
                <input type="number" step="0.1" min="0" max="100" placeholder="Ej: 65"
                  className="input-field text-xl font-bold"
                  value={form.humedad} onChange={e => setForm({ ...form, humedad: e.target.value })} />
                <HumedadIndicador valor={form.humedad} />
              </Campo>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="💨 Ventilación" ayuda="¿Cómo está el aire en el galpón?">
                <div className="grid grid-cols-5 gap-1.5">
                  {ventilaciones.map(v => (
                    <button key={v} type="button" onClick={() => setForm({ ...form, ventilacion: v })}
                      className={`py-2.5 px-1 rounded-xl border-2 text-xs font-semibold transition-all text-center
                        ${form.ventilacion === v ? 'border-blue-400 bg-blue-50 text-blue-800' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {v}
                    </button>
                  ))}
                </div>
              </Campo>
              <Campo label="💡 Horas de luz" ayuda="¿Cuántas horas de luz recibieron?">
                <div className="grid grid-cols-3 gap-2">
                  {iluminaciones.map(il => (
                    <button key={il} type="button" onClick={() => setForm({ ...form, iluminacion: il })}
                      className={`py-2.5 rounded-xl border-2 text-sm font-bold transition-all
                        ${form.iluminacion === il ? 'border-amber-400 bg-amber-50 text-amber-800' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {il}
                    </button>
                  ))}
                </div>
              </Campo>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setMostrarForm(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" disabled={guardando} className="btn-primary flex-1 justify-center">
                <Save size={18} /> {guardando ? 'Guardando...' : 'Guardar registro'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100"><p className="section-title">Registros recientes</p></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Galpón</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-center">Temp.</th>
                <th className="px-4 py-3 text-center">Humedad</th>
                <th className="px-4 py-3 text-center">Ventilación</th>
                <th className="px-4 py-3 text-center">Luz</th>
                {admin && <th className="px-4 py-3 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.condiciones.length === 0
                ? <FilaVacia mensaje="No hay registros ambientales aún" />
                : state.condiciones.map(c => {
                  const tempOk  = c.temperatura >= 18 && c.temperatura <= 28
                  const tempBad = c.temperatura > 32 || c.temperatura < 15
                  return (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-800">{galponNombre(c.id_galpon)}</td>
                      <td className="px-4 py-3 text-gray-600">{new Date(c.fecha + 'T12:00').toLocaleDateString('es-CO')}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-bold text-lg ${tempBad ? 'text-red-600' : tempOk ? 'text-green-600' : 'text-amber-600'}`}>
                          {c.temperatura}°C
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-700 font-semibold">{c.humedad}%</td>
                      <td className="px-4 py-3 text-center text-gray-700">{c.ventilacion}</td>
                      <td className="px-4 py-3 text-center text-gray-700">{c.iluminacion}</td>
                      {admin && (
                        <td className="px-4 py-3 text-right">
                          <div className="flex gap-2 justify-end">
                            <button type="button" className="btn-secondary !px-3 !py-1.5"
                              onClick={() => editarRegistro(c)}>Editar</button>
                            <button type="button" className="btn-danger !px-3 !py-1.5"
                              onClick={() => eliminarRegistro(c.id)}>Eliminar</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
