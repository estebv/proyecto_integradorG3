# 🐔 La Reina del Huevo — Frontend

Interfaz web del sistema avícola. Construida con React + Vite + TailwindCSS.


## ⚡ Inicio rápido

```bash
npm install
npm run dev
```

La app corre en **http://localhost:5173**

Usuario de prueba: `admin@avicola.com` / `123456`

---

## 📁 Estructura

```
src/
├── pages/           ← Una carpeta por pantalla (Login, Dashboard, Galpones...)
├── components/
│   ├── layout/      ← Header, Sidebar, Layout principal
│   └── ui/          ← Componentes reutilizables (Toast, Badge, Campo...)
├── services/
│   └── api.js       ← Configuración de llamadas al backend
├── helpers/
│   ├── storage.js   ← Guarda la sesión en el navegador
│   └── permissions.js ← Verifica si el usuario es admin
└── routes/
    ├── AppRouter.jsx      ← Define todas las rutas de la app
    └── ProtectedRoute.jsx ← Bloquea rutas si no hay sesión
```


