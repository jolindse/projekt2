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
            userStats(req);
            break;
        case 'class':
            classStats(req);
            break;
        case 'exam':
            examStats(req);
            break;
    }


    /*
    --------------------------------
            EXAM STATS
    --------------------------------

      Genererar statistik för ett prov

     */
    function examStats(req) {
        var returnObject = {
            numStudents: 0,     // Antal studenter som skrivit provet
            numG: 0,            // Antal studenter som fick G på provet
            percentageG: 0,     // Procent
            numVG: 0,           // Antal studenter som fick VG på provet
            percentageVG: 0,    // Procent
            numIG: 0,           // Antal studenter som fick IG på provet
            percentageIG: 0,    // Procent
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
                // Sätt antal studenter som gjort provet
                returnObject.numStudents = submitted.length;
                submitted.forEach(function(sub) {
                    // Sätt betyget för alla elever som gjort provet
                    if (sub.grade === 'G') {returnObject.numG++;}
                    else if(sub.grade === 'VG') {returnObject.numVG++;}
                    else {returnObject.numIG++;}

                    // Sätt provtider för alla studenter
                    var startTime = moment(sub.startTime).unix();
                    // När ett prov sparas i databasen lagras en timstamp i ObjektId
                    var endTime = moment(sub._id.getTimestamp()).unix();
                    var minutes = (endTime-startTime)/60;
                    var examTimeHours  =  parseInt(minutes/60);
                    var examTimeMinutes = parseInt(minutes - (examTimeHours*60));
                    returnObject.examTime.push({student: sub.student, hours: examTimeHours, minutes: examTimeMinutes});
                });

                // Hur många procent av provresultaten är IG, G eller VG
                returnObject.percentageIG = (returnObject.numIG / returnObject.numStudents) * 100;
                returnObject.percentageG = (returnObject.numG / returnObject.numStudents) * 100;
                returnObject.percentageVG = (returnObject.numVG / returnObject.numStudents) * 100;

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
                                // Hur många frågor är korrekt besvarade med respektive betyg
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
    
    
    /*
    ------------------------------
            Class Stats
    ------------------------------
    
    Genererar statistik för en klass
     */
    
    function classStats(req) {
        var returnObject = {
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
        // Hämta alla elever från klassen
        var classId = req.params.id;
        Class.getClass(classId, function (err, schoolClass){
            if(err) {error(err);}
            else {
                schoolClass.students.forEach(function(student){
                    SubmittedExam.getByStudent(student, function(err, submitted) {
                        if(err){error(err);}
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
    }

    function examTime(schoolClass, returnObject) {
        schoolClass.students.forEach(function(user) {
            User.getUser(user, function(err, student) {
                if(err){error(err);}
                else {
                    SubmittedExam.getByStudent(student._id, function(err, subEx) {
                        if(err){error(err);}
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
                                    console.log(returnObject);
                                    success(returnObject);
                                }
                                
                            });
                            
                        }
                    });
                }
            });
        });
    }
    
   /*
   ---------------------------------
            User stats
   ---------------------------------
    
    Genererar statistik för en elev
    */
    
    function userStats(req) {
        var userId = req.params.id;
        var returnObject = {
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
        
        // Hämtar alla prov studenten har gjort
        // Räknar ut betygsprocent och genomsnittlig provtid
        SubmittedExam.getByStudent(userId, function(err, subExams) {
            if(err) {error(err);}
            returnObject.numExams = subExams.length;
            subExams.forEach(function(subEx) {
                if(subEx.grade === 'IG') {returnObject.numIGExams++;}
                else if(subEx.grade === 'G') {returnObject.numGExams++;}
                else if(subEx.grade === 'VG') {returnObject.numVGExams++;}
                var startTime = moment(subEx.startTime).unix();
                var endTime = moment(subEx._id.getTimestamp()).unix();
                var minutes = (endTime-startTime)/60;
                var examTimeHours  =  parseInt(minutes/60);
                var examTimeMinutes = parseInt(minutes - (examTimeHours*60));
                returnObject.examTime.push({exam: subEx.exam, hours: examTimeHours, minutes: examTimeMinutes});
                if(returnObject.examTime.length === returnObject.numExams) {
                    var hours = 0;
                    var minutes = 0;
                    returnObject.examTime.forEach(function(examTime) {
                        hours += examTime.hours;
                        minutes += examTime.minutes;
                    });
                    returnObject.avgExamTime.push({hours: hours/returnObject.examTime.length, minutes: parseInt(minutes/returnObject.examTime.length)});
                }
            });
            returnObject.percentageIGExams = (returnObject.numIGExams/returnObject.numExams)*100;
            returnObject.percentageGExams = (returnObject.numGExams/returnObject.numExams)*100;
            returnObject.percentageVGExams = (returnObject.numVGExams/returnObject.numExams)*100;
            success(returnObject);
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