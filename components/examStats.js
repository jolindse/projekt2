/**
 * Created by Mattias on 2016-05-07.
 */

var User = require('../models/User');
var Class = require('../models/Class');
var Exam = require('../models/Exam');
var SubmittedExam = require('../models/SubmittedExam');
var Question = require('../models/Question');
var moment = require('moment');

module.exports.examStats = function(req, callback) {
    var gQuestions = 0;
    var vgQuestions = 0;
    var questionsArray = [];
    var returnObject = {
        success: false,
        error: '',
        exam: 0,
        numStudents: 0,
        numIGResults: 0,
        numGResults: 0,
        numVGResults: 0,
        percentageIGResults: 0,
        percentageGResults: 0,
        percentageVGResults: 0,
        numIGQuestions: 0,
        numGQuestions: 0,
        numVGQuestions: 0,
        percentageGQuestions: 0,
        percentageVGQuestions: 0,
        examTime: [],
        avgExamTime: []
    };
    Exam.findById(req.params.id, function (err, exam) {
        if (err) {
            error(err, callback, returnObject);
        }
        else {
            SubmittedExam.getByExam(exam._id, function (err, subExams) {
                if (err) {
                    error(err, callback, returnObject);
                }
                else {
                    returnObject.exam = exam._id;
                    returnObject.numStudents = subExams.length;
                    subExams.forEach(function (sub) {
                        if (sub.grade === 'IG') {
                            returnObject.numIGResults++;
                            returnObject.percentageIGResults = (returnObject.numIGResults / returnObject.numStudents) * 100;
                        } else if (sub.grade === 'G') {
                            returnObject.numGResults++;
                            returnObject.percentageGResults = (returnObject.numGResults / returnObject.numStudents) * 100;
                        } else if (sub.grade === 'VG') {
                            returnObject.numVGResults++;
                            returnObject.percentageVGResults = (returnObject.numVGResults / returnObject.numStudents) * 100;
                        }
                    });
                    getQuestions(subExams, callback, returnObject);
                }
            });
        }
    });

    function getQuestions(subExams, callback, returnObject) {
        subExams.forEach(function(subExam) {
           Exam.getExam(subExam.exam, function(err, exam) {
               if(err){error(err, callback, returnObject);}
               else {
                    exam.questions.forEach(function(question) {
                        Question.getQuestion(question, function(err, q) {
                            if(err){error(err, callback, returnObject);}
                            else {
                                if (questionsArray.indexOf(question) < 0) {
                                    questionsArray.push(q)
                                }
                                if (questionsArray.length === exam.questions.length) {
                                    checkAnswers(subExams);
                                }
                            }
                        });
                    });
               }
           });
       });
    }
    
    function checkAnswers(subExams) {
        subExams.forEach(function(sub) {
            for(var i = 0; i < sub.answers.length; i++) {
                if (questionsArray[i].vgQuestion === false) {
                    gQuestions++;
                    if(sub.answers[i].correct === true) {
                        returnObject.numGQuestions++;
                        returnObject.percentageGQuestions = ((returnObject.numGQuestions*returnObject.numStudents) / (gQuestions*returnObject.numStudents))*100;
                    } else {returnObject.numIGQuestions++;}
                } else if(questionsArray[i].vgQuestion === true) {
                    vgQuestions++;
                    if(sub.answers[i].correct === true) {
                        returnObject.numVGQuestions++;
                        returnObject.percentageVGQuestions = ((returnObject.numVGQuestions*returnObject.numStudents) / (vgQuestions*returnObject.numStudents))*100;
                    } else {returnObject.numIGQuestions++;}
                }
                if(returnObject.numIGQuestions + returnObject.numGQuestions + returnObject.numVGQuestions === questionsArray.length*returnObject.numStudents) {
                    examTime(subExams, callback, returnObject);
                }
            }
        });
    }
    
    function examTime(subExams, callback, returnObject) {
        subExams.forEach(function(subExam) {
            var startTime = moment(subExam.startTime).unix();
            var endTime = moment(subExam._id.getTimestamp()).unix();
            var minutes = (endTime - startTime) / 60;
            var examTimeHours = parseInt(minutes/60);
            var examTimeMinutes = parseInt(minutes-examTimeHours*60);
            returnObject.examTime.push({student: subExam.student, hours: examTimeHours, minutes: examTimeMinutes});
        });
        var hours = 0;
        var minutes = 0;
        returnObject.examTime.forEach(function(exTime) {
            hours += exTime.hours;
            minutes += exTime.minutes;
        });
        returnObject.avgExamTime.push({hours: hours/returnObject.numStudents, minutes: minutes/returnObject.numStudents});
        success(callback, returnObject);
    }
    
    function success(callback, returnObject) {
        returnObject.success = true;
        callback(returnObject);
    }

    function error(err, callback, returnObject) {
        returnObject.success = false;
        returnObject.error = err;
        callback(returnObject);
    }
};