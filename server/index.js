const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express(); // This object will receive and process any HTTP request that comes to the Express server
app.use(cors()); // cors: Cross Origin Resource Sharing allows to make requests from one domain (the one running the react app) to antoher domain (on which the Express API is running on)
app.use(bodyParser.json()) // will convert the body of any request to JSON object that the express app can work with

// Postgres Client Setup
const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    port: keys.pgPort
});

// Create a database table if it's not already created
pgClient.on('connect', () => {
    pgClient
      .query('CREATE TABLE IF NOT EXISTS values (number INT)')
      .catch((err) => console.log(err));
});


// Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

const redisPublisher = redisClient.duplicate(); // Another Redis client which will be responsible for publishing events on Redis with each new inserted index. The worker has a Redis client subscribing to that event, which will wake up upon receiving this event and will calculate the Fibbonacci value for it.


app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * FROM values');

    res.send(values.rows); // makes sure that we only send the data and not the other parameters that are in the results object
});

app.get('/values/current', async (req, res) => {
    // Look up the redis database for the hash table named 'values' and retrieve everything there
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

app.post('/values', async (req, res) => {
    const index = req.body.index;
    if (parseInt(index) > 40) {
        return res.status(422).send('Index too high!'); // Putting a cap on the maximum number for which we can calculate the Fibbonacci value (because the worker uses a recursive approach that will take forever for large numbers)
    }
    redisClient.hset('values', index, 'Nothing yet!'); // Insert in the hashtable named 'values' the index. The current vaalue is set currently to a placeholder. The worker will later pick it up, calculate the Fibbonacci value for it and add it in the hash table in Redis
    redisPublisher.publish('insert', index); // push the event 'insert' with the submitted index. The worker is listening to the same event on Redis. It will wake up upon receiving it and will calculate the Fibbonacci value for the index.
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    res.send({working: true});
});

app.listen(5000, err => {
    console.log('Listening');
});