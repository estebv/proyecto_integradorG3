import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../components/ui/context/AppContext'

export default function ProtectedRoute() {
  const { state } = useApp()
  const location = useLocation()

  // Cualquier ruta interna requiere una sesión activa.
  if (!state.user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
