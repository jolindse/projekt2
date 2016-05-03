/**
 * Created by robin on 2016-04-29.
 */
myApp.controller('makeExamCtrl', ['$scope', 'userService', 'ExamManager', function($scope, userService, ExamManager){

    $scope.exam = {
        gradePercentage: [],
        interval: [],
    };

    $scope.allExams = [];

    $scope.getAllExams = function () {
        ExamManager.getAllExams( function (data) {
            $scope.allExams = data;
        })
    };

    $scope.loadExam = function (id) {
        ExamManager.getExam(id, function(data){
            $scope.exam = data;
        })
    };

    $scope.saveExam = function () {
        exam.cre8or = userService.id;
        ExamManager.addExam($scope.exam, function (data) {
            $scope.exam = data;
            $scope.getAllExams();
        })
    };
    
    $scope.getAllExams();
    
}]);