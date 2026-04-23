import { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout({ children, titulo }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    // Estructura base de todas las páginas internas autenticadas.
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area - offset from sidebar on desktop */}
      <div className="flex-1 lg:ml-64 min-w-0 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} titulo={titulo} />
        <main className="flex-1 p-4 lg:p-6 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
