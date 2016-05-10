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
var bodyParser = require('body-parser');
var db = require('./components/db');
var multer = require('multer');
var path = require('path');

// Components import
var correction = require('./components/correction');
var sendMail = require('./components/sendMail');
var examStat = require('./components/examStats');
var userStat = require('./components/userStats');
var classStat = require('./components/classStats');

// Models import
var User = require('./models/User');
var Class = require('./models/Class');
var Exam = require('./models/Exam');
var Question = require('./models/Question');
var Submitted = require('./models/SubmittedExam');

// Init express to handle api-requests
var app = express();
app.use(bodyParser.json());

// Enable CORS-calls
app.all('/*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.use(express.static(__dirname + '/client'));
app.use(express.static(__dirname + '/questionImages'));
app.use(express.static(__dirname + '/client/partials'));

// Init body-parser to handle request params.
app.use(bodyParser.urlencoded({extended: false}));

// Default endpoint.
app.get('/api', function (req, res) {
    res.send('System for exam. Please use /api/users, /api/class, /api/exams, /api/question, /api/submitted');
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
app.get('/api/user/:id', function (req, res) {
    User.getUser(req.params.id, function (err, user) {
        if (err) {
            console.log(err);
            res.status(404);
        }
        res.status(200).json(user);
    });
});

// Update specific user (id)
app.put('/api/user/:id', function (req, res) {
    var currUser = req.body;
    User.updateUser(req.params.id, currUser, function (err, updatedUser) {
        if (err) {
            console.log(err);
            res.status(404);
        } else {
            console.log('Updated user');
            res.status(200).json(updatedUser);
        }

    });
});

// Log in
app.post('/api/user/login/:id', function (req, res) {
    var id = req.params.id;
    User.loginUser(id, function (err, user) {
        if (err) {
            res.status(405).json({login: false, message: 'Error connecting to db'});
        } else {
            if (user != null) {
                if (user.password === req.body.password) {
                    res.status(200).json({login: true, user: user});
                } else {
                    res.status(405).json({login: false, message: 'Kontrollera användarnamn och lösenord'});
                }
            }
            else {
                res.status(405).json({login: false, message: 'Hittar inte användarnamnet.'});
            }
        }
    });
});

// Delete specific user (id)
app.delete('/api/user/:id', function (req, res) {
    var id = req.params.id;
    User.deleteUser(id, function (err) {
        if (err) {
            res.status(405).json('Delete operation unsuccessful.');
        } else {
            //TODO Hangs from tooling.
            Class.removeStudent(id);
            Submitted.getByUser(id).forEach(function (userSubmitted) {
                Submitted.deleteSubmitted(userSubmitted._id);
            });
            res.status(200).json('User with id ' + id + ' deleted');
        }
    });
});

/*
 ------------------------------------------------------------------------------------------------------------------------
 CLASS ENDPOINTS
 ------------------------------------------------------------------------------------------------------------------------
 */

// Get all classes
app.get('/api/class', function (req, res) {
    Class.getClasses(function (err, classes) {
        if (err) {
            throw err;
        }
        res.status(200).json(classes);
    });
});

// Add class
app.post('/api/class', function (req, res) {
    var currClass = req.body;
    Class.addClass(currClass, function (err, currClass) {
        if (err) {
            console.log(err);
            res.status(404);
        }
        res.status(200).json(currClass);
    });
});

// Update class
app.put('/api/class/:id', function (req, res) {
    var currClass = req.body;
    Class.updateClass(req.params.id, currClass, function (err, updatedClass) {
        if (err) {
            console.log(err);
            res.status(404);
        } else {
            console.log('Updated Class');
            res.status(200).json(updatedClass);
        }

    });
});

// Delete class
app.delete('/api/class/:id', function (req, res) {
    var id = req.params.id;
    Class.deleteClass(id, function (err) {
        if (err) {
            res.status(405).json('Delete operation unsuccessful.');
        } else {
            res.status(200).json('Class with id ' + id + ' deleted');
        }
    });
});

// Get specific class (id)
app.get('/api/class/:id', function (req, res) {
    var result = [];
    Class.getClass(req.params.id, function (err, currClass) {
        if (err) {
            res.status(404).json('No such Class.');
        } else {
            res.status(200).json(currClass);
        }
    });
});

// Delete class and all students in class.
app.delete('/api/class/remove/:id', function (req, res) {
    var currClass = Class.getClass(req.params.id, function (err) {
        if (err) {
            res.status(404).json('No such Class.');
        } else {
            currClass.students.forEach(function (studentId) {
                User.deleteUser(studentId);
            });
            Class.deleteClass(req.params.id);
            res.status(200).json('Class with id ' + req.params.id + ' deleted with all students.');
        }
    });
});

/*
 ------------------------------------------------------------------------------------------------------------------------
 EXAM ENDPOINTS
 ------------------------------------------------------------------------------------------------------------------------
 */

// Get all exams
app.get('/api/exam', function (req, res) {
    Exam.getExams(function (err, Exams) {
        if (err) {
            throw err;
        }
        res.status(200).json(Exams);
    });
});

// Add exam
app.post('/api/exam', function (req, res) {
    var currExam = req.body;
    Exam.addExam(currExam, function (err, currExam) {
        if (err) {
            console.log(err);
            res.status(404);
        }
        res.status(200).json(currExam);
    });
});

// Update exam
app.put('/api/exam/:id', function (req, res) {
    var currExam = req.body;
    Exam.updateExam(req.params.id, currExam, function (err, updatedExam) {
        if (err) {
            console.log(err);
            res.status(404);
        } else {
            res.status(200).json(updatedExam);
        }

    });
});

// Delete exam
app.delete('/api/exam/:id', function (req, res) {
    var id = req.params.id;
    Exam.deleteExam(id, function (err) {
        if (err) {
            res.status(405).json('Delete operation unsuccessful.');
        } else {
            Submitted.getByExam(id, function (data) {
                if (data) {
                    data.forEach(function (currSubmitted) {
                        Submitted.deleteSubmitted(currSubmitted._id);
                    });
                }
            });
            res.status(200).json('Exam with id ' + id + ' deleted');
        }
    });
});

// Get specific exam (id) with questions
app.get('/api/exam/:id', function (req, res) {
    var result = [];
    var currExam = '';
    var questionsArray = [];
    var counter = 0;

    Exam.getExam(req.params.id, function (err, exam) {
        if (err) {
            res.status(404).json('No such exam.');
        } else {
            res.status(200).json(exam);
        }
    });
});

// Get exams by author
app.get('/api/exam/cre8or/:id', function (req, res) {
    Exam.getByAuthor(req.params.id, function (err, exams) {
        if (err) {
            res.status(404).json('No results for that id.');
        } else {
            res.status(200).json(exams);
        }
    });
});

/*
 ------------------------------------------------------------------------------------------------------------------------
 QUESTION ENDPOINTS
 ------------------------------------------------------------------------------------------------------------------------
 */

// Get all questions
app.get('/api/question', function (req, res) {
    Question.getQuestions(function (err, Questions) {
        if (err) {
            throw err;
        }
        res.status(200).json(Questions);
    });
});

// Get specific question (id)
app.get('/api/question/:id', function (req, res) {
    Question.getQuestion(req.params.id, function (err, question) {
        if (err) {
            console.log(err);
            res.status(404);
        }
        res.status(200).json(question);
    });
});

// Add question
app.post('/api/question', multer({dest: './questionImages/'}).single('file'), function (req, res) {
    // Workaround for the multipart upload array problem.
    var questionToFormat = req.body;
    var currQuestion = req.body;

    if (questionToFormat.type !== 'text') {
        if (questionToFormat.answerOptions.text) {
            currQuestion = JSON.parse(JSON.stringify(questionToFormat)); // In order to make a clone and not a reference to original object.
            currQuestion.answerOptions = [];
            for (var i = 0; i < questionToFormat.answerOptions.text.length; i++) {
                currQuestion.answerOptions[i] = {
                    text: '',
                    correct: false
                };
                currQuestion.answerOptions[i].text = questionToFormat.answerOptions.text[i];
                if (questionToFormat.answerOptions.correct[i] === "true") {
                    currQuestion.answerOptions[i].correct = true;
                }
            }
        }
    }

    if (req.file) {
        currQuestion.imageUrl = req.file.filename;
    }
    Question.addQuestion(currQuestion, function (err, currQuestion) {
        if (err) {
            console.log(err);
            res.status(404);
        }
        res.status(200).json(currQuestion);
    });
});

app.put('/api/question', multer({dest: './questionImages/'}).single('file'), function (req, res) {
    // Workaround for the multipart upload array problem.
    var questionToFormat = req.body;
    var currQuestion = req.body;

    if (questionToFormat.type !== 'text') {
        if (questionToFormat.answerOptions.text) {
            currQuestion = JSON.parse(JSON.stringify(questionToFormat)); // In order to make a clone and not a reference to original object.
            currQuestion.answerOptions = [];
            for (var i = 0; i < questionToFormat.answerOptions.text.length; i++) {
                currQuestion.answerOptions[i] = {
                    text: '',
                    correct: false
                };
                currQuestion.answerOptions[i].text = questionToFormat.answerOptions.text[i];
                if (questionToFormat.answerOptions.correct[i] === "true") {
                    currQuestion.answerOptions[i].correct = true;
                }
            }
        }
    }

    if (req.file) {
        currQuestion.imageUrl = req.file.filename;
    }
    Question.updateQuestion(currQuestion._id, currQuestion, function (err, updatedQuestion) {
        if (err) {
            console.log(err);
            res.status(404);
        } else {
            res.status(200).json(updatedQuestion);
        }
    });
})
;

// Delete question
app.delete('/api/question/:id', function (req, res) {
    var id = req.params.id;
    Question.deleteQuestion(id, function (err) {
        if (err) {
            res.status(405).json('Delete operation unsuccessful.');
        } else {
            res.status(200).json('Question with id ' + id + ' deleted');
        }
    });
});

// Get by author
app.get('/api/question/cre8or/:id', function (req, res) {
    Question.getByAuthor(req.params.id, function (err, questions) {
        if (err) {
            res.status(404).json('No questions by author found.');
        } else {
            res.status(200).json(questions);
        }
    });
});


/*
 ------------------------------------------------------------------------------------------------------------------------
 SUBMITTED EXAM ENDPOINTS
 ------------------------------------------------------------------------------------------------------------------------
 */

// Get specific submitted exam (id)
app.get('/api/submitted/:id', function (req, res) {
    Submitted.getSubmitted(req.params.id, function (err, submitted) {
        if (err) {
            console.log(err);
            res.status(404);
        }
        res.status(200).json(submitted);
    });
});

// Add submitted exam
app.post('/api/submitted', function (req, res) {
    var currSubmitted = req.body;
    Submitted.addSubmitted(currSubmitted, function (err, currSubmitted) {
        if (err) {
            console.log(err);
            res.status(404);
        } else {
            res.status(200).json(currSubmitted);
        }
    });
});

// Update submitted exam
app.put('/api/submitted/:id', function (req, res) {
    var currSubmitted = req.body;
    Submitted.updateSubmitted(req.params.id, currSubmitted, function (err, updatedExam) {
        if (err) {
            console.log(err);
            res.status(404);
        } else {
            correction.setExamCorrected(req.params.id, function (err, subExam) {
                if (err) {
                    res.status(404).json({success: false, message: 'Couldn\'t correct test'});
                } else {
                    correction.getSubmittedAndCorrectAnswers(req, res, function(question, subExam, orgExam) {
                        correction.autoCorrect(question, subExam, orgExam, function(submittedExam) {
                            Submitted.updateSubmitted(submittedExam.id, submittedExam, function() {
                                res.status(200).json(subExam);
                            });
                        });
                    });

                }
            });
        }
    });
});

// Try to autocorrect exam
app.get('/api/submitted/autocorrect/:id', function (req, res) {
    correction.getSubmittedAndCorrectAnswers(req, res, function (question, subExam, orgExam) {
        correction.autoCorrect(question, subExam, orgExam, function (submittedExam) {
            // Update the submitted exam in db
            Submitted.updateSubmitted(submittedExam.id, submittedExam, function () {
                res.json(submittedExam);
            });
        });
    });
});

// Delete Submitted
app.delete('/api/submitted/:id', function (req, res) {
    var id = req.params.id;
    Submitted.deleteSubmitted(id, function (err) {
        if (err) {
            res.status(405).json('Delete operation unsuccessful.');
        } else {
            res.status(200).json('Submitted exam with id ' + id + ' deleted');
        }
    });
});

// Get all submitted exams by a student
app.get('/api/submitted/user/:id', function (req, res) {
    Submitted.getByStudent(req.params.id, function (err, submitted) {
        if (err) {
            res.status(404).json('No submitted exams found.');
        } else {
            res.status(200).json(submitted);
        }
    });
});

// Get all exams which needs to be corrected
app.get('/api/submittedneedcorr/', function (req, res) {
    Submitted.getExamsNeedCorrection(function (err, exam) {
        if (err) {
            res.status(404).json('Error');
        } else {
            if(!exam) {res.status(200).json([]);}
            else {res.status(200).json(exam);}
        }
    });
});

/*
--------------------------------------------------------
    Mail endpoints
--------------------------------------------------------
 */

// Send email
app.post('/api/mail', function (req, res) {
    sendMail.sendMail(req.body, function (success) {
        if (success.success === true) {
            res.status(200).json(success);
        } else {
            res.status(404).json(success);
        }
    });
});

// Send password to user
app.get('/api/sendpass/:id', function(req, res) {
   sendMail.sendPassword(req.params.id, function(success) {
      if(success.success === true) {
          res.status(200).json(success);
      } else {
          res.status(404).json(success);
      }
   });
});

/*
---------------------------------
            STATISTICS
---------------------------------
*/

app.get('/api/statistics/:scope/:id', function(req, res) {
    if (req.params.scope === 'exam') {
        examStat.examStats(req, function(returnObject) {
            if(!returnObject.success) {
                res.status(400).json(returnObject);
            } else {
                res.status(200).json(returnObject);
            }
        });
    } else if(req.params.scope === 'user') {
        userStat.userStats(req, function(returnObject) {
            if(!returnObject.success) {
                res.status(400).json(returnObject);
            } else {
                res.status(200).json(returnObject);
            }
        });
    } else if(req.params.scope === 'class') {
        classStat.classStats(req, function(returnObject) {
            if(!returnObject.success) {
                res.status(400).json(returnObject);
            } else {
                res.status(200).json(returnObject);
            }
        });
    }

});


/*
-------------------------------------------
                Starta servern
-------------------------------------------
 */
// Start listening and log start.
var listener = app.listen(3000, function () {
    console.log('Server running on port 3000');
});