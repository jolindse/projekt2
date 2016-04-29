
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
    var subexam; // The _id of the exam that is submitted
    var questionsId = []; // The _id's of questions in exam
    var questions = []; // The questions in exam
    // Fetch the submitted exam
    SubmittedExam.getSubmitted(req.params.id, function(err, submittedExam) {
        subexam = submittedExam.exam;
        // Fetch the exam
        Exam.getExam(subexam, function(err, exam) {
            questionsId = exam.questions;
            questionsId.forEach(function(id) {
                // Fetch the questions in exam
                Question.getQuestion(id.id, function(err, question) {
                    questions.push(question);
                    // If all questions is inserted in array, go back
                    if(questions.length === questionsId.length) {
                        callback(questions, submittedExam);
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
module.exports.autoCorrect = function(question, submittedExam, callback) {
    var type; // Type of question; radiobuttons, checkboxes or rank
    for (var i = 0; i < question.length; i++) {
        type = question[i].type;
        if (type === 'radio' || type === 'check' || type === 'rank') { // These types are autocorrectable
            // Set student's answer as corrected
            submittedExam.answers[i].corrected = true;
            // Loop through the question's answerOptions
            for (var j = 0; j < question[i].answerOptions.length; j++) {
                if (question[i].answerOptions[j].correct === true) {
                    // If student's answer and correct answer mathes set student's answer to correct
                    if (submittedExam.answers[i].text === question[i].answerOptions[j].text) {
                        submittedExam.answers[i].correct = true;

                    } else {
                        submittedExam.answers[i].correct = false;
                    }
                }
            }
        }
    }
    callback(submittedExam);
};