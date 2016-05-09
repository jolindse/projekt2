
/**
 * Created by Mattias on 2016-04-25.
 */

var SubmittedExam = require('../models/SubmittedExam');
var Exam = require('../models/Exam');
var Question = require('../models/Question');
var SendMail = require('./sendMail');

/** Set a submitted exam to completely corrected if all answers
 * in that exam is corrected by teacher
 *
 * @param id
 * @param callback
 */
module.exports.setExamCorrected = function(id, callback) {
    // Find the exam
    SubmittedExam.findOne(
        {_id: id},
        function(err, exam) {
            if(err) {
                console.log(err);
            } else {
                var numAnswers = exam.answers.length;
                var corrected = 0;
                exam.answers.forEach(function(answer) {
                    if (answer.corrected === 'true') {
                        corrected++;
                    }
                });
                // If all answers are corrected set, the exam to completely corrected
                if (corrected == numAnswers) {
                    SubmittedExam.findOneAndUpdate(
                        {_id: id},
                        {
                            $set: {completeCorrection: true}

                        },
                        {upsert: false}, callback
                    );
                    // If all answers are not corrected
                } else {
                    SubmittedExam.findOneAndUpdate(
                        {_id: id},
                        {
                            $set: {completeCorrection: false}
                        },
                        {upsert: false}, callback
                    );
                }
            }
        }
    );
};

/** Fetch submitted answers and correct answers
 *
 * @param req
 * @param res
 * @param callback
 */
module.exports.getSubmittedAndCorrectAnswers = function(req, res, callback) {
    var subExam = null; // The _id of the exam that is submitted
    var questionsId = []; // The _id's of questions in exam
    var questions = []; // The questions in exam
    var orgExam = null; // The exam which is taken by student
    var maxPoints;
    // Fetch the submitted exam
    SubmittedExam.getSubmitted(req.params.id, function(err, submittedExam) {
        if (err) {console.log(err);}
        else {
            if(!submittedExam.points) {submittedExam.points = 0;}
            subExam = submittedExam.exam;
        }
        // Fetch the exam
        Exam.getExam(subExam, function (err, exam) {
            orgExam = exam;
            questionsId = exam.questions;
            questionsId.forEach(function (id) {
                // Fetch the questions in exam
                Question.getQuestion(id, function (err, question) {
                    questions.push(question);
                    // If all questions is inserted in array, go back
                    if (questions.length === questionsId.length) {
                        callback(questions, submittedExam, orgExam);
                    }
                });
            });
        });

    });
};

/** Autocorrect a submitted exam
 *
 * @param question
 * @param submittedExam
 * @param callback
 */
module.exports.autoCorrect = function(question, submittedExam, orgExam, callback) {
    var maxPoints = orgExam.maxPoints;
    var type; // Type of question; radiobuttons, checkboxes or rank
    if (submittedExam.completeCorrection != true) {
        for (var i = 0; i < question.length; i++) {
            type = question[i].type;
            // Single type
            if(type === 'single') {
                for (var j=0; j<question[i].answerOptions.length; j++) {
                   if(!submittedExam.answers[i].corrected) {
                       // Set student's answer as corrected
                       submittedExam.answers[i].corrected = true;
                       if(question[i].answerOptions[j].correct === true) {
                           // If student's answer and correct answer mathes set student's answer to correct
                           for (var k = 0; k<submittedExam.answers[i].subAnswers.length; k++) {
                               if(submittedExam.answers[i].subAnswers[k].text === question[i].answerOptions[j].text) {
                                   submittedExam.answers[i].correct = true;
                                   submittedExam.answers[i].points = question[i].points;
                                   submittedExam.points += question[i].points;
                               } else {
                                   submittedExam.answers[i].correct = false;
                                   submittedExam.answers[i].points = 0;
                               }
                           }
                       }
                   }
                }
            } 
            // Multi type
            else if (type === 'multi') {
                for (var j = 0; j<question[i].answerOptions.length; j++) {
                    if(!submittedExam.answers[i].corrected) {
                        // Set student's answer as corrected
                        submittedExam.answers[i].corrected = true;
                        // Get all the correct answers from the question
                        var correctArray = [];
                        question[i].answerOptions.forEach(function(correct) {
                            if(correct.correct) {correctArray.push(correct);}
                        });
                        var numCorrectAnswers = 0;
                        correctArray.forEach(function(correctAnswer) {
                           submittedExam.answers[i].subAnswers.forEach(function(subAnswer) {
                               if(subAnswer.text === correctAnswer.text) {
                                   numCorrectAnswers++;
                               }
                            });
                        });
                        if(numCorrectAnswers === correctArray.length) {
                            submittedExam.answers[i].correct = true;
                            submittedExam.answers[i].points = question[i].points;
                            submittedExam.points += question[i].points;
                        }
                    }
                }
            }
            
            // Rank type
            else if(type === 'rank') {
                for (var j = 0; j < question[i].answerOptions.length; j++) {
                    if(!submittedExam.answers[i].corrected) {
                        // Set the student's answer as corrected
                        submittedExam.answers[i].corrected = true;
                        var numCorrect = question[i].answerOptions.length;
                        var numCorrectAnswers = 0;
                        var subAnswers = submittedExam.answers[i];
                        for(var k = 0; k < subAnswers.length; k++) {
                            if(subAnswers[k].text === question[i].answerOptions[k].text) {
                                numCorrectAnswers++;
                            }
                        }
                        if(numCorrectAnswers === numCorrect) {
                            submittedExam.answers[i].correct = true;
                            submittedExam.answers[i].points = question[i].points;
                            submittedExam.points += question[i].points;
                        }
                    }
                }
            }
        }
        // Check if all answers are corrected
        var numAnswers = submittedExam.answers.length;
        var numCorrected = 0;
        submittedExam.answers.forEach(function (answer) {
            if (answer.corrected === true) {
                numCorrected++;
            }
        });

        if (numAnswers == numCorrected) {
            submittedExam.completeCorrection = true;

            submittedExam.points = totalPoints;
            SendMail.sendCorrected(submittedExam);
        }
        if ((submittedExam.points/maxPoints)*100 < orgExam.gradePercentage[0]) {
            submittedExam.grade = "IG";
        } else if ((submittedExam.points/maxPoints)*100 >= orgExam.gradePercentage[0] && (submittedExam.points/maxPoints)*100 < orgExam.gradePercentage[1]) {
            submittedExam.grade = "G";
        } else {
            submittedExam.grade = "VG";
        }
    }
    callback(submittedExam);
};