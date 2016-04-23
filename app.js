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
var bodyParser  =   require('body-parser');
var db          =   require('./components/db');

// Models import
var User        =   require('./models/User');
var Class       =   require('./models/Class');
var Exam        =   require('./models/Exam');
var Question    =   require('./models/Question');
var Submitted   =   require('./models/SubmittedExam');

// Init express to handle api-requests
var app         =   express();

// Connect to mongoose

// Init body-parser to handle request params.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Default endpoint.
app.get('/', function (req, res) {
    res.send('System for exam. Please use /api/users or /api/exams');
});

/*
 ------------------------------------------------------------------------------------------------------------------------
 USERS ENDPOINTS

 Http status codes:

 200    -   Success
 404    -   Not found
 405    -   Method not allowed

 ------------------------------------------------------------------------------------------------------------------------
 */

// Get all users
app.get('/api/user/', function (req, res) {
    User.getUsers(function (err, users) {
        if (err) {
            throw err;
        }
        res.status(200).json(users);
    });
});

// Add user
app.post('/api/user', function (req, res) {
    var currUser = req.body;
    User.addUser(currUser, function (err, currUser) {
        if (err) {
            console.log(err);
            res.status(404);
        }
        res.status(200).json(currUser);
    });
});

// Get specific user (id)
app.get('/api/user/:id', function(req, res) {
    User.getUser(req.params.id, function(err, user) {
        if(err) {
            console.log(err);
            res.status(404);
        }
        res.status(200).json(user);
    });
});

// Update specific user (id)
app.put('/api/user/:id', function(req, res) {
    var currUser = req.body;
    User.updateUser(req.params.id, currUser, function(err, updatedUser) {
        if(err) {
            console.log(err);
            res.status(404);
        } else {
            console.log('Updated user');
            res.status(200).json(updatedUser);
        }

    });
});

// Log in
// ADD CALLBACK FOR ADMIN LOGIN?
app.post('/api/user/login/:id', function(req, res) {
    var id = req.params.id;
    User.loginUser(id, function(err, user){
        if (err) {
            res.status(405).json({login: false, message: 'Error connecting to db'});
        } else {
            if(user.password === req.body.password) {
                res.status(200).json({login: true, user: user});
            } else {
                res.status(405).json({login: false, message: 'Not logged in. Check id,pw'});
            }
        }
    });
});

// Delete specific user (id)
app.delete('/api/user/:id', function(req, res){
   var id = req.params.id;
    User.deleteUser(id, function(err){
        if (err) {
            res.status(405).json('Delete operation unsuccessful.');
        } else {
            res.status(200).json('User with id '+id+' deleted');
        }
    });
});


/*
 ------------------------------------------------------------------------------------------------------------------------
 CLASS ENDPOINTS
 ------------------------------------------------------------------------------------------------------------------------
 */

// Get all classes
app.get('/api/class', function(req, res){
    Class.getClasses(function (err, classes) {
        if (err) {
            throw err;
        }
        res.status(200).json(classes);
    });
});

// Add class
app.post('/api/class', function(req, res){
    var currClass = req.body;
    Class.addClass(currClass, function(err, currClass){
        if (err) {
            console.log(err);
            res.status(404);
        }
        res.status(200).json(currClass);
    });
});

// Update class
app.put('/api/class/:id', function(req, res) {
    var currClass = req.body;
    Class.updateClass(req.params.id, currClass, function(err, updatedClass) {
        if(err) {
            console.log(err);
            res.status(404);
        } else {
            console.log('Updated user');
            res.status(200).json(updatedClass);
        }

    });
});

// Delete class
app.delete('/api/class/:id', function(req, res){
    var id = req.params.id;
    Class.deleteClass(id, function(err){
        if (err) {
            res.status(405).json('Delete operation unsuccessful.');
        } else {
            res.status(200).json('Class with id '+id+' deleted');
        }
    });
});

// Get specific class (id)
// TODO GET CLASS AND ALL STUDENTS IN CLASS
// TODO METHOD TO DELETE CLASS AND ALL STUDENTS IN CLASS

/*
 ------------------------------------------------------------------------------------------------------------------------
 EXAM ENDPOINTS
 ------------------------------------------------------------------------------------------------------------------------
 */

