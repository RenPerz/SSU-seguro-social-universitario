# Sistema de Seguro Social Universitario de Bolivia

Aplicacion web academica para gestionar usuarios, citas medicas, recordatorios, historial, notificaciones y administracion del Seguro Social Universitario de Cochabamba.

## Tecnologias

- Frontend: React, Vite, JavaScript, HTML5 y CSS3
- Backend: Python, FastAPI y Uvicorn
- Base de datos: MySQL (administrable con MySQL Workbench)

## Requisitos

- Node.js 18 o superior y npm
- Python 3.10 o superior
- MySQL Server
- MySQL Workbench

## Estructura

```text
cliente/                 Aplicacion React/Vite
servidor/app/            API FastAPI, autenticacion, rutas y servicios
servidor/requirements.txt
database/schema.sql      Esquema y datos iniciales de MySQL
```

## Instalacion

1. Clona o descarga el repositorio.
2. Instala las dependencias del cliente desde PowerShell, en la raiz:

	```powershell
	cd cliente
	npm ci
	cd ..
	```

3. Crea el entorno e instala las dependencias del backend:

	```powershell
	cd servidor
	python -m venv .venv
	.\.venv\Scripts\Activate.ps1
	python -m pip install -r requirements.txt
	Copy-Item .env.example .env
	```

4. Edita `servidor/.env` con las credenciales de tu instancia MySQL. Genera `JWT_SECRET` con:

	```powershell
	python -c "import secrets; print(secrets.token_urlsafe(48))"
	```

	Pega el resultado en `JWT_SECRET`. Debe tener al menos 32 bytes. No uses el archivo `.env.example` como configuracion real ni subas `.env` a Git.

5. Abre `database/schema.sql` en MySQL Workbench y ejecuta el script sobre tu instancia local. Crea las tablas necesarias y agrega las columnas finales sin eliminar los datos existentes.

## Ejecucion

Inicia el backend desde `servidor` con el entorno virtual activo:

```powershell
uvicorn app.main:app --reload --port 8000
```

En otra terminal, inicia el frontend:

```powershell
cd cliente
npm run dev
```

Vite muestra la URL local, normalmente `http://localhost:5173`. La API usa `http://127.0.0.1:8000` por defecto. Para cambiarla, configura `VITE_API_BASE_URL` antes de ejecutar Vite, por ejemplo `http://localhost:8000`.

La documentacion interactiva de la API queda disponible en `http://localhost:8000/docs`; `http://localhost:8000/api/health` comprueba que FastAPI responde.

## Acceso administrativo

El registro publico crea cuentas con rol `estudiante`. Para habilitar una cuenta administrativa, registra primero la cuenta y cambia su rol desde MySQL Workbench, verificando cuidadosamente el email:

```sql
UPDATE usuarios
SET rol = 'administrador'
WHERE email = 'correo-administrador@ejemplo.bo';
```

Las rutas `/api/admin/...` verifican el rol en el backend; ocultar el enlace en el cliente no sustituye esa autorizacion. No asignes este rol a cuentas no confiables.

## Checklist de pruebas

### Autenticacion

- [ ] Registro de estudiante
- [ ] Login correcto e incorrecto
- [ ] Rutas protegidas y cierre de sesion

### Citas y recordatorios

- [ ] Crear y consultar citas
- [ ] Cancelar citas propias y rechazar acceso a citas ajenas
- [ ] Filtrar citas y validar horarios
- [ ] Guardar, activar y desactivar recordatorios
- [ ] Cambiar anticipacion del recordatorio

### Perfil, historial y notificaciones

- [ ] Consultar y editar el perfil propio
- [ ] Consultar y filtrar el historial propio
- [ ] Listar notificaciones, marcar una y marcarlas todas como leidas

### Administracion

- [ ] Entrar al panel con rol administrador
- [ ] Rechazar acceso de estudiante a `/admin` y `/api/admin/...`
- [ ] Buscar, filtrar y activar/desactivar usuarios
- [ ] Crear, editar y activar/desactivar profesionales
- [ ] Crear, editar y activar/desactivar especialidades
- [ ] Consultar citas administrativas con filtros

### Responsive y estados

- [ ] Verificar desktop (1440 px), tablet (768 px) y mobile (390 px)
- [ ] Comprobar loading, errores y estados vacios
- [ ] Confirmar que no haya scroll horizontal fuera de tablas desplazables

## Notas de seguridad

- Las contrasenas se almacenan con hash Argon2id.
- MySQL requiere `DB_USER` y `DB_PASSWORD`; no se usa una cuenta root sin contrasena por defecto.
- Los secretos y credenciales locales van en `servidor/.env`, excluido por Git.
- Los errores internos de MySQL se registran en el backend y no se devuelven como detalle tecnico al cliente.