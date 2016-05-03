/**
 * Created by Jonas on 2016-04-25.
 */

myApp.controller('classCtrl',['$scope', 'userService', 'StudentClassManager', function($scope, userService, StudentClassManager){

    $scope.allStudentClasses = [];

    $scope.getAllStudentClasses = function () {
        StudentClassManager.getAllStudentClasses (function (data) {
            $scope.allStudentClasses = data;
        })
    };

    $scope.loadClass = function (id) {
        StudentClassManager.getStudentClass(id, function (data) {
            $scope.studentClass = data;
        })
    };

    $scope.saveSchoolClass = function () {
        StudentClassManager.addClass($scope.class, function (data) {
            $scope.class = data;
            $scope.getAllStudentClasses();
        })
    };
    
    $scope.getAllStudentClasses();
}]);

