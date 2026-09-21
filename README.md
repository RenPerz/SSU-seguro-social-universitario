# Seguro Social Universitario (SSU) Cochabamba

Aplicación web de SSU por estrudiantes.

## Stack Tecnológico
- **Frontend:** React (Vite) + JavaScript
- **Backend:** Python (FastAPI) + Uvicorn
- **Base de Datos:** MySQL

---

## Requisitos Previos
- [Node.js](https://nodejs.org/) (v18 o superior)
- [Python](https://www.python.org/) (v3.10 o superior)
- MySQL Server y MySQL Workbench

---

## Guía de Ejecución Local

### 1. Base de Datos
- Crear y configurar la base de datos en MySQL Workbench según las credenciales del backend.

### 2. Backend (Servidor - Python)
Desde la raíz del proyecto:
```bash
cd servidor
# Crear entorno virtual (solo la primera vez)
python -m venv venv

# Activar entorno virtual en Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# Instalar dependencias
pip install -r requirements.txt

# Iniciar el servidor
uvicorn main:app --reload --port 8000