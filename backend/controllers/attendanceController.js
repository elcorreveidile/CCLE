require('dotenv').config();
const { query, get, run } = require('../config/database');
const crypto = require('crypto');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// Validar QR code y registrar asistencia
const validateQRCode = async (req, res) => {
    try {
        const { qr_code } = req.body;
        const user_id = req.user.id;

        if (!qr_code) {
            return res.status(400).json({
                success: false,
                message: 'QR code es requerido'
            });
        }

        // Buscar QR code válido
        const qrRecord = await get(`
            SELECT qc.*, cs.course_id, cs.date as session_date, cs.start_time, cs.location,
                   c.name as course_name, c.year_academic, c.semester
            FROM qr_codes qc
            JOIN class_sessions cs ON qc.class_session_id = cs.id
            JOIN courses c ON cs.course_id = c.id
            WHERE qc.qr_code = ? AND qc.expires_at > datetime("now") AND qc.is_used = 0
        `, [qr_code]);

        if (!qrRecord) {
            return res.status(404).json({
                success: false,
                message: 'QR code inválido, expirado o ya utilizado'
            });
        }

        // Verificar si el usuario ya registró asistencia para esta sesión
        const existingAttendance = await get(
            'SELECT id FROM attendance WHERE user_id = ? AND class_session_id = ?',
            [user_id, qrRecord.class_session_id]
        );

        if (existingAttendance) {
            return res.status(400).json({
                success: false,
                message: 'Ya se ha registrado asistencia para esta sesión'
            });
        }

        // Registrar asistencia
        await run(`
            INSERT INTO attendance (
                user_id, course_id, class_session_id, qr_code,
                check_in_time, verification_method, ip_address, user_agent
            ) VALUES (?, ?, ?, ?, datetime("now"), 'qr', ?, ?)
        `, [
            user_id, qrRecord.course_id, qrRecord.class_session_id, qr_code,
            req.ip, req.get('User-Agent')
        ]);

        // Marcar QR code como usado
        await run(
            'UPDATE qr_codes SET is_used = 1, used_by = ?, used_at = datetime("now") WHERE id = ?',
            [user_id, qrRecord.id]
        );

        res.json({
            success: true,
            message: 'Asistencia registrada exitosamente',
            data: {
                course_name: qrRecord.course_name,
                session_date: qrRecord.session_date,
                check_in_time: new Date().toISOString(),
                location: qrRecord.location,
                verification_method: 'qr'
            }
        });

    } catch (error) {
        console.error('Error validando QR code:', error);
        res.status(500).json({
            success: false,
            message: 'Error validando QR code'
        });
    }
};

// Validar código de asistencia alternativo
const validateAttendanceCode = async (req, res) => {
    try {
        const { code } = req.body;
        const user_id = req.user.id;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: 'Código de asistencia es requerido'
            });
        }

        // Buscar código válido
        const codeRecord = await get(`
            SELECT ac.*, cs.course_id, cs.date as session_date, cs.start_time, cs.location,
                   c.name as course_name, c.year_academic, c.semester
            FROM attendance_codes ac
            JOIN class_sessions cs ON ac.class_session_id = cs.id
            JOIN courses c ON cs.course_id = c.id
            WHERE ac.code = ? AND ac.expires_at > datetime("now") AND ac.is_used = 0
        `, [code]);

        if (!codeRecord) {
            return res.status(404).json({
                success: false,
                message: 'Código inválido, expirado o ya utilizado'
            });
        }

        // Verificar si el usuario ya registró asistencia para esta sesión
        const existingAttendance = await get(
            'SELECT id FROM attendance WHERE user_id = ? AND class_session_id = ?',
            [user_id, codeRecord.class_session_id]
        );

        if (existingAttendance) {
            return res.status(400).json({
                success: false,
                message: 'Ya se ha registrado asistencia para esta sesión'
            });
        }

        // Registrar asistencia
        await run(`
            INSERT INTO attendance (
                user_id, course_id, class_session_id, qr_code,
                check_in_time, verification_method, ip_address, user_agent
            ) VALUES (?, ?, ?, ?, datetime("now"), 'code', ?, ?)
        `, [
            user_id, codeRecord.course_id, codeRecord.class_session_id, code,
            req.ip, req.get('User-Agent')
        ]);

        // Marcar código como usado
        await run(
            'UPDATE attendance_codes SET is_used = 1, used_by = ?, used_at = datetime("now") WHERE id = ?',
            [user_id, codeRecord.id]
        );

        res.json({
            success: true,
            message: 'Asistencia registrada exitosamente',
            data: {
                course_name: codeRecord.course_name,
                session_date: codeRecord.session_date,
                check_in_time: new Date().toISOString(),
                location: codeRecord.location,
                verification_method: 'code'
            }
        });

    } catch (error) {
        console.error('Error validando código de asistencia:', error);
        res.status(500).json({
            success: false,
            message: 'Error validando código de asistencia'
        });
    }
};

