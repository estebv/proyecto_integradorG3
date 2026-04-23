// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// Configuración de headers por defecto
const defaultHeaders = {
  'Content-Type': 'application/json',
}

// Función helper para manejar respuestas de la API
async function handleResponse(response) {
  const data = await response.json()
  
  if (!response.ok) {
    // Si el backend envía un mensaje de error, úsalo
    if (data.message) {
      throw new Error(data.message)
    }
    // Si no, usa un mensaje genérico basado en el status
    throw new Error(`Error ${response.status}: ${response.statusText}`)
  }
  
  return data
}

// Función helper para hacer peticiones con autenticación
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  // Obtener token del localStorage si existe
  const token = localStorage.getItem('authToken')
  
  const config = {
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  }
  
  // Agregar token de autenticación si existe
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  
  try {
    const response = await fetch(url, config)
    return await handleResponse(response)
  } catch (error) {
    // Si es un error de red
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.')
    }
    throw error
  }
}

// Métodos HTTP específicos
export const api = {
  // GET
  get: (endpoint, options = {}) => 
    apiRequest(endpoint, { method: 'GET', ...options }),
  
  // POST
  post: (endpoint, data, options = {}) => 
    apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    }),
  
  // PUT
  put: (endpoint, data, options = {}) => 
    apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    }),
  
  // PATCH
  patch: (endpoint, data, options = {}) => 
    apiRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    }),
  
  // DELETE
  delete: (endpoint, options = {}) => 
    apiRequest(endpoint, { method: 'DELETE', ...options }),
  

}

// Exportar la URL base para referencia
export { API_BASE_URL }
