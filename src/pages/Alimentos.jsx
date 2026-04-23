import { useState } from 'react'
import Layout from '../components/layout/Layout'
import { useApp } from '../components/ui/context/AppContext'
import { Campo, SelectorGalpon, Toast, FilaVacia } from '../components/ui'
import { Plus, Save } from 'lucide-react'
import { isAdmin } from '../helpers/permissions'
import { api } from '../services/api'

const hoy = new Date().toISOString().split('T')[0]
const marcas  = ['ProLay Feed Pro', 'NutriAve Plus', 'AveMax Ponedora', 'GranjaVit', 'Otra']
const etapas  = ['Inicio (0-8 semanas)', 'Crecimiento (8-18 semanas)', 'Postura (18+ semanas)', 'Muda forzada']
const formVacio = { id_galpon: '', marca_alimento: '', etapa_alimento: 'Postura (18+ semanas)', fecha_consumo: hoy, cantidad_kg: '' }

export default function Alimentos() {
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
    if (!form.id_galpon)                              e.id_galpon      = 'Selecciona un galpón'
    if (!form.marca_alimento)                         e.marca_alimento = 'Selecciona una marca'
    if (!form.cantidad_kg || form.cantidad_kg <= 0)   e.cantidad_kg    = 'Ingresa los kilogramos'
    return e
  }

  async function guardar(e) {
    e.preventDefault()
    const e2 = validar()
    setErrores(e2)
    if (Object.keys(e2).length > 0) return
    setGuardando(true)
    try {
      const guardado = await api.post(`/alimentos?idGalpon=${form.id_galpon}`, {
        marca_alimento: form.marca_alimento,
        etapa_alimento: form.etapa_alimento,
        fecha_consumo:  form.fecha_consumo,
        cantidad_kg:    Number(form.cantidad_kg),
      })
      dispatch({ type: 'ADD_ALIMENTO', payload: guardado })
      mostrarToast('exito', '✅ Consumo de alimento guardado')
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
    const cantidad = Number(prompt('Nueva cantidad en kg', registro.cantidad_kg))
    if (!cantidad || cantidad < 1) return
    try {
      const actualizado = await api.put(
        `/alimentos/${registro.id}?idGalpon=${registro.id_galpon}`,
        { ...registro, cantidad_kg: cantidad }
      )
      dispatch({ type: 'UPDATE_ALIMENTO', payload: actualizado })
      mostrarToast('exito', '✅ Registro actualizado')
    } catch (err) {
      mostrarToast('error', `❌ ${err.message}`)
    }
  }

  async function eliminarRegistro(id) {
    if (!admin || !confirm('¿Eliminar este registro de alimento?')) return
    try {
      await api.delete(`/alimentos/${id}`)
      dispatch({ type: 'DELETE_ALIMENTO', payload: { id } })
    } catch (err) {
      mostrarToast('error', `❌ ${err.message}`)
    }
  }

  const galponNombre = (id) => {
    const g = state.galpones.find(g => g.id === Number(id))
    return g ? `Galpón ${g.numero}` : '—'
  }

  return (
    <Layout titulo="🌾 Alimentos">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex justify-between items-center mb-5">
        <p className="text-gray-500 text-sm">Registra cuánto alimento se le dio a cada galpón</p>
        <button onClick={() => setMostrarForm(!mostrarForm)} className="btn-primary">
          <Plus size={18} /> Nuevo registro
        </button>
      </div>

      {mostrarForm && (
        <div className="card p-6 mb-6 border-2 border-green-100">
          <h2 className="section-title mb-5">📋 Nuevo registro de alimento</h2>
          <form onSubmit={guardar} className="space-y-5">
            <Campo label="¿A qué galpón?" requerido error={errores.id_galpon}
              ayuda="Toca el galpón al que se le dio el alimento">
              <SelectorGalpon galpones={state.galpones} value={form.id_galpon}
                onChange={v => setForm({ ...form, id_galpon: v })} />
            </Campo>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="Marca del alimento" requerido error={errores.marca_alimento}>
                <select className="input-field" value={form.marca_alimento}
                  onChange={e => setForm({ ...form, marca_alimento: e.target.value })}>
                  <option value="">— Selecciona una marca —</option>
                  {marcas.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </Campo>
              <Campo label="Etapa del alimento">
                <select className="input-field" value={form.etapa_alimento}
                  onChange={e => setForm({ ...form, etapa_alimento: e.target.value })}>
                  {etapas.map(et => <option key={et} value={et}>{et}</option>)}
                </select>
              </Campo>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="Fecha" requerido>
                <input type="date" className="input-field" value={form.fecha_consumo}
                  onChange={e => setForm({ ...form, fecha_consumo: e.target.value })} />
              </Campo>
              <Campo label="¿Cuántos kilogramos?" requerido error={errores.cantidad_kg}
                ayuda="Total en kilogramos (kg)">
                <div className="relative">
                  <input type="number" min="0" step="0.1" placeholder="Ej: 480"
                    className="input-field pr-12 text-xl font-bold"
                    value={form.cantidad_kg}
                    onChange={e => setForm({ ...form, cantidad_kg: e.target.value })} />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">kg</span>
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
        <div className="p-5 border-b border-gray-100">
          <p className="section-title">Registros recientes</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Galpón</th>
                <th className="px-4 py-3 text-left">Marca</th>
                <th className="px-4 py-3 text-left">Etapa</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-right">Cantidad</th>
                {admin && <th className="px-4 py-3 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.alimentos.length === 0
                ? <FilaVacia mensaje="No hay registros de alimento aún" />
                : state.alimentos.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-800">{galponNombre(a.id_galpon)}</td>
                    <td className="px-4 py-3 text-gray-700">{a.marca_alimento}</td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{a.etapa_alimento}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(a.fecha_consumo + 'T12:00').toLocaleDateString('es-CO')}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-700 text-lg">{Number(a.cantidad_kg).toLocaleString()} kg</td>
                    {admin && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button type="button" className="btn-secondary !px-3 !py-1.5"
                            onClick={() => editarRegistro(a)}>Editar</button>
                          <button type="button" className="btn-danger !px-3 !py-1.5"
                            onClick={() => eliminarRegistro(a.id)}>Eliminar</button>
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
