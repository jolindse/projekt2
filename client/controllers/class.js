/**
 * Created by Robin on 2016-04-25.
 */

myApp.controller('classCtrl',['$scope', 'userService', 'StudentClassManager','UserManager', function($scope, userService, StudentClassManager, UserManager){

    $scope.studentClass = "";
    $scope.selectedRow = "";
    $scope.selectedUser = "";
    $scope.userCon = "";
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
            console.log("laddat alla klasser" + $scope.studentClasses.length);
        })
    };

    $scope.loadUser = function (currUser, index) {
        console.log("laddat user" + currUser._id);
            $scope.userCon = currUser;
            $scope.selectedUser = index;
        console.log($scope.userCon._id);
    };

    $scope.loadClass = function (currClass, index) {
        console.log("laddat klass"+ currClass._id);
            $scope.studentClass = currClass;
            $scope.selectedRow = index;
        console.log($scope.studentClass._id);
    };
    
    $scope.deleteClassBut = function () {
        console.log("ska deleta klass " + $scope.studentClass._id);
        StudentClassManager.deleteClass($scope.studentClass._id, function () {
            $scope.getAllStudentClasses();
            console.log("callback");
        });
    };

    $scope.deleteUserBut = function () {
        console.log("ska deleta user" + $scope.userCon._id)
        UserManager.deleteUser($scope.userCon._id, function () {
            $scope.getAllUsers();
            console.log("callback");
        });
    };
    
    $scope.saveUser = function () {
      UserManager.addUser($scope.userCon, function (data) {
            $scope.userCon = data;
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

