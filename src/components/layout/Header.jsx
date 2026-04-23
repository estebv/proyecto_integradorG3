import { Menu, Bell } from 'lucide-react'
import { useApp } from '../ui/context/AppContext'

export default function Header({ onMenuClick, titulo }) {
  const { state } = useApp()
  const alertas = state.alertas.length

  return (
    // Encabezado común: título, fecha y contador de alertas.
    <header className="bg-white border-b border-gray-100 h-16 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-20 shadow-sm">
      {/* Hamburger mobile */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
      >
        <Menu size={22} />
      </button>

      {/* Titulo */}
      <h1 className="text-lg font-bold text-gray-900 flex-1">{titulo}</h1>

      {/* Fecha */}
      <span className="hidden sm:block text-sm text-gray-400 font-medium">
        {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
      </span>

      {/* Campana alertas */}
      <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors">
        <Bell size={20} />
        {alertas > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {alertas}
          </span>
        )}
      </button>
    </header>
  )
}
