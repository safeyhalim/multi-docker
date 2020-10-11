const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});
const sub = redisClient.duplicate(); // duplicating the client because we are going to use one instance to 
// listen to the insertion messages (numbers), and the other to calculate and add the Fibbonacci values for those messages


/*
* The recursive Fibbonacci solution is the ideal one, because it's super slow.
* We are using it here purposely because we want the solution to be slow so that it justifies the use 
* of a worker architecture that is attached to the redis database
*/
function fib(index) {
    if (index < 2) return 1;
    return fib(index - 1) + fib(index - 2);
}

// anytime you get a message, run the callback function
sub.on('message', (channel, message) => {
    redisClient.hset('values', message, fib(parseInt(message))); // insert into a hash table called 'values'
    // the key which is the message and the value which is the Fibbonacci value of that message
});
sub.subscribe('insert'); // subscribe to the 'insert' event so that whenever a new value is inserted into the redis,
// the above logic will fire