# 🚨 IMPORTANTE: Configuración del Formulario de Registro

## El Problema: GitHub Pages vs Localhost

Si estás viendo este mensaje es porque el **formulario de registro no funciona** en GitHub Pages sin configuración adicional.

### ¿Por qué?

El sitio está desplegado en **GitHub Pages (HTTPS)** pero el backend está en **localhost:3000 (HTTP)**:

1. **Mixed Content**: Los navegadores bloquean peticiones HTTP desde sitios HTTPS
2. **CORS**: No puedes acceder a localhost desde un sitio remoto
3. **Sin Backend**: GitHub Pages solo sirve archivos estáticos, no ejecuta Node.js

## ✅ Soluciones

### Opción 1: Desarrollo Local (Recomendado para Pruebas)

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/elcorreveidile/CILE.git
   cd CILE
   ```

2. **Iniciar el backend**:
   ```bash
   cd backend
   npm install
   npm start
   ```

   Deberías ver:
   ```
   ✓ Servidor corriendo en puerto 3000
   ✓ API: http://localhost:3000/api
   ```

3. **Iniciar el frontend** (en otra terminal):
   ```bash
   # Desde la raíz del proyecto
   python3 -m http.server 8080
   ```

   O con Node:
   ```bash
   npx http-server -p 8080
   ```

4. **Abrir en el navegador**:
   ```
   http://localhost:8080/register.html
   ```

   ⚠️ **IMPORTANTE**: Debe ser `localhost`, NO `github.io`

### Opción 2: Producción (Requiere Backend en la Nube)

Para que funcione en GitHub Pages necesitas:

1. **Desplegar el backend** en un servicio cloud:
   - [Railway](https://railway.app/)
   - [Render](https://render.com/)
   - [Heroku](https://heroku.com/)
   - [Vercel](https://vercel.com/)
   - Tu propio VPS

2. **Obtener la URL HTTPS** de tu API desplegada
   Ejemplo: `https://mi-api.railway.app`

3. **Agregar meta tag en el HTML**:

   Edita `register.html` y agrega en el `<head>`:
   ```html
   <meta name="api-base-url" content="https://mi-api.railway.app">
   ```

4. **Configurar CORS** en el backend:

   Edita `backend/server.js`:
   ```javascript
   const corsOptions = {
       origin: ['https://elcorreveidile.github.io', 'http://localhost:8080'],
       credentials: true
   };
   ```

### Opción 3: Demo Sin Backend

Si solo quieres mostrar el diseño sin funcionalidad:

1. El formulario mostrará un mensaje claro:
   > "El formulario no puede funcionar desde GitHub Pages sin una API configurada"

2. Los usuarios pueden ver el diseño y la validación de campos

3. Para probar la funcionalidad completa, deben usar las opciones 1 o 2

## 🔍 Verificar Configuración

Abre la consola del navegador (F12) y escribe:
```javascript
console.log('Backend configurado:', window.APP_CONFIG.hasBackend);
console.log('URL API:', window.APP_CONFIG.apiBaseUrl);
console.log('GitHub Pages:', window.APP_CONFIG.isGitHubPages);
console.log('Localhost:', window.APP_CONFIG.isLocalhost);
```

**Respuestas esperadas:**

En localhost:
```
Backend configurado: true
URL API: http://localhost:3000
GitHub Pages: false
Localhost: true
```

En GitHub Pages SIN configurar:
```
Backend configurado: false
URL API:
GitHub Pages: true
Localhost: false
```

En GitHub Pages CON backend configurado:
```
Backend configurado: true
URL API: https://tu-api.com
GitHub Pages: true
Localhost: false
```

## 📚 Recursos Adicionales

- **Guía de diagnóstico**: Ver `DIAGNOSTICO-FORMULARIO.md`
- **Página de prueba**: Abrir `test-register.html` en localhost
- **Backend README**: Ver `backend/README.md` (si existe)

## 🆘 Ayuda

Si después de seguir estos pasos el formulario no funciona:

1. Verifica que el backend esté corriendo (paso 2 de Opción 1)
2. Verifica que estés en `localhost:8080`, NO en `github.io`
3. Abre la consola (F12) y busca mensajes de error
4. Lee el archivo `DIAGNOSTICO-FORMULARIO.md`

## 🎯 Resumen Rápido

| Ubicación | Backend Necesario | Funciona |
|-----------|-------------------|----------|
| `github.io` (sin meta tag) | ❌ No configurado | ❌ NO |
| `github.io` (con meta tag) | ✅ API en la nube | ✅ SÍ |
| `localhost:8080` | ✅ Backend local | ✅ SÍ |

**Para estudiantes/pruebas**: Usa localhost (Opción 1)
**Para producción**: Despliega backend + configura meta tag (Opción 2)
