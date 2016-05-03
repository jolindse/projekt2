/**
 * Created by Jonas on 2016-04-25.
 */

myApp.controller('classCtrl',['$scope', 'userService', 'StudentClassManager', function($scope, userService, StudentClassManager){
    
    
    $scope.studentClasses = [];

    $scope.getAllStudentClasses = function () {
        StudentClassManager.getAllStudentClasses (function (data) {
            $scope.studentClasses = data;
        })
    };

    $scope.loadClass = function (id) {
        StudentClassManager.getStudentClass(id, function (data) {
            $scope.studentClass = data;
        })
    };

    $scope.saveSchoolClass = function () {
        StudentClassManager.addStudentClass($scope.class, function (data) {
            console.log($scope.studentClasses);
            $scope.class = data;
            $scope.getAllStudentClasses();
        })
    };
    $scope.selectedClass = function () {
        
    };
    
    $scope.deleteSelectedClass = function () {
        StudentClassManager.deleteClass($scope.class, function () {

        })  
    };
    
    $scope.getAllStudentClasses();
}]);

