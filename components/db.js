/**
 * Created by Johan on 2016-04-23.
 */

/**
 * Database handler to allow graceful disconnects and not spam MongoDB with connections.
 */

// Used to detect and emit SIGINT for win32
var readLine = require('readline');
if(process.platform === 'win32') {
    var rl = readLine.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.on ("SIGINT", function(){
       process.emit ("SIGINT");
    });
};

// Init mongoose
var mongoose = require('mongoose');
var gracefulShutdown;
var dbURI = 'mongodb://localhost/examsystem';

// Connect to DB
mongoose.connect(dbURI);

// Graceful shutdown function
gracefulShutdown = function (msg, callback) {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected through: '+msg);
        callback();
    });
};

/*
EVENTLISTENERS
 */

// Log connection
mongoose.connection.on('connected', function(){
    console.log('Mongoose connected to '+dbURI);
});

// Connection error
mongoose.connection.on('error', function (err) {
   console.log('Mongoose connection error: '+err);
});

// Disconnect
mongoose.connection.on('disconnected', function () {
   console.log('Mongoose disconnected');
});

// Nodemon restarts
process.once('SIGUSR2', function () {
   gracefulShutdown('nodemon restart', function () {
       process.kill(process.pid, 'SIGUSR2');
   });
});

// Application termination
process.once('SIGINT', function () {
    gracefulShutdown('Application termination', function () {
        process.exit(0);
    });
});

// *NIX termination
process.once('SIGTERM', function () {
    gracefulShutdown('*NIX termination', function () {
        process.exit(0);
    });
});
