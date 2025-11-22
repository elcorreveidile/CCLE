require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();

// CORS primero
const corsOptions = {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:8000', 'http://127.0.0.1:8000', 'http://localhost:8081', 'http://127.0.0.1:8081'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Middlewares de seguridad
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
});
app.use('/api/', limiter);

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../')));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/attendance', require('./routes/attendance'));

// Ruta de bienvenida
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'API Intensivo 3 - CLM UGR',
        version: '1.0.0',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                me: 'GET /api/auth/me (protected)',
                updateProfile: 'PUT /api/auth/profile (protected)',
                changePassword: 'PUT /api/auth/change-password (protected)'
            },
            attendance: {
                generateQR: 'POST /api/attendance/qr/generate/:class_session_id (professors)',
                validateQR: 'POST /api/attendance/qr/validate (students)',
                validateCode: 'POST /api/attendance/code/validate (students)',
                myAttendance: 'GET /api/attendance/my-attendance (students)',
                stats: 'GET /api/attendance/stats (professors)'
            }
        }
    });
});

// Manejo de errores 404
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada'
    });
});

// Manejador global de errores
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('=================================');
    console.log('  Intensivo 3 - API Server');
    console.log('=================================');
    console.log(`✓ Servidor corriendo en puerto ${PORT}`);
    console.log(`✓ Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✓ API: http://localhost:${PORT}/api`);
    console.log('=================================');
});

module.exports = app;
