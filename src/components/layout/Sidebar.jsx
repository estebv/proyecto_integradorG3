import { NavLink, useLocation } from 'react-router-dom'
import { useApp } from '../ui/context/AppContext'

const nav = [
  { to: '/',              icono: '📊', label: 'Inicio',           grupo: 'principal' },
  { to: '/galpones',      icono: '🏠', label: 'Galpones',         grupo: 'registros' },
  { to: '/aves',          icono: '🐔', label: 'Aves',             grupo: 'registros' },
  { to: '/huevos',        icono: '🥚', label: 'Producción Huevos', grupo: 'registros' },
  { to: '/alimentos',     icono: '🌾', label: 'Alimentos',        grupo: 'registros' },
  { to: '/mortalidad',    icono: '💀', label: 'Mortalidad',       grupo: 'registros' },
  { to: '/condiciones',   icono: '🌡️', label: 'Clima y Ambiente', grupo: 'registros' },
  { to: '/reportes',      icono: '📈', label: 'Reportes',         grupo: 'analisis' },
  { to: '/perfil',        icono: '👤', label: 'Mi perfil',        grupo: 'principal' },
]

const grupos = {
  principal: 'Principal',
  registros: 'Registros diarios',
  analisis:  'Análisis',
}

export default function Sidebar({ open, onClose }) {
  const { state, dispatch } = useApp()
  const alertas = state.alertas.length
  const user = state.user

  function cerrarSesion() {
    // Limpia sesión global y storage para volver al login.
    dispatch({ type: 'LOGOUT' })
    onClose()
  }

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full z-40 bg-gray-900 flex flex-col
        transition-transform duration-300 w-64
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-amber-400 rounded-xl flex items-center justify-center text-2xl shadow-md">
              🥚
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">Huevos</p>
              <p className="text-xs text-gray-400">Sistema Avícola</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          {Object.entries(grupos).map(([key, label]) => {
            const items = nav.filter(n => n.grupo === key)
            return (
              <div key={key}>
                <p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase px-3 mb-1">{label}</p>
                {items.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all text-sm font-medium
                      ${isActive
                        ? 'bg-amber-400/20 text-amber-300'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <span className="text-xl w-7 text-center">{item.icono}</span>
                    <span>{item.label}</span>
                    {item.to === '/' && alertas > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {alertas}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            )
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-400 rounded-full flex items-center justify-center text-sm font-bold text-amber-900">
              {user?.nombre?.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.nombre || 'Sin sesión'}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.rol || 'invitado'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={cerrarSesion}
            className="mt-3 w-full text-sm text-gray-300 hover:text-white border border-white/10 rounded-lg py-2 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
