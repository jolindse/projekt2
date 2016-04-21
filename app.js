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

Users = require('./models/users');

// Connect to mongoose

mongoose.connect('mongodb://localhost/examsystem');
var db = mongoose.connection;

// Default endpoint.
app.get('/', function(req, res){
   res.send('System for exam. Please use /api/users or /api/exams');
});

/*
------------------------------------------------------------------------------------------------------------------------
USERS ENDPOINTS
 ------------------------------------------------------------------------------------------------------------------------
 */

app.get('/api/users', function(req, res){
    Users.getUsers(function (err, users) {
        if (err){
            throw err;
        }
        res.json(users);
    })
});

/*
 ------------------------------------------------------------------------------------------------------------------------
 EXAM ENDPOINTS
 ------------------------------------------------------------------------------------------------------------------------
 */

// Start listening and log start.
app.listen(3000);
console.log('Server running on port 3000');