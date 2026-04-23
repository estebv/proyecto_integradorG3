import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom'
import { AppProvider, useApp } from '../components/ui/context/AppContext'
import ProtectedRoute from './ProtectedRoute'
import Dashboard from '../pages/Dashboard'
import Galpones from '../pages/Galpones'
import Aves from '../pages/Aves'
import Huevos from '../pages/Huevos'
import Alimentos from '../pages/Alimentos'
import Mortalidad from '../pages/Mortalidad'
import Condiciones from '../pages/Condiciones'
import Reportes from '../pages/Reportes'
import Login from '../pages/Login'
import Perfil from '../pages/Perfil'

function RootLayout() {
  // Envuelve TODA la app con el contexto global.
  return (
    <AppProvider>
      <Outlet />
    </AppProvider>
  )
}

function LoginRoute() {
  const { state } = useApp()

  // Si ya hay sesión, no tiene sentido volver al login.
  if (state.user) {
    return <Navigate to="/" replace />
  }

  return <Login />
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { path: 'login', element: <LoginRoute /> },
      {
        // Todas estas rutas requieren sesión por ProtectedRoute.
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'galpones', element: <Galpones /> },
          { path: 'aves', element: <Aves /> },
          { path: 'huevos', element: <Huevos /> },
          { path: 'alimentos', element: <Alimentos /> },
          { path: 'mortalidad', element: <Mortalidad /> },
          { path: 'condiciones', element: <Condiciones /> },
          { path: 'reportes', element: <Reportes /> },
          { path: 'perfil', element: <Perfil /> },
        ],
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
