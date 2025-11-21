const { body } = require('express-validator');

// Validaciones para registro
exports.registerValidation = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('El nombre es obligatorio')
        .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo puede contener letras'),

    body('lastName')
        .trim()
        .notEmpty().withMessage('Los apellidos son obligatorios')
        .isLength({ min: 2 }).withMessage('Los apellidos deben tener al menos 2 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('Los apellidos solo pueden contener letras'),

    body('email')
        .trim()
        .notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('Formato de email inválido')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres')
        .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una mayúscula')
        .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('La contraseña debe contener al menos un símbolo'),

    body('phone')
        .optional()
        .matches(/^\+?[\d\s-()]+$/).withMessage('Formato de teléfono inválido'),

    body('country')
        .notEmpty().withMessage('El país es obligatorio'),

    body('birthDate')
        .notEmpty().withMessage('La fecha de nacimiento es obligatoria')
        .isISO8601().withMessage('Formato de fecha inválido')
        .custom((value) => {
            const birthDate = new Date(value);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            if (age < 16) {
                throw new Error('Debes tener al menos 16 años');
            }
            return true;
        }),

    body('spanishLevel')
        .notEmpty().withMessage('El nivel de español es obligatorio'),

    body('startDate')
        .notEmpty().withMessage('La fecha de inicio es obligatoria')
        .isISO8601().withMessage('Formato de fecha inválido')
        .custom((value) => {
            const startDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (startDate <= today) {
                throw new Error('La fecha de inicio debe ser futura');
            }
            return true;
        }),

    body('newsletter')
        .optional()
        .isBoolean().withMessage('Newsletter debe ser verdadero o falso')
];

// Validaciones para login
exports.loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('El email es obligatorio')
        .isEmail().withMessage('Formato de email inválido')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria')
];

// Validaciones para cambio de contraseña
exports.changePasswordValidation = [
    body('currentPassword')
        .notEmpty().withMessage('La contraseña actual es obligatoria'),

    body('newPassword')
        .notEmpty().withMessage('La nueva contraseña es obligatoria')
        .isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres')
        .matches(/[A-Z]/).withMessage('La nueva contraseña debe contener al menos una mayúscula')
        .matches(/[0-9]/).withMessage('La nueva contraseña debe contener al menos un número')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('La nueva contraseña debe contener al menos un símbolo')
];
