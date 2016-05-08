/**
 * Created by Robin on 2016-04-25.
 */

myApp.controller('classCtrl',['$scope', 'userService', 'StudentClassManager','UserManager', function($scope, userService, StudentClassManager, UserManager){

    $scope.studentClass = "";
    $scope.selectedRow = "";
    $scope.selectedUser = "";
    $scope.user = "";
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

    $scope.loadUser = function (currUser, index) {
            $scope.user = currUser;
            $scope.selectedUser = index;
    };

    $scope.loadClass = function (currClass, index) {
        console.log(currClass);
            $scope.studentClass = currClass;
            $scope.selectedRow = index;
        $scope.deleteClassBut = function () {
            console.log(currClass);
            StudentClassManager.deleteClass(currClass, callback);
        }
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
    
    // $scope.deleteClassBut = function () {
    //     StudentClassManager.deleteClass($scope.class, function (data) {
    //
    //
    //     })
    // };

    $scope.getAllStudentClasses();
    $scope.getAllUsers();
}]);

