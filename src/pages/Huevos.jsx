import { useState } from 'react'
import Layout from '../components/layout/Layout'
import { useApp } from '../components/ui/context/AppContext'
import { Campo, SelectorGalpon, CalidadSelector, Toast, FilaVacia } from '../components/ui'
import { Plus, Save } from 'lucide-react'
import { isAdmin } from '../helpers/permissions'
import { api } from '../services/api'

const hoy = new Date().toISOString().split('T')[0]
const formVacio = { id_galpon: '', fecha_puesta: hoy, total_huevo: '', peso_huevo: '', calidad_huevo: 3 }

export default function Huevos() {
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
    if (!form.id_galpon)                          e.id_galpon   = 'Selecciona un galpón'
    if (!form.total_huevo || form.total_huevo <= 0) e.total_huevo = 'Ingresa la cantidad de huevos'
    if (!form.peso_huevo  || form.peso_huevo  <= 0) e.peso_huevo  = 'Ingresa el peso del huevo'
    return e
  }

  async function guardar(e) {
    e.preventDefault()
    const e2 = validar()
    setErrores(e2)
    if (Object.keys(e2).length > 0) return
    setGuardando(true)
    try {
      const guardado = await api.post(`/huevos?idGalpon=${form.id_galpon}`, {
        fecha_puesta:  form.fecha_puesta,
        total_huevo:   Number(form.total_huevo),
        peso_huevo:    Number(form.peso_huevo),
        calidad_huevo: Number(form.calidad_huevo),
      })
      dispatch({ type: 'ADD_HUEVO', payload: guardado })
      mostrarToast('exito', '✅ Producción guardada correctamente')
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
    const total = Number(prompt('Nuevo total de huevos', registro.total_huevo))
    if (!total || total < 1) return
    const peso = Number(prompt('Nuevo peso promedio (g)', registro.peso_huevo))
    if (!peso || peso < 1) return
    try {
      const actualizado = await api.put(
        `/huevos/${registro.id}?idGalpon=${registro.id_galpon}`,
        { ...registro, total_huevo: total, peso_huevo: peso }
      )
      dispatch({ type: 'UPDATE_HUEVO', payload: actualizado })
      mostrarToast('exito', '✅ Registro actualizado')
    } catch (err) {
      mostrarToast('error', `❌ ${err.message}`)
    }
  }

  async function eliminarRegistro(id) {
    if (!admin || !confirm('¿Eliminar este registro de huevos?')) return
    try {
      await api.delete(`/huevos/${id}`)
      dispatch({ type: 'DELETE_HUEVO', payload: { id } })
    } catch (err) {
      mostrarToast('error', `❌ ${err.message}`)
    }
  }

  const galponNombre = (id) => {
    const g = state.galpones.find(g => g.id === Number(id))
    return g ? `Galpón ${g.numero}` : '—'
  }
  const calidad_labels = { 1: '😟 Muy mala', 2: '😕 Mala', 3: '😐 Regular', 4: '😊 Buena', 5: '😄 Excelente' }

  return (
    <Layout titulo="🥚 Producción de Huevos">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="flex justify-between items-center mb-5">
        <p className="text-gray-500 text-sm">Registra cuántos huevos se recogieron en cada galpón</p>
        <button onClick={() => setMostrarForm(!mostrarForm)} className="btn-primary">
          <Plus size={18} /> Nuevo registro
        </button>
      </div>

      {mostrarForm && (
        <div className="card p-6 mb-6 border-2 border-brand-100">
          <h2 className="section-title mb-5">📋 Nuevo registro de huevos</h2>
          <form onSubmit={guardar} className="space-y-5">
            <Campo label="¿En qué galpón?" requerido error={errores.id_galpon}
              ayuda="Toca el galpón donde se recogieron los huevos">
              <SelectorGalpon galpones={state.galpones} value={form.id_galpon}
                onChange={v => setForm({ ...form, id_galpon: v })} />
            </Campo>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Campo label="Fecha" requerido>
                <input type="date" className="input-field" value={form.fecha_puesta}
                  onChange={e => setForm({ ...form, fecha_puesta: e.target.value })} />
              </Campo>
              <Campo label="¿Cuántos huevos?" requerido error={errores.total_huevo}
                ayuda="Número total recogido hoy">
                <input type="number" min="0" placeholder="Ej: 3200" className="input-field text-xl font-bold"
                  value={form.total_huevo} onChange={e => setForm({ ...form, total_huevo: e.target.value })} />
              </Campo>
              <Campo label="Peso del huevo (gramos)" requerido error={errores.peso_huevo}
                ayuda="Peso promedio en gramos">
                <input type="number" min="0" step="0.1" placeholder="Ej: 58.5" className="input-field"
                  value={form.peso_huevo} onChange={e => setForm({ ...form, peso_huevo: e.target.value })} />
              </Campo>
            </div>
            <Campo label="¿Cómo es la calidad del huevo?" ayuda="Selecciona cómo se ven los huevos hoy">
              <CalidadSelector value={form.calidad_huevo}
                onChange={v => setForm({ ...form, calidad_huevo: v })} />
            </Campo>
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
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-right">Huevos</th>
                <th className="px-4 py-3 text-right">Peso (g)</th>
                <th className="px-4 py-3 text-center">Calidad</th>
                {admin && <th className="px-4 py-3 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.huevos.length === 0
                ? <FilaVacia mensaje="No hay registros de huevos aún" />
                : state.huevos.map(h => (
                  <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800">{galponNombre(h.id_galpon)}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(h.fecha_puesta + 'T12:00').toLocaleDateString('es-CO')}</td>
                    <td className="px-4 py-3 text-right font-bold text-amber-700 text-lg">{Number(h.total_huevo).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{Number(h.peso_huevo).toFixed(1)} g</td>
                    <td className="px-4 py-3 text-center">{calidad_labels[h.calidad_huevo]}</td>
                    {admin && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          <button type="button" className="btn-secondary !px-3 !py-1.5"
                            onClick={() => editarRegistro(h)}>Editar</button>
                          <button type="button" className="btn-danger !px-3 !py-1.5"
                            onClick={() => eliminarRegistro(h.id)}>Eliminar</button>
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