// Get all exams
app.get('/api/exam', function(req, res){
    Exam.getExams(function (err, Exams) {
        if (err) {
            throw err;
        }
        res.status(200).json(Exams);
    });
});

// Add exam
app.post('/api/exam', function(req, res){
    var currExam = req.body;
    Exam.addExam(currExam, function(err, currExam){
        if (err) {
            console.log(err);
            res.status(404);
        }
        res.status(200).json(currExam);
    });
});

// Update exam
app.put('/api/exam/:id', function(req, res) {
    var currExam = req.body;
    Exam.updateExam(req.params.id, currExam, function(err, updatedExam) {
        if(err) {
            console.log(err);
            res.status(404);
        } else {
            console.log('Updated user');
            res.status(200).json(updatedExam);
        }

    });
});

// Delete exam
// TODO Remove all submitted tests.
app.delete('/api/exam/:id', function(req, res){
    var id = req.params.id;
    Exam.deleteExam(id, function(err){
        if (err) {
            res.status(405).json('Delete operation unsuccessful.');
        } else {
            res.status(200).json('Exam with id '+id+' deleted');
        }
    });
});

// Get specific exam (id)
// TODO GET EXAM WITH ALL QUESTIONS

/*
 ------------------------------------------------------------------------------------------------------------------------
 QUESTION ENDPOINTS
 ------------------------------------------------------------------------------------------------------------------------
 */

// Get all questions
app.get('/api/question', function(req, res){
    Question.getQuestions(function (err, Questions) {
        if (err) {
            throw err;
        }
        res.status(200).json(Questions);
    });
});

// Get specific question (id)
app.get('/api/question/:id', function(req, res){
    Question.getQuestion(req.params.id, function(err, question) {
        if(err) {
            console.log(err);
            res.status(404);
        }
        res.status(200).json(question);
    });
});


// Add question
app.post('/api/question', function(req, res){
    var currQuestion = req.body;
    Question.addQuestion(currQuestion, function(err, currQuestion){
        if (err) {
            console.log(err);
            res.status(404);
        }
        res.status(200).json(currQuestion);
    });
});

// Update question
app.put('/api/question/:id', function(req, res) {
    var currQuestion = req.body;
    Question.updateQuestion(req.params.id, currQuestion, function(err, updatedQuestion) {
        if(err) {
            console.log(err);
            res.status(404);
        } else {
            console.log('Updated user');
            res.status(200).json(updatedQuestion);
        }

    });
});

// Delete question
app.delete('/api/question/:id', function(req, res){
    var id = req.params.id;
    Question.deleteQuestion(id, function(err){
        if (err) {
            res.status(405).json('Delete operation unsuccessful.');
        } else {
            res.status(200).json('Question with id '+id+' deleted');
        }
    });
});

/*
 ------------------------------------------------------------------------------------------------------------------------
 SUBMITTED EXAM ENDPOINTS
 ------------------------------------------------------------------------------------------------------------------------
 */

// Get specific submitted exam (id)
app.get('/api/submitted/:id', function(req, res){
    Submitted.getSubmitted(req.params.id, function(err, submitted) {
        if(err) {
            console.log(err);
            res.status(404);
        }
        res.status(200).json(submitted);
    });
});


// Add submitted exam
app.post('/api/submitted', function(req, res){
    var currSubmitted = req.body;
    Submitted.addSubmitted(currSubmitted, function(err, currSubmitted){
        if (err) {
            console.log(err);
            res.status(404);
        }
        res.status(200).json(currSubmitted);
    });
});

// Update submitted exam
app.put('/api/submitted/:id', function(req, res) {
    var currSubmitted = req.body;
    Submitted.updateSubmitted(req.params.id, currSubmitted, function(err, updatedSubmitted) {
        if(err) {
            console.log(err);
            res.status(404);
        } else {
            console.log('Updated user');
            res.status(200).json(updatedSubmitted);
        }

    });
});

// Delete Submitted
app.delete('/api/submitted/:id', function(req, res){
    var id = req.params.id;
    Submitted.deleteSubmitted(id, function(err){
        if (err) {
            res.status(405).json('Delete operation unsuccessful.');
        } else {
            res.status(200).json('Submitted exam with id '+id+' deleted');
        }
    });
});


// Start listening and log start.
app.listen(3000);
console.log('Server running on port 3000');