/**
 * Created by Mattias on 2016-05-02.
 */

// Models import
var User = require('../models/User');
var Class = require('../models/Class');
var Exam = require('../models/Exam');
var SubmittedExam = require('../models/SubmittedExam');
var Question = require('../models/Question');



module.exports.statistics = function(req, callback) {
    switch (req.params.scope) {
        case 'user':
            var questionG = 0;
            var questionStudentG = 0;
            var questionVG = 0;
            var questionStudentVG = 0;
            var subExams = [];
            var returnObject = {
                success: "",
                error: "",
                user: "",
                numExams: 0,
                numGExams: 0,
                percentageGExams: 0,
                numVGExams: 0,
                percentageVGExams: 0,
                numGQuestions: 0,
                percentageGQuestions: 0,
                numVGQuestions: 0,
                percentageVGQuestions: 0,
                testTime: []
            };
            var id = req.params.id;
            User.getUser(id, function (err, user) {
                if (err) {
                    returnObject.success = false;
                    returnObject.error = err;
                    callback(returnObject);
                } else {
                    returnObject.success = true;
                    returnObject.user = user;
                    SubmittedExam.getByStudent(id, function (err, exams) {
                        subExams = exams;
                        returnObject.numExams = subExams.length;
                        subExams.forEach(function (exam) {
                            if (exam.grade === 'G') {
                                returnObject.numGExams ++;
                            } else if(exam.grade === 'VG') {
                                returnObject.numVGExams ++;
                            }
                            Exam.getExam(exam.exam, function (err, orgExam) {
                                if (err) {
                                    returnObject.success = false;
                                    returnObject.error = err;
                                    callback(returnObject);
                                } else {
                                    returnObject.testTime.push({
                                        exam: orgExam._id,
                                        examStart: orgExam.interval[0],
                                        examEnd: orgExam.interval[1],
                                        submitTime: exam._id.getTimestamp(),
                                    });
                                    if (returnObject.testTime.length === subExams.length) {
                                        orgExam.questions.forEach(function(question) {
                                            Question.getQuestion(question.id, function(err, q) {
                                                if (err) {
                                                    returnObject.success = false;
                                                    returnObject.error = err;
                                                    callback(returnObject);
                                                } else {
                                                    if (q.vgQuestion === true) {
                                                        questionVG++;
                                                        
                                                    } else {
                                                        questionG++;
                                                    }
                                                    if (questionVG + questionG === orgExam.questions.length) {

                                                        returnObject.percentageGExams = ((returnObject.numGExams / returnObject.numExams)*100);
                                                        returnObject.percentageVGExams = ((returnObject.numVGExams / returnObject.numExams)*100);
                                                        callback(returnObject);
                                                    }
                                                }
                                            });
                                        });
                                    }
                                }
                            });
                        });
                    });
                }
            });
            break;
        case 'class':
            
            
            
        
    }
}