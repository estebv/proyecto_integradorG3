import { useState } from 'react'
import Layout from '../components/layout/Layout'
import { useApp } from '../components/ui/context/AppContext'

export default function Perfil() {
  const { state, dispatch } = useApp()
  const [nombre, setNombre] = useState(state.user?.nombre ?? '')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMensaje('')
    setError('')
    setLoading(true)

    // Simulación visual - no llama a la API
    setTimeout(() => {
      // Actualizar el nombre en el estado local
      const updatedProfile = { ...state.user, nombre }
      dispatch({ type: 'UPDATE_USER', payload: updatedProfile })
      setMensaje('Perfil actualizado correctamente (simulado)')
      setPassword('')
      setLoading(false)
    }, 1000)
  }

  return (
    <Layout titulo="👤 Mi perfil">
      <div className="card p-6 max-w-xl">
        <p className="text-sm text-gray-500 mb-4">Actualiza tus datos de acceso y nombre visible.</p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="label">Rol</label>
            <input className="input-field bg-gray-50" value={state.user?.rol ?? ''} disabled />
          </div>
          <div>
            <label className="label">Correo</label>
            <input className="input-field bg-gray-50" value={state.user?.email ?? ''} disabled />
          </div>
          <div>
            <label className="label">Nombre</label>
            <input className="input-field" value={nombre} onChange={e => setNombre(e.target.value)} required />
          </div>
          <div>
            <label className="label">Nueva contraseña (opcional)</label>
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Dejar vacío para no cambiar"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {mensaje && <p className="text-green-600 text-sm">{mensaje}</p>}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </Layout>
  )
}
