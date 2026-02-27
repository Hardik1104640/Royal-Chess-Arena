// db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbFile = path.join(__dirname, 'data.sqlite');

// Create database connection
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error('Database connection error:', err);
        throw err;
    }
    console.log('Connected to SQLite database');
});

// Initialize database
function init() {
    return new Promise((resolve, reject) => {
        // Create users table if it doesn't exist
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                display_name TEXT UNIQUE NOT NULL,
                registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME,
                status TEXT DEFAULT 'active'
            )`, (err) => {
                if (err) {
                    console.error('Error creating users table:', err);
                    reject(err);
                    return;
                }
                console.log('Database tables initialized');
                resolve();
            });
        });
    });
}

function findUserByEmail(email) {
    return new Promise((resolve, reject) => {
        const query = `SELECT id, email, password_hash, display_name 
                      FROM users 
                      WHERE email = ? AND status = 'active'`;
        db.get(query, [email], (err, row) => {
            if (err) {
                console.error('Error finding user by email:', err);
                return reject(err);
            }
            resolve(row);
        });
    });
}

function findUserByDisplayName(display_name) {
    return new Promise((resolve, reject) => {
        const query = `SELECT id, display_name 
                      FROM users 
                      WHERE display_name = ? AND status = 'active'`;
        db.get(query, [display_name], (err, row) => {
            if (err) {
                console.error('Error finding user by display name:', err);
                return reject(err);
            }
            resolve(row);
        });
    });
}

function createUser({ email, password_hash, display_name }) {
    return new Promise((resolve, reject) => {
        // First check if email exists
        findUserByEmail(email)
            .then(existingEmail => {
                if (existingEmail) {
                    return reject(new Error('EMAIL_EXISTS'));
                }
                // Then check if display name exists
                return findUserByDisplayName(display_name);
            })
            .then(existingDisplayName => {
                if (existingDisplayName) {
                    return reject(new Error('DISPLAY_NAME_EXISTS'));
                }
                // If neither exists, create the user
                const query = `INSERT INTO users (
                    email, password_hash, display_name, registration_date
                ) VALUES (?, ?, ?, datetime('now'))`;
                
                db.run(query, [email, password_hash, display_name], function(err) {
                    if (err) {
                        console.error('Error creating user:', err);
                        return reject(err);
                    }
                    resolve({
                        id: this.lastID,
                        email,
                        display_name
                    });
                });
            })
            .catch(err => {
                console.error('Error in create user flow:', err);
                reject(err);
            });
    });
}

function updateLastLogin(userId) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE users 
                      SET last_login = datetime('now') 
                      WHERE id = ?`;
        db.run(query, [userId], (err) => {
            if (err) {
                console.error('Error updating last login:', err);
                return reject(err);
            }
            resolve();
        });
    });
}

module.exports = { 
    db, 
    init, 
    findUserByEmail, 
    findUserByDisplayName,
    createUser,
    updateLastLogin 
};
