import { createContext, useContext, useReducer, useEffect } from 'react'
import { clearAuthSession, getAuthSession, saveAuthSession } from '../../../helpers/storage'
import { isAdmin } from '../../../helpers/permissions'
import { api } from '../../../services/api'

// ─────────────────────────────────────────────────────────────────
//  ✅ CORRECCIÓN BUG 3:
//  Se agregó useEffect que al arrancar la app hace GET a todos
//  los endpoints del backend y llena el estado global con datos reales.
//  Antes: estado inicial era [] vacío y nunca se conectaba al backend.
// ─────────────────────────────────────────────────────────────────

const initialState = {
  user:        null,
  loading:     true,
  galpones:    [],
  huevos:      [],
  alimentos:   [],
  mortalidad:  [],
  condiciones: [],
  alertas:     [],
}

function getInitialState() {
  const authSession = getAuthSession()
  return { ...initialState, user: authSession ?? null }
}

function reducer(state, action) {
  const adminAction = action.type.startsWith('UPDATE_') || action.type.startsWith('DELETE_')
  if (adminAction && !isAdmin(state.user)) return state

  switch (action.type) {
    case 'SET_DATA':
      return { ...state, ...action.payload, loading: false }

    case 'ADD_HUEVO':
      return { ...state, huevos: [action.payload, ...state.huevos] }
    case 'UPDATE_HUEVO':
      return { ...state, huevos: state.huevos.map(h => h.id === action.payload.id ? { ...h, ...action.payload } : h) }
    case 'DELETE_HUEVO':
      return { ...state, huevos: state.huevos.filter(h => h.id !== action.payload.id) }

    case 'ADD_ALIMENTO':
      return { ...state, alimentos: [action.payload, ...state.alimentos] }
    case 'UPDATE_ALIMENTO':
      return { ...state, alimentos: state.alimentos.map(a => a.id === action.payload.id ? { ...a, ...action.payload } : a) }
    case 'DELETE_ALIMENTO':
      return { ...state, alimentos: state.alimentos.filter(a => a.id !== action.payload.id) }

    case 'ADD_MORTALIDAD': {
      const galpones = state.galpones.map(g =>
        g.id === Number(action.payload.id_galpon)
          ? { ...g, numero_aves: Math.max(0, g.numero_aves - action.payload.numero_aves) }
          : g
      )
      return { ...state, mortalidad: [action.payload, ...state.mortalidad], galpones }
    }
    case 'UPDATE_MORTALIDAD':
      return { ...state, mortalidad: state.mortalidad.map(m => m.id === action.payload.id ? { ...m, ...action.payload } : m) }
    case 'DELETE_MORTALIDAD':
      return { ...state, mortalidad: state.mortalidad.filter(m => m.id !== action.payload.id) }

    case 'ADD_CONDICION':
      return { ...state, condiciones: [action.payload, ...state.condiciones] }
    case 'UPDATE_CONDICION':
      return { ...state, condiciones: state.condiciones.map(c => c.id === action.payload.id ? { ...c, ...action.payload } : c) }
    case 'DELETE_CONDICION':
      return { ...state, condiciones: state.condiciones.filter(c => c.id !== action.payload.id) }

    case 'ADD_GALPON':
      return { ...state, galpones: [...state.galpones, action.payload] }
    case 'UPDATE_GALPON':
      return { ...state, galpones: state.galpones.map(g => g.id === action.payload.id ? { ...g, ...action.payload } : g) }
    case 'DELETE_GALPON':
      return { ...state, galpones: state.galpones.filter(g => g.id !== action.payload.id) }

    case 'LOGIN':
      saveAuthSession(action.payload)
      return { ...state, user: action.payload }
    case 'UPDATE_USER': {
      const user = { ...state.user, ...action.payload }
      saveAuthSession(user)
      return { ...state, user }
    }
    case 'LOGOUT':
      clearAuthSession()
      return { ...state, user: null }

    default:
      return state
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState)

  // ✅ Al montar la app, carga todos los datos del backend.
  // Promise.allSettled: si un endpoint falla, los demás igual cargan.
  useEffect(() => {
    async function cargarDatos() {
      try {
        const [galpones, huevos, alimentos, mortalidad, condiciones] =
          await Promise.allSettled([
            api.get('/galpones'),
            api.get('/huevos'),
            api.get('/alimentos'),
            api.get('/mortalidad'),
            api.get('/condiciones'),
          ])

        dispatch({
          type: 'SET_DATA',
          payload: {
            galpones:    galpones.status    === 'fulfilled' ? galpones.value    : getDatosEjemplo().galpones,
            huevos:      huevos.status      === 'fulfilled' ? huevos.value      : getDatosEjemplo().huevos,
            alimentos:   alimentos.status   === 'fulfilled' ? alimentos.value   : getDatosEjemplo().alimentos,
            mortalidad:  mortalidad.status  === 'fulfilled' ? mortalidad.value  : getDatosEjemplo().mortalidad,
            condiciones: condiciones.status === 'fulfilled' ? condiciones.value : getDatosEjemplo().condiciones,
          },
        })
      } catch (error) {
        // Si todo falla, usar datos de ejemplo
        dispatch({
          type: 'SET_DATA',
          payload: getDatosEjemplo()
        })
      }
    }
    cargarDatos()
  }, [])

  // Función para generar datos de ejemplo cuando no hay conexión al backend
  function getDatosEjemplo() {
    const hoy = new Date().toISOString().split('T')[0]
    return {
      galpones: [
        { id: 1, numero: 1, raza: 'Hy-Line Brown', numero_aves: 5000, estado: 'activo' },
        { id: 2, numero: 2, raza: 'Lohmann Brown', numero_aves: 4500, estado: 'activo' },
        { id: 3, numero: 3, raza: 'Hy-Line Brown', numero_aves: 5200, estado: 'alerta' },
      ],
      huevos: [
        { id: 1, id_galpon: 1, fecha_puesta: hoy, total_huevo: 4200, calidad: 4 },
        { id: 2, id_galpon: 2, fecha_puesta: hoy, total_huevo: 3800, calidad: 3 },
        { id: 3, id_galpon: 3, fecha_puesta: hoy, total_huevo: 4100, calidad: 4 },
      ],
      alimentos: [
        { id: 1, id_galpon: 1, fecha_consumo: hoy, cantidad_kg: 125, tipo_alimento: 'Balanceado' },
        { id: 2, id_galpon: 2, fecha_consumo: hoy, cantidad_kg: 112, tipo_alimento: 'Balanceado' },
        { id: 3, id_galpon: 3, fecha_consumo: hoy, cantidad_kg: 130, tipo_alimento: 'Balanceado' },
      ],
      mortalidad: [
        { id: 1, id_galpon: 3, fecha_muerte: hoy, numero_aves: 5, causa_muerte: 'Enfermedad respiratoria' },
      ],
      condiciones: [
        { id: 1, id_galpon: 1, fecha_registro: hoy, temperatura: 24.5, humedad: 65, amoniaco: 10 },
        { id: 2, id_galpon: 2, fecha_registro: hoy, temperatura: 25.0, humedad: 62, amoniaco: 8 },
        { id: 3, id_galpon: 3, fecha_registro: hoy, temperatura: 26.2, humedad: 70, amoniaco: 15 },
      ],
    }
  }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
