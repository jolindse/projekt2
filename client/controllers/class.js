/**
 * Created by Robin on 2016-04-25.
 */

myApp.controller('classCtrl',['$scope', 'userService', 'StudentClassManager','UserManager', function($scope, userService, StudentClassManager, UserManager){

    $scope.studentClass = "";
    $scope.selectedRow = "";
    $scope.selectedUser = "";
    $scope.userCon = "";

    $scope.selectedStudents = [];
    $scope.selectedClasses = [];
    $scope.studentClasses = [];
    $scope.users = [];

    $scope.getAllUsers = function () {
        UserManager.getAllUsers(function (data) {
            $scope.users = data;

            StudentClassManager.getAllStudentClasses(function (data) {
                $scope.studentClasses = data;

                $scope.studentClasses.forEach(function (currClass) {
                    currClass.students.forEach(function (currId) {
                        for(var i = 0; i < $scope.users.length; i++) {
                            if($scope.users[i]._id === currId){
                                $scope.users[i].className = currClass.name;
                                break;
                            }
                        }
                    })
                })
            })
        })
    };
    
    $scope.getAllStudentClasses = function () {
        StudentClassManager.getAllStudentClasses (function (data) {
            $scope.studentClasses = data;
            console.log("laddat alla klasser" + $scope.studentClasses.length);
        })
    };

    $scope.loadUser = function (currUser, index) {
        if($scope.userCon === currUser){
            $scope.userCon = "";
            $scope.editUserBut = false;
        }else {
            console.log("laddat user" + currUser._id);
            $scope.userCon = currUser;
            $scope.selectedUser = index;
            $scope.editUserBut = true;
            console.log($scope.userCon._id);
        }
    };

    $scope.loadClass = function (currClass, index) {
        if($scope.studentClass === currClass){
            $scope.studentClass = "";
            $scope.editClassBut = false;
        }
        else{
        console.log("laddat klass"+ currClass._id);
            $scope.studentClass = currClass;
            $scope.selectedRow = index;
            $scope.editClassBut = true;
        console.log($scope.studentClass._id);
        }
    };
    
    $scope.deleteClassBut = function () {
        console.log("ska deleta klass " + $scope.studentClass._id);
        StudentClassManager.deleteClass($scope.studentClass._id, function () {
            $scope.getAllStudentClasses();
            console.log("callback");
        });
        $scope.studentClass = "";
    };

    $scope.deleteUserBut = function () {
        console.log("ska deleta user" + $scope.userCon._id);
        UserManager.deleteUser($scope.userCon._id, function () {
            $scope.getAllUsers();
            console.log("callback");
        });
        $scope.getAllUsers();
        console.log("Uppdaterat listan efter delete")
    };
    
    $scope.saveUser = function () {
         console.log(JSON.stringify($scope.userCon,null,2));
            if($scope.userCon._id === undefined) {
                UserManager.addUser($scope.userCon, function (data) {
                    console.log("Adding a user");
                    $scope.userCon = data;
                     if($scope.studentClass !== undefined) {
                         StudentClassManager.setStudentClass($scope.studentClass, function (data) {
                             $scope.studentClass = data;
                         });
                         $scope.addStudentToClass($scope.userCon._id);
                     }
                });
            }else{
                console.log("setting a user111" + $scope.userCon);
                $scope.addStudentToClass($scope.userCon._id);
                UserManager.setUser($scope.userCon, function (data) {
                    $scope.userCon = data;
                    StudentClassManager.setStudentClass($scope.studentClass, function (data) {
                        console.log("setting student class");
                        $scope.studentClass = data;
                    });
                });
            };
        $scope.getAllStudentClasses();
        $scope.getAllUsers();
    };

    $scope.saveSchoolClass = function () {
        if($scope.studentClass._id === undefined){
            StudentClassManager.addStudentClass($scope.studentClass, function (data) {
                $scope.studentClass = data;
                $scope.getAllStudentClasses();
            });
        }else{
            StudentClassManager.setStudentClass($scope.studentClass, function (data) {
                $scope.studentClass = data;
                $scope.getAllStudentClasses();
            })
        }
    };

    $scope.addStudentToClass = function (data) {
        $scope.studentClass.students.push(data);
    };

    $scope.setStudentToClass = function (currClass) {
        console.log(currClass);
        $scope.studentClass = currClass;
    };

    $scope.resetSchoolClass = function () {
        $scope.studentClass = "";
    };

    $scope.resetUser = function () {
        $scope.userCon = "";
    };

    $scope.getAllStudentClasses();
    $scope.getAllUsers();
}]);

