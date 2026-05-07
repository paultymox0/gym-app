# GymApp - Entrenamiento y Nutrición

Full-stack PWA para seguimiento de entrenamiento y nutrición para Timmy y Andrea.

## Inicio Rápido

```bash
# Instalar todas las dependencias
npm run install:all

# Si better-sqlite3 necesita recompilación (Node.js v24+):
cd server && npm rebuild better-sqlite3 && cd ..

# Iniciar en modo desarrollo (servidor + cliente)
npm run dev
```

- Servidor: http://localhost:3001
- Cliente: http://localhost:5173

## Usuarios

| Usuario | Contraseña | Color |
|---------|-----------|-------|
| timmy | timmy123 | Azul (#3B82F6) |
| andrea | andrea123 | Rosa (#EC4899) |

## Funcionalidades

- Login con selector de usuario
- Dashboard con resumen del día
- Sesiones de entrenamiento con sets/reps y timer de descanso
- Seguimiento de nutrición y macros con historial
- Perfil con gráficos de peso y récords personales
- Seguimiento de suplementos diarios
- Seguimiento de ciclo menstrual (Andrea únicamente)
- Exportación de datos a CSV
- PWA con soporte offline

## Estructura

```
gym-app/
  server/          # Express + SQLite backend
  client/          # React + Vite + Tailwind frontend
```
