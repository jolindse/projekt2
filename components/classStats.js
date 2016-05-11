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
    var schoolClassId;
    var submittedArray = [];
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
        if(err){error(err, callback, returnObject);}
        else{
            var classId = schoolClass._id;
            returnObject.numStudents = schoolClass.students.length;
            for(var i = 0; i<schoolClass.students.length; i++) {
                studentArray.push(schoolClass.students[i]);
            }
            for(var i = 0; i<studentArray.length; i++) {
                SubmittedExam.getByStudent(studentArray[i], function(err, submitted) {
                    if(err){error(err, callback, returnObject);}
                    else {
                        if (submittedArray.length === returnObject.numStudents) {
                            getExamTimes(submittedArray);
                        } else {
                            for (var j = 0; j < submitted.length; j++) {
                                submittedArray.push(submitted[j]);
                                returnObject.numExams++;
                                if(submitted[j].grade === 'IG'){returnObject.numIGExams++;
                                    returnObject.percentageIGExams = (returnObject.numIGExams/returnObject.numExams)*100;}
                                else if(submitted[j].grade === 'G'){returnObject.numGExams++;
                                    returnObject.percentageGExams = (returnObject.numGExams/returnObject.numExams)*100;}
                                else if(submitted[j].grade === 'VG'){returnObject.numVGExams++;
                                    returnObject.percentageVGExams = (returnObject.numVGExams/returnObject.numExams)*100;}
                                if (submitted.length<returnObject.numStudents) {
                                    submittedArray.push('');
                                }
                            }
                        }
                    }
                });
            }
        }
    });
   
    function getExamTimes(submittedArray) {
        var totalTimeMinutes = 0;
        submittedArray.forEach(function(submittedExam) {
            if(submittedExam.startTime) {
                var startTime = moment(submittedExam.startTime).unix();
                var endTime = moment(submittedExam._id.getTimestamp()).unix();
                var minutes = (endTime - startTime)/60;
                totalTimeMinutes += minutes;
                var examTimeHours = parseInt(minutes/60);
                var examTimeMinutes = parseInt(minutes-(examTimeHours*60));
                returnObject.examTime.push({
                    student: submittedExam.student,
                    exam: submittedExam.exam,
                    hours: examTimeHours,
                    minutes: examTimeMinutes
                });
            }
        });
        var totalTimeMinutes = totalTimeMinutes/returnObject.numExams;
        var avgHours = parseInt(totalTimeMinutes/60);
        var avgMinutes = parseInt(totalTimeMinutes-(avgHours*60));
        returnObject.avgExamTime.push({
            hours: avgHours,
            minutes: avgMinutes
        });
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