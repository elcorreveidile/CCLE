const express = require('express');
const { protect } = require('../middleware/auth');
const {
    generateQRCode,
    validateQRCode,
    validateAttendanceCode,
    getUserAttendance,
    getAttendanceStats
} = require('../controllers/attendanceController');

const router = express.Router();

// Generar QR code para una sesión de clase (solo profesores)
router.post('/qr/generate/:class_session_id', protect, generateQRCode);

// Validar QR code y registrar asistencia (estudiantes)
router.post('/qr/validate', protect, validateQRCode);

// Validar código de asistencia alternativo (estudiantes)
router.post('/code/validate', protect, validateAttendanceCode);

// Obtener asistencias del usuario actual
router.get('/my-attendance', protect, getUserAttendance);

// Obtener estadísticas de asistencia (profesores)
router.get('/stats', protect, getAttendanceStats);

module.exports = router;