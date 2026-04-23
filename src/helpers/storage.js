const AUTH_STORAGE_KEY = 'avicola-auth-user'
const USERS_STORAGE_KEY = 'avicola-users'

export function saveAuthSession(user) {
  // Guarda la sesión actual para mantener login al recargar.
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
}

export function getAuthSession() {
  // Recupera sesión previa; si falla el parseo, se ignora por seguridad.
  const rawSession = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!rawSession) return null

  try {
    return JSON.parse(rawSession)
  } catch {
    return null
  }
}

export function clearAuthSession() {
  // Elimina sesión local al cerrar sesión.
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function getStoredUsers() {
  const rawUsers = localStorage.getItem(USERS_STORAGE_KEY)
  if (!rawUsers) return null
  try {
    return JSON.parse(rawUsers)
  } catch {
    return null
  }
}

export function saveStoredUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}
