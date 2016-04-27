
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

/** Try to autocorrect a submitted exam
 *
 * @param id
 * @param callback
 */
module.exports.autoCorrect = function(id,callback) {
    SubmittedExam.findOne(
        {_id: id},
        function (err, subExam) {
            if (err) {
                console.log(err);
            } else {
                Exam.findOne(
                    {_id : subExam.exam},
                    function(err, exam) {
                        if(err){
                            console.log(err);
                        }
                        else {
                            exam.questions.forEach(function(questionId) {
                               Question.findOne(function(err, question) {
                                   
                               });
                            });
                        }
                    }
                )
            }
        }
    );
}