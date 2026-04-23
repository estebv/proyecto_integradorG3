import Layout from '../components/layout/Layout'
import { useApp } from '../components/ui/context/AppContext'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, PieChart, Pie, Cell
} from 'recharts'

const COLORS = ['#EF9F27', '#1D9E75', '#D85A30', '#378ADD', '#639922']

export default function Reportes() {
  const { state } = useApp()

  // Esta página transforma datos crudos del contexto en métricas visuales.
  // Producción por galpón
  const produccionPorGalpon = state.galpones.map(g => ({
    name: `G${g.numero}`,
    huevos: state.huevos.filter(h => h.id_galpon === g.id).reduce((s, h) => s + Number(h.total_huevo), 0),
    aves: g.numero_aves,
  }))

  // Alimento por galpón
  const alimentoPorGalpon = state.galpones.map(g => ({
    name: `G${g.numero}`,
    kg: state.alimentos.filter(a => a.id_galpon === g.id).reduce((s, a) => s + Number(a.cantidad_kg), 0),
  }))

  // Mortalidad por causa
  const causas = {}
  state.mortalidad.forEach(m => {
    causas[m.causa_muerte] = (causas[m.causa_muerte] || 0) + Number(m.numero_aves)
  })
  const mortalidadPorCausa = Object.entries(causas).map(([name, value]) => ({ name, value }))

  // KPIs generales
  const totalHuevos = state.huevos.reduce((s, h) => s + Number(h.total_huevo), 0)
  const totalAves   = state.galpones.reduce((s, g) => s + g.numero_aves, 0)
  const totalMuertes = state.mortalidad.reduce((s, m) => s + Number(m.numero_aves), 0)
  const pctMortalidad = totalAves > 0 ? ((totalMuertes / (totalAves + totalMuertes)) * 100).toFixed(2) : 0
  const totalAlimento = state.alimentos.reduce((s, a) => s + Number(a.cantidad_kg), 0)
  const eficiencia = totalAves > 0 ? ((totalHuevos / totalAves) * 100).toFixed(1) : 0

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
          <p className="font-bold text-gray-700 mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }} className="font-semibold">
              {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
              {p.name === 'kg' ? ' kg' : p.name === 'huevos' ? ' huevos' : ''}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Layout titulo="📈 Reportes y Análisis">

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total huevos registrados', valor: totalHuevos.toLocaleString(), icono: '🥚', color: 'border-amber-200 bg-amber-50 text-amber-700' },
          { label: 'Tasa de postura', valor: `${eficiencia}%`, icono: '📊', color: 'border-teal-200 bg-teal-50 text-teal-700' },
          { label: '% Mortalidad', valor: `${pctMortalidad}%`, icono: '💀', color: 'border-red-200 bg-red-50 text-red-700' },
          { label: 'Alimento total (kg)', valor: totalAlimento.toLocaleString(), icono: '🌾', color: 'border-green-200 bg-green-50 text-green-700' },
        ].map(k => (
          <div key={k.label} className={`rounded-2xl border-2 p-4 ${k.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{k.icono}</span>
              <p className="text-xs font-semibold opacity-80 leading-tight">{k.label}</p>
            </div>
            <p className="text-3xl font-bold">{k.valor}</p>
          </div>
        ))}
      </div>

      {/* Gráfica 1: Producción de huevos por galpón */}
      <div className="card p-5 mb-5">
        <p className="section-title mb-1">🥚 Producción de huevos por galpón</p>
        <p className="text-sm text-gray-400 mb-4">Total de huevos registrados en cada galpón</p>
        {produccionPorGalpon.every(d => d.huevos === 0)
          ? <p className="text-center text-gray-400 py-8">No hay datos de producción aún</p>
          : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={produccionPorGalpon} margin={{ top: 4, right: 10, left: 0, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 13, fontWeight: 600 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="huevos" name="huevos" fill="#EF9F27" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )
        }
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        {/* Gráfica 2: Alimento por galpón */}
        <div className="card p-5">
          <p className="section-title mb-1">🌾 Alimento consumido por galpón</p>
          <p className="text-sm text-gray-400 mb-4">Kilogramos totales por galpón</p>
          {alimentoPorGalpon.every(d => d.kg === 0)
            ? <p className="text-center text-gray-400 py-8">Sin datos</p>
            : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={alimentoPorGalpon} margin={{ top: 4, right: 10, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="kg" name="kg" fill="#639922" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )
          }
        </div>

        {/* Gráfica 3: Mortalidad por causa */}
        <div className="card p-5">
          <p className="section-title mb-1">💀 Causas de mortalidad</p>
          <p className="text-sm text-gray-400 mb-4">Distribución por causa registrada</p>
          {mortalidadPorCausa.length === 0
            ? <p className="text-center text-gray-400 py-8">Sin muertes registradas</p>
            : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={mortalidadPorCausa} cx="50%" cy="50%" outerRadius={75}
                    dataKey="value" nameKey="name" label={({ name, value }) => `${value}`}>
                    {mortalidadPorCausa.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [`${v} aves`, n]} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )
          }
        </div>
      </div>

      {/* Tabla resumen por galpón */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <p className="section-title">Resumen completo por galpón</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Galpón</th>
                <th className="px-4 py-3 text-right">Aves activas</th>
                <th className="px-4 py-3 text-right">Huevos</th>
                <th className="px-4 py-3 text-right">Alimento (kg)</th>
                <th className="px-4 py-3 text-right">Muertes</th>
                <th className="px-4 py-3 text-right">% Postura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {state.galpones.map(g => {
                const huevos = state.huevos.filter(h => h.id_galpon === g.id).reduce((s, h) => s + Number(h.total_huevo), 0)
                const alimento = state.alimentos.filter(a => a.id_galpon === g.id).reduce((s, a) => s + Number(a.cantidad_kg), 0)
                const muertes = state.mortalidad.filter(m => m.id_galpon === g.id).reduce((s, m) => s + Number(m.numero_aves), 0)
                const pct = g.numero_aves > 0 ? ((huevos / g.numero_aves) * 100).toFixed(1) : '0'
                return (
                  <tr key={g.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-gray-800">Galpón {g.numero}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{g.numero_aves.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-bold text-amber-600">{huevos.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-green-700 font-semibold">{alimento.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-red-600 font-semibold">{muertes}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${Number(pct) >= 80 ? 'text-green-600' : Number(pct) >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                        {pct}%
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}
