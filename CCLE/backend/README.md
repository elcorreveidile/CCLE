# Backend API - Intensivo 3 CLM-UGR

Backend completo con Node.js + Express para el curso Intensivo 3.

## 🚀 Instalación

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

El archivo `.env` ya está configurado con valores por defecto. Modifícalo si es necesario.

### 3. Inicializar la base de datos

```bash
npm run init-db
```

Este comando creará:
- Base de datos SQLite en `backend/database/intensivo3.db`
- Todas las tablas necesarias
- Datos de ejemplo (recursos)

### 4. Iniciar el servidor

**Modo desarrollo (con auto-reload):**
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```

El servidor estará disponible en: **http://localhost:3000**

---

## 📡 Endpoints API

### Autenticación

#### Registro de Usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "Juan",
  "lastName": "García",
  "email": "juan@example.com",
  "password": "Password123!",
  "phone": "+34 600 123 456",
  "country": "ES",
  "birthDate": "2000-05-15",
  "university": "Universidad de Granada",
  "spanishLevel": "A2.1",
  "startDate": "2024-12-01",
  "motivation": "Quiero estudiar español",
  "newsletter": true
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": 1,
      "first_name": "Juan",
      "last_name": "García",
      "email": "juan@example.com",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "Password123!"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Obtener Información del Usuario Actual
```http
GET /api/auth/me
Authorization: Bearer {token}
```

#### Actualizar Perfil
```http
PUT /api/auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "first_name": "Juan Carlos",
  "phone": "+34 600 999 888"
}
```

#### Cambiar Contraseña
```http
PUT /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "Password123!",
  "newPassword": "NewPassword456!"
}
```

---

## 🗄️ Estructura de Base de Datos

### Tabla: `users`
Almacena información de los estudiantes registrados.

### Tabla: `attendance`
Registro de asistencia con sistema QR.

### Tabla: `forum_posts` y `forum_replies`
Sistema de foro de comunicación.

### Tabla: `ai_conversations`
Historial de conversaciones con el Profesor Virtual.

### Tabla: `resources`
Materiales del curso (PDFs, videos, etc.).

### Tabla: `student_progress`
Progreso de cada estudiante en los proyectos.

---

## 🔐 Seguridad

- **Bcrypt**: Hash de contraseñas con salt
- **JWT**: Tokens con expiración de 7 días
- **Helmet**: Headers de seguridad HTTP
- **Rate Limiting**: Máximo 100 requests por 15 minutos
- **CORS**: Configurado para orígenes permitidos
- **Validación**: Express-validator en todos los endpoints

---

## 📦 Dependencias

- **express**: Framework web
- **bcryptjs**: Hash de contraseñas
- **jsonwebtoken**: Autenticación JWT
- **sqlite3**: Base de datos
- **cors**: Cross-Origin Resource Sharing
- **helmet**: Seguridad HTTP
- **express-validator**: Validación de datos
- **express-rate-limit**: Rate limiting

---

## 🧪 Testing

### Probar el registro con cURL:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "Test1234!",
    "phone": "+34 600 000 000",
    "country": "ES",
    "birthDate": "2000-01-01",
    "university": "UGR",
    "spanishLevel": "A2.1",
    "startDate": "2024-12-01",
    "newsletter": false
  }'
```

### Probar el login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

---

## 📝 Notas

- La base de datos SQLite es perfecta para desarrollo y pequeña escala
- Para producción considerar migrar a PostgreSQL o MySQL
- Los tokens JWT se guardan en localStorage en el frontend
- Implementar HTTPS en producción

---

## 🔜 Próximas Funcionalidades

- [ ] Endpoints de Profesor Virtual (integración OpenAI)
- [ ] Endpoints de Foro
- [ ] Endpoints de Control de Asistencia
- [ ] Endpoints de Recursos/Materiales
- [ ] Sistema de recuperación de contraseña
- [ ] Verificación de email
- [ ] Panel de administración

---

## 🐛 Troubleshooting

**Error: "Cannot find module 'sqlite3'"**
```bash
npm install
```

**Error: "Database locked"**
```bash
rm backend/database/intensivo3.db
npm run init-db
```

**Puerto 3000 ya en uso:**
```bash
# Cambiar PORT en .env
PORT=3001
```
