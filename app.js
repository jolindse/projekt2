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
var express     =   require('express');
var app         =   express();
var mongoose    =   require('mongoose');
var bodyParser  =   require('body-parser');

var User = require('./models/User');

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

app.get('/api/user/:id', function(req, res) {
    User.getUser(req.params.id, function(err, user) {
        if(err) {
            console.log(err);
        }
        res.json(user);
    });
});

app.put('/api/user/:id', function(req, res) {
    var currUser = req.body;
    User.updateUser(req.params.id, currUser, function(err, updatedUser) {
        if(err) {
            console.log(err);
        } else {
            console.log('Updated user');
            res.json(updatedUser);
        }

    });
});

// Log in
app.post('/api/user/login/:id', function(req, res) {
    var id = req.params.id;
    User.loginUser(id, function(err, user){
        if (err) {
            res.json({login: false, message: 'Error connecting to db'});
        } else {
            if(user.password === req.body.password) {
                res.json({login: true, user: user});
            } else {
                res.json({login: false, message: 'Not logged in. Check id,pw'});
            }
        }
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