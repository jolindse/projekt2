/**
 * Created by robin on 2016-04-29.
 */
myApp.controller('makeExamCtrl', ['$scope', 'userService', 'ExamManager', 'QuestionManager', '$uibModal', function ($scope, userService, ExamManager, QuestionManager, $uibModal) {

    /*
     FUNCTIONS
     */
    $scope.loadExam = function (id) {
        ExamManager.getExam(id, function (data) {
            $scope.exam = data;
        });
    };

    $scope.saveExam = function () {
        $scope.exam.cre8or = userService.id;
        ExamManager.addExam($scope.exam, function (data) {
            $scope.exam = data;
        });
    };

    $scope.addQuestion = function (currQuestionId) {
        $scope.exam.questions.push(currQuestionId);
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
            console.log('return from modal: '+JSON.stringify(data)); // TEST
            $scope.addQuestion(data._id);
            $scope.exam.questionArray.push(data);
        });
    };

    $scope.userList = function () {
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'modalviews/listModal.html',
            controller: 'modalListCtrl',
            size: 'lg',
            resolve: {
                listType: function () {
                    return 'users';
                }
            }
        });

        modalInstance.result.then(function (data) {
            console.log('return from modal: '+JSON.stringify(data)); // TEST
        });
    };

    /*
     INIT
     */

    $scope.exam = {
        gradePercentage: [],
        interval: [],
        questions: [],
        questionArray: []  // GLÖM INTE TA BORT INNAN EXPORT
    };

}]);