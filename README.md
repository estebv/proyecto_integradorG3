# 🐔 La Reina del Huevo — Frontend

Interfaz web del sistema avícola. Construida con React + Vite + TailwindCSS.

> 📖 La documentación completa del proyecto (backend + frontend + base de datos) está en `avicola-backend/README.md`.

---

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

---

## 🔌 Conectar con el backend

Crea un archivo `.env` en esta carpeta:

```
VITE_API_URL=http://localhost:8080/api
```

El backend debe estar corriendo en http://localhost:8080 (ver `avicola-backend/README.md`).
