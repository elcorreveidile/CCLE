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

        // Tabla de Asistencia
        db.run(`
            CREATE TABLE IF NOT EXISTS attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                check_in_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                check_out_time DATETIME,
                qr_code TEXT,
                status TEXT DEFAULT 'present',
                notes TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
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
