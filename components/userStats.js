/**
 * Created by Mattias on 2016-05-07.
 */

var User = require('../models/User');
var Class = require('../models/Class');
var Exam = require('../models/Exam');
var SubmittedExam = require('../models/SubmittedExam');
var Question = require('../models/Question');
var moment = require('moment');

/*
    Genererar statistik på elev-nivå
 */
module.exports.userStats = function(req, callback) {
    var totalQuestions;
    var gQuestions = 0;
    var vgQuestions = 0;
    var questionsArray = [];
    var examsArray = [];
    var returnObject = {
        success: false,
        error: '',
        user: 0,
        numExams: 0,
        numIGExams: 0,
        numGExams: 0,
        numVGExams: 0,
        percentageIGExams: 0,
        percentageGExams: 0,
        percentageVGExams: 0,
        examTime: [],
        avgExamTime: []
    };
    
    returnObject.user = req.params.id;
    
    // Hämtar alla prov eleven har lämnat in
    SubmittedExam.getByStudent(req.params.id, function(err, subExams) {
        if(err){error(err, callback, returnObject);}
        else {
            returnObject.numExams = subExams.length;
            subExams.forEach(function (subExam) {
                // Kontrollerar betygen på proven
                if (subExam.grade === 'IG') {
                    returnObject.numIGExams++;
                }
                else if (subExam.grade === 'G') {
                    returnObject.numGExams++;
                }
                else if (subExam.grade === 'VG') {
                    returnObject.numVGExams++;
                }
                returnObject.percentageIGExams = (returnObject.numIGExams / returnObject.numExams) * 100;
                returnObject.percentageGExams = (returnObject.numGExams / returnObject.numExams) * 100;
                returnObject.percentageVGExams = (returnObject.numVGExams / returnObject.numExams) * 100;
            });
            getExamTime(subExams);
        }
    });
    
    // Kollar alla privtider
    function getExamTime(subExams) {
        subExams.forEach(function(subExam) {
            var startTime = moment(subExam.startTime).unix();
            var endTime = moment(subExam._id.getTimestamp()).unix();
            var minutes = (endTime - startTime) / 60;
            var examTimeHours = parseInt(minutes/60);
            var examTimeMinutes = parseInt(minutes-examTimeHours*60);
            returnObject.examTime.push({exam: subExam.exam, hours: examTimeHours, minutes: examTimeMinutes});
        });
        var hours = 0;
        var minutes = 0;
        returnObject.examTime.forEach(function(exTime) {
            hours += exTime.hours;
            minutes += exTime.minutes;
        });
        returnObject.avgExamTime.push({hours: hours/subExams.length, minutes: minutes/subExams.length});
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