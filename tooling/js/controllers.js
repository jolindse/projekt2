/**
 * Created by Johan on 2016-04-24.
 */

uat.controller('homeCtrl', function ($scope) {

});

uat.controller('classCtrl',['$scope','$http','StudentClassManager', function ($scope, $http, StudentClassManager) {
    /***********************************************************************************************************************
     /api/class                 GET         -            [class]            Gets ALL classes
     /api/class                 POST        class        -                Adds a class
     /api/class/(id)            PUT         class        -                Updates a class
     /api/class/(id)            GET         -            class            Gets a specific class
     /api/class/(id)            DELETE      -            -                Deletes a class
     /api/class/remove/(id)     DELETE      -            -                Deletes a class and ALL students that belong to it

     class:
     {
     _id:				MongoDB id
     name:				String
     students:			[user._id,user._id...]
     }
     ***********************************************************************************************************************/

    $scope.studentClasses = [];
    $scope.studentClass = StudentClassManager.getStudentClass(0);
    $scope.studentToAdd = '';


    // Load a class
    $scope.loadClass = function() {
        console.log('Should load class with id: '+$scope.studentClass._id);
        StudentClassManager.getStudentClass($scope.studentClass._id).then(function (currClass) {
            console.log('Loaded class: '+JSON.stringify(currClass));
            $scope.studentClass = currClass;
        })
    };

    // Add students to class
    $scope.addStudent = function() {
        $scope.studentClass.students.push($scope.studentToAdd);
    };

    // Update and add
    $scope.submitClass = function() {
        if ($scope.studentClass._id) {
            StudentClassManager.setData(studentClass);
        } else {
            delete $scope.studentClass._id; // Need to remove this in order for MongoDB integrity.
            StudentClassManager.addStudentClass($scope.studentClass, function(newClass){
                $scope.studentClass = newClass;
                console.log('submitClass; result: '+JSON.stringify(newClass)); // TEST
            });

        }
    };

    // Show all classes
    $scope.getAllClasses = function() {
        StudentClassManager.getAllStudentClasses(function (data){
            $scope.studentClasses = data;
        });
    };
    $scope.getAllClasses();
}]);

uat.controller('examCtrl', function ($scope) {

});

uat.controller('questionCtrl', function ($scope) {

});

uat.controller('submittedCtrl', function ($scope) {

});

uat.controller('userCtrl', function ($scope, UserManager) {
    $scope.user = "";
    $scope.testToAdd = "";
    $scope.users = [];

     // Load a class
     $scope.loadUser = function() {
         UserManager.getUser($scope.user._id).then(function (currUser) {
             $scope.user = currUser;
         })
     };

    // Add students to class
    $scope.addExam = function() {
        $scope.user.testToTake.push($scope.testToAdd);
    };

    // Show all classes
    $scope.getAllUsers = function() {
        console.log('Gets all users');
        UserManager.getAllUsers(function (data){
            $scope.users = data;
        });
    };

    // Update and add
    $scope.submitUser = function() {
        if ($scope.user._id) {
            console.log('submitUser; existing : '+JSON.stringify($scope.user));
            UserManager.setUser($scope.user);
        } else {
            delete $scope.user._id; // Need to remove this in order for MongoDB integrity.
            console.log('submitUser; new : '+JSON.stringify($scope.user));
            UserManager.addUser($scope.user, function(newUser){
                $scope.user = newUser;
            });
        }
        $scope.getAllUsers();
    };


    $scope.getAllUsers();
});
