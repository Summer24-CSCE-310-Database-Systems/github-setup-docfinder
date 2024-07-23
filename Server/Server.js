//simple node.js webserver to take in post and get requests, contact a PSQL database, and return the results
//importing the required modules
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const { Client } = require('pg');
const cors = require('cors');
const { response } = require('express');
const { json } = require('body-parser');

//setting up the connection to the PSQL database
const client = new Client({
    user: 'postgre1',
    host: 'localhost',
    database
    : 'postgres',
    password: 'password',
    port: 5432,
});

client.connect();

//setting up the server to use the required modules
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//setting up the server to listen on port 3000
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

//setting up the server to handle a get request
app.get('/', (req, res) => {
    res.send('Hello World');
});

//setting up the server to handle a post request
app.post('/post', (req, res) => {
    //getting the data from the post request
    const data = req.body;
    //querying the database
    client.query('SELECT * FROM users WHERE id = $1', [data.id], (err, response) => {
        if (err) {
            console.log(err.stack);
        } else {
            console.log(response.rows[0]);
            res.send(response.rows[0]);
        }
    });
});

//setting up the server to handle a get request
app.get('/get', (req, res) => {
    //getting the data from the get request
    const data = req.query;
    //querying the database
    client.query('SELECT * FROM users WHERE id = $1', [data.id], (err, response) => {
        if (err) {
            console.log(err.stack);
        } else {
            console.log(response.rows[0]);
            res.send(response.rows[0]);
        }
    });
});