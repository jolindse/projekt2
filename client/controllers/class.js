/**
 * Created by Robin on 2016-04-25.
 */

myApp.controller('classCtrl',['$scope', 'userService', 'StudentClassManager','UserManager', function($scope, userService, StudentClassManager, UserManager){

    $scope.studentClass = "";
    $scope.studentClasses = [];
    $scope.users = [];

    $scope.getAllUsers = function () {
        UserManager.getAllUsers(function (data) {
            $scope.users = data;
        })
    };
    
    $scope.getAllStudentClasses = function () {
        StudentClassManager.getAllStudentClasses (function (data) {
            $scope.studentClasses = data;
        })
    };
    // $scope.selectClass = function (data) {
    //     StudentClassManager.getStudentClass(data._id, function (data) {
    //         $scope.studentClass = data;
    //     })
    // };
    
    $scope.loadClass = function (id) {
        StudentClassManager.getStudentClass(id._id, function (data) {
            $scope.studentClass = data;
        })
    };
    
    $scope.saveUser = function () {
      UserManager.addUser($scope.user, function (data) {
            $scope.user = data;
            $scope.getAllUsers();
        })  
    };
    
    $scope.saveSchoolClass = function () {
        StudentClassManager.addStudentClass($scope.class, function (data) {
            $scope.class = data;
            $scope.getAllStudentClasses();
        })
    };
    
    $scope.getAllStudentClasses();
    $scope.getAllUsers();
}]);

