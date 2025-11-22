const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, run, get } = require('../config/database');

class User {
    // Crear nuevo usuario
    static async create(userData) {
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
        } = userData;

        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const sql = `
            INSERT INTO users (
                first_name, last_name, email, password_hash, phone, country,
                birth_date, university, spanish_level, start_date, motivation, newsletter
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            firstName, lastName, email.toLowerCase(), passwordHash, phone, country,
            birthDate, university, spanishLevel, startDate, motivation, newsletter ? 1 : 0
        ];

        try {
            const result = await run(sql, params);
            return await User.findById(result.id);
        } catch (error) {
            throw error;
        }
    }

    // Buscar usuario por ID
    static async findById(id) {
        const sql = 'SELECT * FROM users WHERE id = ?';
        return await get(sql, [id]);
    }

    // Buscar usuario por email
    static async findByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        return await get(sql, [email.toLowerCase()]);
    }

    // Verificar contraseña
    static async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Generar JWT token
    static generateToken(userId) {
        return jwt.sign(
            { id: userId },
            process.env.JWT_SECRET || 'default-secret-key',
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );
    }

    // Verificar token
    static verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
        } catch (error) {
            return null;
        }
    }

    // Actualizar usuario
    static async update(id, updates) {
        const allowedUpdates = ['first_name', 'last_name', 'phone', 'university', 'spanish_level'];
        const updateFields = [];
        const params = [];

        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                updateFields.push(`${key} = ?`);
                params.push(updates[key]);
            }
        });

        if (updateFields.length === 0) {
            return await User.findById(id);
        }

        params.push(id);
        const sql = `UPDATE users SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

        await run(sql, params);
        return await User.findById(id);
    }

    // Eliminar campo password_hash de la respuesta
    static sanitizeUser(user) {
        if (!user) return null;
        const { password_hash, ...sanitizedUser } = user;
        return sanitizedUser;
    }

    // Obtener todos los usuarios (admin)
    static async getAll(limit = 50, offset = 0) {
        const sql = 'SELECT id, first_name, last_name, email, spanish_level, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?';
        return await query(sql, [limit, offset]);
    }

    // Verificar email
    static async verifyEmail(userId) {
        const sql = 'UPDATE users SET email_verified = 1 WHERE id = ?';
        return await run(sql, [userId]);
    }

    // Obtener estadísticas del usuario
    static async getUserStats(userId) {
        const attendanceSql = 'SELECT COUNT(*) as count FROM attendance WHERE user_id = ?';
        const forumPostsSql = 'SELECT COUNT(*) as count FROM forum_posts WHERE user_id = ?';
        const aiConversationsSql = 'SELECT COUNT(*) as count FROM ai_conversations WHERE user_id = ?';

        const attendance = await get(attendanceSql, [userId]);
        const forumPosts = await get(forumPostsSql, [userId]);
        const aiConversations = await get(aiConversationsSql, [userId]);

        return {
            attendanceCount: attendance.count,
            forumPostsCount: forumPosts.count,
            aiConversationsCount: aiConversations.count
        };
    }
}

module.exports = User;
