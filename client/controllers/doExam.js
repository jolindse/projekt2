/**
 * Created by Johan on 2016-05-01.
 */
myApp.controller('doExamCtrl',['$scope','userService','ExamManager','SubmittedManager','QuestionManager', function($scope,userService,ExamManager,SubmittedManager,QuestionManager){

    $scope.qIndex = 0;
    $scope.hasNextQ = true;
    $scope.hasPreviousQ = false;

    /*
    FUNCTIONS
     */

    $scope.getExam = function(id, callback){
        ExamManager.getExam(id, function(data){
            $scope.currExam = data;
            $scope.currExam.questions.forEach(function(currQId){
                QuestionManager.getQuestion(currQId, function(data){
                    $scope.questions.push(data);
                });
            });
        });
    };

    $scope.submitAnswer = function() {
        

        currSubmitted.answers[$scope.qIndex] = {
        }
    }

    $scope.checkboxChange = function (index) {
        /*if ($scope.currQuestion.type === 'single') {
            for (var i = 0; i < $scope.question.answerOptions.length; i++) {
                if (i !== index) {
                    $scope.question.answerOptions[i].correct = false;
                }
            }
        }*/
    };

    $scope.setNextPrev = function(){
        if ($scope.qIndex === $scope.questions.length-1){
            $scope.hasNextQ = false;
        } else {
            $scope.hasNextQ = true;
        }

        if ($scope.qIndex === 0){
            $scope.hasPreviousQ = false;
        } else {
            $scope.hasPreviousQ = true;
        }
    };

    $scope.nextQuestion = function(){
        if ($scope.qIndex < $scope.questions.length){
            $scope.qIndex++;
            $scope.currQuestion = $scope.questions[$scope.qIndex];
            $scope.setNextPrev();
        }
    };

    $scope.previousQuestion = function() {
        if ($scope.qIndex >= 0){
            $scope.qIndex--;
            $scope.currQuestion = $scope.questions[$scope.qIndex];
            $scope.setNextPrev();
        }
    };

    /*
    INIT
     */

    $scope.currExam = '';
    $scope.currSubmitted = '';

    $scope.questions = [];
    $scope.currQuestion = '';

    $scope.getExam('572657c22e854865189929c6', function(){
        $scope.currSubmitted = {
            exam: $scope.currExam._id,
            student: userService.id,
            answers: []
        }
        $scope.currQuestion = $scope.questions[0];        
    });

    
}]);