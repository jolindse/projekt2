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
    // $scope.getAllUsers = function () {
    //     UserManager.getAllUsers(function (data) {
    //         $scope.users = data;
    //         console.log(data);
    //         $scope.users.forEach(function (student) {
    //             if (student.admin == false) {
    //                 $scope.selectedStudents.push(
    //                     {
    //                         user: student,
    //                         studentClass: ""
    //
    //                     }
    //                 );
    //             }
    //         });
    //
    //         StudentClassManager.getAllStudentClasses(function (data) {
    //             $scope.selectedClasses = data;
    //             console.log(data);
    //             //Add classes to the array "selectedStudents":
    //             $scope.selectedStudents.forEach(function (student) {
    //                 $scope.selectedClasses.forEach(function (studentClass) {
    //                     studentClass.students.forEach(function (studentId) {
    //                         if (student.userCon._id == studentId){
    //                             student.studentClass = studentClass.name;
    //                         }
    //                     })
    //                 })
    //             });
    //         });
    //     });
    // };
    
    $scope.getAllStudentClasses = function () {
        StudentClassManager.getAllStudentClasses (function (data) {
            $scope.studentClasses = data;
            console.log("laddat alla klasser" + $scope.studentClasses.length);
        })
    };

    $scope.loadUser = function (currUser, index) {
        if($scope.userCon === currUser){
            $scope.userCon = "";
        }else {
            console.log("laddat user" + currUser._id);
            $scope.userCon = currUser;
            $scope.selectedUser = index;
            console.log($scope.userCon._id);
        }
    };

    $scope.loadClass = function (currClass, index) {
        if($scope.studentClass === currClass){
            $scope.studentClass = "";
        }
        else{
        console.log("laddat klass"+ currClass._id);
            $scope.studentClass = currClass;
            $scope.selectedRow = index;
        console.log($scope.studentClass._id);
        }
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
         console.log(JSON.stringify($scope.userCon,null,2));
                console.log($scope.userCon._id);
            if($scope.userCon._id === undefined) {
                UserManager.addUser($scope.userCon, function (data) {
                    console.log("Adding a user");
                    $scope.userCon = data;
                    StudentClassManager.setStudentClass($scope.studentClass, function (data) {
                        $scope.studentClass = data;
                        $scope.getAllUsers();
                    });
                    $scope.addStudentToClass();
                });
                
            }else{
                console.log("setting a user111");
                UserManager.setUser($scope.userCon, function (data) {
                    console.log("setting a user222");
                    $scope.userCon = data;
                    StudentClassManager.setStudentClass($scope.studentClass, function (data) {
                        $scope.studentClass = data;
                        console.log(data);
                        $scope.getAllUsers();
                    });
                    $scope.addStudentToClass();
                });
            };
    };
    
    $scope.addStudentToClass = function () {
        $scope.studentClass.students.push($scope.userCon._id);
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

