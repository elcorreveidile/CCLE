require('dotenv').config();
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../database/intensivo3.db');
const db = new sqlite3.Database(dbPath);

async function createDemoUser() {
    const email = 'demo@ccle.es';
    const password = 'demo123';
    const firstName = 'Usuario';
    const lastName = 'Demo';

    try {
        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Verificar si el usuario ya existe
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) {
                console.error('Error checking existing demo user:', err);
                process.exit(1);
            }

            if (row) {
                console.log('✓ Usuario de demostración ya existe:');
                console.log('  Email:', email);
                console.log('  Contraseña:', password);
                console.log('');
                console.log('Puedes usar estas credenciales para el acceso de demostración.');
                db.close();
                return;
            }

            // Insertar usuario de demostración
            const sql = `
                INSERT INTO users (
                    first_name, last_name, email, password_hash,
                    spanish_level, university, country, role
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const params = [
                firstName, lastName, email.toLowerCase(), passwordHash,
                'A2', 'CLM-UGR', 'España', 'demo'
            ];

            db.run(sql, params, function(err) {
                if (err) {
                    console.error('Error creating demo user:', err);
                    process.exit(1);
                }

                console.log('✓ Usuario de demostración creado exitosamente:');
                console.log('  Email:', email);
                console.log('  Contraseña:', password);
                console.log('  ID:', this.lastID);
                console.log('  Rol:', 'demo');
                console.log('');
                console.log('Puedes usar estas credenciales para el acceso de demostración.');
                db.close();
            });
        });
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createDemoUser();