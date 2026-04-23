import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Punto de arranque de React:
// monta la aplicación en el div#root definido en index.html.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)