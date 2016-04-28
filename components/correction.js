
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

/** Try to autocorrect an exam
 *
 * @param req
 * @param res
 */
module.exports.autoCorrect = function(req, res) {
    var submittedExam;
    var answersArray = [];
    var questionsArray = [];
    var corrAnswer = [];
    console.log(req.params.id);
    SubmittedExam.getSubmitted(req.params.id, function(err, subEx) {
        if(err) {
            res.json(err);
        } else {
            subEx.answers.forEach(function (answer) {
                answersArray.push(answer);
            });
            Exam.getExam(subEx.exam, function (err, exam) {
                if(err) {
                    res.json(err);
                } else {
                    console.log(exam.questions);
                    exam.questions.forEach(function(question) {
                        Question.getQuestion(question.id, function(err, currQuestion) {
                            if(err) {
                                res.json(err);
                            } else {
                                currQuestion.answerOptions.forEach(function(answer) {
                                    if (answer.correct === 'true') {
                                        corrAnswer.push(answer.text);
                                        console.log(corrAnswer);
                                    }
                                });
                            }
                        });

                    });
                }
            });
        }
        
    });
};