/**
 * Created by robin on 2016-04-29.
 */
myApp.controller('makeExamCtrl', ['$scope', 'userService', 'ExamManager', 'QuestionManager', '$uibModal', function ($scope, userService, ExamManager, QuestionManager, $uibModal) {

    /*
     FUNCTIONS
     */

    $scope.getAllQuestions = function () {
        QuestionManager.getAllQuestions(function (data) {
            $scope.allQuestions = data;
        });
    };

    $scope.getAllExams = function () {
        ExamManager.getAllExams(function (data) {
            $scope.allExams = data;
        });
    };

    $scope.loadExam = function (id) {
        ExamManager.getExam(id, function (data) {
            $scope.exam = data;
        });
    };

    $scope.saveExam = function () {
        exam.cre8or = userService.id;
        ExamManager.addExam($scope.exam, function (data) {
            $scope.exam = data;
            $scope.getAllExams();
        });
    };

    $scope.addQuestion = function (currQuestion) {
        $scope.exam.questions.push(currQuestion);
    };

    $scope.dateParams = {
        icons: {
            next: 'glyphicon glyphicon-right',
            previous: 'glyphicon glyphicon-arrow-left',
            up: 'glyphicon glyphicon-arrow-up',
            down: 'glyphicon glyphicon-arrow-down'
        },
        format: 'YYYY-MM-DD HH:mm',
        stepping: 10,
        sideBySide: true,
        calendarWeeks: true
    };

    $scope.exam = {
        gradePercentage: [],
        interval: []
    };

    // MODAL

    $scope.newQuestion = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'modalviews/newquestion.html',
            controller: 'modalQuestionCtrl',
            size: 'lg'
        });

        modalInstance.result.then(function (data) {
            $scope.addQuestion(data);
        });
    };


    /*
     INIT
     */

    $scope.allExams = [];
    $scope.allQuestions = [];

    $scope.exam = {
        gradePercentage: [],
        interval: [],
        questions: []
    };

    $scope.getAllExams();
    $scope.getAllQuestions();
}]);