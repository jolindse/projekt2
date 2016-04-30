/**
 * Created by Johan on 2016-04-29.
 */

myApp.controller('makeQuestionCtrl', ['$scope', 'QuestionManager', 'userService', function($scope, QuestionManager, userService) {

    // Init

    $scope.question = {
        answerOption: [],
    };
    $scope.questions = [];

    $scope.qTypeText = "";

    $scope.questionTypes = [
        {
            text: 'Fritext',
            value: 'text'
        },
        {
            text: 'Flerval',
            value: 'multi'
        },
        {
            text: 'Enkelval',
            value: 'single'
        },
        {
            text: 'Rangordning',
            value: 'rank'
        }];

    // Functions

    $scope.pickType = function(index) {
        $scope.question.type = $scope.questionTypes[index].value;
        $scope.qTypeText = $scope.questionTypes[index].text;
    };

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

    $scope.toggleDropdown = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
    };

    // Calls

    $scope.pickType(0);

}]);