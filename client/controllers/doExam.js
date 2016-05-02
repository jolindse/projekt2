/**
 * Created by Johan on 2016-05-01.
 */
myApp.controller('doExamCtrl', ['$scope', 'userService', 'ExamManager', 'SubmittedManager', 'QuestionManager', function ($scope, userService, ExamManager, SubmittedManager, QuestionManager) {

    /*
     FUNCTIONS
     */

    $scope.startExam = function (id) {
        // Get current exam
        ExamManager.getExam(id, function (data) {
            $scope.currExam = data;
            $scope.currSubmitted = {
                exam: $scope.currExam._id,
                student: userService.id,
                answers: []
            };
            // Build submitted exam answers
            var examLength = $scope.currExam.questions.length;
            for (var i = 0; i < examLength; i++) {
                $scope.currSubmitted.answers[i] = {
                    text: []
                };
            }
            // callback();
            QuestionManager.getQuestion($scope.currExam.questions[$scope.qIndex], function (data) {
                $scope.currQuestion = data;
            });
        });
    };

    $scope.selectAnswer = function (index) {
        if ($scope.currQuestion.type === 'single') {
            $scope.currSubmitted.answers[$scope.qIndex].text[0] = $scope.currQuestion.answerOptions[index].text;
        }
        if ($scope.currQuestion.type === 'multi') {

            var currIndex = $scope.currSubmitted.answers[$scope.qIndex].text.indexOf($scope.currQuestion.answerOptions[index].text);
            if (currIndex >= 0) {
                $scope.currSubmitted.answers[$scope.qIndex].text.splice(currIndex, 1);
            } else {
                $scope.currSubmitted.answers[$scope.qIndex].text.push($scope.currQuestion.answerOptions[index].text);
            }
        }
    };

    $scope.setNextPrev = function () {
        if ($scope.qIndex === $scope.currExam.questions.length - 1) {
            $scope.hasNextQ = false;
        } else {
            $scope.hasNextQ = true;
        }

        if ($scope.qIndex === 0) {
            $scope.hasPreviousQ = false;
        } else {
            $scope.hasPreviousQ = true;
        }
    };

    $scope.setupRanking = function() {
        // If first time this question is being displayed make a copy of the answers.
        if ($scope.currSubmitted.answers[$scope.qIndex].text.length < 1){
            $scope.currQuestion.answerOptions.forEach(function(data){
                $scope.currSubmitted.answers[$scope.qIndex].text.push(data.text);
            });
        }
        // Randomize the order of the answers.
        for (var i = $scope.currSubmitted.answers[$scope.qIndex].text.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = $scope.currSubmitted.answers[$scope.qIndex].text[i];
            $scope.currSubmitted.answers[$scope.qIndex].text[i] = $scope.currSubmitted.answers[$scope.qIndex].text[j];
            $scope.currSubmitted.answers[$scope.qIndex].text[j] = temp;
        }

    }

    $scope.nextQuestion = function () {
        if ($scope.qIndex < $scope.currExam.questions.length) {
            $scope.qIndex++;
            QuestionManager.getQuestion($scope.currExam.questions[$scope.qIndex], function (data) {
                $scope.currQuestion = data;
                if ($scope.currQuestion.type === 'rank'){
                    $scope.setupRanking();
                }
            });
            $scope.setNextPrev();
        }
    };

    $scope.previousQuestion = function () {
        if ($scope.qIndex >= 0) {
            $scope.qIndex--;
            QuestionManager.getQuestion($scope.currExam.questions[$scope.qIndex], function (data) {
                $scope.currQuestion = data;
                if ($scope.currQuestion.type === 'rank'){
                    $scope.setupRanking();
                }
            });
            $scope.setNextPrev();
        }
    };

    /*
     INIT
     */
    $scope.qIndex = 0;
    $scope.hasNextQ = true;
    $scope.hasPreviousQ = false;

    $scope.currExam = '';
    $scope.currQuestion = '';
    $scope.currSubmitted = '';

    $scope.startExam('572657c22e854865189929c6');

/*    $scope.startExam('572657c22e854865189929c6', function () {
        QuestionManager.getQuestion($scope.currExam.questions[$scope.qIndex], function (data) {
            $scope.currQuestion = data;
        });
    });*/

}]);