import { useApp } from '../components/ui/context/AppContext'
import Layout from '../components/layout/Layout'
import { KpiCard, AlertaBanner } from '../components/ui'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { state } = useApp()
  const navigate = useNavigate()

  // Métricas del día calculadas a partir del estado global.
  const totalHuevosHoy = state.huevos
    .filter(h => h.fecha_puesta === new Date().toISOString().split('T')[0])
    .reduce((s, h) => s + Number(h.total_huevo), 0)

  const totalAves = state.galpones.reduce((s, g) => s + g.numero_aves, 0)

  const muertesHoy = state.mortalidad
    .filter(m => m.fecha_muerte === new Date().toISOString().split('T')[0])
    .reduce((s, m) => s + Number(m.numero_aves), 0)

  const alimentoHoy = state.alimentos
    .filter(a => a.fecha_consumo === new Date().toISOString().split('T')[0])
    .reduce((s, a) => s + Number(a.cantidad_kg), 0)

  const acciones = [
    { label: 'Registrar Huevos', icono: '🥚', ruta: '/huevos',    color: 'bg-amber-400 hover:bg-amber-500 text-amber-900' },
    { label: 'Registrar Alimento', icono: '🌾', ruta: '/alimentos', color: 'bg-green-400 hover:bg-green-500 text-green-900' },
    { label: 'Reportar Muerte', icono: '💀', ruta: '/mortalidad',  color: 'bg-red-100 hover:bg-red-200 text-red-800' },
    { label: 'Clima y Ambiente', icono: '🌡️', ruta: '/condiciones', color: 'bg-blue-100 hover:bg-blue-200 text-blue-800' },
  ]

  return (
    <Layout titulo="Inicio — Resumen del día">
      {/* Alertas */}
      {state.alertas.length > 0 && (
        <div className="mb-6 space-y-2">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">⚠ Alertas de hoy</p>
          {state.alertas.map(a => (
            <AlertaBanner key={a.id} tipo={a.tipo} mensaje={a.mensaje} hora={a.hora} />
          ))}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiCard icono="🥚" label="Huevos recogidos hoy" valor={totalHuevosHoy.toLocaleString()} sub="En todos los galpones" color="amber" />
        <KpiCard icono="🐔" label="Total aves activas" valor={totalAves.toLocaleString()} sub="En todos los galpones" color="teal" />
        <KpiCard icono="💀" label="Muertes hoy" valor={muertesHoy} sub="Aves registradas" color="red" />
        <KpiCard icono="🌾" label="Alimento dado hoy" valor={`${alimentoHoy.toLocaleString()} kg`} sub="Total consumido" color="green" />
      </div>

      {/* Accesos rápidos */}
      <div className="card p-5 mb-6">
        <p className="section-title mb-4">¿Qué quieres registrar ahora?</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {acciones.map(a => (
            <button
              key={a.ruta}
              onClick={() => navigate(a.ruta)}
              className={`flex flex-col items-center justify-center gap-2 py-5 px-3 rounded-2xl font-semibold transition-all active:scale-95 text-sm ${a.color}`}
            >
              <span className="text-4xl">{a.icono}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Estado galpones */}
      <div className="card p-5">
        <p className="section-title mb-4">Estado de galpones hoy</p>
        <div className="space-y-3">
          {state.galpones.map(g => {
            const huevosG = state.huevos
              .filter(h => h.id_galpon === g.id && h.fecha_puesta === new Date().toISOString().split('T')[0])
              .reduce((s, h) => s + Number(h.total_huevo), 0)
            const pct = g.numero_aves > 0 ? Math.round((huevosG / g.numero_aves) * 100) : 0

            return (
              <div key={g.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold
                  ${g.estado === 'alerta' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  G{g.numero}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-semibold text-gray-800 text-sm">Galpón {g.numero} · {g.raza}</p>
                    <p className="text-sm font-bold text-gray-700">{huevosG.toLocaleString()} huevos</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${pct >= 80 ? 'bg-green-400' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{g.numero_aves.toLocaleString()} aves · {pct}% producción</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
