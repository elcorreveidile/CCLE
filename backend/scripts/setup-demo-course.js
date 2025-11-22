require('dotenv').config();
const { run, get, query } = require('../config/database');

const setupDemoCourse = async () => {
    try {
        console.log('🏫 Configurando curso de demostración...');

        // Obtener ID del profesor
        const professor = await get('SELECT id FROM users WHERE email = ?', ['profesor@ugr.es']);

        if (!professor) {
            console.log('❌ Profesor no encontrado. Ejecuta primero create-professor-user.js');
            return;
        }

        console.log('👩‍🏫 Profesor encontrado ID:', professor.id);

        // Crear curso de demostración
        await run(`
            INSERT OR IGNORE INTO courses (
                name, description, year_academic, semester, start_date, end_date, schedule, created_by, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
        `, [
            'Intensivo 3 - Español A2.1',
            'Curso intensivo de español nivel A2.1 con metodología por proyectos para el CLM-UGR',
            2024,
            1,
            '2024-11-01',
            '2024-11-28',
            'Lunes a Viernes 08:30-10:30h',
            professor.id
        ]);

        console.log('✅ Curso creado exitosamente');

        // Obtener el ID del curso
        const course = await get('SELECT id FROM courses WHERE created_by = ?', [professor.id]);

        if (course) {
            console.log('📚 Curso ID:', course.id);

            // Crear sesión de clase de ejemplo
            await run(`
                INSERT OR IGNORE INTO class_sessions (
                    course_id, date, start_time, end_time, location, topic, session_type, qr_code, is_active
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
            `, [
                course.id,
                '2024-11-22',
                '08:30:00',
                '10:30:00',
                'Sala 201 - CLM UGR',
                'Introducción y demostración del sistema QR',
                'demo',
                'QR_DEMO_12345'
            ]);

            console.log('✅ Sesión de clase creada');

            // Obtener el ID de la sesión que se acaba de crear
            const session = await get('SELECT id FROM class_sessions WHERE course_id = ? AND date = ?', [course.id, '2024-11-22']);

            if (session) {
                console.log('📅 Sesión ID:', session.id);

                // Crear código de asistencia alternativo
                const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
                await run(`
                    INSERT OR IGNORE INTO attendance_codes (
                        code, class_session_id, expires_at, created_at
                    ) VALUES (?, ?, ?, datetime("now"))
                `, [
                    'DEMO-CODE-123',
                    session.id,
                    expiresAt.toISOString()
                ]);

                console.log('✅ Código de asistencia creado');
            } else {
                console.log('⚠️ No se pudo obtener el ID de la sesión');
            }
        }

        console.log('');
        console.log('🎉 Sistema de demostración listo');
        console.log('');
        console.log('🔑 Credenciales para probar:');
        console.log('');
        console.log('🎓 ESTUDIANTE:');
        console.log('  Email: test@ejemplo.com');
        console.log('  Contraseña: test123');
        console.log('');
        console.log('👩‍🏫 PROFESOR:');
        console.log('  Email: profesor@ugr.es');
        console.log('  Contraseña: profesor123');
        console.log('');
        console.log('🧪 Códigos de prueba:');
        console.log('  Código Manual: DEMO-CODE-123');
        console.log('  QR Code: QR_DEMO_12345');
        console.log('');
        console.log('🌐 URLs:');
        console.log('  Frontend: http://localhost:8081');
        console.log('  Backend API: http://localhost:3000');

    } catch (error) {
        console.error('❌ Error configurando demo:', error.message);
    }
};

setupDemoCourse();