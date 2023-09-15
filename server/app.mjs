import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
dotenv.config();

// plugin
import logger from './lib/logger.mjs';
import db from './lib/db_req.mjs';

const app = express();
app.use(bodyParser.json());

// pug engine
app.set('view engine', 'pug');
app.set('views', './views');

// static files
app.use(express.static('public'));

const server = http.createServer(app);

const io = new Server(server);
io.on('connection', (socket) => {
    logger.success('A user connected');

    socket.on('message', (message) => {
        logger.info(message);
        io.emit('message', message);
    });

    socket.on('disconnect', () => {
        logger.warning('A user disconnected');
    });
});

app.get('/', (req, res) => {
    res.render('index' , { 
        title: process.env.TITLE || 'Tinner',
        description: process.env.DESCRIPTION || 'Tinner is a smart tin soldering machine.',
    });
});

app.get('/api', (req, res) => {
    res.render('rest_api' , {
        title: process.env.TITLE || 'Tinner',
        description: process.env.DESCRIPTION || 'Tinner is a smart tin soldering machine.',
    });
});
    

app.post('/data', (req, res) => {
    const data = req.body;
    io.emit('data', data);
    db.insert('tinner_data', 'gas_value, flame_value, temperature_value, humidity_value', `${parseFloat(data.gas_value).toFixed(2)}, ${parseFloat(data.flame_value).toFixed(2)}, ${parseFloat(data.temperature).toFixed(2)}, ${parseFloat(data.humidity).toFixed(2)}`);
    res.send('ok');
});

app.get('/data', (req, res) => {
    const sql = 'SELECT * FROM tinner_data';
    db.select(sql, (rows) => {
        res.json(rows);
    });
});

app.get('/data/average', (req, res) => {
    const sql = 'SELECT AVG(gas_value) AS gas_value, AVG(flame_value) AS flame_value, AVG(temperature_value) AS temperature_value, AVG(humidity_value) AS humidity_value FROM tinner_data ORDER BY id DESC LIMIT 30';
    db.select(sql, (rows) => {
        res.json(rows);
    });
});

app.get('/data/average/:minutes', (req, res) => {
    let minutes = req.params.minutes || 30;
    const sql = 'SELECT AVG(gas_value) AS gas_value, AVG(flame_value) AS flame_value, AVG(temperature_value) AS temperature_value, AVG(humidity_value) AS humidity_value FROM tinner_data WHERE timestamp > datetime("now", "-' + minutes + ' minutes")';
    db.select(sql, (rows) => {
        res.json(rows);
    });
});

app.get('/data/day', (req, res) => {
    const sql = 'SELECT * FROM tinner_data_1d ORDER BY id DESC';
    db.select(sql, (rows) => {
        res.json(rows);
    });
});

app.get('/data/hour', (req, res) => {
    const sql = 'SELECT * FROM tinner_data_1h';
    db.select(sql, (rows) => {
        res.json(rows);
    });
});

app.get('/data/scatter', (req, res) => {
    res.render('scatter');
}); 

server.listen(process.env.PORT || 2560, () => {
    logger.success(`Server is listening on port ${process.env.PORT || 2560}`);
});