// Obtener asistencias del usuario actual
const getUserAttendance = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { course_id, limit = 50, offset = 0 } = req.query;

        let queryText = `
            SELECT a.*, cs.date as session_date, cs.start_time, cs.end_time, cs.location, cs.topic,
                   c.name as course_name, c.year_academic, c.semester
            FROM attendance a
            JOIN class_sessions cs ON a.class_session_id = cs.id
            JOIN courses c ON cs.course_id = c.id
            WHERE a.user_id = ?
        `;
        const params = [user_id];

        if (course_id) {
            queryText += ' AND c.id = ?';
            params.push(course_id);
        }

        queryText += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), parseInt(offset));

        const attendance = await query(queryText, params);

        res.json({
            success: true,
            data: attendance
        });

    } catch (error) {
        console.error('Error obteniendo asistencias:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo registros de asistencia'
        });
    }
};

// Obtener estadísticas de asistencia (para profesores)
const getAttendanceStats = async (req, res) => {
    try {
        const { course_id, session_id } = req.query;
        const user_id = req.user.id;

        // Verificar que el usuario es profesor del curso
        if (course_id) {
            const course = await get(
                'SELECT created_by FROM courses WHERE id = ?',
                [course_id]
            );

            if (course.created_by !== user_id) {
                return res.status(403).json({
                    success: false,
                    message: 'No autorizado para ver estadísticas de este curso'
                });
            }
        }

        let queryText = `
            SELECT
                COUNT(DISTINCT a.user_id) as total_students,
                COUNT(a.id) as total_attendance,
                c.name as course_name,
                cs.date as session_date,
                cs.topic
            FROM attendance a
            JOIN class_sessions cs ON a.class_session_id = cs.id
            JOIN courses c ON cs.course_id = c.id
        `;

        const conditions = [];
        const params = [];

        if (course_id) {
            conditions.push('c.id = ?');
            params.push(course_id);
        }

        if (session_id) {
            conditions.push('cs.id = ?');
            params.push(session_id);
        }

        if (conditions.length > 0) {
            queryText += ' WHERE ' + conditions.join(' AND ');
        }

        queryText += ' GROUP BY c.id, cs.id ORDER BY cs.date DESC';

        const stats = await query(queryText, params);

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Error obteniendo estadísticas de asistencia'
        });
    }
};

// Generar QR code para una sesión de clase (solo profesores)
const generateQRCode = async (req, res) => {
    try {
        const { class_session_id } = req.params;
        const user_id = req.user.id;

        // Verificar que la sesión existe y está activa
        const session = await get(`
            SELECT cs.*, c.name as course_name
            FROM class_sessions cs
            JOIN courses c ON cs.course_id = c.id
            WHERE cs.id = ? AND cs.is_active = 1
        `, [class_session_id]);

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Sesión no encontrada o inactiva'
            });
        }

        // Verificar que el usuario es el profesor del curso
        const course = await get(
            'SELECT created_by FROM courses WHERE id = ?',
            [session.course_id]
        );

        if (course.created_by !== user_id) {
            return res.status(403).json({
                success: false,
                message: 'No autorizado para generar QR para esta sesión'
            });
        }

        // Generar QR code único con expiración
        const qrCodeText = uuidv4();
        const qrCodeDisplay = 'QR_' + qrCodeText.substring(0, 8).toUpperCase();
        const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 horas

        // Generar imagen QR code
        const qrImage = await QRCode.toDataURL(qrCodeText, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            quality: 0.92,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            width: 256
        });

        // Invalidar QR codes anteriores de esta sesión
        await run(
            'UPDATE qr_codes SET expires_at = datetime("now") WHERE class_session_id = ? AND expires_at > datetime("now")',
            [class_session_id]
        );

        // Insertar nuevo QR code
        await run(
            'INSERT INTO qr_codes (class_session_id, qr_code, expires_at, created_at) VALUES (?, ?, ?, datetime("now"))',
            [class_session_id, qrCodeText, expiresAt.toISOString()]
        );

        res.json({
            success: true,
            data: {
                qr_code: qrCodeDisplay,
                qr_code_text: qrCodeText,
                qr_image: qrImage,
                expires_at: expiresAt.toISOString(),
                session_info: {
                    course_name: session.course_name,
                    date: session.date,
                    start_time: session.start_time,
                    location: session.location
                }
            }
        });

    } catch (error) {
        console.error('Error generando QR code:', error);
        res.status(500).json({
            success: false,
            message: 'Error generando QR code'
        });
    }
};

module.exports = {
    generateQRCode,
    validateQRCode,
    validateAttendanceCode,
    getUserAttendance,
    getAttendanceStats
};