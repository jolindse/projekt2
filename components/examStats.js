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
    Genererar statistik på provnivå
 */
module.exports.examStats = function(req, callback) {
    var gQuestions = 0;
    var gQuestionsPartial = 0;
    var vgQuestions = 0;
    var vgQuestionsPartial = 0;
    var questionsArray = [];
    var returnObject = {
        success: false,
        error: '',
        exam: 0,
        numStudents: 0,
        numNoResults: 0,
        numIGResults: 0,
        numGResults: 0,
        numVGResults: 0,
        percentageNoResults: 0,
        percentageIGResults: 0,
        percentageGResults: 0,
        percentageVGResults: 0,
        numIGQuestions: 0,
        numGQuestions: 0,
        numGQuestionsPartial: 0,
        numVGQuestions: 0,
        numVGQuestionsPartial: 0,
        percentageIGQuestions: 0,
        percentageGQuestions: 0,
        percentageVGQuestions: 0,
        examTime: [],
        avgExamTime: []
    };
    
    returnObject.exam = req.params.id;
    
    // Hämtar provet
    Exam.findById(req.params.id, function(err, exam) {
        if(err) {error(err, callback, returnObject);}
        else {
            // Hämtar alla prov som lämnats in
            SubmittedExam.getByExam(exam._id, function(err, subExams) {
                if(err){error(err, callback, returnObject);}
                else {
                    returnObject.numStudents = subExams.length;
                    
                    // Kollar graderingen på de inlämnade proven
                    subExams.forEach(function(subExam) {
                        if(subExam.grade === 'IG') {returnObject.numIGResults++;
                        returnObject.percentageIGResults = (returnObject.numIGResults/returnObject.numStudents)*100;}
                        else if(subExam.grade === 'G') {returnObject.numGResults++;
                        returnObject.percentageGResults = (returnObject.numGResults/returnObject.numStudents)*100;}
                        else if(subExam.grade === 'VG') {returnObject.numVGResults++;
                        returnObject.percentageVGResults = (returnObject.numVGResults/returnObject.numStudents)*100;}
                            
                        // Om inte provet är helt rättat
                        else if(!subExam.grade) {returnObject.numNoResults++;
                        returnObject.percentageNoResults = (returnObject.numNoResults/returnObject.numStudents)*100;}
                    });
                    getQuestions(subExams, exam, callback, returnObject);
                }
            });
        }
    });
    
    /*
        Hämtar frågorna som hör till provet
     */
    function getQuestions(subExams, exam, callback, returnObject) {
        subExams.forEach(function(subExam) {
            exam.questions.forEach(function(question){
                Question.getQuestion(question, function(err, currQuestion) {
                    if(err){error(err, callback, returnObject);}
                    else {
                        // Om arrayen innehåller alla frågor så kontrollera svaren
                        if(questionsArray.indexOf(currQuestion)<0) {questionsArray.push(currQuestion);}
                        if(questionsArray.length === exam.questions.length) {checkAnswers(subExams);}
                    }     
                }); 
            });
        });
    }

    /*
        Kontrollerar elevernas svar   
    */
    function checkAnswers(subExams) {
        subExams.forEach(function(subExam) {
           for (var i = 0; i<subExam.answers.length; i++) {
               var subAnswers = subExam.answers[i];
               var numSubAnswersCorrect = 0;
               for (var j = 0; j < subAnswers.length; j++) {
                   if(subAnswers[j].correct) {numSubAnswersCorrect++;}
               }
               
               // Har man svarat helt rätt och frågan är en G
               if(numSubAnswersCorrect === questionsArray[i].answerOptions.length && !questionsArray[i].vgQuestion) {
                   gQuestions++;
                   returnObject.numGQuestions++;
               }
               // Har man svarat delvis rätt och frågan är en G
               else if(numSubAnswersCorrect < questionsArray[i].answerOptions.length && 
                   numSubAnswersCorrect > 0 && !questionsArray.vgQuestion) {
                   gQuestions++;
                   returnObject.numGQuestionsPartial++;
               } 
               // Har man svarat helt rätt och frågan är en VG
               else if(numSubAnswersCorrect === questionsArray[i].answerOptions.length && questionsArray[i].vgQuestion){
                   vgQuestions++;
                   returnObject.numVGQuestions++;
               }
               // Har man svarat delvis rätt och frågan är en VG
               else if(numSubAnswersCorrect < questionsArray[i].answerOptions.length && 
                    numSubAnswersCorrect > 0 && questionsArray[i].vgQuestion) {
                   vgQuestions++;
                   returnObject.numVGQuestionsPartial++;
               }
               // Har man svarat helt fel
               else {returnObject.numIGQuestions++;}
               
               returnObject.percentageGQuestions = (returnObject.numGQuestions/gQuestions)*100;
               returnObject.percentageVGQuestions = (returnObject.numVGQuestions/vgQuestions)*100;
               returnObject.percentageIGQuestions = (returnObject.numIGQuestions/(gQuestions+vgQuestions))*100;
               
               // Om alla frågor är kontrollerade så kolla tiderna
               if(returnObject.numIGQuestions + returnObject.numGQuestions + returnObject.numVGQuestions +
                  returnObject.numGQuestionsPartial + returnObject.numVGQuestionsPartial === questionsArray.length) {
                   examTime(subExams, callback, returnObject);
               }
           }
        });
    }
    
    /*
        Räknar ut hur lång tid eleverna har tagit på sig för att skriva provet
     */
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