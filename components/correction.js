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
    var grade = '';

    // Find the exam
    SubmittedExam.findOne(
        {_id: id},
        function (err, exam) {
            if (err) {
                console.log('setExamCorrected error');
            } else {
                var correctedArray = [];
                var corrected = 0;
                var numAnswers = exam.answers.length;
                for (var i = 0; i < exam.answers.length; i++) {
                    var subAnswers = exam.answers[i];
                    for (var j = 0; j < subAnswers.length; j++) {
                        if (subAnswers[j].corrected) {
                            console.log('pushar true');
                            correctedArray.push('true');
                        } else {
                            console.log('Pushar false');
                            correctedArray.push('false');
                        }
                    }
                }
            }

            if (correctedArray.indexOf('false') < 0) {
                console.log('complete correction');
                SubmittedExam.getSubmitted(id, function(err, subExam) {
                   var exam = subExam.exam;
                    console.log('subexam points: ' + exam.points);
                    Exam.getExam(exam,function(err, exam) {
                        var maxPoints = exam.maxPoints;
                        console.log('Maxpoints: ' + maxPoints);
                        if((subExam.points/maxPoints)*100 < exam.gradePercentage[0]) {
                            grade = 'IG';
                        } else if((subExam.points/maxPoints)*100 >= exam.gradePercentage[0] && (subExam.points/maxPoints)*100<exam.gradePercentage[1]) {
                            grade = 'G';
                        } else {
                            grade = 'VG';
                        }
                        subExam.points = Math.round(subExam.points*2)/2;
                        SendMail.sendCorrected(subExam);
                        SubmittedExam.findOneAndUpdate(
                            {_id: id},
                            {$set: {completeCorrection: true,
                                    grade: grade}},
                            callback
                        );
                    });
                });
               
            } else {
                SubmittedExam.findOneAndUpdate(
                    {_id: id},
                    {$set: {completeCorrection: false}},
                    callback
                );
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
    var submittedExam = null;
    //var questionsId = []; // The _id's of questions in exam
    var questions = []; // The questions in exam
    var orgExam = null; // The exam which is taken by student
    var counter = "";

    // Fetch the submitted exam
    SubmittedExam.getSubmitted(id, function (err, data) {
        if (err) {
            //console.log('getSubmitted ' + id);
        }
        else {
            submittedExam = data;
            if (!submittedExam.points) {
                submittedExam.points = 0;
            }
            subExam = submittedExam.exam;
            // Fetch the exam
            Exam.getExam(subExam, function (err, exam) {
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
            function finish(question, index) {
                questions[index] = question;
                counter--;
                //console.log('Finish counter: ' + counter); // TEST
                if (counter === 0) {
                    for (var qI = 0; qI < questions.length; qI++) {
                        //console.log('QUESTIONS TO SEND NR ' + qI + ' type: ' + questions[qI].type); // TEST
                    }
                    //console.log('BEFORE NEXT PART:\n\nQUESTIONS:\n'+JSON.stringify(questions, null, 2)+'\n\nSUBEXAM:\n'+JSON.stringify(subExam,null,2)+'\n\nORGEXAM:\n'+JSON.stringify(orgExam,null,2)); // TEST
                    callback(questions, submittedExam, orgExam);
                }
            }
        }
    });

    /** Autocorrect a submitted exam
     *
     * @param question
     * @param submittedExam
     * @param callback
     */
    module.exports.autoCorrect = function (question, submittedExam, orgExam, callback) {
        var maxPoints = orgExam.maxPoints;
        var subAnswer = "";
        var subAnswers = "";
        var type; // Type of question; radiobuttons, checkboxes or rank
        if (submittedExam.completeCorrection != true) {
            for (var i = 0; i < question.length; i++) {
                type = question[i].type;

                // Single type
                if (type === 'single') {
                    subAnswer = submittedExam.answers[i];
                    if (!subAnswer[0].corrected) {
                        for (var j = 0; j < question[i].answerOptions.length; j++) {
                            if (subAnswer[0].text === question[i].answerOptions[j].text && question[i].answerOptions[j].correct) {
                                subAnswer[0].correct = true;
                                subAnswer[0].corrected = true;
                                subAnswer[0].points = question[i].points;
                                submittedExam.points += subAnswer[0].points;
                                break;
                            } else {
                                subAnswer[0].correct = false;
                                subAnswer[0].corrected = true;
                                subAnswer[0].points = 0;
                            }
                        }
                    }
                }

                // Multi type
                else if (type === 'multi') {
                    subAnswers = submittedExam.answers[i];
                    var correctArray = [];
                    question[i].answerOptions.forEach(function (answerOption) {
                        if (answerOption.correct) {
                            if (correctArray.indexOf(answerOption.text < 0)) {
                                correctArray.push(answerOption.text);
                            }
                        }
                    });
                    var pointsPerQ = question[i].points / correctArray.length;
                    var numCorr = 0;
                    var numFault = 0;
                    var corrAns = [];
                    for (var j = 0; j < subAnswers.length; j++) {
                        if (!subAnswers[j].corrected) {
                            if (correctArray.indexOf(subAnswers[j].text) > -1) {
                                subAnswers[j].corrected = true;
                                subAnswers[j].correct = true;
                                corrAns.push(j);
                                numCorr++;
                            } else {
                                subAnswers[j].corrected = true;
                                subAnswers[j].correct = false;
                                numFault++;
                                subAnswers[j].points = 0;
                            }
                        }
                    }
                    var pointsAwarded = ((numCorr - numFault) * pointsPerQ) / numCorr;
                    var pointsRounded = Math.round(pointsAwarded * 2) / 2;
                    corrAns.forEach(function (currIndex) {
                        subAnswers[currIndex].points = pointsRounded;
                        submittedExam.points += pointsRounded;
                    });
                }

                // Rank type
                else if (type === 'rank') {
                    subAnswers = submittedExam.answers[i];
                    for (var j = 0; j < subAnswers.length; j++) {
                        if (!subAnswers[j].corrected) {
                            // Set the student's answer as corrected
                            subAnswers[j].corrected = true;
                            if (subAnswers[j].text === question[i].answerOptions[j].text) {
                                subAnswers[j].correct = true;
                                subAnswers[j].points = (question[i].points / question[i].answerOptions.length);
                                submittedExam.points += subAnswers[j].points;
                            } else {
                                subAnswers[j].correct = false;
                                subAnswers[j].points = 0;
                            }
                        }
                    }
                }

                // Text type
                else if (type === 'text') {
                    subAnswers = submittedExam.answers[i];
                    if (subAnswers[0].corrected && subAnswers[0].correct) {
                        //subAnswers[0].points = question[i].points;
                        submittedExam.points += subAnswers[0].points;
                    }
                }
                if (submittedExam.points < 0) {
                    submittedExam.points = 0;
                }
            }
        }
        callback(submittedExam);
    };

};