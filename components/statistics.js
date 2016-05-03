/**
 * Created by Mattias on 2016-05-02.
 */

// Models import
var User = require('../models/User');
var Class = require('../models/Class');
var Exam = require('../models/Exam');
var SubmittedExam = require('../models/SubmittedExam');
var Question = require('../models/Question');
var moment = require('moment');



module.exports.statistics = function(req, callback) {
    switch (req.params.scope) {
        case 'user':
            break;
        case 'class':
            break;
        case 'exam':
            examStats(req, callback);
            break;
    }


    /*
    --------------------------------
            EXAM STATS
    --------------------------------

      Genererar statistik för ett prov

     */
    function examStats(req) {
        var submittedTime = [];
        var returnObject = {
            numStudents: 0,     // Antal studenter som skrivit provet
            numG: 0,            // Antal studenter som fick G på provet
            numVG: 0,           // Antal studenter som fick VG på provet
            numIG: 0,           // Antal studenter som fick IG på provet
            numGQuestions: 0,   // Antal rättsvarade frågor med betyget G
            numVGQuestions: 0,  // Antal rättsvarade frågor med betyget VG
            examTime: [],       // Hur lång tid har varje student tagit på sig att skriva provet
            avgExamTime: []     // Genomsnittlig provtid
        };

        // Hämtar valt prov från databasen
        var examId = req.params.id;
        SubmittedExam.getByExam(examId, function(err, submitted) {
            if (err) {
                error(err, returnObject);
            } else {
                returnObject.numStudents = submitted.length;
                submitted.forEach(function(sub) {
                    if (sub.grade === 'G') {returnObject.numG++;}
                    else if(sub.grade === 'VG') {returnObject.numVG++;}
                    else {returnObject.numIG++;}
                    var startTime = moment(sub.startTime).unix();
                    // När ett prov sparas i databasen lagras en timstamp i ObjektId
                    var endTime = moment(sub._id.getTimestamp()).unix();
                    var minutes = (endTime-startTime)/60;
                    var examTimeHours  =  parseInt(minutes/60);
                    var examTimeMinutes = parseInt(minutes - (examTimeHours*60));
                    returnObject.examTime.push({student: sub.student, hours: examTimeHours, minutes: examTimeMinutes});
                });

                // Räkna ut den genomsnittliga tiden
                var hours = 0;
                var minutes = 0;
                returnObject.examTime.forEach(function(examTime) {
                    hours += examTime.hours;
                    minutes += examTime.minutes;
                });
                returnObject.avgExamTime.push({hours: hours/returnObject.examTime.length, minutes: parseInt(minutes/returnObject.examTime.length)});
                getQuestions(examId, returnObject);
            }
        });
    }

    /** Hämtar varje fråga som ingår i provet
     *
     * @param examId
     * @param returnObject
     */
    function getQuestions(examId, returnObject) {
        var questionsArray = [];
        SubmittedExam.getByExam(examId, function(err, subExam) {
            if(err){error(err);}
            else{
                Exam.getExam(examId, function(err, exam) {
                    if(err){error(err);}
                    else {
                        exam.questions.forEach(function(question) {
                            questionsArray.push(question);
                            if(questionsArray.length === exam.questions.length) {getAnswersGrade(examId, questionsArray, returnObject);}
                        });
                    }
                });
            }
        });
    }

    /** Kollar om svaren är rätt och vilket betyg de är värda
     *
     * @param examId
     * @param questionsArray
     * @param returnObject
     */
    function getAnswersGrade(examId, questionsArray, returnObject) {
        SubmittedExam.getByExam(examId, function(err, subExams) {
            if(err){error(err, returnObject);}
            else {
                subExams.forEach(function(subExam) {
                    for (var i = 0; i < subExam.answers.length-1; i++) {
                        Question.getQuestion(questionsArray[i].id, function(err, question) {
                            if(err){error(err, returnObject);}
                            else {
                                if (subExam.answers[i].correct === true && question.vgQuestion === true) {
                                    returnObject.numVGQuestions++;
                                } else if (subExam.answers[i].correct === true && question.vgQuestion === false) {
                                    returnObject.numGQuestions++;
                                }
                                if (returnObject.numGQuestions + returnObject.numVGQuestions === questionsArray.length) {
                                    success(returnObject);
                                }
                            }
                        });
                    }
                });
            }
        });
    }
    
   
    
   


    function error(err, returnObject) {
        returnObject.success = false;
        returnObject.error = err;
        callback(returnObject);
    }

    function success(returnObject) {
        returnObject.success = true;
        callback(returnObject);
    }
};