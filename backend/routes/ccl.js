const express = require('express');
const router = express.Router();
const cclController = require('../controllers/cclController');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/ccl/analizar
 * @desc    Analizar texto con sistema CCL
 * @access  Protected
 */
router.post('/analizar', protect, cclController.analizarTexto);

/**
 * @route   GET /api/ccl/historial
 * @desc    Obtener historial de análisis
 * @access  Protected
 */
router.get('/historial', protect, cclController.obtenerHistorial);

module.exports = router;
