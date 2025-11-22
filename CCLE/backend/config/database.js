const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const resolveDatabasePath = () => {
    const customPath = process.env.DATABASE_PATH && process.env.DATABASE_PATH.trim();
    if (customPath) {
        return customPath;
    }
    return path.join(__dirname, '../database/intensivo3.db');
};

const dbPath = resolveDatabasePath();
const dbDirectory = path.dirname(dbPath);

if (!fs.existsSync(dbDirectory)) {
    fs.mkdirSync(dbDirectory, { recursive: true });
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos SQLite:', err);
    }
});

db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON');
});

const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) {
                return reject(err);
            }
            resolve({ id: this.lastID, changes: this.changes });
        });
    });
};

const get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) {
                return reject(err);
            }
            resolve(row);
        });
    });
};

const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                return reject(err);
            }
            resolve(rows);
        });
    });
};

module.exports = {
    db,
    run,
    get,
    query,
    dbPath
};
