const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    registerValidation,
    loginValidation,
    changePasswordValidation
} = require('../middleware/validators');
const {
    register,
    login,
    getMe,
    updateProfile,
    changePassword
} = require('../controllers/authController');

// Rutas públicas
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Rutas protegidas
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePasswordValidation, changePassword);

module.exports = router;
