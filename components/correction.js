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
module.exports.setExamCorrected = function (id, callback) {
    console.log('IN setExamCorrected'); // TEST
    // Find the exam
    SubmittedExam.findOne(
        {_id: id},
        function (err, exam) {
            if (err) {
                console.log(err);
            } else {
                var numAnswers = exam.answers.length;
                var corrected = 0;
                exam.answers.forEach(function (answer) {
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

 * @param callback
 */
module.exports.getSubmittedAndCorrectAnswers = function (id, callback) {
    var subExam = null; // The _id of the exam that is submitted
    var questions = []; // The questions in exam
    var orgExam = null; // The exam which is taken by student
    var counter = "";

    console.log('IN getSubmittedAndCorrectAnswers'); // TEST
    // Fetch the submitted exam
    SubmittedExam.getSubmitted(id, function (err, submittedExam) {
        if (err) {
            console.log(err);
        }
        else {
            if (!submittedExam.points) {
                submittedExam.points = 0;
            }
            subExam = submittedExam;
            var sExam = submittedExam.exam;
        }
        // Fetch the exam
        Exam.getExam(sExam, function (err, exam) {
            orgExam = exam;
            //console.log('EXAM GOTTEN: ' + JSON.stringify(exam, null, 2)); // TEST
            counter = exam.questions.length;
            exam.questions.forEach(function (id) {
                // Fetch the questions in exam
                Question.getQuestion(id, function (err, question) {
                    //console.log('GET QUESTIONS: Got question with id: ' + question._id + ' and type: ' + question.type); // TEST
                    var currQuestId = question._id;
                    //console.log('CurrQuestID: '+currQuestId); // TEST
                    var currIndex = exam.questions.indexOf(currQuestId);
                    //console.log('question ' + question._id + ' has index: ' + currIndex); // TEST
                    finish(question, currIndex);
                });
            });
        });
    });
    function finish(question, index) {
        questions[index] = question;
        counter--;
        //console.log('Finish counter: ' + counter); // TEST
        if (counter === 0) {
            for (var qI = 0; qI < questions.length; qI++) {
                console.log('QUESTIONS TO SEND NR ' + qI + ' type: ' + questions[qI].type); // TEST
            }
            //console.log('BEFORE NEXT PART:\n\nQUESTIONS:\n'+JSON.stringify(questions, null, 2)+'\n\nSUBEXAM:\n'+JSON.stringify(subExam,null,2)+'\n\nORGEXAM:\n'+JSON.stringify(orgExam,null,2)); // TEST
            callback(questions, subExam, orgExam);
        }
    };

};

/** Autocorrect a submitted exam
 *
 * @param question
 * @param submittedExam
 * @param callback
 */
module.exports.autoCorrect = function (question, submittedExam, orgExam, callback) {
    console.log('IN autoCorrect'); // TEST
    var maxPoints = orgExam.maxPoints;
    var type; // Type of question; radiobuttons, checkboxes or rank
    if (submittedExam.completeCorrection != true) {
        for (var i = 0; i < question.length; i++) {
            type = question[i].type;

            // Single type
            if (type === 'single') {
                var subAnswer = submittedExam.answers[i];
                // console.log('Current answer is single (Question ' + i + ') : QUESTION: ' + JSON.stringify(question[i], null, 2) + ' \nANSWER: ' + JSON.stringify(subAnswer, null, 2) + '\n\n'); // TEST
                if (!subAnswer[0].corrected) {
                    for (var j = 0; j < question[i].answerOptions.length; j++) {
                        if (subAnswer[0].text === question[i].answerOptions[j].text && question[i].answerOptions[j].correct) {
                            //console.log('Question ' + i + ' Subanswer ' + JSON.stringify(subAnswer[0], null, 2) + ' is correct' + '\n\n'); // TEST
                            subAnswer[0].correct = true;
                            subAnswer[0].corrected = true;
                            subAnswer[0].points = question[i].points;
                            submittedExam.points += subAnswer[0].points;
                            break;
                        } else {
                            //console.log('Question ' + i + 'Subanswer ' + JSON.stringify(subAnswer[0], null, 2) + ' is faulty' + '\n\n'); // TEST
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
                var correctArray = [];
                //console.log('Current answer is multi (Question ' + i + ') : QUESTION: ' + JSON.stringify(question[i], null, 2) + ' \nANSWER: ' + JSON.stringify(subAnswers, null, 2) + '\n\n'); // TEST
                question[i].answerOptions.forEach(function (answerOption) {
                    if (answerOption.correct) {
                        if (correctArray.indexOf(answerOption.text < 0)) {
                            correctArray.push(answerOption.text);
                        }
                    }
                });
                for (var j = 0; j < subAnswers.length; j++) {
                    if (!subAnswers[j].corrected) {
                        if (correctArray.indexOf(subAnswers[j].text) > -1) {
                            //console.log('Question ' + i + ' Subanswer ' + JSON.stringify(subAnswers[j], null, 2) + ' is correct' + '\n\n'); // TEST
                            subAnswers[j].corrected = true;
                            subAnswers[j].correct = true;
                            subAnswers[j].points = (question[i].points / correctArray.length);
                            submittedExam.points += subAnswers[j].points;
                        } else {
                            //console.log('Question ' + i + 'Subanswer ' + JSON.stringify(subAnswers[j], null, 2) + ' is faulty' + '\n\n'); // TEST
                            subAnswers[j].corrected = true;
                            subAnswers[j].correct = false;
                            subAnswers[j].points = 0;
                        }
                    }
                }
            }

            // Rank type
            else if (type === 'rank') {
                var subAnswers = submittedExam.answers[i];
                //console.log('Current answer is rank (Question ' + i + ') : QUESTION: ' + JSON.stringify(question[i], null, 2) + ' \nANSWER: ' + JSON.stringify(subAnswers, null, 2) + '\n\n'); // TEST
                for (var j = 0; j < subAnswers.length; j++) {
                    if (!subAnswers[j].corrected) {
                        //console.log('Rank itteration: ' + j + ' length: ' + subAnswers.length); // TEST
                        // Set the student's answer as corrected
                        subAnswers[j].corrected = true;
                        if (subAnswers[j].text === question[i].answerOptions[j].text) {
                            //console.log('Question ' + i + ' Subanswer ' + JSON.stringify(subAnswers[j], null, 2) + ' is correct' + '\n\n'); // TEST
                            subAnswers[j].correct = true;
                            subAnswers[j].points = (question[i].points / question[i].answerOptions.length);
                            submittedExam.points += subAnswers[j].points;
                        } else {
                            //console.log('Question ' + i + 'Subanswer ' + JSON.stringify(subAnswers[j], null, 2) + ' is faulty' + '\n\n'); // TEST
                            subAnswers[j].correct = false;
                            subAnswers[j].points = 0;
                        }
                    }
                }
            }

            else if (type === 'text') {
                var subAnswers = submittedExam.answers[i];
                //console.log('Current answer is text (Question ' + i + ') : QUESTION: ' + JSON.stringify(question[i], null, 2) + ' \nANSWER: ' + JSON.stringify(subAnswers, null, 2) + '\n\n'); // TEST
            }
        }

        // Check if all answers are corrected
        var numAnswers = submittedExam.answers.length;
        var numSubCorrected = 0;
        var numTotCorrected = 0;
        submittedExam.answers.forEach(function (answer) {
            var subAnswers = answer;
            subAnswers.forEach(function (sub) {
                if (sub.corrected) {
                    numSubCorrected++;
                }
                if (numSubCorrected === subAnswers.length) {
                    numTotCorrected++;
                }
            });
        });

        if (numAnswers == numTotCorrected) {
            submittedExam.completeCorrection = true;

            //submittedExam.points = totalPoints;
            if ((submittedExam.points / maxPoints) * 100 < orgExam.gradePercentage[0]) {
                submittedExam.grade = "IG";
            } else if ((submittedExam.points / maxPoints) * 100 >= orgExam.gradePercentage[0] && (submittedExam.points / maxPoints) * 100 < orgExam.gradePercentage[1]) {
                submittedExam.grade = "G";
            } else {
                submittedExam.grade = "VG";
            }
            submittedExam.points = Math.round(submittedExam.points * 2) / 2;
            SendMail.sendCorrected(submittedExam);
        }

    }
    callback(submittedExam);
};