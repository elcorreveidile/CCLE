const User = require('../models/User');

// Middleware para proteger rutas
exports.protect = async (req, res, next) => {
    let token;

    // Verificar si el token está en el header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Verificar si no hay token
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'No autorizado. Por favor, inicia sesión.'
        });
    }

    try {
        // Verificar token
        const decoded = User.verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido o expirado'
            });
        }

        // Obtener usuario del token
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Cuenta desactivada'
            });
        }

        // Añadir usuario a la request
        req.user = User.sanitizeUser(user);

        next();
    } catch (error) {
        console.error('Error en autenticación:', error);
        return res.status(401).json({
            success: false,
            message: 'No autorizado'
        });
    }
};

// Middleware para verificar rol de admin
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'No autorizado'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `El rol '${req.user.role}' no tiene permisos para acceder a este recurso`
            });
        }

        next();
    };
};
