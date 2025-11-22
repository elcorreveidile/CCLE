const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Registrar nuevo usuario
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        // Validar errores de validación
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const {
            firstName,
            lastName,
            email,
            password,
            phone,
            country,
            birthDate,
            university,
            spanishLevel,
            startDate,
            motivation,
            newsletter
        } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Este correo electrónico ya está registrado'
            });
        }

        // Crear usuario
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            phone,
            country,
            birthDate,
            university,
            spanishLevel,
            startDate,
            motivation,
            newsletter
        });

        // Generar token
        const token = User.generateToken(user.id);

        // Devolver usuario sin password_hash
        const sanitizedUser = User.sanitizeUser(user);

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                user: sanitizedUser,
                token
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario',
            error: error.message
        });
    }
};

// @desc    Login de usuario
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Buscar usuario
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Verificar contraseña
        const isMatch = await User.comparePassword(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Verificar si el usuario está activo
        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Tu cuenta ha sido desactivada. Contacta al administrador.'
            });
        }

        // Generar token
        const token = User.generateToken(user.id);

        // Devolver usuario sin password_hash
        const sanitizedUser = User.sanitizeUser(user);

        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                user: sanitizedUser,
                token
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión',
            error: error.message
        });
    }
};

// @desc    Obtener usuario actual
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const sanitizedUser = User.sanitizeUser(user);
        const stats = await User.getUserStats(user.id);

        res.json({
            success: true,
            data: {
                user: sanitizedUser,
                stats
            }
        });

    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener información del usuario',
            error: error.message
        });
    }
};

// @desc    Actualizar perfil de usuario
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const updates = req.body;
        const user = await User.update(req.user.id, updates);

        const sanitizedUser = User.sanitizeUser(user);

        res.json({
            success: true,
            message: 'Perfil actualizado exitosamente',
            data: sanitizedUser
        });

    } catch (error) {
        console.error('Error actualizando perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar perfil',
            error: error.message
        });
    }
};

// @desc    Cambiar contraseña
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id);

        // Verificar contraseña actual
        const isMatch = await User.comparePassword(currentPassword, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Contraseña actual incorrecta'
            });
        }

        // Hash nueva contraseña
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // Actualizar contraseña
        const { run } = require('../config/database');
        await run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [passwordHash, req.user.id]);

        res.json({
            success: true,
            message: 'Contraseña cambiada exitosamente'
        });

    } catch (error) {
        console.error('Error cambiando contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar contraseña',
            error: error.message
        });
    }
};
