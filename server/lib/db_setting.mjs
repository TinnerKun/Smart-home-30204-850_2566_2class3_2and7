export default function (db) {
    db.serialize(function() {
        db.run(`
            CREATE TABLE IF NOT EXISTS tinner_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                gas_value INTEGER,
                flame_value INTEGER,
                temperature_value INTEGER,
                humidity_value INTEGER,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS tinner_data_1d (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                gas_value INTEGER,
                flame_value INTEGER,
                temperature_value INTEGER,
                humidity_value INTEGER,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        db.run(`
            CREATE TABLE IF NOT EXISTS tinner_data_1h (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                gas_value INTEGER,
                flame_value INTEGER,
                temperature_value INTEGER,
                humidity_value INTEGER,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    });
}
