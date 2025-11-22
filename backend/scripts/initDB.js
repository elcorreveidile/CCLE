require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../database/intensivo3.db');
const dbDir = path.dirname(dbPath);

// Crear directorio si no existe
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

const initDB = () => {
    db.serialize(() => {
        // Tabla de Usuarios
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                phone TEXT,
                country TEXT,
                birth_date TEXT,
                university TEXT,
                spanish_level TEXT,
                start_date TEXT,
                motivation TEXT,
                newsletter BOOLEAN DEFAULT 0,
                email_verified BOOLEAN DEFAULT 0,
                is_active BOOLEAN DEFAULT 1,
                role TEXT DEFAULT 'student',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabla de Asistencia extendida para QR
        db.run(`
            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                course_id INTEGER,
                class_session_id INTEGER,
                qr_code TEXT UNIQUE NOT NULL,
                check_in_time DATETIME,
                check_out_time DATETIME,
                status TEXT DEFAULT 'checked_in',
                verification_method TEXT DEFAULT 'qr',
                ip_address TEXT,
                user_agent TEXT,
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Tabla de Cursos
        db.run(`
            CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                year_academic INTEGER NOT NULL,
                semester INTEGER NOT NULL,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL,
                schedule TEXT,
                created_by INTEGER,
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (created_by) REFERENCES users(id)
            )
        `);

        // Tabla de Sesiones de Clase
        db.run(`
            CREATE TABLE IF NOT EXISTS class_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                course_id INTEGER NOT NULL,
                date DATE NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                location TEXT,
                topic TEXT,
                session_type TEXT DEFAULT 'regular',
                qr_code TEXT UNIQUE,
                is_active BOOLEAN DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
            )
        `);

        // Tabla de QR Codes Generados
        db.run(`
            CREATE TABLE IF NOT EXISTS qr_codes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                class_session_id INTEGER NOT NULL,
                qr_code TEXT UNIQUE NOT NULL,
                expires_at DATETIME NOT NULL,
                is_used BOOLEAN DEFAULT 0,
                used_by INTEGER,
                used_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (class_session_id) REFERENCES class_sessions(id) ON DELETE CASCADE,
                FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL
            )
        `);

        // Tabla de Códigos de Asistencia (backup/alternativos)
        db.run(`
            CREATE TABLE IF NOT EXISTS attendance_codes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                code TEXT UNIQUE NOT NULL,
                class_session_id INTEGER NOT NULL,
                is_used BOOLEAN DEFAULT 0,
                used_by INTEGER,
                used_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME,
                FOREIGN KEY (class_session_id) REFERENCES class_sessions(id) ON DELETE CASCADE,
                FOREIGN KEY (used_by) REFERENCES users(id) ON DELETE SET NULL
            )
        `);

        // Tabla de Mensajes del Foro
        db.run(`
            CREATE TABLE IF NOT EXISTS forum_posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                category TEXT DEFAULT 'general',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                is_pinned BOOLEAN DEFAULT 0,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Tabla de Respuestas del Foro
        db.run(`
            CREATE TABLE IF NOT EXISTS forum_replies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Tabla de Conversaciones con Profesor Virtual
        db.run(`
            CREATE TABLE IF NOT EXISTS ai_conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                message TEXT NOT NULL,
                response TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Tabla de Recursos/Materiales
        db.run(`
            CREATE TABLE IF NOT EXISTS resources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                file_url TEXT,
                file_type TEXT,
                category TEXT,
                week INTEGER,
                uploaded_by INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (uploaded_by) REFERENCES users(id)
            )
        `);

        // Tabla de Progreso del Estudiante
        db.run(`
            CREATE TABLE IF NOT EXISTS student_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                project_name TEXT NOT NULL,
                completion_percentage INTEGER DEFAULT 0,
                last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
                notes TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Tabla de Tokens de Verificación
        db.run(`
            CREATE TABLE IF NOT EXISTS verification_tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token TEXT NOT NULL UNIQUE,
                type TEXT NOT NULL,
                expires_at DATETIME NOT NULL,
                used BOOLEAN DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `, (err) => {
            if (err) {
                console.error('Error creando tablas:', err);
            } else {
                console.log('✓ Base de datos inicializada correctamente');
                console.log('✓ Todas las tablas han sido creadas');
                insertSampleData();
            }
        });
    });
};

// Insertar datos de ejemplo
const insertSampleData = () => {
    // Insertar curso de ejemplo
    const currentYear = new Date().getFullYear();
    db.run(`
        INSERT OR IGNORE INTO courses (name, description, year_academic, semester, start_date, end_date, schedule, created_by, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        'Intensivo 3 - Español A2.1',
        'Curso intensivo de español nivel A2.1 con metodología por proyectos',
        currentYear,
        1,
        '2024-11-01',
        '2024-11-28',
        'Lunes a Viernes 08:30-10:30h',
        1,
        1
    ]);

    // Insertar sesiones de ejemplo
    const sampleSessions = [
        {
            course_id: 1,
            date: '2024-11-25',
            start_time: '08:30:00',
            end_time: '10:30:00',
            location: 'Sala 201 - CLM UGR',
            topic: 'Introducción al curso y presentación de proyectos',
            session_type: 'regular'
        },
        {
            course_id: 1,
            date: '2024-11-26',
            start_time: '08:30:00',
            end_time: '10:30:00',
            location: 'Sala 201 - CLM UGR',
            topic: 'Desarrollo del proyecto 1: Ruta de Tapas',
            session_type: 'regular'
        },
        {
            course_id: 1,
            date: '2024-11-27',
            start_time: '08:30:00',
            end_time: '10:30:00',
            location: 'Sala 201 - CLM UGR',
            topic: 'Presentación y trabajo en grupos',
            session_type: 'regular'
        },
        {
            course_id: 1,
            date: '2024-11-28',
            start_time: '08:30:00',
            end_time: '10:30:00',
            location: 'Sala 201 - CLM UGR',
            topic: 'Conversación práctica y corrección',
            session_type: 'conversation'
        },
        {
            course_id: 1,
            date: '2024-11-29',
            start_time: '08:30:00',
            end_time: '10:30:00',
            location: 'Sala 201 - CLM UGR',
            topic: 'Taller de proyectos: Avance del proyecto 1',
            session_type: 'workshop'
        }
    ];

    sampleSessions.forEach(session => {
        db.run(`
            INSERT OR IGNORE INTO class_sessions (course_id, date, start_time, end_time, location, topic, session_type, qr_code, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'QR_' + Math.random().toString(36).substr(2, 9), 1)
        `, [session.course_id, session.date, session.start_time, session.end_time, session.location, session.topic, session.session_type]);
    });

    // Insertar QR codes para las sesiones
    setTimeout(() => {
        db.all('SELECT id FROM class_sessions WHERE is_active = 1', [], (err, rows) => {
            if (err) {
                console.error('Error obteniendo sesiones para QR:', err);
                return;
            }

            rows.forEach(row => {
                const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 horas
                const qrCode = 'QR_' + Math.random().toString(36).substr(2, 9);

                db.run(`
                    INSERT INTO qr_codes (class_session_id, qr_code, expires_at, created_at)
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                `, [row.id, qrCode, expiresAt]);
            });

            console.log('✓ QR codes generados para las sesiones');
        });
    }, 1000);

    // Insertar códigos de asistencia de backup
    setTimeout(() => {
        const attendanceCodes = [
            'ATT-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            'CHECK-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            'ASIST-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            'CLM-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            'UGR-' + Math.random().toString(36).substr(2, 9).toUpperCase()
        ];

        const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000); // 8 horas

        attendanceCodes.forEach((code, index) => {
            const sessionId = (index % 5) + 1;
            db.run(`
                INSERT INTO attendance_codes (code, class_session_id, expires_at, created_at)
                VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            `, [code, sessionId, expiresAt]);
        });

        console.log('✓ Códigos de asistencia de backup generados');
    }, 2000);

    // Insertar recursos de ejemplo
    const sampleResources = [
        {
            title: 'Guía del Proyecto: Ruta de Tapas',
            description: 'Documento completo con instrucciones para el proyecto de tapas',
            file_url: '/resources/ruta-tapas-guia.pdf',
            file_type: 'pdf',
            category: 'proyecto1',
            week: 1
        },
        {
            title: 'Vocabulario Gastronómico',
            description: 'Lista de vocabulario para usar en bares y restaurantes',
            file_url: '/resources/vocabulario-gastronomico.pdf',
            file_type: 'pdf',
            category: 'proyecto1',
            week: 1
        },
        {
            title: 'Guía del Proyecto: Serie Para Mudarse a España',
            description: 'Instrucciones completas para crear tu episodio',
            file_url: '/resources/serie-guia.pdf',
            file_type: 'pdf',
            category: 'proyecto2',
            week: 3
        }
    ];

    sampleResources.forEach(resource => {
        db.run(`
            INSERT OR IGNORE INTO resources (title, description, file_url, file_type, category, week)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [resource.title, resource.description, resource.file_url, resource.file_type, resource.category, resource.week]);
    });

    console.log('✓ Datos de ejemplo insertados');
    db.close();
};

// Ejecutar inicialización
initDB();
