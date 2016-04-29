/**
 * Created by Johan on 2016-04-29.
 */

myApp.controller('makeQuestionCtrl', ['$scope', 'QuestionManager', 'userService', function($scope, QuestionManager, userService) {

    $scope.question = {
        answerOption: []
    };

    $scope.questions = [];

    $scope.loadQuestion = function(id) {
        QuestionManager.getQuestion(id, function(data){
            $scope.question = data;
        });
    };

    $scope.loadAllQuestions = function() {
        QuestionManager.getAllQuestions(function(data) {
           $scope.questions = data;
        });
    };

    $scope.saveQuestion = function () {
        QuestionManager.setQuestion($scope.question);
    };

}]);