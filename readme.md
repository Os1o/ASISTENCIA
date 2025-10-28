# 🏥 Control de Asistencia - IMSS

Sistema web para registro de asistencia durante eventos de 2 días con gestión de entrada y salida.

## 📋 Características

- ✅ Autenticación segura con Supabase
- ✅ Registro de entrada y salida por día
- ✅ Gestión de personas con OOAD (Estados de México)
- ✅ Exportación a Excel
- ✅ Diseño responsive (móvil, tablet, desktop)
- ✅ Interfaz con colores institucionales IMSS

## 🚀 Configuración

### 1. Configurar Credenciales de Supabase

Abre el archivo `config.js` y reemplaza con tus credenciales:

```javascript
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_ANON_KEY = 'tu_anon_key_aqui';
```

**¿Dónde encontrar estas credenciales?**
1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Ve a **Project Settings** → **API**
3. Copia:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** → `SUPABASE_ANON_KEY`

### 2. Verificar Base de Datos

Asegúrate de que en Supabase tienes:

**Tabla: personas**
- id (uuid)
- nombre (text)
- ooad (text)
- created_at (timestamp)

**Tabla: asistencias**
- id (uuid)
- persona_id (uuid, foreign key)
- dia (integer, 1 o 2)
- entrada (timestamp)
- salida (timestamp)
- created_at (timestamp)

**Row Level Security (RLS)** habilitado con políticas para usuarios autenticados.

### 3. Crear Usuario Administrador

1. Ve a **Authentication** → **Users** en Supabase
2. Clic en **Add user** → **Create new user**
3. Ingresa email y contraseña
4. Guarda estas credenciales para el login

## 📦 Deployment en Netlify

### Opción 1: Drag & Drop

1. Ve a [Netlify](https://www.netlify.com)
2. Crea una cuenta o inicia sesión
3. Arrastra la carpeta del proyecto a Netlify
4. ¡Listo! Tu sitio estará publicado

### Opción 2: Deploy desde Git

1. Sube tu código a GitHub
2. En Netlify: **Add new site** → **Import from Git**
3. Conecta tu repositorio
4. Build settings:
   - Build command: (dejar vacío)
   - Publish directory: `/`
5. Clic en **Deploy site**

### ⚠️ IMPORTANTE: Proteger Credenciales

**NUNCA subas el archivo `config.js` con credenciales reales a un repositorio público.**

Para producción, usa variables de entorno:
1. En Netlify: **Site settings** → **Environment variables**
2. Agrega:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
3. Modifica `config.js` para usar estas variables

## 📂 Estructura de Archivos

```
├── index.html          # Página de login
├── dashboard.html      # Dashboard principal
├── styles.css         # Estilos CSS
├── config.js          # Configuración de Supabase
├── auth.js            # Lógica de autenticación
├── app.js             # Lógica principal del dashboard
├── export.js          # Exportación a Excel
└── README.md          # Este archivo
```

## 🎨 Colores IMSS

```css
--imss-green: #1A5642;    /* Verde principal */
--burgundy: #16433e;       /* Burgundy */
--cool-gray: #9B9B9B;     /* Gris */
--beige: #D4C5A0;         /* Beige */
--gold: #AE843F;          /* Dorado */
--dark-gray: #2B2B2B;     /* Gris oscuro */
--white: #FFFFFF;         /* Blanco */
```

## 📱 Uso de la Aplicación

### Login
1. Ingresa con el email y contraseña del usuario creado en Supabase
2. Clic en **Iniciar Sesión**

### Dashboard
1. **Seleccionar Día**: Usa los botones "Día 1" y "Día 2"
2. **Agregar Persona**: 
   - Clic en "Agregar Persona"
   - Completa nombre y estado (OOAD)
   - Guardar
3. **Registrar Asistencia**:
   - En cada tarjeta, haz clic en "Registrar" para entrada o salida
   - Se guarda automáticamente con fecha y hora
4. **Exportar**: Clic en "Exportar a Excel" descarga un archivo con todos los datos
5. **Cerrar Sesión**: Usa el botón en el header

## 🔒 Seguridad

- ✅ Autenticación obligatoria
- ✅ Row Level Security (RLS) en Supabase
- ✅ Solo usuarios autenticados pueden acceder a los datos
- ✅ Las credenciales se validan del lado del servidor

## 🛠️ Tecnologías

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL + Auth)
- **Librerías**:
  - Supabase JS Client
  - SheetJS (xlsx) para Excel
- **Hosting**: Netlify

## 📞 Soporte

Para dudas o problemas:
1. Verifica que las credenciales en `config.js` sean correctas
2. Revisa la consola del navegador (F12) para errores
3. Verifica que las tablas en Supabase estén bien configuradas

## ✅ Checklist de Implementación

- [ ] Supabase configurado (tablas, RLS, usuario)
- [ ] Credenciales en `config.js`
- [ ] Probado localmente
- [ ] Subido a Netlify
- [ ] Login funciona
- [ ] Agregar personas funciona
- [ ] Registrar asistencia funciona
- [ ] Exportar a Excel funciona

¡Listo para usar! 🎉