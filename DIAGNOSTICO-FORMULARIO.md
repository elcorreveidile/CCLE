# Diagnóstico del Formulario de Inscripción

## Problema Reportado
El formulario de inscripción "ya no hace nada" cuando se intenta usar.

## Soluciones Implementadas

### 1. Logs de Depuración
He agregado logs de consola detallados para diagnosticar el problema:
- Logs cuando se hace clic en "Siguiente"
- Logs de validación de cada paso
- Logs de campos inválidos
- Logs de mensajes de error

### 2. Mejor Retroalimentación al Usuario
- Ahora se muestra un mensaje de error claro cuando la validación falla
- Los mensajes indican qué campos faltan o son incorrectos

## Cómo Diagnosticar el Problema

### Paso 1: Abrir la Consola del Navegador
1. Abre `register.html` en tu navegador
2. Presiona **F12** (o clic derecho > Inspeccionar)
3. Ve a la pestaña **Console**

### Paso 2: Intentar Usar el Formulario
1. Llena al menos un campo (por ejemplo, nombre)
2. Haz clic en el botón "Siguiente"
3. Observa los mensajes en la consola

### Paso 3: Interpretar los Mensajes

#### Si ves esto:
```
nextStep called with step: 1
validateStep called for step: 1
Found inputs: 5
```

Significa que el JavaScript se está ejecutando correctamente.

#### Si ves:
```
Validation failed for step: 1
Invalid fields: ['firstName', 'lastName', ...]
```

Significa que algunos campos no pasan la validación. Debes llenarlos correctamente.

#### Si NO ves ningún mensaje:
Significa que hay un error de JavaScript que impide que el código se ejecute. Busca errores en rojo en la consola.

## Archivo de Prueba

He creado un archivo `test-register.html` que puedes abrir para verificar que:
- Los scripts se cargan correctamente
- Las funciones están disponibles
- La configuración de la API está correcta

### Cómo usarlo:
1. Abre http://localhost:8080/test-register.html en tu navegador
2. Haz clic en cada botón de prueba
3. Revisa los resultados

## Requisitos para que el Formulario Funcione

### Paso 1: Datos Personales
- **Nombre**: Mínimo 2 caracteres, solo letras
- **Apellidos**: Mínimo 2 caracteres, solo letras
- **Teléfono**: Formato válido (ej: +34 600 000 000)
- **País**: Debes seleccionar uno del menú desplegable
- **Fecha de Nacimiento**: Debes tener al menos 16 años

### Paso 2: Información de Cuenta
- **Email**: Formato válido (usuario@dominio.com)
- **Contraseña**: Mínimo 8 caracteres, una mayúscula, un número y un símbolo
- **Confirmar Contraseña**: Debe coincidir con la contraseña

### Paso 3: Información Académica
- **Nivel de Español**: Debes seleccionar uno
- **Fecha de Inicio**: Debe ser una fecha futura
- **Términos y Condiciones**: Debes aceptar (checkbox marcado)

## Solución Rápida

### Si el formulario aún no funciona:

1. **Limpia la caché del navegador**:
   - Chrome/Edge: Ctrl + Shift + Delete > Selecciona "Imágenes y archivos en caché" > Borrar
   - Firefox: Ctrl + Shift + Delete > Selecciona "Caché" > Limpiar ahora

2. **Recarga la página** con Ctrl + F5 (recarga forzada)

3. **Verifica que el backend esté corriendo**:
   ```bash
   cd backend
   npm install
   npm start
   ```

   Debería mostrar:
   ```
   ✓ Servidor corriendo en puerto 3000
   ✓ API: http://localhost:3000/api
   ```

4. **Abre el frontend**:
   ```bash
   # Desde la raíz del proyecto
   python3 -m http.server 8080
   ```

   Luego ve a: http://localhost:8080/register.html

## Errores Comunes

### Error: "TypeError: Cannot read properties of null"
- **Causa**: Falta algún elemento HTML esperado
- **Solución**: Verifica que todos los IDs en el HTML coincidan con los del JavaScript

### Error: "notify is not defined"
- **Causa**: El archivo config.js no se cargó
- **Solución**: Verifica que `<script src="js/config.js"></script>` esté en el HTML antes de register.js

### Los campos parecen válidos pero no avanza
- **Causa**: La validación personalizada está fallando
- **Solución**: Revisa los logs de consola para ver qué campo específico está fallando

## Contacto

Si después de seguir estos pasos el problema persiste:
1. Copia todos los mensajes de la consola del navegador
2. Toma una captura de pantalla del formulario
3. Reporta el issue con esta información
