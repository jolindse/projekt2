/**
 * Created by Johan on 2016-04-21.
 */


/*
 ------------------------------------------------------------------------------------------------------------------------
 ------------------------------------------------------------------------------------------------------------------------
 */

/**
 * Entry for node server
 */

// Dependecies
var express = require('express');
var app = express();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

User = require('./models/User');

// Connect to mongoose

mongoose.connect('mongodb://localhost/examsystem');
var db = mongoose.connection;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Default endpoint.
app.get('/', function (req, res) {
    res.send('System for exam. Please use /api/users or /api/exams');
});

/*
 ------------------------------------------------------------------------------------------------------------------------
 USERS ENDPOINTS
 ------------------------------------------------------------------------------------------------------------------------
 */

app.get('/api/user/', function (req, res) {
    User.getUsers(function (err, users) {
        if (err) {
            throw err;
        }
        res.json(users);
    })
});

app.post('/api/user', function (req, res) {
    var currUser = req.body;
    User.addUser(currUser, function (err, currUser) {
        if (err) {
            console.log(err);
        }
        res.json(currUser);
    });
});

/*
 ------------------------------------------------------------------------------------------------------------------------
 EXAM ENDPOINTS
 ------------------------------------------------------------------------------------------------------------------------
 */

// Start listening and log start.
app.listen(3000);
console.log('Server running on port 3000');