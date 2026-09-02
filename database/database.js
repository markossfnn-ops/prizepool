const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "prizepool.sqlite");

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            currency TEXT NOT NULL,
            value INTEGER NOT NULL,
            increment INTEGER NOT NULL,
            invitations INTEGER NOT NULL
        )
    `);

    db.get(
        "SELECT COUNT(*) AS count FROM settings",
        (err, row) => {
            if (err) {
                console.error("Error:", err);
                return;
            }

            if (row.count === 0) {
                db.run(
                    `
                    INSERT INTO settings
                    (id, title, currency, value, increment, invitations)
                    VALUES (?, ?, ?, ?, ?, ?)
                    `,
                    [1, "Prize Pool", "V-Bucks", 1000000, 500, 0]
                );

                console.log("Configuración inicial creada.");
            }
        }
    );
});

function getSettings() {
    return new Promise((resolve, reject) => {
        db.get(
            "SELECT * FROM settings WHERE id = 1",
            (err, row) => {
                if (err) reject(err);
                else resolve(row);
            }
        );
    });
}

function addInvitation() {
    return new Promise((resolve, reject) => {
        db.run(
            `
            UPDATE settings
            SET value = value + increment,
                invitations = invitations + 1
            WHERE id = 1
            `,
            (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                getSettings()
                    .then(resolve)
                    .catch(reject);
            }
        );
    });
}

function updateSettings(title, currency, value, increment) {
    return new Promise((resolve, reject) => {
        db.run(
            `
            UPDATE settings
            SET title = ?,
                currency = ?,
                value = ?,
                increment = ?
            WHERE id = 1
            `,
            [title, currency, value, increment],
            (err) => {
                if (err) reject(err);
                else resolve();
            }
        );
    });
}

function resetCounter(value = 0) {
    return new Promise((resolve, reject) => {
        db.run(
            `
            UPDATE settings
            SET value = ?,
                invitations = 0
            WHERE id = 1
            `,
            [value],
            (err) => {
                if (err) reject(err);
                else getSettings().then(resolve).catch(reject);
            }
        );
    });
}

module.exports = {
    getSettings,
    addInvitation,
    updateSettings,
    resetCounter
};