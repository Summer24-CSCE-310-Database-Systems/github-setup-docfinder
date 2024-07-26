const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { Client } = require('pg');

// server port and hostname
const port = 3000;
const hostname = 'localhost';

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

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    if (pathname === '/getData' && query.request === 'GetDoctors') {
        client.query('SELECT * FROM doctors', (err, result) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Database query error' }));
            } else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result.rows));
            }
        });
    } else if (pathname === '/' || pathname === '/Main.html') {
        const filePath = path.join(__dirname, 'Client/Main.html');
        fs.readFile(filePath, (error, content) => {
            if (error) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(content, 'utf-8');
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
