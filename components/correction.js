
/**
 * Created by Mattias on 2016-04-25.
 */

var SubmittedExam = require('../models/SubmittedExam');
var Exam = require('../models/Exam');
var Question = require('../models/Question');

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
    // Fetch the submitted exam
    SubmittedExam.getSubmitted(req.params.id, function(err, submittedExam) {
        subExam = submittedExam.exam;
        
            // Fetch the exam
            Exam.getExam(subExam, function (err, exam) {
                orgExam = exam;
                questionsId = exam.questions;
                questionsId.forEach(function (id) {
                    // Fetch the questions in exam
                    Question.getQuestion(id.id, function (err, question) {
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
    var type; // Type of question; radiobuttons, checkboxes or rank
    if (submittedExam.completeCorrection != true) {
        for (var i = 0; i < question.length; i++) {
            type = question[i].type;
            if (type === 'radio' || type === 'check' || type === 'rank') { // These types are autocorrectable
                // Loop through the question's answerOptions
                for (var j = 0; j < question[i].answerOptions.length; j++) {
                    if (submittedExam.answers[i].corrected != true) {
                        // Set student's answer as corrected
                        submittedExam.answers[i].corrected = true;
                        if (question[i].answerOptions[j].correct === true) {
                            // If student's answer and correct answer mathes set student's answer to correct
                            if (submittedExam.answers[i].text === question[i].answerOptions[j].text) {
                                submittedExam.answers[i].correct = true;
                                submittedExam.answers[i].points = question[i].points;

                            } else {
                                submittedExam.answers[i].correct = false;
                                submittedExam.answers[i].points = 0;
                            }
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
            var totalPoints = submittedExam.points;
            submittedExam.answers.forEach(function (answer) {
                totalPoints += answer.points;
            });
            submittedExam.points = totalPoints;
        }
        if (submittedExam.points < orgExam.gradePercentage[0]) {
            submittedExam.grade = "IG";
        } else if (submittedExam.points >= orgExam.gradePercentage[0] && submittedExam.points < orgExam.gradePercentage[1]) {
            submittedExam.grade = "G";
        } else {
            submittedExam.grade = "VG";
        }
    }
    callback(submittedExam);
};