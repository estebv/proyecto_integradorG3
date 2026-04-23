import { useState } from 'react'
import Layout from '../components/layout/Layout'
import { useApp } from '../components/ui/context/AppContext'
import { Campo, SelectorGalpon, Toast, FilaVacia } from '../components/ui'
import { Plus, Save } from 'lucide-react'

const hoy = new Date().toISOString().split('T')[0]
const razas = ['Lohmann', 'Hy-Line', 'Shaver', 'ISA Brown', 'Novogen', 'Otra']
const origenes = ['Proveedor local', 'Importado', 'Propio (nacido en granja)', 'Otro']
const formVacio = { id_galpon: '', raza: '', fecha_nacimiento: '', fecha_llegada: hoy, origen: '', total_aves: '' }

export default function Aves() {
  const { state, dispatch } = useApp()
  const [form, setForm] = useState(formVacio)
  const [errores, setErrores] = useState({})
  const [toast, setToast] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)

  function validar() {
    const e = {}
    if (!form.id_galpon) e.id_galpon = 'Selecciona un galpón'
    if (!form.raza) e.raza = 'Selecciona la raza'
    if (!form.fecha_nacimiento) e.fecha_nacimiento = 'Ingresa la fecha de nacimiento'
    if (!form.origen) e.origen = 'Selecciona el origen'
    if (!form.total_aves || form.total_aves <= 0) e.total_aves = 'Ingresa el número de aves'
    return e
  }

  function guardar(e) {
    e.preventDefault()
    const e2 = validar()
    setErrores(e2)
    if (Object.keys(e2).length > 0) return
    const nuevo = { ...form, id: Date.now(), id_galpon: Number(form.id_galpon), total_aves: Number(form.total_aves) }
    setAvesRegistradas(prev => [nuevo, ...prev])
    setToast({ tipo: 'exito', mensaje: '✅ Lote de aves registrado correctamente' })
    setForm(formVacio)
    setMostrarForm(false)
    setTimeout(() => setToast(null), 3000)
  }

  const galponNombre = (id) => {
    const g = state.galpones.find(g => g.id === Number(id))
    return g ? `Galpón ${g.numero}` : '—'
  }

  function calcEdad(fechaNac) {
    if (!fechaNac) return '—'
    const diff = Date.now() - new Date(fechaNac).getTime()
    const semanas = Math.floor(diff / (1000 * 60 * 60 * 24 * 7))
    if (semanas < 52) return `${semanas} sem`
    return `${Math.floor(semanas / 52)} año${Math.floor(semanas / 52) > 1 ? 's' : ''}`
  }

  const totalAves = avesRegistradas.reduce((s, a) => s + a.total_aves, 0)

  return (
    <Layout titulo="🐔 Aves">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="card p-4 border-2 border-amber-100 flex items-center gap-3">
          <span className="text-3xl">🐔</span>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Total aves</p>
            <p className="text-3xl font-bold text-amber-700">{totalAves.toLocaleString()}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <span className="text-3xl">📦</span>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase">Lotes registrados</p>
            <p className="text-3xl font-bold text-gray-800">{avesRegistradas.length}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-5">
        <p className="text-gray-500 text-sm">Registra los lotes de aves en cada galpón</p>
        <button onClick={() => setMostrarForm(!mostrarForm)} className="btn-primary">
          <Plus size={18} /> Nuevo lote
        </button>
      </div>

      {mostrarForm && (
        <div className="card p-6 mb-6 border-2 border-brand-100">
          <h2 className="section-title mb-5">📋 Registrar lote de aves</h2>
          <form onSubmit={guardar} className="space-y-5">

            <Campo label="¿En qué galpón van?" requerido error={errores.id_galpon}>
              <SelectorGalpon galpones={state.galpones} value={form.id_galpon}
                onChange={v => setForm({ ...form, id_galpon: v })} />
            </Campo>

            <Campo label="Raza de las aves" requerido error={errores.raza}
              ayuda="¿Qué tipo de gallina es?">
              <div className="grid grid-cols-3 gap-2">
                {razas.map(r => (
                  <button key={r} type="button"
                    onClick={() => setForm({ ...form, raza: r })}
                    className={`py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all
                      ${form.raza === r ? 'border-brand-200 bg-brand-50 text-brand-800' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {r}
                  </button>
                ))}
              </div>
            </Campo>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Campo label="Fecha de nacimiento" requerido error={errores.fecha_nacimiento}>
                <input type="date" className="input-field" value={form.fecha_nacimiento}
                  onChange={e => setForm({ ...form, fecha_nacimiento: e.target.value })} />
              </Campo>
              <Campo label="Fecha de llegada" requerido>
                <input type="date" className="input-field" value={form.fecha_llegada}
                  onChange={e => setForm({ ...form, fecha_llegada: e.target.value })} />
              </Campo>
              <Campo label="Número de aves" requerido error={errores.total_aves}>
                <input type="number" min="1" placeholder="Ej: 4500" className="input-field text-xl font-bold"
                  value={form.total_aves}
                  onChange={e => setForm({ ...form, total_aves: e.target.value })} />
              </Campo>
            </div>

            <Campo label="¿De dónde vienen?" requerido error={errores.origen}>
              <div className="grid grid-cols-2 gap-2">
                {origenes.map(o => (
                  <button key={o} type="button"
                    onClick={() => setForm({ ...form, origen: o })}
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all text-left
                      ${form.origen === o ? 'border-brand-200 bg-brand-50 text-brand-800' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {o}
                  </button>
                ))}
              </div>
            </Campo>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setMostrarForm(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary flex-1 justify-center">
                <Save size={18} /> Guardar lote
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100"><p className="section-title">Lotes registrados</p></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Galpón</th>
                <th className="px-4 py-3 text-left">Raza</th>
                <th className="px-4 py-3 text-left">Origen</th>
                <th className="px-4 py-3 text-center">Edad</th>
                <th className="px-4 py-3 text-right">Aves</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {avesRegistradas.length === 0
                ? <FilaVacia mensaje="No hay lotes de aves registrados" />
                : avesRegistradas.map(a => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-800">{galponNombre(a.id_galpon)}</td>
                    <td className="px-4 py-3 text-gray-700 font-medium">{a.raza}</td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{a.origen}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="bg-blue-50 text-blue-700 font-semibold text-sm px-3 py-1 rounded-full">
                        {calcEdad(a.fecha_nacimiento)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-lg text-gray-800">{a.total_aves.toLocaleString()}</td>
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
