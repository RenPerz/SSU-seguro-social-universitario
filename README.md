# Seguro Social Universitario

Aplicacion web del Seguro Social Universitario de Cochabamba.

## Tecnologias

- Frontend: React, Vite y JavaScript
- Backend: Python, FastAPI y Uvicorn
- Base de datos prevista: MySQL

## Estructura actual

```text
cliente/       Aplicacion React existente
servidor/      API FastAPI existente
	main.py
	requirements.txt
```

Se mantienen los nombres `cliente` y `servidor` porque ya forman parte del
repositorio. La organizacion interna de rutas y servicios se ampliara en los
siguientes pasos.

## Requisitos

- Node.js 18.18 o superior (requisito de la configuracion actual de ESLint)
- Python 3.10 o superior
- MySQL Server y MySQL Workbench para las funciones que usan base de datos

## Ejecutar el frontend

Desde la raiz del repositorio:

```powershell
cd cliente
npm ci
npm run dev
```

Vite mostrara la direccion local en la terminal (normalmente
`http://localhost:5173`).

## Ejecutar el backend

Desde la raiz del repositorio:

```powershell
cd servidor
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

En PowerShell, si la activacion esta restringida, se puede ejecutar Uvicorn
directamente con `\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000`.

## Comprobar la API

- `http://localhost:8000/` responde `{"message":"API del Seguro Social Universitario funcionando"}`.
- `http://localhost:8000/api/health` responde `{"status":"ok"}`.
- `http://localhost:8000/docs` abre la documentacion Swagger de FastAPI.

Este paso no crea ni configura el esquema MySQL ni el modulo de citas. Las
rutas preexistentes que consultan datos siguen dependiendo de la configuracion
de base de datos que ya tenia el proyecto.