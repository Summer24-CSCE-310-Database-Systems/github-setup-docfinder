const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { Client } = require('pg');
const jwt = require('jsonwebtoken');
const express = require('express');
const bodyParser = require('body-parser');

// server port and hostname
const port = 3000;
const hostname = 'localhost';
const secretKey = 'AIUdlHDSFIUh)*Q@U$ORFSJNDKJF';

// setting up the connection to the PSQL database
const client = new Client({
    connectionString: 'postgresql://postgres1:OFxTqKxLDjCirxD3lmh1CSzYavgof1yU@dpg-cqg321dds78s73c8721g-a.oregon-postgres.render.com/postgres1_h1qw',
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch(err => console.error('Connection error', err.stack));

// Function to handle serving static files
function serveStaticFile(filePath, contentType, res) {
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (req.method === 'POST' && (pathname === '/login' || pathname === '/register')) {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            const data = JSON.parse(body);
            const { userType, email, password } = data;

            if (pathname === '/register') {
                if (userType === 'doctor') {
                    const { name, specialty, loc, phone } = data;
                    try {
                        await client.query('INSERT INTO doctors (name, specialty, loc, phone, email, password) VALUES ($1, $2, $3, $4, $5, $6)', 
                        [name, specialty, loc, phone, email, password]);
                        const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ token }));
                    } catch (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Registration failed' }));
                    }
                } else if (userType === 'patient') {
                    const { name, phone } = data;
                    try {
                        await client.query('INSERT INTO patients (name, phone, email, password) VALUES ($1, $2, $3, $4)', 
                        [name, phone, email, password]);
                        const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ token }));
                    } catch (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Registration failed' }));
                    }
                }
            } else if (pathname === '/login') {
                if (userType === 'doctor') {
                    try {
                        const result = await client.query('SELECT * FROM doctors WHERE email = $1 AND password = $2', [email, password]);
                        if (result.rows.length > 0) {
                            const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true, token }));
                        } else {
                            res.writeHead(401, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, message: 'Login failed' }));
                        }
                    } catch (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, message: 'Database error' }));
                    }
                } else if (userType === 'patient') {
                    try {
                        const result = await client.query('SELECT * FROM patients WHERE email = $1 AND password = $2', [email, password]);
                        if (result.rows.length > 0) {
                            const token = jwt.sign({ email }, secretKey, { expiresIn: '1h' });
                            res.writeHead(200, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: true, token }));
                        } else {
                            res.writeHead(401, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, message: 'Login failed' }));
                        }
                    } catch (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, message: 'Database error' }));
                    }
                }
            }
        });
    } else if (pathname === '/' || pathname === '/Main.html') {
        serveStaticFile(path.join(__dirname, 'Client', 'Main.html'), 'text/html', res);
    } else if (pathname === '/login.html') {
        serveStaticFile(path.join(__dirname, 'Client', 'login.html'), 'text/html', res);
    } else if (pathname === '/getData' && parsedUrl.query.request === 'GetDoctors') {
        try {
            const result = await client.query('SELECT * FROM doctors');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result.rows));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Database query failed' }));
        }
    } else if (pathname === '/leaveReview' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const data = JSON.parse(body);
            const { doctorId, rating, review } = data;

            try {
                await client.query('INSERT INTO reviews (doctorID, rating, review) VALUES ($1, $2, $3)', [doctorId, rating, review]);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Failed to leave review' }));
            }
        });
    } else if (pathname === '/createAppointment' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            const data = JSON.parse(body);
            const { doctorId, appointmentDate, description } = data;

            try {
                await client.query('INSERT INTO appointments (doctorID, appointmentDate, description) VALUES ($1, $2, $3)', [doctorId, appointmentDate, description]);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Failed to create appointment' }));
            }
        });
    } else if (pathname === '/viewBills' && req.method === 'GET') {
        try {
            const result = await client.query('SELECT * FROM bills');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result.rows));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to retrieve bills' }));
        }
    } else {
        serveStaticFile(path.join(__dirname, 'Client', pathname), getContentType(pathname), res);
    }
});

function getContentType(filePath) {
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.svg': 'application/image/svg+xml'
    };
    return mimeTypes[extname] || 'application/octet-stream';
}

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
