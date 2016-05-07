/**
 * Created by Mattias on 2016-05-07.
 */
var User = require('../models/User');
var Class = require('../models/Class');
var Exam = require('../models/Exam');
var SubmittedExam = require('../models/SubmittedExam');
var Question = require('../models/Question');
var moment = require('moment');


module.exports.classStats = function(req, callback) {
    var studentArray = [];
    var returnObject = {
        success: false,
        error: '',
        numStudents: 0,
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

    Class.getClass(req.params.id, function(err, schoolClass) {
       
        // Hämta alla elever från klassen
        var classId = req.params.id;
        Class.getClass(classId, function (err, schoolClass){
            if(err) {error(err);}
            else {
                returnObject.numStudents = schoolClass.students.length;
                schoolClass.students.forEach(function(student){
                    SubmittedExam.getByStudent(student, function(err, submitted) {
                        if(err){error(err, callback, returnObject);}
                        else {
                            submitted.forEach(function(subEx) {
                                returnObject.numExams++;
                                if(subEx.grade === 'IG') {
                                    returnObject.numIGExams++;
                                } else if(subEx.grade === 'G') {
                                    returnObject.numGExams++;
                                } else if(subEx.grade === 'VG') {
                                    returnObject.numVGExams++;
                                }
                            });
                            returnObject.percentageIGExams = (returnObject.numIGExams/returnObject.numExams)*100;
                            returnObject.percentageGExams = (returnObject.numGExams/returnObject.numExams)*100;
                            returnObject.percentageVGExams = (returnObject.numVGExams/returnObject.numExams)*100;
                            examTime(schoolClass, returnObject);
                        }
                    });
                });
            }
        });
    });

    function examTime(schoolClass, returnObject) {
        schoolClass.students.forEach(function(user) {
            User.getUser(user, function(err, student) {
                if(err){error(err, callback, returnObject);}
                else {
                    SubmittedExam.getByStudent(student._id, function(err, subEx) {
                        if(err){error(err, callback, returnObject);}
                        else {
                            subEx.forEach(function(submitted) {
                                var startTime = moment(submitted.startTime).unix();
                                var endTime = moment(submitted._id.getTimestamp()).unix();
                                var minutes = (endTime-startTime)/60;
                                var examTimeHours  =  parseInt(minutes/60);
                                var examTimeMinutes = parseInt(minutes - (examTimeHours*60));
                                returnObject.examTime.push({student: submitted.student, hours: examTimeHours, minutes: examTimeMinutes});
                                if(returnObject.examTime.length === returnObject.numExams) {
                                    var hours = 0;
                                    var minutes = 0;
                                    returnObject.examTime.forEach(function(examTime) {
                                        hours += examTime.hours;
                                        minutes += examTime.minutes;
                                    });
                                    returnObject.avgExamTime.push({hours: hours/returnObject.examTime.length, minutes: parseInt(minutes/returnObject.examTime.length)});
                                    success(callback, returnObject);
                                }
                            });
                        }
                    });
                }
            });
        });
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