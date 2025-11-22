require('dotenv').config();
const bcrypt = require('bcryptjs');
const { run } = require('../config/database');

// Credenciales para el profesor
const professorCredentials = {
    email: 'profesor@ugr.es',
    password: 'profesor123',
    first_name: 'Ana',
    last_name: 'García',
    phone: '+34 600 100 200',
    country: 'ES',
    birth_date: '1980-05-15',
    university: 'Universidad de Granada',
    spanish_level: 'C1',
    start_date: '2024-11-01',
    role: 'teacher'
};

const createProfessorUser = async () => {
    try {
        console.log('👩‍🏫 Creando usuario profesor...');

        // Encriptar contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(professorCredentials.password, saltRounds);

        // Insertar profesor en la base de datos
        await run(`
            INSERT OR IGNORE INTO users (
                first_name, last_name, email, password_hash, phone, country, birth_date,
                university, spanish_level, start_date, role, is_active, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime("now"))
        `, [
            professorCredentials.first_name,
            professorCredentials.last_name,
            professorCredentials.email,
            hashedPassword,
            professorCredentials.phone,
            professorCredentials.country,
            professorCredentials.birth_date,
            professorCredentials.university,
            professorCredentials.spanish_level,
            professorCredentials.start_date,
            professorCredentials.role
        ]);

        console.log('✅ Profesor creado exitosamente:');
        console.log('📧 Email:', professorCredentials.email);
        console.log('🔑 Contraseña:', professorCredentials.password);
        console.log('👤 Rol:', professorCredentials.role);
        console.log('');
        console.log('📋 Usuarios disponibles para login:');
        console.log('');
        console.log('🎓 ESTUDIANTE:');
        console.log('  Email: test@ejemplo.com');
        console.log('  Contraseña: test123');
        console.log('');
        console.log('👩‍🏫 PROFESOR:');
        console.log('  Email:', professorCredentials.email);
        console.log('  Contraseña:', professorCredentials.password);
        console.log('');

    } catch (error) {
        console.error('❌ Error creando profesor:', error.message);
    }
};

createProfessorUser();