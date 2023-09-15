import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
import cron from 'node-cron';
dotenv.config();

// plugins
import log_effect from './logger.mjs';

let db;

function connect() {
    db = new sqlite3.Database(process.env.DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
        if (err) return log_effect.warning('Error when connecting to SQLite DB') && setTimeout(connect, 2000);

        log_effect.success('Connected to SQLite DB');
        import('./db_setting.mjs').then(db_setting => {
        db_setting.default(db);
        });
    });
}

connect();

const insert = (table, key, value) => {
    const sql = `INSERT INTO ${table} (${key}) VALUES (${value})`;
    db.run(sql, (err) => {
        if (err) return log_effect.error(err);
        log_effect.success('Inserted data to table ' + table);
    });
}

const select = (sql, callback) => {
    db.all(sql, (err, rows) => {
        if (err) return log_effect.error(err);
        log_effect.success('Selected data from table ' + sql.split(' ')[3]);
        callback(rows);
    });
}

const delete_data = (table) => {
    db.run(`DELETE FROM ${table}`, (err) => {
        if (err) return log_effect.error(err);
        log_effect.success('Deleted data from table ' + table);
    });
}

cron.schedule('0 0 * * *', () => {
    const sql = 'SELECT AVG(gas_value) AS gas_value, AVG(flame_value) AS flame_value, AVG(temperature_value) AS temperature_value, AVG(humidity_value) AS humidity_value FROM tinner_data';
    db.get(sql, (err, row) => {
        if (err) return log_effect.error(err);
        insert('tinner_data_1d', 'gas_value, flame_value, temperature_value, humidity_value', `${parseFloat(row.gas_value).toFixed(2)}, ${parseFloat(row.flame_value).toFixed(2)}, ${parseFloat(row.temperature_value).toFixed(2)}, ${parseFloat(row.humidity_value).toFixed(2)}`);
        db.run('DELETE FROM tinner_data');
    });
});

cron.schedule('0 * * * *', () => {
    const sql = 'SELECT AVG(gas_value) AS gas_value, AVG(flame_value) AS flame_value, AVG(temperature_value) AS temperature_value, AVG(humidity_value) AS humidity_value FROM tinner_data';
    db.get(sql, (err, row) => {
        if (err) return log_effect.error(err);
        insert('tinner_data_1h', 'gas_value, flame_value, temperature_value, humidity_value', `${parseFloat(row.gas_value).toFixed(2)}, ${parseFloat(row.flame_value).toFixed(2)}, ${parseFloat(row.temperature_value).toFixed(2)}, ${parseFloat(row.humidity_value).toFixed(2)}`);
    });
});

const res = {
    insert,
    select,
    delete_data
};

export default res;