
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
                    console.log('Getting question (id: '+question._id+'): '+JSON.stringify(question,null, 2)); // TESe
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
    console.log('AutoCorrect '+JSON.stringify(question),null, 2); // TEST
    var maxPoints = orgExam.maxPoints;
    var type; // Type of question; radiobuttons, checkboxes or rank
    if (submittedExam.completeCorrection != true) {
        for (var i = 0; i < question.length; i++) {
            console.log('Current Question (index '+i+')'+JSON.stringify(question[i],null, 2)+'\n\n'); // TEST
            type = question[i].type;
            
            // Single type
            if(type === 'single') {
                var subAnswer = submittedExam.answers[i];
                console.log('Current answer is single (index '+i+') : '+JSON.stringify(subAnswer,null, 2)+'\n\n'); // TEST
                if(!subAnswer[0].corrected) {
                    console.log('Subanswer '+JSON.stringify(subAnswer[0],null, 2)+' deemed not corrected Index i '+i+' index j '+j+'\n\n'); // TEST
                    for (var j = 0; j < question[i].answerOptions.length; j++) {
                        if (subAnswer[0].text === question[i].answerOptions[j].text && question[i].answerOptions[j].correct) {
                            console.log('Subanswer '+JSON.stringify(subAnswer[0],null, 2)+' is correct'+'\n\n'); // TEST
                            subAnswer[0].correct = true;
                            subAnswer[0].corrected = true;
                            subAnswer[0].points = question[i].points;
                            submittedExam.points += subAnswer[0].points;
                            break;
                        } else {
                            console.log('Subanswer '+JSON.stringify(subAnswer[0],null, 2)+' is NOT correct'+'\n\n'); // TEST
                            subAnswer[0].correct = false;
                            subAnswer[0].corrected = true;
                            subAnswer[0].points = 0;
                        }
                    }
                }
            }

            // Multi type
            else if (type === 'multi') {
                var subAnswers = submittedExam.answers[i];
                console.log('Current answer is multi (index '+i+') : '+JSON.stringify(subAnswers,null, 2)+'\n\n'); // TEST
                var correctArray = [];
                question[i].answerOptions.forEach(function (answerOption) {
                    if (answerOption.correct) {
                        if(correctArray.indexOf(answerOption.text<0)) {
                            correctArray.push(answerOption.text);
                        }
                    }
                });
                for (var j=0; j<subAnswers.length; j++) {
                    if (!subAnswers[j].corrected) {
                         console.log('Subanswer '+JSON.stringify(subAnswers[j],null, 2)+' deemed not corrected Index i '+i+' index j '+j+'\n\n'); // TEST
                        if (correctArray.indexOf(subAnswers[j].text) > -1) {
                            console.log('Subanswer '+JSON.stringify(subAnswers[j],null, 2)+' is correct'+'\n\n'); // TEST
                            subAnswers[j].corrected = true;
                            subAnswers[j].correct = true;
                            subAnswers[j].points = (question[i].points / correctArray.length);
                            submittedExam.points += subAnswers[j].points;
                        } else {
                            console.log('Subanswer '+JSON.stringify(subAnswers[j],null, 2)+' is NOT correct'+'\n\n'); // TEST
                            subAnswers[j].corrected = true;
                            subAnswers[j].correct = false;
                            subAnswers[j].points = 0;
                        }
                    }
                }
            }
            
            // Rank type
            else if(type === 'rank') {
                var subAnswers = submittedExam.answers[i];
                console.log('Current answer is rank (index '+i+') : '+JSON.stringify(subAnswers,null, 2)+'\n\n'); // TEST
                for (var j = 0; j < subAnswers.length; j++) {
                    if(!subAnswers[j].corrected) {
                        // Set the student's answer as corrected
                        subAnswers[j].corrected = true;
                        if(subAnswers[j].text === question[i].answerOptions[j].text) {
                            subAnswers[j].correct = true;
                            subAnswers[j].points = (question[i].points/question[i].answerOptions.length);
                            submittedExam.points += subAnswers[j].points;
                        } else {
                            subAnswers[j].correct = false;
                            subAnswers[j].points = 0;
                        }
                    }
                }
            }

            else if(type === 'text') {
                var subAnswers = submittedExam.answers[i];
                console.log('Current answer is text (index '+i+') : '+JSON.stringify(subAnswers,null, 2)+'\n\n'); // TEST
            }
        }

        // Check if all answers are corrected
        var numAnswers = submittedExam.answers.length;
        var numSubCorrected = 0;
        var numTotCorrected = 0;
        submittedExam.answers.forEach(function (answer) {
            var subAnswers = answer;
            subAnswer.forEach(function(sub) {
               if(sub.corrected){numSubCorrected++;}
                if(numSubCorrected === subAnswer.length) {numTotCorrected++;}
            });
        });

        if (numAnswers == numTotCorrected) {
            submittedExam.completeCorrection = true;

            //submittedExam.points = totalPoints;
            if ((submittedExam.points/maxPoints)*100 < orgExam.gradePercentage[0]) {
                submittedExam.grade = "IG";
            } else if ((submittedExam.points/maxPoints)*100 >= orgExam.gradePercentage[0] && (submittedExam.points/maxPoints)*100 < orgExam.gradePercentage[1]) {
                submittedExam.grade = "G";
            } else {
                submittedExam.grade = "VG";
            }
            submittedExam.points = Math.round(submittedExam.points*2)/2;
            SendMail.sendCorrected(submittedExam);
        }

    }
    callback(submittedExam);
};